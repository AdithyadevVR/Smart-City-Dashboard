// ─────────────────────────────────────────────
// routes/energy.js — Energy source CRUD
// ─────────────────────────────────────────────
// GET    /api/energy            — list all sources
// GET    /api/energy/analytics  — chart + summary data
// GET    /api/energy/:id        — single source
// POST   /api/energy            — admin: create
// PUT    /api/energy/:id        — admin: update
// DELETE /api/energy/:id        — admin: delete
// ─────────────────────────────────────────────
const router    = require('express').Router();
const db        = require('../db');
const authMw    = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

async function logActivity(message, userId = null) {
  await db.query(
    `INSERT INTO activity_log (module, icon, message, created_by) VALUES ('energy', '⚡', $1, $2)`,
    [message, userId]
  ).catch(() => {});
}

// ─────────────────────────────────────────────
// GET /api/energy
// ─────────────────────────────────────────────
router.get('/', authMw, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM energy_sources ORDER BY output_mw DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get energy error:', err);
    res.status(500).json({ error: 'Failed to fetch energy data.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/energy/analytics
// Returns donut data, totals, cost summary, trend
// ─────────────────────────────────────────────
router.get('/analytics', authMw, async (req, res) => {
  try {
    // Totals
    const totals = await db.query(
      `SELECT
         ROUND(SUM(output_mw), 2)                          AS total_mw,
         ROUND(AVG(capacity_pct), 1)                       AS avg_capacity,
         ROUND(SUM(output_mw * cost_per_mwh) / NULLIF(SUM(output_mw), 0), 2) AS blended_cost_per_mwh,
         COUNT(*) FILTER (WHERE status = 'online')         AS online_count,
         COUNT(*) FILTER (WHERE status = 'partial')        AS partial_count,
         COUNT(*) FILTER (WHERE status = 'offline')        AS offline_count
       FROM energy_sources`
    );

    // By source type (for donut chart)
    const byType = await db.query(
      `SELECT type,
              ROUND(SUM(output_mw), 2)                     AS total_mw,
              ROUND(SUM(output_mw) * 100.0 / NULLIF(
                (SELECT SUM(output_mw) FROM energy_sources), 0
              ), 1)                                         AS pct_of_total,
              ROUND(AVG(cost_per_mwh), 2)                  AS avg_cost
       FROM energy_sources
       GROUP BY type
       ORDER BY total_mw DESC`
    );

    // Trend from snapshots
    const trend = await db.query(
      `SELECT DATE_TRUNC('hour', snapshot_time) AS hour,
              ROUND(AVG(total_energy_mw), 2) AS total_mw
       FROM analytics_snapshots
       WHERE snapshot_time > NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('hour', snapshot_time)
       ORDER BY hour ASC`
    );

    res.json({
      totals: totals.rows[0],
      by_type: byType.rows,
      trend: trend.rows
    });
  } catch (err) {
    console.error('Energy analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/energy/:id
// ─────────────────────────────────────────────
router.get('/:id', authMw, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM energy_sources WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Energy source not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/energy — admin only
// Body: { source_code, name, type, output_mw, capacity_pct, cost_per_mwh, status }
// ─────────────────────────────────────────────
router.post('/', authMw, adminOnly, async (req, res) => {
  const { source_code, name, type, output_mw, capacity_pct, cost_per_mwh, status } = req.body;

  if (!source_code || !name || !type) {
    return res.status(400).json({ error: 'source_code, name and type are required.' });
  }

  const validTypes = ['solar', 'wind', 'gas', 'grid', 'hydro', 'nuclear', 'battery'];
  if (!validTypes.includes(type.toLowerCase())) {
    return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
  }

  try {
    const result = await db.query(
      `INSERT INTO energy_sources (source_code, name, type, output_mw, capacity_pct, cost_per_mwh, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        source_code.toUpperCase(), name, type.toLowerCase(),
        parseFloat(output_mw) || 0,
        parseInt(capacity_pct) || 0,
        parseFloat(cost_per_mwh) || 0,
        status || 'online'
      ]
    );

    await logActivity(`New source added: ${name} (${type}) — ${output_mw} MW`, req.user.id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Source code already exists.' });
    console.error('Create energy source error:', err);
    res.status(500).json({ error: 'Failed to create energy source.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/energy/:id — admin only
// ─────────────────────────────────────────────
router.put('/:id', authMw, adminOnly, async (req, res) => {
  const { name, type, output_mw, capacity_pct, cost_per_mwh, status } = req.body;

  try {
    const current = await db.query('SELECT * FROM energy_sources WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Energy source not found.' });
    const e = current.rows[0];

    const result = await db.query(
      `UPDATE energy_sources
       SET name=$1, type=$2, output_mw=$3, capacity_pct=$4, cost_per_mwh=$5, status=$6, updated_at=NOW()
       WHERE id=$7
       RETURNING *`,
      [
        name          || e.name,
        type          ? type.toLowerCase() : e.type,
        output_mw     !== undefined ? parseFloat(output_mw) : e.output_mw,
        capacity_pct  !== undefined ? parseInt(capacity_pct) : e.capacity_pct,
        cost_per_mwh  !== undefined ? parseFloat(cost_per_mwh) : e.cost_per_mwh,
        status        || e.status,
        req.params.id
      ]
    );

    await logActivity(`Source ${e.name} updated — ${result.rows[0].output_mw} MW`, req.user.id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update energy source error:', err);
    res.status(500).json({ error: 'Failed to update energy source.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/energy/:id — admin only
// ─────────────────────────────────────────────
router.delete('/:id', authMw, adminOnly, async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM energy_sources WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Energy source not found.' });

    await db.query('DELETE FROM energy_sources WHERE id = $1', [req.params.id]);
    await logActivity(`Source ${current.rows[0].name} deleted`, req.user.id);
    res.json({ success: true, message: 'Energy source deleted.' });
  } catch (err) {
    console.error('Delete energy source error:', err);
    res.status(500).json({ error: 'Failed to delete energy source.' });
  }
});

module.exports = router;