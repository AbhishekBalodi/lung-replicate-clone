/**
 * Compliance & Security Backend Logic
 * Handles audit logs, access control, and data access logs
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// AUDIT LOGS
// ============================================

export async function getAuditLogsSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM audit_logs');
    const [logins] = await pool.execute("SELECT COUNT(*) as count FROM audit_logs WHERE action = 'LOGIN' AND DATE(created_at) = CURDATE()");
    const [dataChanges] = await pool.execute("SELECT COUNT(*) as count FROM audit_logs WHERE action IN ('CREATE', 'UPDATE', 'DELETE')");
    const [failed] = await pool.execute("SELECT COUNT(*) as count FROM audit_logs WHERE status = 'failed'");
    
    res.json({
      totalActions: total[0]?.count || 0,
      loginsToday: logins[0]?.count || 0,
      dataChanges: dataChanges[0]?.count || 0,
      failedActions: failed[0]?.count || 0
    });
  } catch (err) {
    console.error('getAuditLogsSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs summary' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const pool = getTenantPool(req);
    const { action, search, from, to } = req.query;
    
    let query = 'SELECT * FROM audit_logs';
    const conditions = [];
    const params = [];
    
    if (action && action !== 'all') {
      conditions.push('action = ?');
      params.push(action);
    }
    
    if (search) {
      conditions.push('(user_name LIKE ? OR resource LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (from) {
      conditions.push('DATE(created_at) >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('DATE(created_at) <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC LIMIT 500';
    
    const [rows] = await pool.execute(query, params);
    res.json({ logs: rows });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}

export async function addAuditLog(req, res) {
  try {
    const pool = getTenantPool(req);
    const { user_id, user_name, action, resource, resource_id, ip_address, user_agent, details, status } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, ip_address, user_agent, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, user_name, action, resource, resource_id || null, ip_address || null, user_agent || null, details || null, status || 'success']
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addAuditLog error:', err);
    res.status(500).json({ error: 'Failed to add audit log' });
  }
}

// ============================================
// ACCESS CONTROL
// ============================================

export async function getAccessControlList(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [roles] = await pool.execute('SELECT * FROM access_roles ORDER BY name');
    const [permissions] = await pool.execute('SELECT * FROM access_permissions ORDER BY resource');
    const [rolePermissions] = await pool.execute(`
      SELECT rp.*, r.name as role_name, p.name as permission_name, p.resource
      FROM role_permissions rp
      JOIN access_roles r ON r.id = rp.role_id
      JOIN access_permissions p ON p.id = rp.permission_id
    `);
    
    res.json({ roles, permissions, rolePermissions });
  } catch (err) {
    console.error('getAccessControlList error:', err);
    res.status(500).json({ error: 'Failed to fetch access control list' });
  }
}

export async function updateRolePermissions(req, res) {
  try {
    const pool = getTenantPool(req);
    const { role_id, permission_ids } = req.body;
    
    // Remove existing permissions
    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [role_id]);
    
    // Add new permissions
    for (const permissionId of permission_ids) {
      await pool.execute('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [role_id, permissionId]);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateRolePermissions error:', err);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
}

// ============================================
// DATA ACCESS LOGS
// ============================================

export async function getDataAccessLogs(req, res) {
  try {
    const pool = getTenantPool(req);
    const { user_id, resource_type, search, from, to } = req.query;
    
    let query = 'SELECT * FROM data_access_logs';
    const conditions = [];
    const params = [];
    
    if (user_id) {
      conditions.push('user_id = ?');
      params.push(user_id);
    }
    
    if (resource_type) {
      conditions.push('resource_type = ?');
      params.push(resource_type);
    }
    
    if (search) {
      conditions.push('(user_name LIKE ? OR resource_type LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (from) {
      conditions.push('DATE(accessed_at) >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('DATE(accessed_at) <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY accessed_at DESC LIMIT 500';
    
    const [rows] = await pool.execute(query, params);
    res.json({ logs: rows });
  } catch (err) {
    console.error('getDataAccessLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch data access logs' });
  }
}

export async function logDataAccess(req, res) {
  try {
    const pool = getTenantPool(req);
    const { user_id, user_name, resource_type, resource_id, action, details, ip_address } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO data_access_logs (user_id, user_name, resource_type, resource_id, action, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, user_name, resource_type, resource_id || null, action, details || null, ip_address || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('logDataAccess error:', err);
    res.status(500).json({ error: 'Failed to log data access' });
  }
}
