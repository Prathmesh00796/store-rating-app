const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/dashboard', getDashboard);

module.exports = router;
