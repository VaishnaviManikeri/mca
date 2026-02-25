const express = require('express');
const router = express.Router();
const {
  getAllCareers,
  createCareer,
  updateCareer,
  deleteCareer
} = require('../controllers/careerController');
const { protect } = require('../middleware/authmiddleware');

// Public routes
router.get('/', getAllCareers);

// Admin routes
router.post('/', protect, createCareer);
router.put('/:id', protect, updateCareer);
router.delete('/:id', protect, deleteCareer);

module.exports = router;