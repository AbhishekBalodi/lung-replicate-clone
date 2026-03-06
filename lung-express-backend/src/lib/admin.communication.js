/**
 * Communication Backend Logic
 * Handles internal chat and staff notes
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// ENSURE TABLES EXIST
// ============================================

async function ensureCommunicationTables(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS internal_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        participant1_id INT NOT NULL,
        participant2_id INT,
        chat_type ENUM('direct', 'group') DEFAULT 'direct',
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS internal_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chat_id INT NOT NULL,
        sender_id INT,
        sender_name VARCHAR(255),
        sender_role VARCHAR(100),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES internal_chats(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT,
        sender_name VARCHAR(255),
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('Communication tables creation warning:', e.message);
  }
}

// ============================================
// CHATS
// ============================================

export async function getChatList(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCommunicationTables(pool);

    // Auto-populate chats from all staff sources if none exist
    const [[{ chatCount }]] = await pool.query(`SELECT COUNT(*) as chatCount FROM internal_chats`);
    
    if (chatCount === 0) {
      // Gather all staff from doctors, hospital_staff, call_center_staff
      const staffMembers = [];

      // Doctors
      try {
        const [doctors] = await pool.query(`SELECT id, name, COALESCE(specialization, 'Doctor') as role FROM doctors WHERE is_active = 1`);
        for (const d of doctors) {
          staffMembers.push({ id: d.id, name: d.name, role: d.role, source: 'doctor' });
        }
      } catch (e) { /* table may not exist */ }

      // Hospital staff
      try {
        const [hStaff] = await pool.query(`SELECT id, name, COALESCE(role, 'Staff') as role FROM hospital_staff WHERE status = 'active'`);
        for (const s of hStaff) {
          staffMembers.push({ id: 1000 + s.id, name: s.name, role: s.role, source: 'hospital_staff' });
        }
      } catch (e) { /* table may not exist */ }

      // Call center staff
      try {
        const [ccStaff] = await pool.query(`SELECT id, name, COALESCE(department, 'Call Center') as role FROM call_center_staff WHERE status = 'active'`);
        for (const s of ccStaff) {
          staffMembers.push({ id: 2000 + s.id, name: s.name, role: s.role, source: 'call_center' });
        }
      } catch (e) { /* table may not exist */ }

      // Create a chat entry for each staff member
      for (const staff of staffMembers) {
        try {
          await pool.query(
            `INSERT INTO internal_chats (participant1_id, participant2_id, chat_type, name) VALUES (0, ?, 'direct', ?)`,
            [staff.id, staff.name]
          );
        } catch (e) { /* ignore duplicates */ }
      }
    }

    // Now fetch chats — join against multiple sources for role info
    const [chats] = await pool.query(`
      SELECT 
        ic.id,
        ic.name,
        COALESCE(
          d.specialization,
          hs.role,
          ccs.department,
          'Staff'
        ) as role,
        COALESCE(
          (SELECT content FROM internal_messages WHERE chat_id = ic.id ORDER BY created_at DESC LIMIT 1),
          'No messages yet'
        ) as last_message,
        COALESCE(
          (SELECT created_at FROM internal_messages WHERE chat_id = ic.id ORDER BY created_at DESC LIMIT 1),
          ic.created_at
        ) as last_message_time,
        (SELECT COUNT(*) FROM internal_messages WHERE chat_id = ic.id AND is_read = FALSE) as unread_count
      FROM internal_chats ic
      LEFT JOIN doctors d ON d.id = ic.participant2_id AND ic.participant2_id < 1000
      LEFT JOIN hospital_staff hs ON hs.id = (ic.participant2_id - 1000) AND ic.participant2_id >= 1000 AND ic.participant2_id < 2000
      LEFT JOIN call_center_staff ccs ON ccs.id = (ic.participant2_id - 2000) AND ic.participant2_id >= 2000
      ORDER BY last_message_time DESC
    `);

    res.json({ chats });
  } catch (err) {
    console.error('getChatList error:', err);
    res.json({ chats: [] });
  }
}

export async function getChatMessages(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCommunicationTables(pool);
    const { chat_id } = req.query;

    if (!chat_id) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    // Mark messages as read
    await pool.query(`UPDATE internal_messages SET is_read = TRUE WHERE chat_id = ?`, [chat_id]);

    const [messages] = await pool.query(`
      SELECT id, sender_name as sender, sender_role, content, created_at, 
             (sender_id = ?) as is_own
      FROM internal_messages
      WHERE chat_id = ?
      ORDER BY created_at ASC
    `, [req.headers['x-doctor-id'] || 0, chat_id]);

    res.json({ messages });
  } catch (err) {
    console.error('getChatMessages error:', err);
    res.json({ messages: [] });
  }
}

