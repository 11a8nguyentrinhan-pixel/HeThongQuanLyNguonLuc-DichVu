const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/requests');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Giải mã tên file tiếng Việt từ latin1 -> utf8 (tránh lỗi ký tự ở Multer)
const decodeOriginalName = (rawName = '') => {
  if ([...rawName].some((ch) => ch.charCodeAt(0) > 255)) {
    return rawName;
  }
  const decoded = Buffer.from(rawName, 'latin1').toString('utf8');
  return decoded.includes('\uFFFD') ? rawName : decoded;
};

// Giữ nguyên tên gốc, chỉ thay các ký tự Windows cấm trong tên file (\ / : * ? " < > |)
const sanitizeFileName = (rawName) => {
  const decoded = decodeOriginalName(rawName);
  const baseName = path.basename(decoded).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
  return baseName || `tep-dinh-kem-${Date.now()}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subFolder = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const targetDir = path.join(uploadDir, subFolder);
    fs.mkdirSync(targetDir, { recursive: true });
    req.uploadSubFolder = subFolder; // Truyền tên thư mục con sang Controller
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  },
});

const allowedExt = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.zip'];

const uploadRequestFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(decodeOriginalName(file.originalname)).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return cb(new Error('Định dạng tệp không được hỗ trợ (chỉ nhận PDF, Word, Excel, Ảnh, ZIP).'));
    }
    cb(null, true);
  },
});

module.exports = { uploadRequestFile };