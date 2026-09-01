const express = require('express');
const router = express.Router();
const { getOwnerDashboard, getOwnerRatings } = require('../controllers/ownerController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All owner routes require STORE_OWNER role
router.use(authenticateToken, requireRole('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);
router.get('/ratings', getOwnerRatings);

module.exports = router;
