import express from 'express';
import { pool } from '../lib/db.js';

const router = express.Router();

// Get SMTP settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');
    
    if (rows.length === 0) {
      return res.json({ settings: null });
    }

    // Don't send the password in the response for security
    const settings = { ...rows[0] };
    if (settings.smtp_pass) {
      settings.smtp_pass = '********'; // Mask password
    }
    
    res.json({ settings });
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    res.status(500).json({ message: 'Failed to fetch SMTP settings' });
  }
});

// Save or update SMTP settings
router.post('/', async (req, res) => {
  const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, smtp_from } = req.body;

  if (!smtp_host || !smtp_user || !smtp_pass || !smtp_from) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if settings exist
    const [existing] = await pool.query('SELECT id FROM smtp_settings LIMIT 1');

    if (existing.length > 0) {
      // Update existing settings
      let updateQuery = `
        UPDATE smtp_settings 
        SET smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_secure = ?, smtp_from = ?, updated_at = NOW()
      `;
      let params = [smtp_host, smtp_port, smtp_user, smtp_secure, smtp_from];

      // Only update password if it's not masked
      if (smtp_pass !== '********') {
        updateQuery += ', smtp_pass = ?';
        params.push(smtp_pass);
      }

      updateQuery += ' WHERE id = ?';
      params.push(existing[0].id);

      await pool.query(updateQuery, params);
    } else {
      // Insert new settings
      await pool.query(
        `INSERT INTO smtp_settings (smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, smtp_from) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, smtp_from]
      );
    }

    res.json({ message: 'SMTP settings saved successfully' });
  } catch (error) {
    console.error('Error saving SMTP settings:', error);
    res.status(500).json({ message: 'Failed to save SMTP settings' });
  }
});

// Test SMTP settings
router.post('/test', async (req, res) => {
  const { test_email } = req.body;

  if (!test_email) {
    return res.status(400).json({ message: 'Test email address is required' });
  }

  try {
    // Get SMTP settings
    const [rows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');
    
    if (rows.length === 0) {
      return res.status(400).json({ message: 'SMTP settings not configured' });
    }

    const settings = rows[0];
    
    // Import mailer dynamically
    const { sendMail } = await import('../lib/mailer.js');

    // Send test email
    await sendMail({
      to: test_email,
      subject: 'SMTP Test Email',
      html: '<h1>Success!</h1><p>Your SMTP settings are working correctly.</p>',
      text: 'Success! Your SMTP settings are working correctly.',
    });

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: `Failed to send test email: ${error.message}` });
  }
});

export default router;
