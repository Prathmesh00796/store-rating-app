const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateName, validateEmail, validatePassword, validateAddress } = require('../validators/validation');

/**
 * POST /api/auth/register
 * Register a new Normal User (public endpoint)
 */
async function register(req, res) {
  try {
    const { name, email, password, address } = req.body;

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

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    // Hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), hashedPassword, address ? address.trim() : '', 'NORMAL_USER']
    );

    res.status(201).json({ success: true, message: 'Registration successful.' });
  } catch (err) {
    console.error('Register error:', err);
    let message = 'Server error.';
    if (err.code === 'ER_NO_SUCH_TABLE') {
      message = 'Database tables not found. Please run schema.sql and seed the database.';
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      message = `Database connection failed (${err.code}). Please check DB environment variables.`;
    } else if (err.message) {
      message = `Server error: ${err.message}`;
    }
    res.status(500).json({ success: false, message });
  }
}

/**
 * POST /api/auth/login
 * Login for all roles (single login system)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token (payload: userId + role only — no sensitive data)
    const jwtSecret = process.env.JWT_SECRET || 'store_rating_jwt_default_secret_key_2025';
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Return token and user info (never send password)
    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    let message = 'Server error.';
    if (err.code === 'ER_NO_SUCH_TABLE') {
      message = 'Database tables not found. Please run schema.sql and seed the database.';
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      message = `Database connection failed (${err.code}). Please check DB environment variables.`;
    } else if (err.message) {
      message = `Server error: ${err.message}`;
    }
    res.status(500).json({ success: false, message });
  }
}

/**
 * POST /api/auth/change-password
 * Change password for authenticated user (any role)
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    // Validate new password
    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      return res.status(400).json({ success: false, message: passwordErr });
    }

    // Get current user
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login, changePassword };
