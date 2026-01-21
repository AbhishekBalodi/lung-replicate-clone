import express from 'express';
import { getPool, getConnection } from '../lib/tenant-db.js';

const router = express.Router();

/**
 * Determine schema configuration based on tenant type
 */
function getSchemaConfig(req) {
  const isHospital = req.tenant?.type === 'hospital';
  return {
    isHospital,
    doctorColumn: isHospital ? 'doctor_id' : 'selected_doctor',
    doctorNameQuery: isHospital 
      ? 'd.name' 
      : 'a.selected_doctor'
  };
}

// GET /api/calendar - Fetch all appointments for calendar view
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    const config = getSchemaConfig(req);
    
    const { start, end } = req.query;
    
    let query;
    if (config.isHospital) {
      query = `
        SELECT 
          a.id,
          a.full_name,
          a.email,
          a.phone,
          a.appointment_date,
          a.appointment_time,
          COALESCE(d.name, 'Unassigned') AS selected_doctor,
          a.message,
          COALESCE(a.status, 'pending') as status,
          a.created_at
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE COALESCE(a.status, 'pending') != 'cancelled'
      `;
    } else {
      query = `
        SELECT 
          id,
          full_name,
          email,
          phone,
          appointment_date,
          appointment_time,
          selected_doctor,
          message,
          COALESCE(status, 'pending') as status,
          created_at
        FROM appointments
        WHERE COALESCE(status, 'pending') != 'cancelled'
      `;
    }
    
    const params = [];
    
    // Filter by date range if provided
    if (start && end) {
      query += ' AND appointment_date BETWEEN ? AND ?';
      params.push(start, end);
    }
    
    query += ' ORDER BY appointment_date, appointment_time';
    
    const [rows] = await conn.query(query, params);
    
    // Transform data for FullCalendar format
    const events = rows.map(appointment => {
      // Combine date and time for FullCalendar
      const dateStr = appointment.appointment_date instanceof Date 
        ? appointment.appointment_date.toISOString().split('T')[0]
        : appointment.appointment_date;
      const startDateTime = `${dateStr}T${appointment.appointment_time}`;
      
      // Set color based on status
      let color;
      switch (appointment.status) {
        case 'pending':
          color = '#22c55e'; // Green
          break;
        case 'rescheduled':
          color = '#3b82f6'; // Blue
          break;
        case 'done':
          color = '#ef4444'; // Red
          break;
        default:
          color = '#6b7280'; // Gray
      }
      
      return {
        id: appointment.id,
        title: appointment.full_name,
        start: startDateTime,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          email: appointment.email,
          phone: appointment.phone,
          doctor: appointment.selected_doctor,
          message: appointment.message,
          status: appointment.status,
          time: appointment.appointment_time
        }
      };
    });
    
    res.json(events);
  } catch (error) {
    console.error('Calendar fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar appointments' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/calendar/stats - Get appointment statistics
router.get('/stats', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    const today = new Date().toISOString().split('T')[0];
    
    const [stats] = await conn.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN COALESCE(status, 'pending') = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN COALESCE(status, 'pending') = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN COALESCE(status, 'pending') = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled,
        SUM(CASE WHEN appointment_date = ? THEN 1 ELSE 0 END) as today
      FROM appointments
      WHERE COALESCE(status, 'pending') != 'cancelled'
    `, [today]);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/calendar/doctors - Get list of doctors with appointment counts
router.get('/doctors', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    const config = getSchemaConfig(req);
    
    let query;
    if (config.isHospital) {
      query = `
        SELECT 
          d.name,
          COUNT(a.id) as appointment_count,
          SUM(CASE WHEN COALESCE(a.status, 'pending') = 'pending' THEN 1 ELSE 0 END) as pending_count
        FROM doctors d
        LEFT JOIN appointments a ON a.doctor_id = d.id AND COALESCE(a.status, 'pending') != 'cancelled'
        WHERE d.is_active = TRUE
        GROUP BY d.id, d.name
        ORDER BY appointment_count DESC
      `;
    } else {
      query = `
        SELECT 
          selected_doctor as name,
          COUNT(*) as appointment_count,
          SUM(CASE WHEN COALESCE(status, 'pending') = 'pending' THEN 1 ELSE 0 END) as pending_count
        FROM appointments
        WHERE COALESCE(status, 'pending') != 'cancelled'
        GROUP BY selected_doctor
        ORDER BY appointment_count DESC
      `;
    }
    
    const [doctors] = await conn.query(query);
    
    res.json(doctors);
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
