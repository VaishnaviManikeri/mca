const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllGallery,
  createGallery,
  updateGallery,
  deleteGallery
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authmiddleware');

const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', getAllGallery);

// Admin routes
router.post('/', protect, upload.single('image'), createGallery);
router.put('/:id', protect, upload.single('image'), updateGallery);
router.delete('/:id', protect, deleteGallery);

module.exports = router;