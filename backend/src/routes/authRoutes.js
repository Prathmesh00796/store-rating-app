const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (any authenticated user)
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
