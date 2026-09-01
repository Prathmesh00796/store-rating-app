const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { validateName, validateEmail, validatePassword, validateAddress, validateRole } = require('../validators/validation');

/**
 * GET /api/users
 * List all users with optional filtering and sorting (Admin only)
 * Query params: name, email, address, role, sortBy, order
 */
async function getUsers(req, res) {
  try {
    const { name, email, address, role, sortBy, order } = req.query;

    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];

    // Apply filters
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    // Apply sorting
    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const [users] = await db.query(query, params);
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * GET /api/users/:id
 * Get user details by ID (Admin only)
 * If user is STORE_OWNER, also returns their store's average rating
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    // If the user is a Store Owner, get their store's average rating
    if (user.role === 'STORE_OWNER') {
      const [storeData] = await db.query(
        `SELECT s.id, s.name, COALESCE(AVG(r.rating), 0) AS averageRating
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?
         GROUP BY s.id, s.name`,
        [user.id]
      );
      user.stores = storeData;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * POST /api/users
 * Create a new user with any role (Admin only)
 */
async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    // Validate all fields
    const errors = [];
    const nameErr = validateName(name);
    if (nameErr) errors.push(nameErr);
    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);
    const passwordErr = validatePassword(password);
    if (passwordErr) errors.push(passwordErr);
    const addressErr = validateAddress(address);
    if (addressErr) errors.push(addressErr);
    const roleErr = validateRole(role);
    if (roleErr) errors.push(roleErr);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), hashedPassword, address ? address.trim() : '', role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getUsers, getUserById, createUser };
