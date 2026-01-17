import multer from 'multer';
import { storage } from '../config/cloudinary.js';

// Bộ lọc file (chỉ chấp nhận ảnh và PDF)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file định dạng ảnh hoặc PDF!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn file 10MB
});

export default upload;