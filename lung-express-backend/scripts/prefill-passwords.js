/**
 * Pre-fill passwords for existing doctors, patients, and staff across ALL tenants.
 * 
 * Default password: "password123" (bcrypt hashed)
 * 
 * Usage:
 *   node scripts/prefill-passwords.js              # Only update users with NULL password_hash
 *   node scripts/prefill-passwords.js --force       # Overwrite ALL passwords (even existing ones)
 *   node scripts/prefill-passwords.js --tenant=hosp_raj_dulai_hospital  # Only a specific tenant
 * 
 * This script updates:
 *   1. Platform DB (saas_platform) → tenant_users table
 *   2. Each tenant DB → doctors table (password_hash column)
 *   3. Each tenant DB → patients table (password_hash column)
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_PASSWORD = 'password123';
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const TENANT_FLAG = args.find(a => a.startsWith('--tenant='));
const SPECIFIC_TENANT = TENANT_FLAG ? TENANT_FLAG.split('=')[1] : null;

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.PLATFORM_DB_NAME || 'saas_platform',
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const condition = FORCE ? '' : ' AND password_hash IS NULL';

    console.log(`\n🔑 Default password: "${DEFAULT_PASSWORD}"`);
    console.log(`📋 Mode: ${FORCE ? 'FORCE (overwrite all)' : 'Safe (only NULL passwords)'}`);
    if (SPECIFIC_TENANT) console.log(`🎯 Tenant: ${SPECIFIC_TENANT}`);
    console.log('');

    // ─── 1. Platform DB: tenant_users ───────────────────────
    const whereClause = FORCE
      ? 'WHERE 1=1'
      : 'WHERE password_hash IS NULL';

    // Diagnostic: show current state
    const [[{ totalUsers }]] = await pool.execute('SELECT COUNT(*) AS totalUsers FROM tenant_users');
    const [[{ nullPasswords }]] = await pool.execute('SELECT COUNT(*) AS nullPasswords FROM tenant_users WHERE password_hash IS NULL');
    console.log(`📊 Platform tenant_users: ${totalUsers} total, ${nullPasswords} with NULL password`);

    const [platformResult] = await pool.execute(
      `UPDATE tenant_users SET password_hash = ? ${whereClause}`,
      [passwordHash]
    );
    console.log(`✅ Platform tenant_users: Updated ${platformResult.affectedRows} users`);

    // ─── 2. Get all tenant databases ────────────────────────
    let tenantQuery = 'SELECT id, tenant_code, name, type FROM tenants WHERE status = "active"';
    const tenantParams = [];
    if (SPECIFIC_TENANT) {
      tenantQuery = 'SELECT id, tenant_code, name, type FROM tenants WHERE tenant_code = ?';
      tenantParams.push(SPECIFIC_TENANT);
    }

    const [tenants] = await pool.execute(tenantQuery, tenantParams);
    console.log(`\n🏥 Found ${tenants.length} tenant(s) to process\n`);

    for (const tenant of tenants) {
      console.log(`── Tenant: ${tenant.name} (${tenant.tenant_code}) ──`);

      let tenantPool;
      try {
        tenantPool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: tenant.tenant_code,
          waitForConnections: true,
          connectionLimit: 2,
        });

        // Check if doctors table has password_hash column
        const [doctorCols] = await tenantPool.execute(
          `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'doctors' AND COLUMN_NAME = 'password_hash'`,
          [tenant.tenant_code]
        );

        if (doctorCols.length === 0) {
          // Add the column
          await tenantPool.execute('ALTER TABLE doctors ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL');
          console.log('   📝 Added password_hash column to doctors table');
        }

        // Update doctors
        const doctorWhere = FORCE ? 'WHERE 1=1' : 'WHERE password_hash IS NULL';
        const [doctorResult] = await tenantPool.execute(
          `UPDATE doctors SET password_hash = ? ${doctorWhere}`,
          [passwordHash]
        );
        console.log(`   👨‍⚕️ Doctors: Updated ${doctorResult.affectedRows} passwords`);

        // Check if patients table has password_hash column
        const [patientCols] = await tenantPool.execute(
          `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'password_hash'`,
          [tenant.tenant_code]
        );

        if (patientCols.length === 0) {
          await tenantPool.execute('ALTER TABLE patients ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL');
          console.log('   📝 Added password_hash column to patients table');
        }

        // Update patients
        const patientWhere = FORCE ? 'WHERE 1=1' : 'WHERE password_hash IS NULL';
        const [patientResult] = await tenantPool.execute(
          `UPDATE patients SET password_hash = ? ${patientWhere}`,
          [passwordHash]
        );
        console.log(`   🧑‍🤝‍🧑 Patients: Updated ${patientResult.affectedRows} passwords`);

        // Check if hospital_staff table exists
        const [staffTables] = await tenantPool.execute(
          `SELECT TABLE_NAME FROM information_schema.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'hospital_staff'`,
          [tenant.tenant_code]
        );

        if (staffTables.length > 0) {
          const staffWhere = FORCE ? 'WHERE 1=1' : 'WHERE password_hash IS NULL';
          try {
            const [staffResult] = await tenantPool.execute(
              `UPDATE hospital_staff SET password_hash = ? ${staffWhere}`,
              [passwordHash]
            );
            console.log(`   👥 Staff: Updated ${staffResult.affectedRows} passwords`);
          } catch (e) {
            // password_hash column might not exist on hospital_staff
            if (e.message.includes('password_hash')) {
              console.log('   ℹ️  hospital_staff table has no password_hash column (staff uses platform login)');
            }
          }
        }

        console.log('');
      } catch (err) {
        console.error(`   ❌ Error for ${tenant.tenant_code}: ${err.message}\n`);
      } finally {
        if (tenantPool) await tenantPool.end();
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Done! All users can now log in with: ${DEFAULT_PASSWORD}`);
    console.log('⚠️  Users should change their password after first login!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
