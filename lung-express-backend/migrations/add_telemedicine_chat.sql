-- Migration to add telemedicine chat support and update telemedicine_sessions
-- MySQL 5.7 compatible (no ADD COLUMN IF NOT EXISTS)

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'telemedicine_sessions'
      AND COLUMN_NAME = 'meeting_link'
    ),
    'SELECT "meeting_link exists";',
    'ALTER TABLE telemedicine_sessions ADD COLUMN meeting_link VARCHAR(500) DEFAULT NULL;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'telemedicine_sessions'
      AND COLUMN_NAME = 'scheduled_date'
    ),
    'SELECT "scheduled_date exists";',
    'ALTER TABLE telemedicine_sessions ADD COLUMN scheduled_date DATE DEFAULT NULL;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'telemedicine_sessions'
      AND COLUMN_NAME = 'scheduled_time_new'
    ),
    'SELECT "scheduled_time_new exists";',
    'ALTER TABLE telemedicine_sessions ADD COLUMN scheduled_time_new TIME DEFAULT NULL;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS telemedicine_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  sender_type ENUM('patient', 'doctor') NOT NULL,
  sender_id INT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  INDEX idx_tele_messages_session (session_id)
);

CREATE TABLE IF NOT EXISTS tenant_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_name VARCHAR(255),
  doctor_specialty VARCHAR(100),
  doctor_degrees TEXT,
  doctor_bio TEXT,
  doctor_photo VARCHAR(500),
  consultation_fee DECIMAL(10, 2),
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  clinic_phone VARCHAR(20),
  clinic_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
