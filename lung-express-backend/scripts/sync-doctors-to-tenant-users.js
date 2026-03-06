/**
 * Sync all existing hospital_doctors into saas_platform.tenant_users
 * 
 * This script finds all doctors in each tenant's hospital_doctors table
 * that are NOT yet in tenant_users, and creates tenant_users entries for them.
 * 
 * Usage:
 *   node scripts/sync-doctors-to-tenant-users.js
 *   node scripts/sync-doctors-to-tenant-users.js --tenant=hosp_raj_dulai_hospital
 *   node scripts/sync-doctors-to-tenant-users.js --force   (re-hash passwords even if entry exists)
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_PASSWORD = 'password123';

async function main() {
  const args = process.argv.slice(2);
  const forceFlag = args.includes('--force');
  const tenantArg = args.find(a => a.startsWith('--tenant='));
  const specificTenant = tenantArg ? tenantArg.split('=')[1] : null;

  const platformConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.PLATFORM_DB_NAME || 'saas_platform',
  });

  console.log('🔗 Connected to platform DB');

  // Get tenants
  let tenantQuery = "SELECT * FROM tenants WHERE status = 'active'";
  const tenantParams = [];
  if (specificTenant) {
    tenantQuery += ' AND tenant_code = ?';
    tenantParams.push(specificTenant);
  }
  const [tenants] = await platformConn.execute(tenantQuery, tenantParams);
  console.log(`📋 Found ${tenants.length} tenant(s)\n`);

  const LEGACY_DB_MAP = { doctor_mann: 'Doctor_Mann' };
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let totalSynced = 0;

  for (const tenant of tenants) {
    const dbName = LEGACY_DB_MAP[tenant.tenant_code] || tenant.tenant_code;
    console.log(`\n━━━ Tenant: ${tenant.name} (${tenant.tenant_code}) → DB: ${dbName} ━━━`);

    let tenantConn;
    try {
      tenantConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
      });
    } catch (err) {
      console.log(`  ⚠ Could not connect to DB "${dbName}": ${err.message}`);
      continue;
    }

    // Check if hospital_doctors table exists
    try {
      const [tables] = await tenantConn.execute(
        "SHOW TABLES LIKE 'hospital_doctors'"
      );
      if (tables.length === 0) {
        // Try 'doctors' table instead
        const [tables2] = await tenantConn.execute("SHOW TABLES LIKE 'doctors'");
        if (tables2.length === 0) {
          console.log('  ℹ No doctors table found, skipping');
          await tenantConn.end();
          continue;
        }
      }
    } catch (err) {
      console.log(`  ⚠ Error checking tables: ${err.message}`);
      await tenantConn.end();
      continue;
    }

    // Determine which table has doctors
    let doctorTable = 'hospital_doctors';
    try {
      await tenantConn.execute(`SELECT 1 FROM hospital_doctors LIMIT 1`);
    } catch {
      try {
        await tenantConn.execute(`SELECT 1 FROM doctors LIMIT 1`);
        doctorTable = 'doctors';
      } catch {
        console.log('  ℹ No accessible doctors table, skipping');
        await tenantConn.end();
        continue;
      }
    }

    // Get all doctors from tenant DB
    const [doctors] = await tenantConn.execute(
      `SELECT * FROM ${doctorTable}`
    );
    console.log(`  📊 Found ${doctors.length} doctor(s) in ${doctorTable}`);

    for (const doc of doctors) {
      const email = (doc.email || '').trim();
      if (!email) {
        console.log(`  ⏭ Skipping doctor "${doc.name || doc.full_name}" — no email`);
        continue;
      }

      // Check if already in tenant_users
      const [existing] = await platformConn.execute(
        'SELECT id, password_hash FROM tenant_users WHERE email = ? AND tenant_id = ?',
        [email, tenant.id]
      );

      if (existing.length > 0) {
        if (forceFlag && !existing[0].password_hash) {
          // Update password if missing
          await platformConn.execute(
            'UPDATE tenant_users SET password_hash = ? WHERE id = ?',
            [passwordHash, existing[0].id]
          );
          console.log(`  🔄 Updated password for ${email}`);
          totalSynced++;
        } else {
          console.log(`  ✓ Already exists: ${email}`);
        }
        continue;
      }

      // Insert into tenant_users
      const name = doc.name || doc.full_name || email;
      const phone = doc.phone || null;
      const doctorId = doc.id || null;

      try {
        await platformConn.execute(
          `INSERT INTO tenant_users (tenant_id, email, password_hash, name, phone, role, doctor_id)
           VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
          [tenant.id, email, passwordHash, name, phone, doctorId]
        );
        console.log(`  ✅ Synced: ${email} (doctor_id: ${doctorId})`);
        totalSynced++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠ Duplicate entry for ${email}, skipping`);
        } else {
          console.log(`  ❌ Error syncing ${email}: ${err.message}`);
        }
      }
    }

    // Also sync patients
    try {
      const [patients] = await tenantConn.execute('SELECT * FROM patients');
      console.log(`  📊 Found ${patients.length} patient(s)`);

      for (const pat of patients) {
        const email = (pat.email || '').trim();
        if (!email) continue;

        const [existing] = await platformConn.execute(
          'SELECT id FROM tenant_users WHERE email = ? AND tenant_id = ? AND role = ?',
          [email, tenant.id, 'patient']
        );

        if (existing.length > 0) continue;

        const name = pat.full_name || pat.name || email;
        const phone = pat.phone || null;

        try {
          await platformConn.execute(
            `INSERT INTO tenant_users (tenant_id, email, password_hash, name, phone, role)
             VALUES (?, ?, ?, ?, ?, 'patient')`,
            [tenant.id, email, passwordHash, name, phone]
          );
          console.log(`  ✅ Synced patient: ${email}`);
          totalSynced++;
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.log(`  ❌ Error syncing patient ${email}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      console.log(`  ℹ No patients table or error: ${err.message}`);
    }

    await tenantConn.end();
  }

  console.log(`\n🎉 Done! Synced ${totalSynced} user(s) to tenant_users`);
  await platformConn.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
