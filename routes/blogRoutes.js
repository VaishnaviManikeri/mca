const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', getAllBlogs);

// Admin routes
router.post('/', protect, upload.single('image'), createBlog);
router.put('/:id', protect, upload.single('image'), updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;