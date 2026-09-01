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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
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
// Health check (checks server and database)
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'API and database are running.', 
      dbConnected: true,
      engine: db.isSqlite ? 'sqlite-embedded' : 'mysql'
    });
  } catch (err) {
    console.error('Health check DB error:', err.message);
    res.status(500).json({
      success: false,
      message: 'API is running, but database connection failed.',
      dbConnected: false,
      error: err.message,
    });
  }
});

// ============================================
// Global error handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
