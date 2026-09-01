const jwt = require('jsonwebtoken');

/**
 * Middleware: Verify JWT token from Authorization header
 * Attaches decoded user info (userId, role) to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Middleware Factory: Restrict access to specific roles
 * Usage: requireRole('ADMIN') or requireRole('ADMIN', 'STORE_OWNER')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to perform this action.' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
