const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboard } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
router.post('/login', loginAdmin);
router.get('/dashboard', protect, getDashboard);

module.exports = router;