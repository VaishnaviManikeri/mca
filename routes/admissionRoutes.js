const express = require('express');
const router = express.Router();
const { submitAdmission, getAllAdmissions, downloadExcel } = require('../controllers/admissionController');
const { protect } = require('../middleware/authMiddleware');
// Public route for form submission
router.post('/submit', submitAdmission);

// Protected admin routes
router.get('/all', protect, getAllAdmissions);
router.get('/download-excel', protect, downloadExcel);

module.exports = router;