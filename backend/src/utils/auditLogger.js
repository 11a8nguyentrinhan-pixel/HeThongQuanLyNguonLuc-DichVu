const { sql } = require('../config/db');

// Helper lấy địa chỉ IP thật của người gửi request (tránh lặp code ở từng controller)
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
        .toString()
        .replace('::ffff:', '');
};

// Helper ghi nhật ký kiểm toán vào bảng dbo.system_logs
const writeSystemLog = async (pool, { actorId, category, detail, ipAddress }) => {
    await pool.request()
        .input('actor_id', sql.Int, actorId || null)
        .input('log_category', sql.NVarChar, category)
        .input('action_detail', sql.NVarChar, detail)
        .input('ip_address', sql.VarChar, ipAddress || '127.0.0.1')
        .query(`
            IF COL_LENGTH('dbo.system_logs', 'actor_id') IS NOT NULL
                INSERT INTO dbo.[system_logs] (actor_id, log_category, action_detail, ip_address)
                VALUES (@actor_id, @log_category, @action_detail, @ip_address)
            ELSE
                INSERT INTO dbo.[system_logs] (log_category, action_detail, ip_address)
                VALUES (@log_category, @action_detail, @ip_address)
        `);
};

module.exports = {getClientIp, writeSystemLog };