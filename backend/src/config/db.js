const path = require('path');
const sql = require('mssql');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'QLNguonLucVaDichVu',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: false,
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('Kết nối SQL Server thành công!');
        return pool;
    } catch (error) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', error.message);
        throw error; // Ném lỗi về controller xử lý thay vì tắt sập server
    }
};

module.exports = { sql, connectDB };