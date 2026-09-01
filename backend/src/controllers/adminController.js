const db = require('../config/db');

/**
 * GET /api/admin/dashboard
 * Returns total users, total stores, total ratings (Admin only)
 */
async function getDashboard(req, res) {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await db.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await db.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    res.json({
      success: true,
      data: { totalUsers, totalStores, totalRatings },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getDashboard };
