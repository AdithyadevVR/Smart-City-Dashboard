// ─────────────────────────────────────────────
// routes/waste.js — Waste facility CRUD
// ─────────────────────────────────────────────
// GET    /api/waste            — list all facilities
// GET    /api/waste/analytics  — chart + summary data
// GET    /api/waste/:id        — single facility
// POST   /api/waste            — admin: create
// PUT    /api/waste/:id        — admin: update
// DELETE /api/waste/:id        — admin: delete
// ─────────────────────────────────────────────
const router    = require('express').Router();
const db        = require('../db');
const authMw    = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

function deriveStatus(capacity) {
  if (capacity >= 85) return 'critical';
  if (capacity >= 60) return 'moderate';
  return 'good';
}

async function logActivity(message, userId = null) {
  await db.query(
    `INSERT INTO activity_log (module, icon, message, created_by) VALUES ('waste', '♻️', $1, $2)`,
    [message, userId]
  ).catch(() => {});
}

// ─────────────────────────────────────────────
// GET /api/waste
// ─────────────────────────────────────────────
router.get('/', authMw, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM waste_facilities ORDER BY capacity DESC, updated_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get waste error:', err);
    res.status(500).json({ error: 'Failed to fetch waste data.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/waste/analytics
// ─────────────────────────────────────────────
router.get('/analytics', authMw, async (req, res) => {
  try {
    const summary = await db.query(
      `SELECT
         COUNT(*) AS total_facilities,
         COUNT(*) FILTER (WHERE status = 'critical') AS critical_count,
         COUNT(*) FILTER (WHERE status = 'moderate') AS moderate_count,
         COUNT(*) FILTER (WHERE status = 'good')     AS good_count,
         ROUND(AVG(capacity), 1)                     AS avg_capacity,
         MAX(capacity)                               AS max_capacity
       FROM waste_facilities`
    );

    const byZone = await db.query(
      `SELECT zone, name, capacity, status, last_pickup, next_pickup
       FROM waste_facilities
       ORDER BY capacity DESC`
    );

    // Capacity trend from snapshots
    const trend = await db.query(
      `SELECT DATE_TRUNC('hour', snapshot_time) AS hour,
              ROUND(AVG(total_waste_pct), 1) AS avg_waste_pct
       FROM analytics_snapshots
       WHERE snapshot_time > NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('hour', snapshot_time)
       ORDER BY hour ASC`
    );

    res.json({
      summary: summary.rows[0],
      by_zone: byZone.rows,
      trend: trend.rows
    });
  } catch (err) {
    console.error('Waste analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/waste/:id
// ─────────────────────────────────────────────
router.get('/:id', authMw, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM waste_facilities WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Facility not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/waste — admin only
// Body: { facility_code, zone, name, capacity, next_pickup }
// ─────────────────────────────────────────────
router.post('/', authMw, adminOnly, async (req, res) => {
  const { facility_code, zone, name, capacity, next_pickup } = req.body;

  if (!facility_code || !zone || !name) {
    return res.status(400).json({ error: 'facility_code, zone and name are required.' });
  }

  try {
    const cap = parseInt(capacity) || 0;
    const status = deriveStatus(cap);

    const result = await db.query(
      `INSERT INTO waste_facilities (facility_code, zone, name, capacity, next_pickup, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [facility_code.toUpperCase(), zone, name, cap,
       next_pickup ? new Date(next_pickup) : null, status]
    );

    await logActivity(`New facility added: ${name} in ${zone}`, req.user.id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Facility code already exists.' });
    console.error('Create facility error:', err);
    res.status(500).json({ error: 'Failed to create facility.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/waste/:id — admin only
// Body: { zone?, name?, capacity?, last_pickup?, next_pickup? }
// ─────────────────────────────────────────────
router.put('/:id', authMw, adminOnly, async (req, res) => {
  const { zone, name, capacity, last_pickup, next_pickup } = req.body;

  try {
    const current = await db.query('SELECT * FROM waste_facilities WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Facility not found.' });
    const f = current.rows[0];

    const newCapacity = capacity !== undefined ? parseInt(capacity) : f.capacity;
    const newStatus = deriveStatus(newCapacity);

    const result = await db.query(
      `UPDATE waste_facilities
       SET zone=$1, name=$2, capacity=$3, last_pickup=$4, next_pickup=$5, status=$6, updated_at=NOW()
       WHERE id=$7
       RETURNING *`,
      [
        zone        || f.zone,
        name        || f.name,
        newCapacity,
        last_pickup ? new Date(last_pickup) : f.last_pickup,
        next_pickup ? new Date(next_pickup) : f.next_pickup,
        newStatus,
        req.params.id
      ]
    );

    await logActivity(`Facility ${f.name} updated — capacity: ${newCapacity}%`, req.user.id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update facility error:', err);
    res.status(500).json({ error: 'Failed to update facility.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/waste/:id — admin only
// ─────────────────────────────────────────────
router.delete('/:id', authMw, adminOnly, async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM waste_facilities WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Facility not found.' });

    await db.query('DELETE FROM waste_facilities WHERE id = $1', [req.params.id]);
    await logActivity(`Facility ${current.rows[0].name} deleted`, req.user.id);
    res.json({ success: true, message: 'Facility deleted.' });
  } catch (err) {
    console.error('Delete facility error:', err);
    res.status(500).json({ error: 'Failed to delete facility.' });
  }
});

module.exports = router;