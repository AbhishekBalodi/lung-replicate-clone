/**
 * Reports Backend Logic
 * Handles daily, monthly, doctor-wise, and department-wise reports
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// DAILY REPORTS
// ============================================

export async function getDailyReport(req, res) {
  try {
    const pool = getTenantPool(req);
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    // Appointments
    const [appointments] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM appointments WHERE appointment_date = ?
    `, [reportDate]);
    
    // Revenue
    const [revenue] = await pool.execute(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM invoices 
      WHERE DATE(created_at) = ? AND status = 'paid'
    `, [reportDate]);
    
    // New patients
    const [newPatients] = await pool.execute(`
      SELECT COUNT(*) as count FROM patients WHERE DATE(created_at) = ?
    `, [reportDate]);
    
    // Lab tests
    const [labTests] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM labs_test WHERE DATE(created_at) = ?
    `, [reportDate]);
    
    res.json({
      date: reportDate,
      appointments: appointments[0] || {},
      revenue: revenue[0]?.total || 0,
      newPatients: newPatients[0]?.count || 0,
      labTests: labTests[0] || {}
    });
  } catch (err) {
    console.error('getDailyReport error:', err);
    res.status(500).json({ error: 'Failed to fetch daily report' });
  }
}

// ============================================
// MONTHLY REPORTS
// ============================================

export async function getMonthlyReport(req, res) {
  try {
    const pool = getTenantPool(req);
    const { year, month } = req.query;
    const reportYear = year || new Date().getFullYear();
    const reportMonth = month || (new Date().getMonth() + 1);
    
    // Daily breakdown
    const [dailyStats] = await pool.execute(`
      SELECT 
        DAY(appointment_date) as day,
        COUNT(*) as appointments,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
      FROM appointments 
      WHERE YEAR(appointment_date) = ? AND MONTH(appointment_date) = ?
      GROUP BY DAY(appointment_date)
      ORDER BY day
    `, [reportYear, reportMonth]);
    
    // Monthly revenue
    const [revenue] = await pool.execute(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM invoices 
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND status = 'paid'
    `, [reportYear, reportMonth]);
    
    // Monthly appointments summary
    const [appointmentsSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM appointments 
      WHERE YEAR(appointment_date) = ? AND MONTH(appointment_date) = ?
    `, [reportYear, reportMonth]);
    
    // New patients this month
    const [newPatients] = await pool.execute(`
      SELECT COUNT(*) as count FROM patients 
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
    `, [reportYear, reportMonth]);
    
    res.json({
      year: reportYear,
      month: reportMonth,
      dailyStats,
      revenue: revenue[0]?.total || 0,
      appointments: appointmentsSummary[0] || {},
      newPatients: newPatients[0]?.count || 0
    });
  } catch (err) {
    console.error('getMonthlyReport error:', err);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
}

// ============================================
// DOCTOR-WISE REVENUE
// ============================================

export async function getDoctorRevenueReport(req, res) {
  try {
    const pool = getTenantPool(req);
    const { from, to } = req.query;
    
    let query = `
      SELECT 
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialization,
        COUNT(DISTINCT a.id) as total_appointments,
        COALESCE(SUM(i.total), 0) as total_revenue
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id = d.id
      LEFT JOIN invoices i ON i.patient_id = (
        SELECT p.id FROM patients p WHERE p.full_name = a.full_name LIMIT 1
      ) AND i.status = 'paid'
    `;
    
    const conditions = [];
    const params = [];
    
    if (from) {
      conditions.push('a.appointment_date >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('a.appointment_date <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY d.id ORDER BY total_revenue DESC';
    
    const [rows] = await pool.execute(query, params);
    
    // Get total
    const totalRevenue = rows.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
    const totalAppointments = rows.reduce((sum, row) => sum + parseInt(row.total_appointments || 0), 0);
    
    res.json({ 
      doctors: rows,
      summary: {
        totalRevenue,
        totalAppointments,
        doctorCount: rows.length
      }
    });
  } catch (err) {
    console.error('getDoctorRevenueReport error:', err);
    res.status(500).json({ error: 'Failed to fetch doctor revenue report' });
  }
}

// ============================================
// DEPARTMENT-WISE REVENUE
// ============================================

export async function getDepartmentRevenueReport(req, res) {
  try {
    const pool = getTenantPool(req);
    const { from, to } = req.query;
    
    let query = `
      SELECT 
        dep.id as department_id,
        dep.name as department_name,
        COUNT(DISTINCT d.id) as doctor_count,
        COUNT(DISTINCT a.id) as total_appointments,
        COALESCE(SUM(i.total), 0) as total_revenue
      FROM departments dep
      LEFT JOIN doctors d ON d.department_id = dep.id
      LEFT JOIN appointments a ON a.doctor_id = d.id
      LEFT JOIN invoices i ON i.patient_id = (
        SELECT p.id FROM patients p WHERE p.full_name = a.full_name LIMIT 1
      ) AND i.status = 'paid'
    `;
    
    const conditions = [];
    const params = [];
    
    if (from) {
      conditions.push('a.appointment_date >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('a.appointment_date <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY dep.id ORDER BY total_revenue DESC';
    
    const [rows] = await pool.execute(query, params);
    
    res.json({ departments: rows });
  } catch (err) {
    console.error('getDepartmentRevenueReport error:', err);
    res.status(500).json({ error: 'Failed to fetch department revenue report' });
  }
}

// ============================================
// LAB REVENUE REPORT
// ============================================

export async function getLabRevenueReport(req, res) {
  try {
    const pool = getTenantPool(req);
    const { from, to } = req.query;
    
    let query = `
      SELECT 
        lc.id as test_id,
        lc.name as test_name,
        lc.category,
        lc.price,
        COUNT(lt.id) as tests_conducted,
        COUNT(lt.id) * lc.price as total_revenue
      FROM lab_catalogue lc
      LEFT JOIN labs_test lt ON lt.lab_id = lc.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (from) {
      conditions.push('lt.created_at >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('lt.created_at <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY lc.id ORDER BY total_revenue DESC';
    
    const [rows] = await pool.execute(query, params);
    
    const summary = {
      totalTests: rows.reduce((sum, r) => sum + parseInt(r.tests_conducted || 0), 0),
      totalRevenue: rows.reduce((sum, r) => sum + parseFloat(r.total_revenue || 0), 0)
    };
    
    res.json({ tests: rows, summary });
  } catch (err) {
    console.error('getLabRevenueReport error:', err);
    res.status(500).json({ error: 'Failed to fetch lab revenue report' });
  }
}
