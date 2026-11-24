const express = require('express');
const router = express.Router();
const {
    getStaffList,
    inviteStaff,
    resendInvite,
    cancelInvite,
    updateStaffStatus,
    updateStaffRole,
} = require('../controllers/staffController');
const {verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

//Áp dụng bảo vệ Admin cho toàn bộ các router bên dưới
router.use(verifyToken, authorizeRoles('Admin'));

//Quản lý danh sách & Lời mời nhân sự
router.get('/', getStaffList);
router.post('/intive', inviteStaff);
router.post('/:id/resend-invite',resendInvite);
router.get('/:id/cancel-invite', cancelInvite);

//Quản lý trạng thái & Phân quyền
router.patch('/:id/status', updateStaffStatus);
router.patch('/:id/role', updateStaffRole);

module.exports=router;

