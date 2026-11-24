const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/systemLogController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Toàn bộ route giám sát hệ thống chỉ dành cho Admin
router.use(verifyToken, authorizeRoles('Admin'));

// GET /api/logs (Lấy danh sách nhật ký kiểm toán, backup, sự cố)
router.get('/', getAuditLogs);

module.exports = router;