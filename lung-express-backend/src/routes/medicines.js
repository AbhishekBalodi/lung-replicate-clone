import { Router } from "express";
import { getPool, getConnection } from "../lib/tenant-db.js";
import { getDoctorFilter, getDoctorIdForInsert } from '../middleware/doctor-context.js';

const router = Router();

/* ------------------------- helpers ------------------------- */
async function ensureTables(conn) {
  // create catalog table if missing (safe to call each request)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS medicines_catalog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      form VARCHAR(100) NULL,
      strength VARCHAR(100) NULL,
      default_frequency VARCHAR(100) NULL,
      duration VARCHAR(100) NULL,
      route VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // optional: ensure prescribed medicines has prescribed_date
  await conn.query(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NULL,
      doctor_id INT NULL,
      medicine_name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100) NULL,
      frequency VARCHAR(100) NULL,
      duration VARCHAR(100) NULL,
      instructions TEXT NULL,
      prescribed_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX (patient_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/**
 * Check if a column exists in a table
 */
async function columnExists(conn, tableName, columnName) {
  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

/* ------------------- catalog: GET /catalog ------------------ */
/** Returns all catalog items used by the UI "Medicines Catalog" list */
router.get("/catalog", async (req, res) => {
  try {
    const conn = await getConnection(req);
    try {
      await ensureTables(conn);
      const [rows] = await conn.query(
        "SELECT * FROM medicines_catalog ORDER BY name ASC"
      );
      res.json({ items: rows });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("GET /api/medicines/catalog error:", err);
    res.status(500).json({ error: "Failed to fetch catalog", details: err.message });
  }
});

/* ------------------- catalog: POST /catalog ----------------- */
/** Adds a new item to the medicines catalog (not a prescription) */
router.post("/catalog", async (req, res) => {
  const {
    name,
    form = "",
    strength = "",
    default_frequency = "",
    duration = "",
    route = "",
  } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Medicine name is required." });
  }

  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute(
      `
      INSERT INTO medicines_catalog
        (name, form, strength, default_frequency, duration, route)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name.trim(), form, strength, default_frequency, duration, route]
    );

    res.status(201).json({ success: true, message: "Catalog item added" });
  } catch (err) {
    console.error("POST /api/medicines/catalog error:", err);
    res.status(500).json({ error: "Failed to add catalog item", details: err.message });
  } finally {
    conn.release();
  }
});

/* --------------- prescribed: GET / (list all) --------------- */
/** Admin listing of prescribed medicines (filtered by doctor) */
router.get("/", async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);
    
    // Check if doctor_id column exists for filtering
    const hasDoctorId = await columnExists(conn, 'medicines', 'doctor_id');
    
    let whereSql = '';
    let params = [];
    
    if (hasDoctorId) {
      const doctorFilter = getDoctorFilter(req, 'doctor_id');
      whereSql = doctorFilter.whereSql ? `WHERE ${doctorFilter.whereSql}` : '';
      params = doctorFilter.params;
    }
    
    const [rows] = await conn.execute(
      `SELECT * FROM medicines ${whereSql} ORDER BY id DESC`,
      params
    );
    res.json({ items: rows });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: "Failed to fetch medicines", details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

/* --------------- prescribed: POST / (create) ---------------- */
/**
 * Creates a prescription row (schema-resilient).
 * Two flows:
 * 1) Provide patient_id
 * 2) Or provide full_name/email/phone → upsert into patients, then save prescription
 */
router.post("/", async (req, res) => {
  const {
    patient_id,
    full_name,
    email,
    phone,
    medicine_name,
    dosage,
    frequency,
    duration,
    instructions,
    medicine_catalogue_id,
  } = req.body || {};

  if (!medicine_name || !String(medicine_name).trim()) {
    return res.status(400).json({ error: "Medicine name is required." });
  }

  const conn = await getConnection(req);
  try {
    await conn.beginTransaction();
    await ensureTables(conn);

    let finalPatientId = patient_id || null;
    const doctorId = getDoctorIdForInsert(req);

    if (!finalPatientId && (full_name || email || phone)) {
      // try match by email/phone
      const [existing] = await conn.execute(
        `
          SELECT id FROM patients
          WHERE
            (email = ? AND email <> '')
            OR (phone = ? AND phone <> '')
          LIMIT 1
        `,
        [email || "", phone || ""]
      );

      if (existing.length) {
        finalPatientId = existing[0].id;
      } else {
        // create a minimal patient row
        const [ins] = await conn.execute(
          `
            INSERT INTO patients
              (full_name, email, phone, doctor_id, created_at)
            VALUES (?, ?, ?, ?, NOW())
          `,
          [full_name || "Unknown", email || "", phone || "", doctorId]
        );
        finalPatientId = ins.insertId;
      }
    }

    // Schema-resilient INSERT: check if doctor_id and medicine_catalogue_id columns exist
    const hasDoctorId = await columnExists(conn, 'medicines', 'doctor_id');
    const hasCatalogueId = await columnExists(conn, 'medicines', 'medicine_catalogue_id');
    
    let insertSql;
    let insertParams;
    
    if (hasDoctorId && hasCatalogueId) {
      insertSql = `INSERT INTO medicines (patient_id, doctor_id, medicine_catalogue_id, medicine_name, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      insertParams = [finalPatientId, doctorId, medicine_catalogue_id || null, medicine_name.trim(), dosage || "", frequency || "", duration || "", instructions || ""];
    } else if (hasDoctorId) {
      insertSql = `INSERT INTO medicines (patient_id, doctor_id, medicine_name, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      insertParams = [finalPatientId, doctorId, medicine_name.trim(), dosage || "", frequency || "", duration || "", instructions || ""];
    } else {
      insertSql = `INSERT INTO medicines (patient_id, medicine_name, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?)`;
      insertParams = [finalPatientId, medicine_name.trim(), dosage || "", frequency || "", duration || "", instructions || ""];
    }

    await conn.execute(insertSql, insertParams);

    await conn.commit();
    res.status(201).json({
      success: true,
      message: "Medicine saved successfully",
      patient_id: finalPatientId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error saving medicine:", err);
    res.status(500).json({ error: "Failed to save medicine", details: err.message });
  } finally {
    conn.release();
  }
});

export default router;
