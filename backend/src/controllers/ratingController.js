const db = require('../config/db');
const { validateRating } = require('../validators/validation');

/**
 * POST /api/stores/:storeId/ratings
 * Submit a rating for a store (Normal User only)
 */
async function submitRating(req, res) {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.userId;

    // Validate rating value
    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ success: false, message: ratingErr });
    }

    // Check if store exists
    const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if user already rated this store
    const [existing] = await db.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already rated this store. Use modify instead.' });
    }

    // Insert rating
    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );

    res.status(201).json({ success: true, message: 'Rating submitted successfully.' });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * PUT /api/stores/:storeId/ratings
 * Modify an existing rating (Normal User only)
 */
async function modifyRating(req, res) {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.userId;

    // Validate rating value
    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ success: false, message: ratingErr });
    }

    // Check if user has an existing rating for this store
    const [existing] = await db.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'No existing rating found. Submit a rating first.' });
    }

    // Update the rating
    await db.query(
      'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
      [rating, userId, storeId]
    );

    res.json({ success: true, message: 'Rating updated successfully.' });
  } catch (err) {
    console.error('Modify rating error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * GET /api/stores/:storeId/ratings
 * Get all ratings for a store
 */
async function getStoreRatings(req, res) {
  try {
    const { storeId } = req.params;

    const [ratings] = await db.query(
      `SELECT r.id, r.rating, r.created_at, u.name AS userName, u.email AS userEmail
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json({ success: true, data: ratings });
  } catch (err) {
    console.error('Get store ratings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { submitRating, modifyRating, getStoreRatings };
