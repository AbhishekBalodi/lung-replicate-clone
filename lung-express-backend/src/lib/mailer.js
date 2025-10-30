import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || 'no-reply@example.com';
  return transporter.sendMail({ from, to, subject, html, text });
}

export function appointmentUserTemplate(data) {
  const { full_name, appointment_date, appointment_time, selected_doctor } = data;
  return {
    subject: `Your appointment is received - ${appointment_date} ${appointment_time}`,
    html: `<p>Hi ${full_name},</p>
           <p>Your appointment request has been received.</p>
           <ul>
             <li><b>Date:</b> ${appointment_date}</li>
             <li><b>Time:</b> ${appointment_time}</li>
             <li><b>Doctor:</b> ${selected_doctor}</li>
           </ul>
           <p>We will confirm shortly.</p>`,
    text: `Hi ${full_name},\nYour appointment request has been received for ${appointment_date} ${appointment_time} with ${selected_doctor}. We will confirm shortly.`
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
