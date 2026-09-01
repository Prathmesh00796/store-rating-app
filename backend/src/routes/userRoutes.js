const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All user routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

module.exports = router;
