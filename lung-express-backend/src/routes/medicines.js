import { Router } from "express";
import { getPool, getConnection } from "../lib/tenant-db.js";

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
/** Admin listing of prescribed medicines (not the catalog) */
router.get("/", async (req, res) => {
  try {
    const pool = getPool(req);
    const [rows] = await pool.query(
      "SELECT * FROM medicines ORDER BY id DESC"
    );
    res.json({ items: rows });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: "Failed to fetch medicines", details: err.message });
  }
});

/* --------------- prescribed: POST / (create) ---------------- */
/**
 * Creates a prescription row. Two flows:
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
  } = req.body || {};

  if (!medicine_name || !String(medicine_name).trim()) {
    return res.status(400).json({ error: "Medicine name is required." });
  }

  const conn = await getConnection(req);
  try {
    await conn.beginTransaction();
    await ensureTables(conn);

    let finalPatientId = patient_id || null;

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
              (full_name, email, phone, created_at)
            VALUES (?, ?, ?, NOW())
          `,
          [full_name || "Unknown", email || "", phone || ""]
        );
        finalPatientId = ins.insertId;
      }
    }

    // insert prescription
    await conn.execute(
      `
        INSERT INTO medicines
          (patient_id, medicine_name, dosage, frequency, duration, instructions)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        finalPatientId,
        medicine_name.trim(),
        dosage || "",
        frequency || "",
        duration || "",
        instructions || "",
      ]
    );

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
