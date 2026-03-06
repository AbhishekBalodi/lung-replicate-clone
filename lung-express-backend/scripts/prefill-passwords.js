/**
 * Pre-fill passwords for existing doctors and patients in tenant_users table.
 * 
 * Default password: "password123" (bcrypt hashed)
 * 
 * Usage:
 *   node scripts/prefill-passwords.js
 * 
 * This script sets a default password for all tenant_users who have
 * NULL password_hash. After running, users can log in with their
 * email + "password123" and should be encouraged to change it.
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_PASSWORD = 'password123';

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.PLATFORM_DB || 'saas_platform',
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Update all tenant_users with NULL password_hash
    const [result] = await pool.execute(
      'UPDATE tenant_users SET password_hash = ? WHERE password_hash IS NULL',
      [passwordHash]
    );

    console.log(`✅ Updated ${result.affectedRows} users with default password "${DEFAULT_PASSWORD}"`);
    console.log('⚠️  Users should change their password after first login!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
