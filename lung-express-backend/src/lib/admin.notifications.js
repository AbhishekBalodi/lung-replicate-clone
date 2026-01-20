/**
 * Notifications & Alerts Backend Logic
 * Handles system alerts and notification settings
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// SYSTEM ALERTS
// ============================================

export async function getSystemAlerts(req, res) {
  try {
    const pool = getTenantPool(req);
    const { type, status, search } = req.query;
    
    let query = 'SELECT * FROM system_alerts';
    const conditions = [];
    const params = [];
    
    if (type && type !== 'all') {
      conditions.push('alert_type = ?');
      params.push(type);
    }
    
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (search) {
      conditions.push('(title LIKE ? OR message LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const [rows] = await pool.execute(query, params);
    res.json({ alerts: rows });
  } catch (err) {
    console.error('getSystemAlerts error:', err);
    res.status(500).json({ error: 'Failed to fetch system alerts' });
  }
}

export async function getSystemAlertsSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM system_alerts');
    const [critical] = await pool.execute("SELECT COUNT(*) as count FROM system_alerts WHERE priority = 'critical' AND status = 'active'");
    const [active] = await pool.execute("SELECT COUNT(*) as count FROM system_alerts WHERE status = 'active'");
    const [today] = await pool.execute("SELECT COUNT(*) as count FROM system_alerts WHERE DATE(created_at) = CURDATE()");
    
    res.json({
      total: total[0]?.count || 0,
      critical: critical[0]?.count || 0,
      active: active[0]?.count || 0,
      today: today[0]?.count || 0
    });
  } catch (err) {
    console.error('getSystemAlertsSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch system alerts summary' });
  }
}

export async function createSystemAlert(req, res) {
  try {
    const pool = getTenantPool(req);
    const { title, message, alert_type, priority, target_role, expires_at } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO system_alerts (title, message, alert_type, priority, target_role, expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [title, message, alert_type || 'info', priority || 'normal', target_role || null, expires_at || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('createSystemAlert error:', err);
    res.status(500).json({ error: 'Failed to create system alert' });
  }
}

export async function dismissAlert(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    await pool.execute("UPDATE system_alerts SET status = 'dismissed', dismissed_at = NOW() WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('dismissAlert error:', err);
    res.status(500).json({ error: 'Failed to dismiss alert' });
  }
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================

export async function getNotificationSettings(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [settings] = await pool.execute('SELECT * FROM notification_settings ORDER BY category, setting_key');
    res.json({ settings });
  } catch (err) {
    console.error('getNotificationSettings error:', err);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
}

export async function updateNotificationSetting(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { enabled, email_enabled, sms_enabled, push_enabled } = req.body;
    
    await pool.execute(
      `UPDATE notification_settings 
       SET enabled = ?, email_enabled = ?, sms_enabled = ?, push_enabled = ?, updated_at = NOW()
       WHERE id = ?`,
      [enabled, email_enabled, sms_enabled, push_enabled, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateNotificationSetting error:', err);
    res.status(500).json({ error: 'Failed to update notification setting' });
  }
}

export async function saveNotificationSettings(req, res) {
  try {
    const pool = getTenantPool(req);
    const { settings } = req.body;
    
    for (const setting of settings) {
      if (setting.id) {
        await pool.execute(
          `UPDATE notification_settings 
           SET enabled = ?, email_enabled = ?, sms_enabled = ?, push_enabled = ?, updated_at = NOW()
           WHERE id = ?`,
          [setting.enabled, setting.email_enabled, setting.sms_enabled, setting.push_enabled, setting.id]
        );
      } else {
        await pool.execute(
          `INSERT INTO notification_settings (category, setting_key, setting_name, enabled, email_enabled, sms_enabled, push_enabled)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [setting.category, setting.setting_key, setting.setting_name, setting.enabled, setting.email_enabled, setting.sms_enabled, setting.push_enabled]
        );
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('saveNotificationSettings error:', err);
    res.status(500).json({ error: 'Failed to save notification settings' });
  }
}
