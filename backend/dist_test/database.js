"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Prefer a single source of truth via DATABASE_URL to avoid env drift
const connectionString = process.env.DATABASE_URL;
// Connection pool with retry and stability settings
const pool = connectionString
    ? new pg_1.Pool({
        connectionString,
        max: 20, // Maximum connections in pool
        idleTimeoutMillis: 30000, // Close idle clients after 30s
        connectionTimeoutMillis: 10000, // Timeout for new connections
        allowExitOnIdle: false, // Keep pool alive
        ssl: {
            rejectUnauthorized: false, // Accept self-signed certificates from managed databases
        },
    })
    : new pg_1.Pool({
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
let lastError = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS = 5000;
// Test the database connection with retry
const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        isConnected = true;
        lastError = null;
        reconnectAttempts = 0;
        console.log('Database connected successfully');
        return true;
    }
    catch (err) {
        isConnected = false;
        lastError = err;
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
    }
    else {
        // Verify connection is still alive
        try {
            await pool.query('SELECT 1');
        }
        catch (_a) {
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
const queryWithRetry = async (text, params, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await pool.query(text, params);
        }
        catch (err) {
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
exports.default = {
    query: (text, params) => queryWithRetry(text, params),
    getClient: () => pool.connect(),
    getHealth: () => ({ isConnected, lastError: (lastError === null || lastError === void 0 ? void 0 : lastError.message) || null, reconnectAttempts }),
    pool, // Expose pool for advanced usage
};
// Handle database errors gracefully (don't crash the process)
pool.on('error', (err) => {
    console.error('Unexpected error on idle client:', err);
    isConnected = false;
    lastError = err;
    // Don't exit - let health checks handle reconnection
});
