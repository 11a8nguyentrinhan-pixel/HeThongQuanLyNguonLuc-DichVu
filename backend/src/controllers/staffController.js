const { sql, connectDB } = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const{ sendStaffInvitationEmail, sendRoleUpdatedEmail } = require('../utils/emailService');
const { writeSystemLog, getClientIp}= require('../utils/auditLogger');

// ADMIN LẤY DANH SÁCH NHÂN SỰ NỘI BỘ (Manager & Member)
const getStaffList = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.status,
                u.created_at,
                r.role_name AS role
            FROM dbo.[users] u
            INNER JOIN dbo.[roles] r ON u.role_id = r.id
            WHERE r.role_name IN ('Manager', 'Member')
            ORDER BY u.id DESC
        `);

        return res.status(200).json({ staff: result.recordset });
    } catch (error) {
        console.error('Lỗi lấy danh sách nhân sự:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách nhân sự.' });
    }
};

// ADMIN MỜI NHÂN SỰ NỘI BỘ (Tạo tài khoản Manager / Member)
const inviteStaff = async (req, res) => {
    try {
        const full_name = (req.body.full_name || req.body.fullname || '').trim();
        const email = (req.body.email || '').trim().toLowerCase();
        const phone = (req.body.phone || '0000000000').trim();
        const rawPassword = (req.body.password || '').trim();
        const role = req.body.role;

        if (!full_name || !email || !role) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và vai trò.' });
        }

        if (!['Manager', 'Member'].includes(role)) {
            return res.status(400).json({ message: 'Chỉ được phép cấp quyền Manager hoặc Member.' });
        }

        const pool = await connectDB();

        const checkExist = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id FROM dbo.[users] WHERE email = @email');

        if (checkExist.recordset.length > 0) {
            return res.status(409).json({ message: 'Email nhân sự này đã tồn tại trên hệ thống.' });
        }

        const roleResult = await pool.request()
            .input('role_name', sql.NVarChar, role)
            .query('SELECT id FROM dbo.[roles] WHERE role_name = @role_name');

        if (roleResult.recordset.length === 0) {
            return res.status(400).json({ message: `Không tìm thấy vai trò ${role} trong bảng role.` });
        }

        // Sinh mã kích hoạt 16 ký tự (khớp độ dài cột reset_code) và thời hạn 48 giờ
        const inviteToken = crypto.randomBytes(8).toString('hex');
        const inviteExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
        const initialPassword = rawPassword || 'Nori@123456';
        const hashedPassword = await bcrypt.hash(initialPassword, 10);

        await pool.request()
            .input('role_id', sql.Int, roleResult.recordset[0].id)
            .input('full_name', sql.NVarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('phone', sql.VarChar, phone)
            .input('reset_code', sql.VarChar, inviteToken)
            .input('reset_expires', sql.DateTime, inviteExpires)
            .input('status', sql.NVarChar, 'Chờ kích hoạt') // Có thể đổi sang N'Chờ kích hoạt' khi tích hợp gửi link email
            .query(`
                INSERT INTO dbo.[users] (role_id, full_name, email, password, phone, reset_code, reset_expires, status)
                VALUES (@role_id, @full_name, @email, @password, @phone, @reset_code, @reset_expires, @status)
            `);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const activateUrl = `${clientUrl}/auth?activateToken=${inviteToken}&email=${encodeURIComponent(email)}`;

        const mailResult = await sendStaffInvitationEmail({
            toEmail: email,
            fullName: full_name,
            role,
            activateUrl,
            tempPassword: rawPassword ? initialPassword : null,
        });

        return res.status(201).json({ 
            message: mailResult.sent
                ? `Đã tạo tài khoản ${role} và gửi email mời kích hoạt tới ${email}!`
                : `Đã tạo tài khoản ${role} (Chờ kích hoạt). Chưa cấu hình SMTP nên link kích hoạt được in ở Terminal Backend.`,
            activateUrl: mailResult.sent ? undefined : activateUrl,
        });
    } catch (error) {
        console.error('Lỗi mời nhân sự:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi mời nhân sự.' });
    }
};
// ADMIN GỬI LẠI LIÊN KẾT MỜI (Khi quá hạn hoặc nhân sự chưa nhận được mail)
const resendInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT u.id, u.full_name, u.email, u.status, r.role_name AS role
                FROM dbo.[users] u
                INNER JOIN dbo.[roles] r ON u.role_id = r.id
                WHERE u.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nhân sự.' });
        }

        const staff = result.recordset[0];
        if (staff.status !== 'Chờ kích hoạt') {
            return res.status(400).json({ message: 'Tài khoản này đã kích hoạt, không cần gửi lại lời mời.' });
        }

        const newToken = crypto.randomBytes(8).toString('hex');
        const newExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

        await pool.request()
            .input('id', sql.Int, id)
            .input('reset_code', sql.VarChar, newToken)
            .input('reset_expires', sql.DateTime, newExpires)
            .query('UPDATE dbo.[users] SET reset_code = @reset_code, reset_expires = @reset_expires WHERE id = @id');

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const activateUrl = `${clientUrl}/auth?activateToken=${newToken}&email=${encodeURIComponent(staff.email)}`;

        const mailResult = await sendStaffInvitationEmail({
            toEmail: staff.email,
            fullName: staff.full_name,
            role: staff.role,
            activateUrl,
        });

        return res.status(200).json({
            message: mailResult.sent
                ? `Đã gửi lại email kích hoạt tới ${staff.email}!`
                : `Đã tạo liên kết mời mới (xem link tại Terminal Backend).`,
        });
    } catch (error) {
        console.error('Lỗi gửi lại lời mời:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi gửi lại lời mời.' });
    }
};
// ADMIN HỦY LỜI MỜI CHƯA KÍCH HOẠT
const cancelInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM dbo.[users] WHERE id = @id AND status = N'Chờ kích hoạt'");

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ message: 'Chỉ có thể hủy tài khoản đang ở trạng thái Chờ kích hoạt.' });
        }

        return res.status(200).json({ message: 'Đã hủy lời mời và xóa bản ghi chờ kích hoạt.' });
    } catch (error) {
        console.error('Lỗi hủy lời mời:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi hủy lời mời.' });
    }
};
// ADMIN KHÓA / KHÔI PHỤC TÀI KHOẢN
const updateStaffStatus = async (req, res) => {
    try {
        const targetId = Number(req.params.id);
        const { action, reason, isEligible } = req.body;
        // action: 'lock' | 'restore'
        const clientIp = getClientIp(req);

        if (!['lock', 'restore'].includes(action)) {
            return res.status(400).json({ message: 'Thao tác không hợp lệ.' });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: 'Vui lòng chọn hoặc nhập lý do thực hiện thao tác.' });
        }

        if (req.user && Number(req.user.id) === targetId) {
            return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản Quản trị viên của chính mình.' });
        }

        const pool = await connectDB();

        // Lấy thông tin nhân sự cần xử lý
        const staffResult = await pool.request()
            .input('id', sql.Int, targetId)
            .query(`
                SELECT u.id, u.full_name, u.email, u.status, r.role_name AS role
                FROM dbo.[users] u
                INNER JOIN dbo.[roles] r ON u.role_id = r.id
                WHERE u.id = @id
            `);

        if (staffResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản nhân sự.' });
        }

        const staff = staffResult.recordset[0];

        // NHÁNH 1: KHÓA / NGƯNG KÍCH HOẠT TÀI KHOẢN
        if (action === 'lock') {
            await pool.request()
                .input('id', sql.Int, targetId)
                .input('status', sql.NVarChar, 'Đã khóa')
                .query('UPDATE dbo.[users] SET status = @status WHERE id = @id');

            await writeSystemLog(pool, {
                actorId: req.user?.id,
                category: 'Audit Trail',
                detail: `[Khóa tài khoản] Admin khóa TK ${staff.full_name} (${staff.email} - ${staff.role}). Lý do: ${reason.trim()}. Đã thu hồi phiên & bảo toàn lịch sử dự án cũ.`,
                ipAddress: clientIp,
            });

            return res.status(200).json({
                message: `Đã khóa tài khoản ${staff.full_name}, thu hồi phiên đăng nhập tức thì và bảo toàn toàn bộ lịch sử công việc cũ.`
            });
        }

        // NHÁNH 2: KHÔI PHỤC TÀI KHOẢN (KIỂM TRA ĐIỀU KIỆN KHÔI PHỤC)
        if (action === 'restore') {
            if (isEligible === false) {
                // Không đủ điều kiện -> Giữ nguyên trạng thái khóa & Ghi nhật ký từ chối
                await writeSystemLog(pool, {
                    actorId: req.user?.id,
                    category: 'Audit Trail',
                    detail: `[Từ chối khôi phục] Giữ nguyên trạng thái khóa đối với ${staff.full_name} (${staff.email}). Lý do không đủ điều kiện: ${reason.trim()}.`,
                    ipAddress: clientIp,
                });

                return res.status(400).json({
                    message: `Đã từ chối khôi phục (không đủ điều kiện) và giữ nguyên trạng thái khóa cho ${staff.full_name}.`
                });
            }

            // Đủ điều kiện -> Mở khóa sang Active & Cấp lại quyền
            await pool.request()
                .input('id', sql.Int, targetId)
                .input('status', sql.NVarChar, 'Active')
                .query('UPDATE dbo.[users] SET status = @status WHERE id = @id');

            await writeSystemLog(pool, {
                actorId: req.user?.id,
                category: 'Audit Trail',
                detail: `[Khôi phục tài khoản] Admin mở khóa Active & cấp lại quyền ${staff.role} cho ${staff.full_name} (${staff.email}). Căn cứ: ${reason.trim()}.`,
                ipAddress: clientIp,
            });

            return res.status(200).json({
                message: `Đã khôi phục tài khoản ${staff.full_name} sang trạng thái Active và cấp lại quyền ${staff.role}.`
            });
        }
    } catch (error) {
        console.error('Lỗi khóa/khôi phục tài khoản:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi xử lý trạng thái tài khoản.' });
    }
};
// ADMIN CẬP NHẬT ROLE NHÂN SỰ (QUÉT XUNG ĐỘT QUYỀN & GHI AUDIT LOG)
const updateStaffRole = async (req, res) => {
    try {
        const targetId = Number(req.params.id);
        const { newRole, reason, permissions = [] } = req.body;
        const clientIp = getClientIp(req);

        if (!['Manager', 'Member'].includes(newRole)) {
            return res.status(400).json({ message: 'Vai trò mới chỉ được phép là Manager hoặc Member.' });
        }
        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập lý do cập nhật Role.' });
        }
        if (req.user && Number(req.user.id) === targetId) {
            return res.status(400).json({ message: 'Không thể tự thay đổi Role của tài khoản Admin đang đăng nhập.' });
        }

        const pool = await connectDB();

        // 1. Lấy thông tin nhân sự hiện tại
        const userResult = await pool.request()
            .input('id', sql.Int, targetId)
            .query(`
                SELECT u.id, u.full_name, u.email, u.status, r.role_name AS currentRole
                FROM dbo.[users] u
                INNER JOIN dbo.[roles] r ON u.role_id = r.id
                WHERE u.id = @id
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nhân sự.' });
        }

        const staff = userResult.recordset[0];
        if (staff.status === 'Đã khóa') {
            return res.status(400).json({
                message: 'Tài khoản đang bị khóa. Vui lòng khôi phục tài khoản trước khi cập nhật Role.'
            });
        }

        // 2. QUÉT XUNG ĐỘT QUYỀN TRUY CẬP (Conflict Detection)
        // 2a. Xung đột ma trận phân tách trách nhiệm (Member không được giữ quyền duyệt QA / Hợp đồng / Đối soát)
        const managerOnlyPerms = ['approve_qa', 'manage_contracts', 'reconcile_payment'];
        const conflictPerms = permissions.filter((p) => managerOnlyPerms.includes(p));

        if (newRole === 'Member' && conflictPerms.length > 0) {
            return res.status(409).json({
                conflict: true,
                message: `Xung đột phân quyền RBAC: Vai trò Member không được phép kiêm nhiệm quyền quản lý/kiểm duyệt (${conflictPerms.join(', ')}). Vui lòng bỏ chọn các quyền xung đột hoặc chọn Role Manager.`
            });
        }

        // 2b. Xung đột công việc đang mở khi hạ quyền từ Manager -> Member
        if (staff.currentRole === 'Manager' && newRole === 'Member') {
            const activeWorkCheck = await pool.request()
                .input('manager_id', sql.Int, targetId)
                .query(`
                    SELECT
                        (CASE WHEN OBJECT_ID('dbo.projects', 'U') IS NOT NULL
                            THEN (SELECT COUNT(*) FROM dbo.[projects] WHERE manager_id = @manager_id AND status NOT IN (N'Hoàn thành', N'Đã đóng', N'Đã hủy'))
                            ELSE 0 END) AS open_projects,
                        (CASE WHEN OBJECT_ID('dbo.service_requests', 'U') IS NOT NULL
                            THEN (SELECT COUNT(*) FROM dbo.[service_requests] WHERE manager_id = @manager_id AND status NOT IN (N'Hoàn thành', N'Đã đóng', N'Từ chối', N'Đã hủy'))
                            ELSE 0 END) AS open_requests
                `);

            const { open_projects, open_requests } = activeWorkCheck.recordset[0];
            if (open_projects > 0 || open_requests > 0) {
                return res.status(409).json({
                    conflict: true,
                    message: `Xung đột dữ liệu vận hành: ${staff.full_name} đang phụ trách ${open_projects} dự án và ${open_requests} yêu cầu dịch vụ chưa đóng. Vui lòng bàn giao cho Manager khác trước khi hạ xuống Member.`
                });
            }
        }

        // 3. Lấy role_id mới từ bảng dbo.roles
        const roleResult = await pool.request()
            .input('role_name', sql.NVarChar, newRole)
            .query('SELECT id FROM dbo.[roles] WHERE role_name = @role_name');

        if (roleResult.recordset.length === 0) {
            return res.status(400).json({ message: `Không tìm thấy vai trò ${newRole} trong bảng roles.` });
        }

        const newRoleId = roleResult.recordset[0].id;

        // 4. Cập nhật Role mới vào dbo.users (giữ nguyên toàn bộ lịch sử công việc cũ)
        await pool.request()
            .input('id', sql.Int, targetId)
            .input('role_id', sql.Int, newRoleId)
            .query('UPDATE dbo.[users] SET role_id = @role_id WHERE id = @id');

        // 5. Ghi nhận vết thay đổi vào dbo.system_logs
        await writeSystemLog(pool, {
            actorId: req.user?.id,
            category: 'Audit Trail',
            detail: `[Cập nhật Role] Admin đổi vai trò của ${staff.full_name} (${staff.email}) từ ${staff.currentRole} sang ${newRole}. Lý do: ${reason.trim()}.`,
            ipAddress: clientIp,
        });

        // 6. Gửi Email thông báo cập nhật quyền cho nhân sự
        const mailResult = await sendRoleUpdatedEmail({
            toEmail: staff.email,
            fullName: staff.full_name,
            oldRole: staff.currentRole,
            newRole,
            reason: reason.trim(),
        });

        return res.status(200).json({
            message: mailResult.sent
                ? `Đã cập nhật Role của ${staff.full_name} sang ${newRole}, ghi nhật ký và gửi email thông báo!`
                : `Đã cập nhật Role của ${staff.full_name} sang ${newRole} và ghi nhật ký kiểm toán.`,
        });
    } catch (error) {
        console.error('Lỗi cập nhật Role:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật phân quyền.' });
    }
};

module.exports={
    getStaffList,
    inviteStaff,
    resendInvite,
    cancelInvite,
    updateStaffStatus,
    updateStaffRole,
};