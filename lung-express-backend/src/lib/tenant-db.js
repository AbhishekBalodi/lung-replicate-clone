/**
 * Helper to get the appropriate database pool for the current request.
 * Uses tenant-specific pool if available, otherwise falls back to default.
 */
import { pool as defaultPool } from './db.js';

/**
 * Get the database pool for the current request
 * @param {Request} req - Express request object
 * @returns {Pool} - MySQL connection pool (tenant-specific or default)
 */
export function getPool(req) {
  // If tenant pool is available (set by tenant-resolver middleware), use it
  if (req.tenantPool) {
    return req.tenantPool;
  }
  // Fall back to default pool (Doctor_Mann database)
  return defaultPool;
}

/**
 * Get a database connection from the appropriate pool
 * @param {Request} req - Express request object
 * @returns {Promise<Connection>} - MySQL connection
 */
export async function getConnection(req) {
  const pool = getPool(req);
  return pool.getConnection();
}
