// ─────────────────────────────────────────────
// db/index.js — PostgreSQL connection pool
// ─────────────────────────────────────────────
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Uncomment below if using Supabase or remote DB with SSL:
  // ssl: { rejectUnauthorized: false }
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check your DATABASE_URL in .env');
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

/**
 * Run a SQL query with optional parameters.
 * Usage: await db.query('SELECT * FROM users WHERE id = $1', [userId])
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool (for transactions).
 * Usage:
 *   const client = await db.getClient()
 *   await client.query('BEGIN')
 *   ...
 *   await client.query('COMMIT')
 *   client.release()
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };