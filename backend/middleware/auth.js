// ─────────────────────────────────────────────
// middleware/auth.js — JWT authentication guard
// ─────────────────────────────────────────────
// Attach this to any route that requires a logged-in user.
// It reads the token from the Authorization header, verifies it,
// and attaches the decoded user payload to req.user.
// ─────────────────────────────────────────────
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  // Token should come in: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};