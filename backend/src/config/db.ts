import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export let isDbConnected = false;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString || undefined,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    isDbConnected = false;
    console.warn('[Database] PostgreSQL connection not established: ' + (err.message || 'connection failed'));
    console.log('[Database] Dual-mode activated: Running with resilient active synthetic clinical store.');
  } else {
    isDbConnected = true;
    console.log('[Database] Connected to PostgreSQL at:', res.rows[0].now);
  }
});

pool.on('error', (err) => {
  isDbConnected = false;
  console.warn('[Database Pool Error] Dual-mode fallback active:', err.message);
});

export default pool;
