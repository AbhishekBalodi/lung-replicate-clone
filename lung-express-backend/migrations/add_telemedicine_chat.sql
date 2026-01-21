-- Migration to add telemedicine chat support and update telemedicine_sessions

-- Add meeting_link column if it doesn't exist
ALTER TABLE telemedicine_sessions 
ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500) DEFAULT NULL;

-- Add session_type if using old 'type' column
-- (Skip if column already exists with correct name)

-- Add scheduled_date and scheduled_time if using old scheduled_time datetime
ALTER TABLE telemedicine_sessions 
ADD COLUMN IF NOT EXISTS scheduled_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS scheduled_time_new TIME DEFAULT NULL;

-- Create telemedicine_messages table for chat
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

-- Create tenant_settings table if not exists (for individual doctor tenants)
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
