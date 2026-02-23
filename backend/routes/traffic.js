// ─────────────────────────────────────────────
// routes/traffic.js — Traffic sensor CRUD
// ─────────────────────────────────────────────
// GET    /api/traffic           — all users: list sensors
// GET    /api/traffic/:id       — all users: single sensor
// GET    /api/traffic/analytics — all users: chart data
// POST   /api/traffic           — admin: create sensor
// PUT    /api/traffic/:id       — admin: update sensor
// DELETE /api/traffic/:id       — admin: delete sensor
// ─────────────────────────────────────────────
const router    = require('express').Router();
const db        = require('../db');
const authMw    = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// ── Helper: derive status from congestion value ──
function deriveStatus(congestion) {
  if (congestion >= 75) return 'high';
  if (congestion >= 45) return 'medium';
  return 'low';
}

// ── Helper: log activity ──
async function logActivity(message, userId = null) {
  await db.query(
    `INSERT INTO activity_log (module, icon, message, created_by) VALUES ('traffic', '🚗', $1, $2)`,
    [message, userId]
  ).catch(() => {}); // don't fail the main request if logging fails
}

// ─────────────────────────────────────────────
// GET /api/traffic
// Returns all sensors sorted by congestion desc
// ─────────────────────────────────────────────
router.get('/', authMw, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM traffic_sensors ORDER BY congestion DESC, updated_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get traffic error:', err);
    res.status(500).json({ error: 'Failed to fetch traffic data.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/traffic/analytics
// Returns aggregated data for charts
// Query params: ?period=7d (default) | 24h | 30d
// ─────────────────────────────────────────────
router.get('/analytics', authMw, async (req, res) => {
  const period = req.query.period || '7d';
  const intervalMap = { '24h': '24 hours', '7d': '7 days', '30d': '30 days' };
  const interval = intervalMap[period] || '7 days';

  try {
    // Sector-by-sector congestion breakdown
    const bySector = await db.query(
      `SELECT sector,
              ROUND(AVG(congestion), 1) AS avg_congestion,
              ROUND(AVG(avg_speed), 1)  AS avg_speed,
              COUNT(*)                  AS sensor_count
       FROM traffic_sensors
       GROUP BY sector
       ORDER BY avg_congestion DESC`
    );

    // Snapshots over time
    const trend = await db.query(
      `SELECT DATE_TRUNC('hour', snapshot_time) AS hour,
              ROUND(AVG(avg_congestion), 1) AS avg_congestion,
              ROUND(AVG(avg_speed), 1)      AS avg_speed
       FROM analytics_snapshots
       WHERE snapshot_time > NOW() - INTERVAL '${interval}'
       GROUP BY DATE_TRUNC('hour', snapshot_time)
       ORDER BY hour ASC`
    );

    // Summary stats
    const summary = await db.query(
      `SELECT
         COUNT(*) AS total_sensors,
         COUNT(*) FILTER (WHERE status = 'high')   AS high_count,
         COUNT(*) FILTER (WHERE status = 'medium') AS med_count,
         COUNT(*) FILTER (WHERE status = 'low')    AS low_count,
         ROUND(AVG(congestion), 1) AS avg_congestion,
         ROUND(AVG(avg_speed), 1)  AS avg_speed
       FROM traffic_sensors`
    );

    res.json({
      summary: summary.rows[0],
      by_sector: bySector.rows,
      trend: trend.rows
    });
  } catch (err) {
    console.error('Traffic analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/traffic/:id
// ─────────────────────────────────────────────
router.get('/:id', authMw, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM traffic_sensors WHERE id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Sensor not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/traffic — admin only
// Body: { sensor_code, location, sector, congestion, avg_speed }
// ─────────────────────────────────────────────
router.post('/', authMw, adminOnly, async (req, res) => {
  const { sensor_code, location, sector, congestion, avg_speed } = req.body;

  if (!sensor_code || !location || !sector) {
    return res.status(400).json({ error: 'sensor_code, location and sector are required.' });
  }

  try {
    const status = deriveStatus(parseInt(congestion) || 0);
    const result = await db.query(
      `INSERT INTO traffic_sensors (sensor_code, location, sector, congestion, avg_speed, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sensor_code.toUpperCase(), location, sector.toUpperCase(),
       parseInt(congestion) || 0, parseInt(avg_speed) || 0, status]
    );

    await logActivity(`New sensor added: ${sensor_code} at ${location}`, req.user.id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Sensor code already exists.' });
    console.error('Create sensor error:', err);
    res.status(500).json({ error: 'Failed to create sensor.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/traffic/:id — admin only
// Body: { location?, sector?, congestion?, avg_speed? }
// ─────────────────────────────────────────────
router.put('/:id', authMw, adminOnly, async (req, res) => {
  const { location, sector, congestion, avg_speed } = req.body;

  try {
    const current = await db.query('SELECT * FROM traffic_sensors WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Sensor not found.' });
    const s = current.rows[0];

    const newCongestion = congestion !== undefined ? parseInt(congestion) : s.congestion;
    const newStatus = deriveStatus(newCongestion);

    const result = await db.query(
      `UPDATE traffic_sensors
       SET location=$1, sector=$2, congestion=$3, avg_speed=$4, status=$5, updated_at=NOW()
       WHERE id=$6
       RETURNING *`,
      [
        location    || s.location,
        sector      ? sector.toUpperCase() : s.sector,
        newCongestion,
        avg_speed   !== undefined ? parseInt(avg_speed) : s.avg_speed,
        newStatus,
        req.params.id
      ]
    );

    await logActivity(`Sensor ${s.sensor_code} updated — congestion: ${newCongestion}%`, req.user.id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update sensor error:', err);
    res.status(500).json({ error: 'Failed to update sensor.' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/traffic/:id — admin only
// ─────────────────────────────────────────────
router.delete('/:id', authMw, adminOnly, async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM traffic_sensors WHERE id = $1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Sensor not found.' });

    await db.query('DELETE FROM traffic_sensors WHERE id = $1', [req.params.id]);
    await logActivity(`Sensor ${current.rows[0].sensor_code} deleted`, req.user.id);
    res.json({ success: true, message: 'Sensor deleted.' });
  } catch (err) {
    console.error('Delete sensor error:', err);
    res.status(500).json({ error: 'Failed to delete sensor.' });
  }
});

module.exports = router;