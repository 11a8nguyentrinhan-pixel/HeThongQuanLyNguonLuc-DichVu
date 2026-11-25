const express = require('express');
const router = express.Router();
const {
  getManagerQuoteContractData,
  createQuotation,
  updateQuotationStatus,
  createContractFromQuote,
  sendContractToClient,
  getClientQuoteContractData,
  respondToQuotation,
  signContractByClient,
} = require('../controllers/quoteContractController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadContractFile } = require('../middlewares/uploadMiddleware');

router.use(verifyToken);

const handleContractUpload = (req, res, next) => {
  uploadContractFile.single('contract_file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Lỗi tải tệp hợp đồng.' });
    }
    next();
  });
};

// Nhóm Route của MANAGER
router.get('/manager/data', authorizeRoles('Manager'), getManagerQuoteContractData);
router.post('/manager/quotes', authorizeRoles('Manager'), createQuotation);
router.patch('/manager/quotes/:id/status', authorizeRoles('Manager'), updateQuotationStatus);
router.post('/manager/contracts', authorizeRoles('Manager'), handleContractUpload, createContractFromQuote);
router.patch('/manager/contracts/:id/send', authorizeRoles('Manager'), sendContractToClient);
// Nhóm Route của CLIENT
router.get('/client/data', authorizeRoles('Client'), getClientQuoteContractData);
router.patch('/client/quotes/:id/respond', authorizeRoles('Client'), respondToQuotation);
router.patch('/client/contracts/:id/sign', authorizeRoles('Client'), signContractByClient);
module.exports = router;