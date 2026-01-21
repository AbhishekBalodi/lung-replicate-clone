-- ============================================
-- ADDITIONAL TABLES FOR SUPER ADMIN DASHBOARD
-- SAFE MIGRATION (MySQL 5.7+ compatible)
-- Run on existing tenant databases
-- ============================================

/* =======================
   CORE TABLES
   ======================= */

CREATE TABLE IF NOT EXISTS ambulance_calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  pickup_location TEXT,
  drop_location TEXT,
  reason VARCHAR(255),
  priority ENUM('normal','urgent','critical') DEFAULT 'normal',
  ambulance_id INT,
  status ENUM('pending','dispatched','en_route','completed','cancelled') DEFAULT 'pending',
  notes TEXT,
  dispatched_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS diagnosis_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  diagnosis TEXT NOT NULL,
  symptoms TEXT,
  notes TEXT,
  status ENUM('draft','final') DEFAULT 'draft',
  doctor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS treatment_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goals TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('active','completed','cancelled') DEFAULT 'active',
  doctor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS progress_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  note_type VARCHAR(50) DEFAULT 'general',
  content TEXT NOT NULL,
  vitals JSON,
  doctor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS medical_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) DEFAULT 'other',
  file_url TEXT,
  file_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  follow_up_date DATE NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  status ENUM('pending','completed','cancelled') DEFAULT 'pending',
  doctor_id INT,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS care_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goals TEXT,
  interventions TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('active','completed','cancelled') DEFAULT 'active',
  doctor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(255),
  resource_id INT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  details TEXT,
  status ENUM('success','failed') DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_access_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id INT,
  action VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(50),
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  alert_type ENUM('info','warning','error','critical') DEFAULT 'info',
  priority ENUM('low','normal','high','critical') DEFAULT 'normal',
  target_role VARCHAR(50),
  status ENUM('active','dismissed','expired') DEFAULT 'active',
  expires_at TIMESTAMP NULL,
  dismissed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100),
  setting_key VARCHAR(100) NOT NULL,
  setting_name VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  tagline VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  registration_number VARCHAR(100),
  established_year INT,
  bed_count INT,
  description TEXT,
  logo_url TEXT,
  accreditations JSON,
  specializations JSON,
  working_hours JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  head_id INT,
  description TEXT,
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* =======================
   SAFE COLUMN ADD (FIX)
   ======================= */

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'doctors'
        AND column_name = 'department_id'
    ),
    'SELECT "department_id already exists";',
    'ALTER TABLE doctors ADD COLUMN department_id INT;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

/* =======================
   OTHER TABLES
   ======================= */

CREATE TABLE IF NOT EXISTS hospital_facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  capacity INT,
  location VARCHAR(255),
  status ENUM('active','inactive','maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  model VARCHAR(255),
  serial_number VARCHAR(100),
  manufacturer VARCHAR(255),
  purchase_date DATE,
  warranty_until DATE,
  status ENUM('operational','maintenance','retired') DEFAULT 'operational',
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  insurance_provider VARCHAR(255),
  policy_number VARCHAR(100),
  claim_number VARCHAR(100) UNIQUE,
  claim_amount DECIMAL(12,2),
  approved_amount DECIMAL(12,2),
  claim_date DATE,
  diagnosis TEXT,
  treatment TEXT,
  documents JSON,
  notes TEXT,
  status ENUM('pending','submitted','approved','rejected','partial') DEFAULT 'pending',
  rejection_reason TEXT,
  approved_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS access_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES access_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES access_permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

/* =======================
   SEED DATA
   ======================= */

INSERT IGNORE INTO notification_settings
(category, setting_key, setting_name, enabled, email_enabled, sms_enabled)
VALUES
('appointments','new_appointment','New Appointment',TRUE,TRUE,TRUE),
('appointments','appointment_reminder','Appointment Reminder',TRUE,TRUE,TRUE),
('appointments','appointment_cancelled','Appointment Cancelled',TRUE,TRUE,FALSE),
('billing','invoice_created','Invoice Created',TRUE,TRUE,FALSE),
('billing','payment_received','Payment Received',TRUE,TRUE,FALSE),
('lab','results_ready','Lab Results Ready',TRUE,TRUE,TRUE),
('system','system_alerts','System Alerts',TRUE,TRUE,FALSE);
