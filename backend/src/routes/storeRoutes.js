const express = require('express');
const router = express.Router();
const { getStores, getStoreById, createStore, getStoreOwners } = require('../controllers/storeController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All store routes require authentication
router.use(authenticateToken);

// Any authenticated user can view stores
router.get('/', getStores);
router.get('/owners', requireRole('ADMIN'), getStoreOwners);
router.get('/:id', getStoreById);

// Only admin can create stores
router.post('/', requireRole('ADMIN'), createStore);

module.exports = router;
