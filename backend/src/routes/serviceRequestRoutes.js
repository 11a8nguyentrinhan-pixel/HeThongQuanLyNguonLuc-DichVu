const express = require('express');
const router = express.Router();
const {
  getActiveCatalogs,
  createServiceRequest,
  getMyServiceRequests,
  clarifyServiceRequest,
} = require('../controllers/serviceRequestController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadRequestFile } = require('../middlewares/uploadMiddleware');

router.use(verifyToken, authorizeRoles('Client'));

const handleUpload = (req, res, next) => {
  uploadRequestFile.single('attachment')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Lỗi tải tệp đính kèm.' });
    }
    next();
  });
};

router.get('/catalogs', getActiveCatalogs);
router.get('/my', getMyServiceRequests);
router.post('/', handleUpload, createServiceRequest);
router.put('/:id/clarify', handleUpload, clarifyServiceRequest);

module.exports = router;