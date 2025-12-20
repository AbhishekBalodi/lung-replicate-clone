import express from 'express';
import { getPool, getConnection } from '../lib/tenant-db.js';

const router = express.Router();

// GET /api/calendar - Fetch all appointments for calendar view
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    
    // Ensure appointments table has status column
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(10) NOT NULL,
        selected_doctor VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add status column if it doesn't exist
    await conn.execute(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
    `).catch(() => {}); // Ignore error if column exists
    
    const { start, end } = req.query;
    
    let query = `
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
      const startDateTime = `${appointment.appointment_date.toISOString().split('T')[0]}T${appointment.appointment_time}`;
      
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
    const [doctors] = await conn.query(`
      SELECT 
        selected_doctor as name,
        COUNT(*) as appointment_count,
        SUM(CASE WHEN COALESCE(status, 'pending') = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM appointments
      WHERE COALESCE(status, 'pending') != 'cancelled'
      GROUP BY selected_doctor
      ORDER BY appointment_count DESC
    `);
    
    res.json(doctors);
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
