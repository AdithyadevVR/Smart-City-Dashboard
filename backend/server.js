// ─────────────────────────────────────────────
// server.js — NEXUS City Backend
// ─────────────────────────────────────────────
require('dotenv').config({ path: __dirname + '/.env' });
const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const { Server } = require('socket.io');
const db         = require('./db');

const app    = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────
// CORS — allow your frontend origin
// ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  // Add your deployed Netlify/Vercel URL here:
  // 'https://nexus-city.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like file:// or Postman)
    if (!origin) return callback(null, true);

    // Allow local development servers
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Otherwise block
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());

// ─────────────────────────────────────────────
// SOCKET.IO — real-time updates
// ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Attach io to every request so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/traffic', require('./routes/traffic'));
app.use('/api/waste',   require('./routes/waste'));
app.use('/api/energy',  require('./routes/energy'));

// ─────────────────────────────────────────────
// EXTRA ROUTES
// ─────────────────────────────────────────────

// GET /api/incidents — open incidents/decisions (all authenticated users)
app.get('/api/incidents', require('./middleware/auth'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, u.name AS created_by_name
       FROM incidents i
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.status = 'open'
       ORDER BY
         CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents.' });
  }
});

// PUT /api/incidents/:id — update incident status
app.put('/api/incidents/:id', require('./middleware/auth'), async (req, res) => {
  const { status } = req.body; // 'approved' | 'deferred' | 'resolved'
  try {
    const result = await db.query(
      `UPDATE incidents
       SET status=$1, resolved_at = CASE WHEN $1 != 'open' THEN NOW() ELSE NULL END
       WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Incident not found.' });

    // Broadcast to all connected clients
    io.emit('incident-update', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update incident.' });
  }
});

// GET /api/activity — recent activity log (all authenticated users)
app.get('/api/activity', require('./middleware/auth'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, u.name AS user_name
       FROM activity_log a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC
       LIMIT 30`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity.' });
  }
});

// GET /api/dashboard — single endpoint returning all dashboard data
app.get('/api/dashboard', require('./middleware/auth'), async (req, res) => {
  try {
    const [traffic, waste, energy, incidents, activity] = await Promise.all([
      db.query('SELECT * FROM traffic_sensors ORDER BY congestion DESC'),
      db.query('SELECT * FROM waste_facilities ORDER BY capacity DESC'),
      db.query('SELECT * FROM energy_sources ORDER BY output_mw DESC'),
      db.query(`SELECT * FROM incidents WHERE status='open' ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`),
      db.query('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 20')
    ]);

    // City score calculation
    const avgCongestion = traffic.rows.reduce((s, r) => s + r.congestion, 0) / (traffic.rows.length || 1);
    const avgWaste      = waste.rows.reduce((s, r) => s + r.capacity, 0)    / (waste.rows.length || 1);
    const totalEnergy   = energy.rows.reduce((s, r) => s + parseFloat(r.output_mw), 0);
    const renewableMw   = energy.rows
      .filter(r => ['solar','wind','hydro'].includes(r.type))
      .reduce((s, r) => s + parseFloat(r.output_mw), 0);
    const renewablePct  = totalEnergy > 0 ? (renewableMw / totalEnergy) * 100 : 0;

    // Score: lower congestion = better, lower waste = better, more renewables = better
    const cityScore = Math.round(
      100 - (avgCongestion * 0.35) - (avgWaste * 0.25) + (renewablePct * 0.40)
    );

    res.json({
      city_score: Math.max(0, Math.min(100, cityScore)),
      traffic:    traffic.rows,
      waste:      waste.rows,
      energy:     energy.rows,
      incidents:  incidents.rows,
      activity:   activity.rows,
      summary: {
        avg_congestion:  Math.round(avgCongestion),
        avg_waste:       Math.round(avgWaste),
        total_energy_mw: totalEnergy.toFixed(1),
        renewable_pct:   renewablePct.toFixed(1)
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

// ─────────────────────────────────────────────
// SCHEDULED JOBS
// ─────────────────────────────────────────────

// 1. Save analytics snapshot every 30 minutes
setInterval(async () => {
  try {
    const traffic = await db.query('SELECT AVG(congestion) AS c, AVG(avg_speed) AS s FROM traffic_sensors');
    const waste   = await db.query('SELECT AVG(capacity) AS w FROM waste_facilities');
    const energy  = await db.query('SELECT SUM(output_mw) AS e FROM energy_sources');

    const avgCongestion = parseFloat(traffic.rows[0].c) || 0;
    const avgWaste      = parseFloat(waste.rows[0].w)   || 0;
    const totalEnergy   = parseFloat(energy.rows[0].e)  || 0;
    const cityScore     = Math.max(0, Math.min(100, Math.round(100 - avgCongestion * 0.35 - avgWaste * 0.25)));

    await db.query(
      `INSERT INTO analytics_snapshots (avg_congestion, avg_speed, total_waste_pct, total_energy_mw, city_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [avgCongestion.toFixed(2), parseFloat(traffic.rows[0].s || 0).toFixed(2),
       avgWaste.toFixed(2), totalEnergy.toFixed(2), cityScore]
    );

    console.log(`📊 Analytics snapshot saved — score: ${cityScore}`);
  } catch (err) {
    console.error('Snapshot error:', err.message);
  }
}, 30 * 60 * 1000); // every 30 minutes

// 2. Broadcast live dashboard data to all connected clients every 15 seconds
setInterval(async () => {
  if (io.engine.clientsCount === 0) return; // skip if no clients

  try {
    const traffic = await db.query('SELECT sector, congestion, status FROM traffic_sensors');
    const energy  = await db.query('SELECT type, output_mw FROM energy_sources');
    const waste   = await db.query('SELECT zone, capacity, status FROM waste_facilities');

    io.emit('live-update', {
      timestamp: new Date().toISOString(),
      traffic:   traffic.rows,
      energy:    energy.rows,
      waste:     waste.rows
    });
  } catch (err) {
    // Silently ignore broadcast errors
  }
}, 15000);

// 3. Auto-generate activity log entries every 2 minutes (simulates sensor events)
const sensorEvents = [
  { module: 'traffic', icon: '🚗', msg: 'Traffic count updated across all active sensors' },
  { module: 'energy',  icon: '⚡', msg: 'Energy output readings synchronized' },
  { module: 'waste',   icon: '♻️', msg: 'Bin sensor network pinged — all zones reporting' },
  { module: 'traffic', icon: '🚦', msg: 'Signal timing optimization cycle completed' },
  { module: 'energy',  icon: '🔋', msg: 'Battery storage status updated' },
];
let eventIdx = 0;

setInterval(async () => {
  try {
    const e = sensorEvents[eventIdx % sensorEvents.length];
    eventIdx++;

    const result = await db.query(
      `INSERT INTO activity_log (module, icon, message) VALUES ($1, $2, $3) RETURNING *`,
      [e.module, e.icon, e.msg]
    );

    // Broadcast new activity to all clients
    io.emit('new-activity', result.rows[0]);
  } catch (err) {
    // Silently ignore
  }
}, 2 * 60 * 1000);

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NEXUS City API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ─────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   NEXUS CITY BACKEND — RUNNING        ║');
  console.log(`║   http://localhost:${PORT}               ║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('');
});