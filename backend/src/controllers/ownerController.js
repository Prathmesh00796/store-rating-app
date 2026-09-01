const db = require('../config/db');

/**
 * GET /api/owner/dashboard
 * Returns the store owner's store info and average rating
 * The owner is identified from the JWT token — they cannot access other stores
 */
async function getOwnerDashboard(req, res) {
  try {
    const ownerId = req.user.userId;

    // Get the owner's store with average rating
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(AVG(r.rating), 0) AS averageRating,
              COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.json({
        success: true,
        data: { store: null, averageRating: 0, totalRatings: 0 },
      });
    }

    res.json({
      success: true,
      data: {
        store: stores[0],
        averageRating: parseFloat(stores[0].averageRating) || 0,
        totalRatings: stores[0].totalRatings,
      },
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * GET /api/owner/ratings
 * Returns list of users who rated the owner's store, with their rating values
 * Owner is identified from JWT — cannot see ratings for other stores
 */
async function getOwnerRatings(req, res) {
  try {
    const ownerId = req.user.userId;

    // First get the owner's store
    const [stores] = await db.query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);

    if (stores.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const storeId = stores[0].id;

    // Get all ratings for this store with user info
    const [ratings] = await db.query(
      `SELECT u.name AS userName, u.email AS userEmail, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json({ success: true, data: ratings });
  } catch (err) {
    console.error('Owner ratings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getOwnerDashboard, getOwnerRatings };
