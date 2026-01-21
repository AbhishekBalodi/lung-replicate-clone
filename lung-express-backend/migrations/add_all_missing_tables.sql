-- =============================================
-- COMPREHENSIVE MIGRATION: All Missing Tables
-- Run this on existing tenant databases to add
-- all missing tables referenced by backend APIs
-- =============================================

-- ============================================
-- PATIENT SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL UNIQUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  medicine_reminders BOOLEAN DEFAULT TRUE,
  lab_reports_notifications BOOLEAN DEFAULT TRUE,
  payment_reminders BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  promotional_emails BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================
-- PATIENT EMERGENCY CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS patient_emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL UNIQUE,
  name VARCHAR(255),
  relationship VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================
-- PATIENT FAMILY MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS patient_family_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100),
  age INT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================
-- PATIENT CONVERSATIONS (Messaging)
-- ============================================
CREATE TABLE IF NOT EXISTS patient_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  participant_type ENUM('doctor', 'hospital', 'support') DEFAULT 'hospital',
  participant_id INT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================
-- PATIENT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS patient_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_type ENUM('patient', 'doctor', 'hospital') NOT NULL,
  sender_id INT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES patient_conversations(id) ON DELETE CASCADE
);

-- ============================================
-- PATIENT NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS patient_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================
-- DOCTOR RATINGS
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_rating (doctor_id, patient_email)
);

-- ============================================
-- HOSPITAL FEEDBACK
-- ============================================
CREATE TABLE IF NOT EXISTS hospital_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NULL,
  patient_email VARCHAR(255),
  feedback TEXT NOT NULL,
  rating TINYINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COMPLAINTS
-- ============================================
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NULL,
  patient_email VARCHAR(255),
  complaint_number VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'general',
  description TEXT NOT NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- SUPPORT TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

-- ============================================
-- SUPPORT TICKET RESPONSES
-- ============================================
CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  responder_type ENUM('patient', 'staff') NOT NULL,
  responder_name VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

-- ============================================
-- DOCTOR SCHEDULE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL,
  day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INT DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_schedule_doctor (doctor_id),
  INDEX idx_schedule_day (day)
);

-- ============================================
-- SCHEDULE SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL UNIQUE,
  default_slot_duration INT DEFAULT 15,
  buffer_time INT DEFAULT 5,
  booking_window_days INT DEFAULT 30,
  cancellation_hours INT DEFAULT 24,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- LEAVE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- FEEDBACK TABLE (for reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL,
  patient_id INT NULL,
  patient_email VARCHAR(255),
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_doctor (doctor_id),
  INDEX idx_feedback_rating (rating)
);

-- ============================================
-- TELEMEDICINE SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  session_type ENUM('video', 'audio', 'chat') DEFAULT 'video',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  meeting_link VARCHAR(500),
  room_id VARCHAR(100),
  notes TEXT,
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tele_patient (patient_id),
  INDEX idx_tele_doctor (doctor_id),
  INDEX idx_tele_date (scheduled_date)
);

-- ============================================
-- TELEMEDICINE MESSAGES (Chat within session)
-- ============================================
CREATE TABLE IF NOT EXISTS telemedicine_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  sender_type ENUM('patient', 'doctor') NOT NULL,
  sender_id INT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES telemedicine_sessions(id) ON DELETE CASCADE
);

-- ============================================
-- Add missing columns to existing tables
-- ============================================

-- Add avatar_url to patients if missing
SET @dbname = DATABASE();
SET @tablename = 'patients';
SET @columnname = 'avatar_url';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname) = 0,
  'ALTER TABLE patients ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL',
  'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add gender to patients if missing
SET @columnname = 'gender';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname) = 0,
  'ALTER TABLE patients ADD COLUMN gender ENUM(''male'', ''female'', ''other'') DEFAULT NULL',
  'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add blood_group to patients if missing
SET @columnname = 'blood_group';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname) = 0,
  'ALTER TABLE patients ADD COLUMN blood_group VARCHAR(5) DEFAULT NULL',
  'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Insert default schedule slots if empty
-- ============================================
INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active)
SELECT 'Monday', '09:00:00', '17:00:00', 30, TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM doctor_schedule LIMIT 1);

INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active)
SELECT 'Tuesday', '09:00:00', '17:00:00', 30, TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM doctor_schedule WHERE day = 'Tuesday');

INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active)
SELECT 'Wednesday', '09:00:00', '17:00:00', 30, TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM doctor_schedule WHERE day = 'Wednesday');

INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active)
SELECT 'Thursday', '09:00:00', '17:00:00', 30, TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM doctor_schedule WHERE day = 'Thursday');

INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active)
SELECT 'Friday', '09:00:00', '17:00:00', 30, TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM doctor_schedule WHERE day = 'Friday');

INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active)
SELECT 'Saturday', '09:00:00', '13:00:00', 30, TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM doctor_schedule WHERE day = 'Saturday');

-- ============================================
-- DEFAULT SCHEDULE SETTINGS
-- ============================================
INSERT INTO schedule_settings (default_slot_duration, buffer_time, booking_window_days, cancellation_hours)
SELECT 30, 5, 30, 24
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM schedule_settings LIMIT 1);
