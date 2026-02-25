const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authmiddleware');

const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', getAllNotices);

// Admin routes
router.post('/', protect, upload.single('file'), createNotice);
router.put('/:id', protect, upload.single('file'), updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;