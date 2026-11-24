const { sql, connectDB } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { sendPasswordResetEmail } = require('../utils/emailService');
const { generateNextUserId } = require('../utils/userIdGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'NovaWorks_Secret_2026';

// Helper kiểm tra định dạng email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//1. Đăng ký tài khoản danh cho Client
const signup = async(req, res) => {
    try {
        const newId = await generateNextUserId(pool, 'Client');
        const full_name = (req.body.full_name || req.body.fullname || '').trim();
        const email = (req.body.email || '').trim().toLowerCase();
        const phone = (req.body.phone || '').trim();
        const password = req.body.password || '';

        // Kiểm tra dữ liệu đầu vào
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Địa chỉ email không đúng định dạng.' });
        }
        if(phone.length!=10){
            return res.status(400).json({message: 'Số điện thoại phải 10 số.'});
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có tối thiểu 6 ký tự.' });
        }

        const pool = await connectDB();

        // Kiểm tra email đã tồn tại trong bảng users chưa
        const checkExist = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id FROM dbo.[users] WHERE email = @email');

        if (checkExist.recordset.length > 0) {
            return res.status(409).json({ message: 'Email này đã được đăng ký. Vui lòng sử dụng email khác.' });
        }

        // Lấy role_id của vai trò Client từ bảng role
        const roleResult = await pool.request()
            .input('role_name', sql.NVarChar, 'Client')
            .query('SELECT id, role_name FROM dbo.[roles] WHERE role_name = @role_name');

        if (roleResult.recordset.length === 0) {
            return res.status(500).json({ message: 'Chưa khởi tạo vai trò Client trong bảng role.' });
        }

        const clientRole = roleResult.recordset[0];

        // Mã hóa mật khẩu trước khi lưu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào bảng users theo schema mới
        const insertResult = await pool.request()
            .input('id', sql.VarChar(20), newId)
            .input('role_id', sql.Int, clientRole.id)
            .input('full_name', sql.NVarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('phone', sql.VarChar, phone)
            .input('status', sql.NVarChar, 'Active')
            .query(`
                INSERT INTO dbo.[users] (id, role_id, full_name, email, password, phone, status)
                OUTPUT INSERTED.id, INSERTED.role_id, INSERTED.full_name, INSERTED.email, INSERTED.phone, INSERTED.status, INSERTED.created_at
                VALUES (@id, @role_id, @full_name, @email, @password, @phone, @status)
            `);

        const newUser = insertResult.recordset[0];

        return res.status(201).json({
            message: 'Tạo tài khoản Client thành công!',
            user: {
                ...newUser,
                user_id: newUser.id,
                role: clientRole.role_name
            }
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi đăng ký tài khoản.' });
    }
};

//2. Đăng nhập tài khoản cho người dùng
const login = async (req, res) => {
    try {
        const email = (req.body.email || req.body.account || '').trim().toLowerCase();
        const password = req.body.password || '';
        const rememberMe = Boolean(req.body.rememberMe);

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
        }

        const pool = await connectDB();

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                SELECT 
                    u.id,
                    u.role_id,
                    u.full_name,
                    u.email,
                    u.password,
                    u.phone,
                    u.kpi_score,
                    u.status,
                    r.role_name,
                    r.permissions
                FROM dbo.[users] u
                INNER JOIN dbo.[roles] r ON u.role_id = r.id
                WHERE u.email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        const user = result.recordset[0];

        // Kiểm tra trạng thái tài khoản theo quy trình nghiệp vụ của Admin
        if (['Đã khóa', 'Locked', 'Suspended'].includes(user.status)) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' });
        }

        if (['Chờ kích hoạt', 'Pending'].includes(user.status)) {
            return res.status(403).json({ message: 'Tài khoản đang chờ kích hoạt. Vui lòng xác nhận liên kết trong email mời.' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'Tài khoản này sử dụng đăng nhập Google. Vui lòng chọn "Tiếp tục với Google".' });
        }

        // Đối chiếu mật khẩu đã mã hóa
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        // Tạo JWT Token chứa thông tin phân quyền
        const token = jwt.sign(
            {
                id: user.id,
                user_id: user.id,
                role_id: user.role_id,
                role: user.role_name,
                full_name: user.full_name,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '3d' }
        );

        const redirectMap = {
            Admin: '/admin',
            Manager: '/manager',
            Member: '/member',
            Client: '/client'
        };

        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                user_id: user.id,
                role_id: user.role_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                kpi_score: user.kpi_score,
                status: user.status,
                role: user.role_name
            },
            redirectUrl: redirectMap[user.role_name] || '/client'
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi đăng nhập.' });
    }
};

