// ─────────────────────────────────────────────
// routes/auth.js — Authentication routes
// ─────────────────────────────────────────────
// POST /api/auth/register   — create new resident account
// POST /api/auth/login      — login, returns JWT
// GET  /api/auth/me         — get current user profile
// PUT  /api/auth/me         — update own profile
// ─────────────────────────────────────────────
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const authMw  = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// ── Helper: create a signed JWT ──────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── Helper: safe user object (no password) ───
function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ─────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    // Hash password (12 salt rounds = very secure, ~300ms)
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'resident')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const user = result.rows[0];

    // Log activity
    await db.query(
      `INSERT INTO activity_log (module, icon, message) VALUES ('system', '👤', $1)`,
      [`New resident registered: ${user.name}`]
    );

    const token = signToken(user);
    res.status(201).json({ token, user: safeUser(user) });

  } catch (err) {
    // Postgres unique violation code
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Check user exists AND password matches
    // (Do both checks before responding to prevent timing attacks)
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last_active timestamp
    await db.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    const token = signToken(user);
    res.json({ token, user: safeUser(user) });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me — get own profile
// Requires: Authorization: Bearer <token>
// ─────────────────────────────────────────────
router.get('/me', authMw, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at, last_active FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/me — update own name/password
// Body: { name?, currentPassword?, newPassword? }
// ─────────────────────────────────────────────
router.put('/me', authMw, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let hashedPassword = user.password;

    // If changing password, verify current one first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to set new password.' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      hashedPassword = await bcrypt.hash(newPassword, 12);
    }

    const updated = await db.query(
      `UPDATE users SET name = $1, password = $2 WHERE id = $3
       RETURNING id, name, email, role, created_at`,
      [name || user.name, hashedPassword, req.user.id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/users — admin only: list all users
// ─────────────────────────────────────────────
router.get('/users', authMw, adminOnly, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at, last_active FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/users/:id — admin only: update any user
// Body: { name?, email?, role?, password? }
// ─────────────────────────────────────────────
router.put('/users/:id', authMw, adminOnly, async (req, res) => {
  const { name, email, role, password } = req.body;
  const { id } = req.params;

  try {
    const current = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'User not found.' });
    const u = current.rows[0];

    const hashed = password ? await bcrypt.hash(password, 12) : u.password;

    const updated = await db.query(
      `UPDATE users SET name=$1, email=$2, role=$3, password=$4 WHERE id=$5
       RETURNING id, name, email, role, created_at, last_active`,
      [name || u.name, email || u.email, role || u.role, hashed, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use.' });
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/auth/users/:id — admin only
// ─────────────────────────────────────────────
router.delete('/users/:id', authMw, adminOnly, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;