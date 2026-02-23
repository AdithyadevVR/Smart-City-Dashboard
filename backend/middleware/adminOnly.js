// ─────────────────────────────────────────────
// middleware/adminOnly.js — Admin role guard
// ─────────────────────────────────────────────
// Always use AFTER authMiddleware, never before.
// Example:
//   router.post('/', authMiddleware, adminOnly, handler)
// ─────────────────────────────────────────────

module.exports = function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden. Administrator access required.'
    });
  }

  next();
};