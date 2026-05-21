import 'dotenv/config';
import mysql from 'mysql2/promise';

const REQUIRED_COLUMNS = ['submitted_date', 'treatment_type', 'remarks'];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'insurance_claims'
         AND COLUMN_NAME IN (?, ?, ?)
       ORDER BY COLUMN_NAME`,
      REQUIRED_COLUMNS
    );

    const found = rows.map((r) => r.COLUMN_NAME);
    const missing = REQUIRED_COLUMNS.filter((c) => !found.includes(c));

    if (missing.length) {
      console.error('Missing columns:', missing.join(', '));
      process.exitCode = 1;
      return;
    }

    console.log('Insurance claim columns verified:', found.join(', '));
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
