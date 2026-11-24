const express = require('express');
const router = express.Router();
const {
    signup, 
    login, 
    forgotPassword, 
    resetPassword, 
    activateAccount,
} = require('../controllers/authController');

const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/activate-account',activateAccount);

// 2. Các route cần đăng nhập (Dùng chung cho cả 4 Role: Admin, Manager, Member, Client)
router.get('/me', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;