// 3. QUÊN MẬT KHẨU - SINH MÃ XÁC NHẬN & GỬI QUA EMAIL
const forgotPassword = async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Vui lòng nhập địa chỉ email hợp lệ.' });
        }

        const pool = await connectDB();
        const userCheck = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, full_name, status FROM dbo.[users] WHERE email = @email');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản nào ứng với email này.' });
        }

        const user = userCheck.recordset[0];
        if (['Đã khóa', 'Locked', 'Suspended'].includes(user.status)) {
            return res.status(403).json({
                message: 'Tài khoản này đang bị khóa. Vui lòng liên hệ Admin để được hỗ trợ khôi phục.'
            });
        }

        // Sinh mã xác nhận 6 chữ số có hiệu lực 15 phút
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

        await pool.request()
            .input('email', sql.VarChar, email)
            .input('reset_code', sql.VarChar, resetCode)
            .input('reset_expires', sql.DateTime, resetExpires)
            .query('UPDATE dbo.[users] SET reset_code = @reset_code, reset_expires = @reset_expires WHERE email = @email');

        const mailResult = await sendPasswordResetEmail({
            toEmail: email,
            fullName: user.full_name,
            resetCode,
        });

        return res.status(200).json({
            message: mailResult.sent
                ? `Mã xác nhận 6 chữ số đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư (hiệu lực 15 phút).`
                : 'Đã tạo mã xác nhận (xem mã tại Terminal Backend do chưa cấu hình SMTP).',
        });
    } catch (error) {
        console.error('Lỗi gửi mã khôi phục mật khẩu:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi gửi email khôi phục mật khẩu.' });
    }
};

// 4. KIỂM TRA MÃ XÁC NHẬN & ĐẶT LẠI MẬT KHẨU MỚI
const resetPassword = async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const reset_code = (req.body.reset_code || '').trim();
        const new_password = req.body.new_password || '';

        if (!email || !reset_code || !new_password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mã xác nhận và mật khẩu mới.' });
        }
        if (new_password.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' });
        }

        const pool = await connectDB();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, reset_code, reset_expires FROM dbo.[users] WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
        }

        const user = result.recordset[0];
        if (!user.reset_code || user.reset_code !== reset_code) {
            return res.status(400).json({ message: 'Mã không hợp lệ. Vui lòng kiểm tra lại hoặc bấm Gửi lại mã.' });
        }
        if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
            return res.status(400).json({ message: 'Mã xác nhận đã hết hạn (quá 15 phút). Vui lòng bấm Gửi lại mã.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.request()
            .input('id', sql.VarChar(20), user.id)
            .input('password', sql.VarChar, hashedPassword)
            .query('UPDATE dbo.[users] SET password = @password, reset_code = NULL, reset_expires = NULL WHERE id = @id');

        return res.status(200).json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.' });
    } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi đặt lại mật khẩu.' });
    }
};

//8 Nhân sự xác nhận kích hoạt tk từ Email
const activateAccount = async(req,res)=>{
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const token = (req.body.token || '').trim();
        const newPassword=(req.body.password || '').trim();

        if (!email || !token) {
            return res.status(400).json({ message: 'Liên kết kích hoạt không hợp lệ hoặc thiếu tham số.' });
        }
        if (newPassword && newPassword.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' });
        }

        const pool = await connectDB();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, reset_code, reset_expires, status FROM dbo.[users] WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
        }

        const user = result.recordset[0];
        if (user.status === 'Active') {
            return res.status(200).json({ message: 'Tài khoản này đã được kích hoạt trước đó. Bạn có thể đăng nhập ngay.' });
        }
        if (!user.reset_code || user.reset_code !== token) {
            return res.status(400).json({ message: 'Mã kích hoạt không chính xác.' });
        }
        if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
            return res.status(400).json({ message: 'Liên kết mời đã quá hạn (48h). Vui lòng liên hệ Admin gửi lại liên kết mời.' });
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.request()
                .input('id', sql.VarChar(20), user.id)
                .input('password', sql.VarChar, hashedPassword)
                .query(`
                    UPDATE dbo.[users]
                    SET password = @password, status = N'Active', reset_code = NULL, reset_expires = NULL
                    WHERE id = @id
                `);
        } else {
            await pool.request()
                .input('id', sql.VarChar(20), user.id)
                .query(`
                    UPDATE dbo.[users]
                    SET status = N'Active', reset_code = NULL, reset_expires = NULL
                    WHERE id = @id
                `);
        }
        return res.status(200).json({ 
            message: 'Kích hoạt tài khoản thành công! Vui lòng đăng nhập để vào Workspace.' 
        });
    } catch (error) {
        console.error('Lỗi kích hoạt tài khoản: ',error);
        return res.status(500).json({
            message: 'Lỗi máy chủ khi kích hoạt tài khoản.'
        });
    }
}

module.exports = {
    signup, 
    login, 
    forgotPassword, 
    resetPassword, 
    activateAccount,
};
