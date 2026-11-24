const express = require('express');
const router = express.Router();
const {
  getActiveCatalogs,
  createServiceRequest,
  getMyServiceRequests,
  clarifyServiceRequest,
  getAllServiceRequestsForManager,
  claimServiceRequest,
  reviewServiceRequest,
} = require('../controllers/serviceRequestController');

const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadRequestFile } = require('../middlewares/uploadMiddleware');

// Chỉ kiểm tra đăng nhập chung, KHÔNG đặt authorizeRoles('Client') ở đây
router.use(verifyToken);

const handleUpload = (req, res, next) => {
  uploadRequestFile.single('attachment')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Lỗi tải tệp đính kèm.' });
    }
    next();
  });
};

// Nhóm Route riêng cho Client
router.get('/catalogs', authorizeRoles('Client'), getActiveCatalogs);
router.get('/my', authorizeRoles('Client'), getMyServiceRequests);
router.post('/', authorizeRoles('Client'), handleUpload, createServiceRequest);
router.put('/:id/clarify', authorizeRoles('Client'), handleUpload, clarifyServiceRequest);

// Nhóm Route riêng cho Manager
router.get('/manager/all', authorizeRoles('Manager'), getAllServiceRequestsForManager);
router.patch('/manager/:id/claim', authorizeRoles('Manager'), claimServiceRequest);
router.patch('/manager/:id/review', authorizeRoles('Manager'), reviewServiceRequest);

module.exports = router;