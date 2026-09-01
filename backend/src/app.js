const express = require('express');
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();

// ============================================
// Middleware
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/stores', ratingRoutes);    // /api/stores/:storeId/ratings
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);

// ============================================
// Health check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running.' });
});

// ============================================
// Global error handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
