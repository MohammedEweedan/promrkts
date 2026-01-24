import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Prefer a single source of truth via DATABASE_URL to avoid env drift
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

// Test the database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error', err);
  } else {
    console.log('Database connected successfully');
  }
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};

// Handle database errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