export async function sendChatMessage(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCommunicationTables(pool);
    const { chat_id, content } = req.body;

    if (!chat_id || !content) {
      return res.status(400).json({ error: 'chat_id and content are required' });
    }

    const doctorId = req.headers['x-doctor-id'] || 0;
    
    // Get sender name
    let senderName = 'Admin';
    let senderRole = 'Admin';
    try {
      const [[doctor]] = await pool.query(`SELECT name, specialization FROM doctors WHERE id = ?`, [doctorId]);
      if (doctor) {
        senderName = doctor.name;
        senderRole = doctor.specialization || 'Doctor';
      }
    } catch (e) { /* ignore */ }

    const [result] = await pool.query(`
      INSERT INTO internal_messages (chat_id, sender_id, sender_name, sender_role, content)
      VALUES (?, ?, ?, ?, ?)
    `, [chat_id, doctorId, senderName, senderRole, content]);

    // Update chat timestamp
    await pool.query(`UPDATE internal_chats SET updated_at = NOW() WHERE id = ?`, [chat_id]);

    res.json({
      message: {
        id: result.insertId,
        sender: senderName,
        sender_role: senderRole,
        content,
        created_at: new Date().toISOString(),
        is_own: true
      }
    });
  } catch (err) {
    console.error('sendChatMessage error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

// ============================================
// STAFF NOTES
// ============================================

export async function getStaffNotes(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCommunicationTables(pool);

    const [notes] = await pool.query(`
      SELECT id, sender_name, recipient, subject, content, is_pinned, created_at
      FROM staff_notes
      ORDER BY is_pinned DESC, created_at DESC
      LIMIT 50
    `);

    res.json({ notes });
  } catch (err) {
    console.error('getStaffNotes error:', err);
    res.json({ notes: [] });
  }
}

export async function addStaffNote(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCommunicationTables(pool);
    const { recipient, subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    const doctorId = req.headers['x-doctor-id'] || 0;
    let senderName = 'Admin';
    try {
      const [[doctor]] = await pool.query(`SELECT name FROM doctors WHERE id = ?`, [doctorId]);
      if (doctor) senderName = doctor.name;
    } catch (e) { /* ignore */ }

    const [result] = await pool.query(`
      INSERT INTO staff_notes (sender_id, sender_name, recipient, subject, content)
      VALUES (?, ?, ?, ?, ?)
    `, [doctorId, senderName, recipient || 'All Staff', subject, content]);

    res.json({
      note: {
        id: result.insertId,
        sender_name: senderName,
        recipient: recipient || 'All Staff',
        subject,
        content,
        is_pinned: false,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('addStaffNote error:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
}

export async function toggleNotePin(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.query(`UPDATE staff_notes SET is_pinned = NOT is_pinned WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('toggleNotePin error:', err);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
}

// ============================================
// HOSPITAL STAFF (non-doctor staff members)
// ============================================

async function ensureHospitalStaffTable(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hospital_staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(100) NOT NULL DEFAULT 'Staff',
        department VARCHAR(100),
        status ENUM('active', 'inactive', 'on-leave') DEFAULT 'active',
        joining_date DATE DEFAULT (CURDATE()),
        shift VARCHAR(50) DEFAULT 'Morning',
        salary DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('Hospital staff table creation warning:', e.message);
  }
}

export async function getHospitalStaffList(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureHospitalStaffTable(pool);
    const { search } = req.query;

    let query = `SELECT * FROM hospital_staff`;
    const params = [];

    if (search) {
      query += ` WHERE name LIKE ? OR role LIKE ? OR department LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ staff: rows });
  } catch (err) {
    console.error('getHospitalStaffList error:', err);
    res.json({ staff: [] });
  }
}

export async function addHospitalStaff(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureHospitalStaffTable(pool);
    const { name, email, phone, role, department, shift, salary } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO hospital_staff (name, email, phone, role, department, shift, salary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, email || null, phone || null, role || 'Staff', department || null, shift || 'Morning', salary || null]);

    const [[newStaff]] = await pool.query(`SELECT * FROM hospital_staff WHERE id = ?`, [result.insertId]);

    res.status(201).json({ success: true, staff: newStaff });
  } catch (err) {
    console.error('addHospitalStaff error:', err);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
}

export async function updateHospitalStaff(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { name, email, phone, role, department, status, shift, salary } = req.body;

    await pool.query(`
      UPDATE hospital_staff SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        status = COALESCE(?, status),
        shift = COALESCE(?, shift),
        salary = COALESCE(?, salary)
      WHERE id = ?
    `, [name, email, phone, role, department, status, shift, salary, id]);

    res.json({ success: true });
  } catch (err) {
    console.error('updateHospitalStaff error:', err);
    res.status(500).json({ error: 'Failed to update staff' });
  }
}

export async function deleteHospitalStaff(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    await pool.query(`DELETE FROM hospital_staff WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteHospitalStaff error:', err);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
}

// ============================================
// CALL CENTER STAFF
// ============================================

async function ensureCallCenterTable(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS call_center_staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        extension VARCHAR(20),
        department VARCHAR(100),
        status ENUM('active', 'inactive', 'on-call') DEFAULT 'active',
        shift VARCHAR(50) DEFAULT 'Morning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('Call center table creation warning:', e.message);
  }
}

export async function getCallCenterStaff(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCallCenterTable(pool);
    const { search } = req.query;

    let query = `SELECT * FROM call_center_staff`;
    const params = [];

    if (search) {
      query += ` WHERE name LIKE ? OR department LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ staff: rows });
  } catch (err) {
    console.error('getCallCenterStaff error:', err);
    res.json({ staff: [] });
  }
}

export async function addCallCenterStaff(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureCallCenterTable(pool);
    const { name, email, phone, extension, department, shift } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await pool.query(`
      INSERT INTO call_center_staff (name, email, phone, extension, department, shift)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email || null, phone || null, extension || null, department || null, shift || 'Morning']);

    const [[newStaff]] = await pool.query(`SELECT * FROM call_center_staff WHERE id = ?`, [result.insertId]);

    res.status(201).json({ success: true, staff: newStaff });
  } catch (err) {
    console.error('addCallCenterStaff error:', err);
    res.status(500).json({ error: 'Failed to add call center staff' });
  }
}
