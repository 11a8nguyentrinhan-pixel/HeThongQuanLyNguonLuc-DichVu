const jwt = require('jsonwebtoken');
const { sql, connectDB } = require('../config/db');

// Xác thực đăng nhập & Kiểm tra trạng thái tài khoản theo thời gian thực
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc thiếu Token xác thực' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NovaWorks_Secret_2026');

        // Kiểm tra trạng thái thực tế trong DB để thu hồi phiên ngay nếu vừa bị Admin khóa
        const pool = await connectDB();
        const userResult = await pool.request()
            .input('id', sql.Int, decoded.id || decoded.user_id)
            .query('SELECT status FROM dbo.[users] WHERE id = @id');

        if (userResult.recordset.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không còn tồn tại trên hệ thống' });
        }

        const currentStatus = userResult.recordset[0].status;
        if (['Đã khóa', 'Locked', 'Suspended'].includes(currentStatus)) {
            return res.status(403).json({
                message: 'Phiên làm việc đã bị thu hồi do tài khoản của bạn đã bị khóa.'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
    }
};

// Kiểm tra quyền theo Role (RBAC)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Từ chối truy cập! Chức năng này chỉ dành cho: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };