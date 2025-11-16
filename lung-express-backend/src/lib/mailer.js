import nodemailer from 'nodemailer';
import { pool } from './db.js';

// Function to get transporter with dynamic SMTP settings
async function getTransporter() {
  try {
    const [rows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');
    
    if (rows.length === 0) {
      console.warn('No SMTP settings configured');
      return null;
    }

    const settings = rows[0];
    
    return nodemailer.createTransport({
      host: settings.smtp_host,
      port: Number(settings.smtp_port || 587),
      secure: String(settings.smtp_secure || 'false') === 'true',
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_pass
      }
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    return null;
  }
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = await getTransporter();
  
  if (!transporter) {
    console.warn('SMTP not configured, skipping email');
    return null;
  }

  try {
    const [rows] = await pool.query('SELECT smtp_from FROM smtp_settings LIMIT 1');
    const from = (rows.length > 0 && rows[0].smtp_from) || 'no-reply@example.com';
    
    return await transporter.sendMail({ from, to, subject, html, text });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function appointmentUserTemplate(data) {
  const { full_name, email, appointment_date, appointment_time, selected_doctor, status } = data;
  
  let statusText = 'scheduled';
  let statusMessage = 'Your appointment request has been received.';
  
  if (status === 'rescheduled') {
    statusText = 'rescheduled';
    statusMessage = 'Your appointment has been rescheduled.';
  } else if (status === 'done') {
    statusText = 'completed';
    statusMessage = 'Your appointment has been completed. Thank you for visiting!';
  } else if (status === 'cancelled') {
    statusText = 'cancelled';
    statusMessage = 'Your appointment has been cancelled.';
  }
  
  return {
    to: email,
    subject: `Your appointment is ${statusText} - ${appointment_date} ${appointment_time}`,
    html: `<p>Hi ${full_name},</p>
           <p>${statusMessage}</p>
           <ul>
             <li><b>Date:</b> ${appointment_date}</li>
             <li><b>Time:</b> ${appointment_time}</li>
             <li><b>Doctor:</b> ${selected_doctor}</li>
             <li><b>Status:</b> ${statusText}</li>
           </ul>
           ${status === 'done' ? '<p>We hope to see you again soon!</p>' : status === 'cancelled' ? '<p>If you need to reschedule, please book a new appointment.</p>' : '<p>We will confirm shortly.</p>'}`,
    text: `Hi ${full_name},\n${statusMessage}\nDate: ${appointment_date}\nTime: ${appointment_time}\nDoctor: ${selected_doctor}\nStatus: ${statusText}`
  };
}

export function appointmentDoctorTemplate(data) {
  const { full_name, email, phone, appointment_date, appointment_time, selected_doctor, message, reports_uploaded } = data;
  const to = process.env.DOCTORS_EMAIL || 'doctor@example.com';
  return {
    to,
    subject: `New appointment: ${full_name} (${appointment_date} ${appointment_time})`,
    html: `<p>New appointment request:</p>
           <ul>
             <li><b>Name:</b> ${full_name}</li>
             <li><b>Email:</b> ${email}</li>
             <li><b>Phone:</b> ${phone}</li>
             <li><b>Date:</b> ${appointment_date}</li>
             <li><b>Time:</b> ${appointment_time}</li>
             <li><b>Doctor:</b> ${selected_doctor}</li>
             <li><b>Reports uploaded:</b> ${reports_uploaded ? 'Yes' : 'No'}</li>
           </ul>
           <p><b>Message:</b><br/>${(message||'').replace(/</g,'&lt;')}</p>`,
    text: `New appointment:\nName: ${full_name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${appointment_date}\nTime: ${appointment_time}\nDoctor: ${selected_doctor}\nReports uploaded: ${reports_uploaded ? 'Yes' : 'No'}\nMessage: ${message||''}`
  };
}

export function contactUserTemplate(data) {
  const { name } = data;
  return {
    subject: 'We received your message',
    html: `<p>Hi ${name},</p><p>Thanks for contacting us. Our team will get back to you soon.</p>`,
    text: `Hi ${name}, We received your message. We'll get back to you soon.`
  };
}

export function contactDoctorTemplate(data) {
  const { name, email, subject, message } = data;
  const to = process.env.DOCTORS_EMAIL || 'doctor@example.com';
  return {
    to,
    subject: `New contact message: ${subject}`,
    html: `<p>You have a new contact message:</p>
           <ul>
             <li><b>Name:</b> ${name}</li>
             <li><b>Email:</b> ${email}</li>
           </ul>
           <p><b>Subject:</b> ${subject}</p>
           <p><b>Message:</b><br/>${(message||'').replace(/</g,'&lt;')}</p>`,
    text: `New contact message\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
  };
}
