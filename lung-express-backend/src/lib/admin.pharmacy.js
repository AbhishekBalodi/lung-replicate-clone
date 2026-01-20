/**
 * Pharmacy Management Backend Logic
 * Handles medicines catalog and inventory
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// PHARMACY MEDICINES
// ============================================

export async function getPharmacyMedicinesList(req, res) {
  try {
    const pool = getTenantPool(req);
    const { search } = req.query;
    
    let query = 'SELECT * FROM pharmacy_medicines';
    const params = [];
    
    if (search) {
      query += ' WHERE name LIKE ? OR brand LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY name ASC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ items: rows });
  } catch (err) {
    console.error('getPharmacyMedicinesList error:', err);
    res.status(500).json({ error: 'Failed to fetch pharmacy medicines' });
  }
}

export async function addPharmacyMedicine(req, res) {
  try {
    const pool = getTenantPool(req);
    const { name, brand, sku, unit_type, unit_price, description } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO pharmacy_medicines (name, brand, sku, unit_type, unit_price, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, brand || null, sku || null, unit_type || 'tablet', unit_price || 0, description || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addPharmacyMedicine error:', err);
    res.status(500).json({ error: 'Failed to add pharmacy medicine' });
  }
}

export async function updatePharmacyMedicine(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { name, brand, sku, unit_type, unit_price, description } = req.body;
    
    await pool.execute(
      `UPDATE pharmacy_medicines SET name = ?, brand = ?, sku = ?, unit_type = ?, unit_price = ?, description = ?
       WHERE id = ?`,
      [name, brand, sku, unit_type, unit_price, description, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updatePharmacyMedicine error:', err);
    res.status(500).json({ error: 'Failed to update pharmacy medicine' });
  }
}

export async function deletePharmacyMedicine(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    await pool.execute('DELETE FROM pharmacy_medicines WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deletePharmacyMedicine error:', err);
    res.status(500).json({ error: 'Failed to delete pharmacy medicine' });
  }
}

// ============================================
// PHARMACY INVENTORY
// ============================================

export async function getPharmacyInventory(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [rows] = await pool.execute(`
      SELECT pi.*, pm.name as medicine_name, pm.brand, pm.unit_type, pm.unit_price
      FROM pharmacy_inventory pi
      JOIN pharmacy_medicines pm ON pm.id = pi.medicine_id
      ORDER BY pm.name ASC
    `);
    
    res.json({ inventory: rows });
  } catch (err) {
    console.error('getPharmacyInventory error:', err);
    res.status(500).json({ error: 'Failed to fetch pharmacy inventory' });
  }
}

export async function getPharmacyInventorySummary(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [totalItems] = await pool.execute('SELECT COUNT(DISTINCT medicine_id) as count FROM pharmacy_inventory');
    const [lowStock] = await pool.execute('SELECT COUNT(*) as count FROM pharmacy_inventory WHERE quantity < 10');
    const [expiringSoon] = await pool.execute(`
      SELECT COUNT(*) as count FROM pharmacy_inventory 
      WHERE expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);
    const [totalValue] = await pool.execute(`
      SELECT SUM(pi.quantity * pm.unit_price) as value 
      FROM pharmacy_inventory pi 
      JOIN pharmacy_medicines pm ON pm.id = pi.medicine_id
    `);
    
    res.json({
      totalItems: totalItems[0]?.count || 0,
      lowStock: lowStock[0]?.count || 0,
      expiringSoon: expiringSoon[0]?.count || 0,
      totalValue: totalValue[0]?.value || 0
    });
  } catch (err) {
    console.error('getPharmacyInventorySummary error:', err);
    res.status(500).json({ error: 'Failed to fetch pharmacy inventory summary' });
  }
}

export async function addPharmacyInventory(req, res) {
  try {
    const pool = getTenantPool(req);
    const { medicine_id, quantity, batch_number, expiry_date } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO pharmacy_inventory (medicine_id, quantity, batch_number, expiry_date)
       VALUES (?, ?, ?, ?)`,
      [medicine_id, quantity || 0, batch_number || null, expiry_date || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addPharmacyInventory error:', err);
    res.status(500).json({ error: 'Failed to add pharmacy inventory' });
  }
}

export async function updatePharmacyInventory(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { quantity, batch_number, expiry_date } = req.body;
    
    await pool.execute(
      `UPDATE pharmacy_inventory SET quantity = ?, batch_number = ?, expiry_date = ?
       WHERE id = ?`,
      [quantity, batch_number, expiry_date, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updatePharmacyInventory error:', err);
    res.status(500).json({ error: 'Failed to update pharmacy inventory' });
  }
}
