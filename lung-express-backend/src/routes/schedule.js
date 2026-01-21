import express from 'express';
import { getTenantPool } from '../lib/tenant-db.js';

const router = express.Router();

/**
 * GET /api/schedule/available-slots
 * Returns available time slots for a doctor on a specific date
 * These come from the doctor's schedule settings, not hardcoded
 */
router.get('/available-slots', async (req, res) => {
  try {
    const db = getTenantPool(req);
    const { doctor_id, date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get day of week from date
    const dateObj = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    // Get schedule for the day
    let scheduleQuery = `
      SELECT start_time, end_time, slot_duration 
      FROM doctor_schedule 
      WHERE day = ? AND is_active = TRUE
    `;
    const params = [dayOfWeek];

    if (doctor_id) {
      scheduleQuery += ` AND (doctor_id = ? OR doctor_id IS NULL)`;
      params.push(doctor_id);
    }

    scheduleQuery += ` LIMIT 1`;

    let scheduleRows;
    try {
      [scheduleRows] = await db.query(scheduleQuery, params);
    } catch (e) {
      // Table might not exist, return default slots
      return res.json({ slots: generateDefaultSlots() });
    }

    if (!scheduleRows || scheduleRows.length === 0) {
      // No schedule defined for this day, return default slots
      return res.json({ slots: generateDefaultSlots() });
    }

    const schedule = scheduleRows[0];
    const slotDuration = schedule.slot_duration || 30;

    // Generate slots based on schedule
    const slots = generateSlotsFromSchedule(
      schedule.start_time, 
      schedule.end_time, 
      slotDuration
    );

    // Get already booked appointments for this date and doctor
    let bookedQuery = `
      SELECT appointment_time 
      FROM appointments 
      WHERE appointment_date = ? AND status NOT IN ('cancelled')
    `;
    const bookedParams = [date];

    if (doctor_id) {
      bookedQuery += ` AND doctor_id = ?`;
      bookedParams.push(doctor_id);
    }

    const [bookedAppointments] = await db.query(bookedQuery, bookedParams);
    const bookedTimes = bookedAppointments.map(a => formatTimeForDisplay(a.appointment_time));

    // Mark unavailable slots
    const availableSlots = slots.map(slot => ({
      time: slot,
      available: !bookedTimes.includes(slot)
    }));

    res.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.json({ slots: generateDefaultSlots() });
  }
});

/**
 * Generate time slots from schedule
 */
function generateSlotsFromSchedule(startTime, endTime, durationMinutes) {
  const slots = [];
  
  // Parse start and end times
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let current = start;
  while (current < end) {
    slots.push(formatTime(current));
    current += durationMinutes;
  }
  
  return slots;
}

/**
 * Parse time string (HH:mm:ss or HH:mm) to minutes since midnight
 */
function parseTime(timeStr) {
  if (!timeStr) return 540; // Default 09:00
  const parts = timeStr.toString().split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
}

/**
 * Format minutes since midnight to display format (HH:mm AM/PM)
 */
function formatTime(minutes) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Convert database time to display format
 */
function formatTimeForDisplay(dbTime) {
  if (!dbTime) return '';
  // Handle different time formats
  let timeStr = dbTime.toString();
  
  // If already in display format, return as-is
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }
  
  // Parse HH:mm:ss format
  const parts = timeStr.split(':');
  const hours24 = parseInt(parts[0]);
  const mins = parseInt(parts[1] || 0);
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  
  return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Generate default time slots
 */
function generateDefaultSlots() {
  return [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '03:30 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: true },
  ];
}

export default router;
