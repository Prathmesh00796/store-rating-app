const db = require('../config/db');

/**
 * GET /api/stores
 * List all stores with average rating and optional search/sort
 * For NORMAL_USER, also includes their own submitted rating per store
 * Query params: name, address, sortBy, order
 */
async function getStores(req, res) {
  try {
    const { name, address, sortBy, order } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query = `
      SELECT 
        s.id, s.name, s.email, s.address, s.owner_id,
        COALESCE(AVG(r.rating), 0) AS averageRating,
        COUNT(r.id) AS totalRatings
    `;

    // If normal user, also get their own rating for each store
    if (userRole === 'NORMAL_USER') {
      query += `,
        (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) AS userRating
      `;
    }

    query += `
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [];
    if (userRole === 'NORMAL_USER') {
      params.push(userId);
    }

    // Apply search filters
    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    // Apply sorting
    const allowedSortFields = ['name', 'email', 'address', 'averageRating'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy === 'averageRating' ? 'averageRating' : `s.${sortBy}`} ${sortOrder}`;
    } else {
      query += ' ORDER BY s.name ASC';
    }

    const [stores] = await db.query(query, params);
    res.json({ success: true, data: stores });
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * GET /api/stores/:id
 * Get a single store by ID with its average rating
 */
async function getStoreById(req, res) {
  try {
    const { id } = req.params;

    const [stores] = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
              COALESCE(AVG(r.rating), 0) AS averageRating,
              COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    res.json({ success: true, data: stores[0] });
  } catch (err) {
    console.error('Get store by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * POST /api/stores
 * Create a new store (Admin only)
 */
async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Store name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Store email is required.' });
    }
    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'Store owner is required.' });
    }

    // Verify owner exists and is a STORE_OWNER
    const [owners] = await db.query(
      'SELECT id, role FROM users WHERE id = ? AND role = ?',
      [ownerId, 'STORE_OWNER']
    );
    if (owners.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected owner must be a Store Owner user.' });
    }

    const [result] = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), address ? address.trim() : '', ownerId]
    );

    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * GET /api/stores/owners
 * Get all Store Owner users (for the store creation form dropdown)
 */
async function getStoreOwners(req, res) {
  try {
    const [owners] = await db.query(
      "SELECT id, name, email FROM users WHERE role = 'STORE_OWNER' ORDER BY name ASC"
    );
    res.json({ success: true, data: owners });
  } catch (err) {
    console.error('Get store owners error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getStores, getStoreById, createStore, getStoreOwners };
