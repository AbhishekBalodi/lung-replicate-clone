import express from 'express';
import { pool } from '../lib/db.js';

const router = express.Router();

// GET /api/calendar - Fetch all appointments for calendar view
router.get('/', async (req, res) => {
  try {
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
        status,
        created_at
      FROM appointments
      WHERE status != 'cancelled'
    `;
    
    const params = [];
    
    // Filter by date range if provided
    if (start && end) {
      query += ' AND appointment_date BETWEEN ? AND ?';
      params.push(start, end);
    }
    
    query += ' ORDER BY appointment_date, appointment_time';
    
    const [rows] = await pool.query(query, params);
    
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
  }
});

// GET /api/calendar/stats - Get appointment statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled,
        SUM(CASE WHEN appointment_date = ? THEN 1 ELSE 0 END) as today
      FROM appointments
      WHERE status != 'cancelled'
    `, [today]);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/calendar/doctors - Get list of doctors with appointment counts
router.get('/doctors', async (req, res) => {
  try {
    const [doctors] = await pool.query(`
      SELECT 
        selected_doctor as name,
        COUNT(*) as appointment_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM appointments
      WHERE status != 'cancelled'
      GROUP BY selected_doctor
      ORDER BY appointment_count DESC
    `);
    
    res.json(doctors);
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

export default router;
