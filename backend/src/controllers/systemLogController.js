const {connectDB} = require('../config/db')

// LẤY DANH SÁCH NHẬT KÝ HỆ THỐNG (dbo.system_logs)
const getAuditLogs = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT TOP 20 id, log_category, action_detail, ip_address, created_at
            FROM dbo.[system_logs]
            ORDER BY id DESC
        `);

        return res.status(200).json({ logs: result.recordset });
    } catch (error) {
        console.error('Lỗi tải nhật ký hệ thống:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi tải nhật ký hệ thống.' });
    }
};

module.exports= {
    getAuditLogs,
};