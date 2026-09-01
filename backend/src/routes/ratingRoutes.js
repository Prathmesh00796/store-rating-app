const express = require('express');
const router = express.Router();
const { submitRating, modifyRating, getStoreRatings } = require('../controllers/ratingController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All rating routes require authentication
router.use(authenticateToken);

// Normal users can submit and modify ratings
router.post('/:storeId/ratings', requireRole('NORMAL_USER'), submitRating);
router.put('/:storeId/ratings', requireRole('NORMAL_USER'), modifyRating);

// Get ratings for a store (used by admin and owner views)
router.get('/:storeId/ratings', getStoreRatings);

module.exports = router;
