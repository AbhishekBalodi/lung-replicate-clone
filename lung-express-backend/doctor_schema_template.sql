-- ============================================
-- INDIVIDUAL DOCTOR SCHEMA TEMPLATE
-- ============================================
-- This template is used for individual doctor tenants (single-doctor practices)
-- Uses selected_doctor VARCHAR for doctor reference (simpler structure)
-- Replace {{TENANT_CODE}} with the actual tenant code

-- Create the tenant database
CREATE DATABASE IF NOT EXISTS {{TENANT_CODE}};
USE {{TENANT_CODE}};

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  age INT DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(50) NOT NULL,
  selected_doctor VARCHAR(150) NOT NULL,
  message TEXT,
  status ENUM('pending', 'confirmed', 'rescheduled', 'cancelled', 'done') DEFAULT 'pending',
  reports_uploaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_appointments_date (appointment_date),
  INDEX idx_appointments_status (status),
  INDEX idx_appointments_email (email)
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_uid VARCHAR(20) DEFAULT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  age INT DEFAULT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  state VARCHAR(100) DEFAULT NULL,
  address TEXT,
  blood_group VARCHAR(5),
  emergency_contact VARCHAR(20),
  medical_history TEXT,
  allergies TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_appointment_date DATE,
  last_appointment_time VARCHAR(50),
  doctor_assigned VARCHAR(150),
  first_visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_patient (email, phone),
  UNIQUE KEY unique_patient_uid (patient_uid),
  INDEX idx_patients_name (full_name),
  INDEX idx_patients_phone (phone)
);

-- ============================================
-- MEDICINES CATALOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicines_catalog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  form ENUM('tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'other') DEFAULT 'tablet',
  strength VARCHAR(50),
  manufacturer VARCHAR(255),
  default_dosage VARCHAR(100),
  default_frequency VARCHAR(100),
  default_duration VARCHAR(50),
  route VARCHAR(50),
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_medicines_name (name)
);

-- ============================================
-- PRESCRIBED MEDICINES TABLE (named 'medicines' for individual doctors for compatibility)
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_id INT,
  medicine_id INT,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(50),
  instructions TEXT,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (medicine_id) REFERENCES medicines_catalog(id) ON DELETE SET NULL,
  INDEX idx_prescribed_patient (patient_id),
  INDEX idx_prescribed_date (prescribed_date)
);

-- ============================================
-- LAB TESTS CATALOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lab_catalogue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  sample_type VARCHAR(100),
  preparation_instructions TEXT,
  turnaround_time VARCHAR(50),
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lab_name (name)
);

-- ============================================
-- PRESCRIBED LAB TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS labs_test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_id INT,
  lab_id INT,
  test_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  sample_type VARCHAR(100),
  notes TEXT,
  status ENUM('ordered', 'sample_collected', 'in_progress', 'completed') DEFAULT 'ordered',
  result TEXT,
  turnaround_time VARCHAR(50),
  preparation_instructions TEXT,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (lab_id) REFERENCES lab_catalogue(id) ON DELETE SET NULL,
  INDEX idx_labs_patient (patient_id),
  INDEX idx_labs_status (status)
);

-- ============================================
-- PROCEDURES CATALOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS procedure_catalogue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  duration_minutes INT,
  preparation_instructions TEXT,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_procedure_name (name)
);

-- ============================================
-- PRESCRIBED PROCEDURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS procedures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_id INT,
  procedure_id INT,
  procedure_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  notes TEXT,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  preparation_instructions TEXT,
  scheduled_date TIMESTAMP NULL,
  completed_date TIMESTAMP NULL,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (procedure_id) REFERENCES procedure_catalogue(id) ON DELETE SET NULL,
  INDEX idx_procedures_patient (patient_id),
  INDEX idx_procedures_status (status)
);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_status (status)
);

-- ============================================
-- TELEMEDICINE SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  patient_name VARCHAR(255),
  doctor_id INT,
  session_type ENUM('video', 'chat', 'phone') DEFAULT 'video',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration VARCHAR(50) DEFAULT '30 min',
  status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  meeting_link VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  INDEX idx_telemedicine_status (status),
  INDEX idx_telemedicine_scheduled (scheduled_date)
);

-- ============================================
-- TELEMEDICINE CHAT MESSAGES
-- ============================================
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

-- ============================================
-- SMTP SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS smtp_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host VARCHAR(255) NOT NULL,
  port INT DEFAULT 587,
  username VARCHAR(255),
  password VARCHAR(255),
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  use_tls BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
