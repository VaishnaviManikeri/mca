const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  submitAdmission,
  getAllAdmissions,
  downloadExcel
} = require('../controllers/admissionController');

// Public route
router.post('/', submitAdmission);

// Protected admin routes
router.get('/', protect, getAllAdmissions);
router.get('/download', protect, downloadExcel);

module.exports = router;