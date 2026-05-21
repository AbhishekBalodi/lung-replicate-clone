import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function main() {
  const migrationArg = process.argv[2];
  if (!migrationArg) {
    console.error('Usage: node scripts/run-migration.js <migration.sql>');
    process.exit(1);
  }

  const migrationPath = path.resolve(process.cwd(), migrationArg);
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log(`Running migration on DB: ${process.env.DB_NAME}`);
    await connection.query(sql);
    console.log(`Migration applied successfully: ${migrationArg}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
