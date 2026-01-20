import { getTenantPool } from './tenant-db.js';

/* ============================================================
   PATIENT SUPPORT & FEEDBACK APIs
   ============================================================ */

/**
 * GET /api/dashboard/patient/support/tickets
 */
export async function getPatientSupportTickets(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ tickets: [] });
    }

    const [tickets] = await db.query(`
      SELECT 
        id,
        ticket_number,
        subject,
        category,
        status,
        description,
        created_at,
        updated_at AS last_update
      FROM support_tickets
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `, [patient.id]);

    res.json({ tickets });
  } catch (error) {
    console.error('❌ Patient support tickets error:', error);
    res.status(500).json({ error: 'Failed to load support tickets' });
  }
}

/**
 * POST /api/dashboard/patient/support/tickets
 */
export async function createSupportTicket(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, category, subject, description } = req.body;

    if (!email || !category || !subject || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const [result] = await db.query(`
      INSERT INTO support_tickets 
      (patient_id, ticket_number, category, subject, description, status)
      VALUES (?, ?, ?, ?, ?, 'open')
    `, [patient.id, ticketNumber, category, subject, description]);

    res.json({ 
      success: true, 
      message: 'Support ticket created',
      ticket: {
        id: result.insertId,
        ticket_number: ticketNumber,
        category,
        subject,
        description,
        status: 'open',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Create support ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
}

/**
 * GET /api/dashboard/patient/support/tickets/:id
 */
export async function getSupportTicketDetails(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;

    const [[ticket]] = await db.query(`
      SELECT 
        t.*,
        p.full_name AS patient_name,
        p.email AS patient_email
      FROM support_tickets t
      LEFT JOIN patients p ON t.patient_id = p.id
      WHERE t.id = ?
    `, [id]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get ticket responses
    const [responses] = await db.query(`
      SELECT * FROM support_ticket_responses
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `, [id]);

    res.json({ ticket, responses });
  } catch (error) {
    console.error('❌ Support ticket details error:', error);
    res.status(500).json({ error: 'Failed to load ticket details' });
  }
}

/**
 * GET /api/dashboard/patient/feedback/doctors
 */
export async function getDoctorsForFeedback(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    // Get doctors the patient has visited
    const [doctors] = await db.query(`
      SELECT DISTINCT
        d.id,
        d.name,
        d.specialization AS department,
        MAX(a.appointment_date) AS last_visit,
        (SELECT AVG(rating) FROM doctor_ratings WHERE doctor_id = d.id AND patient_email = ?) AS my_rating
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.email = ? AND a.status = 'done' AND d.id IS NOT NULL
      GROUP BY d.id, d.name, d.specialization
      ORDER BY last_visit DESC
    `, [email, email]);

    res.json({ doctors });
  } catch (error) {
    console.error('❌ Doctors for feedback error:', error);
    res.status(500).json({ error: 'Failed to load doctors' });
  }
}

/**
 * POST /api/dashboard/patient/feedback/doctor-rating
 */
export async function submitDoctorRating(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, doctor_id, rating, comment } = req.body;

    if (!email || !doctor_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Upsert rating
    await db.query(`
      INSERT INTO doctor_ratings (doctor_id, patient_email, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = ?, comment = ?, updated_at = NOW()
    `, [doctor_id, email, rating, comment || null, rating, comment || null]);

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('❌ Submit doctor rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
}

/**
 * POST /api/dashboard/patient/feedback/hospital
 */
export async function submitHospitalFeedback(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, feedback, rating } = req.body;

    if (!email || !feedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [[patient]] = await db.query(
      `SELECT id, full_name FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    await db.query(`
      INSERT INTO hospital_feedback (patient_id, patient_email, feedback, rating)
      VALUES (?, ?, ?, ?)
    `, [patient?.id || null, email, feedback, rating || null]);

    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('❌ Submit hospital feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

/**
 * POST /api/dashboard/patient/feedback/complaint
 */
export async function submitComplaint(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, complaint, category } = req.body;

    if (!email || !complaint) {
      return res.status(400).json({ error: 'Complaint description is required' });
    }

    const [[patient]] = await db.query(
      `SELECT id, full_name FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    const complaintNumber = `CMP-${Date.now().toString(36).toUpperCase()}`;

    const [result] = await db.query(`
      INSERT INTO complaints (patient_id, patient_email, complaint_number, category, description, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [patient?.id || null, email, complaintNumber, category || 'general', complaint]);

    res.json({ 
      success: true, 
      message: 'Complaint registered successfully',
      complaintNumber
    });
  } catch (error) {
    console.error('❌ Submit complaint error:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
}
