import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Prefer a single source of truth via DATABASE_URL to avoid env drift
const connectionString = process.env.DATABASE_URL;

// Connection pool with retry and stability settings
const pool = connectionString
  ? new Pool({
      connectionString,
      max: 20, // Maximum connections in pool
      idleTimeoutMillis: 30000, // Close idle clients after 30s
      connectionTimeoutMillis: 10000, // Timeout for new connections
      allowExitOnIdle: false, // Keep pool alive
      ssl: {
        rejectUnauthorized: false, // Accept self-signed certificates from managed databases
      },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: false,
      ssl: {
        rejectUnauthorized: false,
      },
    });

// Connection health state
let isConnected = false;
let lastError: Error | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS = 5000;

// Test the database connection with retry
const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT NOW()');
    isConnected = true;
    lastError = null;
    reconnectAttempts = 0;
    console.log('Database connected successfully');
    return true;
  } catch (err) {
    isConnected = false;
    lastError = err as Error;
    console.error('Database connection error:', err);
    return false;
  }
};

// Initial connection test
testConnection();

// Periodic health check every 30 seconds
const healthCheckInterval = setInterval(async () => {
  if (!isConnected) {
    console.log(`Attempting database reconnection (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
    const success = await testConnection();
    if (!success) {
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached. Database may be unavailable.');
      }
    }
  } else {
    // Verify connection is still alive
    try {
      await pool.query('SELECT 1');
    } catch {
      isConnected = false;
      console.warn('Database connection lost, will attempt reconnection...');
    }
  }
}, 30000);

// Cleanup on process exit
process.on('beforeExit', () => {
  clearInterval(healthCheckInterval);
});

// Query wrapper with automatic retry for transient errors
const queryWithRetry = async (text: string, params?: any[], retries = 3): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (err: any) {
      const isTransient = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === '57P01';
      if (isTransient && attempt < retries) {
        console.warn(`Query failed (attempt ${attempt}/${retries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
};

export default {
  query: (text: string, params?: any[]) => queryWithRetry(text, params),
  getClient: (): Promise<PoolClient> => pool.connect(),
  getHealth: () => ({ isConnected, lastError: lastError?.message || null, reconnectAttempts }),
  pool, // Expose pool for advanced usage
};

// Handle database errors gracefully (don't crash the process)
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  isConnected = false;
  lastError = err;
  // Don't exit - let health checks handle reconnection
});
