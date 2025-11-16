-- SQL Schema for Appointments, Patients, and Medicines tables

-- 1. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(50) NOT NULL,
  selected_doctor VARCHAR(150) NOT NULL,
  message TEXT,
  reports_uploaded BOOLEAN DEFAULT 0,
  status ENUM('pending', 'rescheduled', 'cancelled', 'done') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  last_appointment_date DATE,
  last_appointment_time VARCHAR(50),
  doctor_assigned VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_patient (email, phone)
);

-- 3. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medicine_name VARCHAR(150) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  instructions TEXT,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 4. SMTP Settings Table
CREATE TABLE IF NOT EXISTS smtp_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INT DEFAULT 587,
  smtp_user VARCHAR(255) NOT NULL,
  smtp_pass VARCHAR(255) NOT NULL,
  smtp_secure VARCHAR(10) DEFAULT 'false',
  smtp_from VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Lab Catalogue Table
CREATE TABLE IF NOT EXISTS lab_catalogue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  sample_type VARCHAR(100),
  preparation_instructions TEXT,
  turnaround_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Labs Test Table (Prescribed Lab Tests)
CREATE TABLE IF NOT EXISTS labs_test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  lab_catalogue_id INT,
  test_name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  sample_type VARCHAR(100),
  preparation_instructions TEXT,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (lab_catalogue_id) REFERENCES lab_catalogue(id) ON DELETE SET NULL
);

-- 7. Procedure Catalogue Table
CREATE TABLE IF NOT EXISTS procedure_catalogue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  duration VARCHAR(50),
  preparation_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Procedures Table (Prescribed Procedures)
CREATE TABLE IF NOT EXISTS procedures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  procedure_catalogue_id INT,
  procedure_name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  preparation_instructions TEXT,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (procedure_catalogue_id) REFERENCES procedure_catalogue(id) ON DELETE SET NULL
);

-- 9. Medicines Catalog Table
CREATE TABLE IF NOT EXISTS medicines_catalog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  form VARCHAR(100),
  strength VARCHAR(100),
  default_frequency VARCHAR(100),
  duration VARCHAR(100),
  route VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- 10. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Note: MySQL doesn't support IF NOT EXISTS in ALTER TABLE, so we'll handle errors gracefully
-- These statements may show warnings if columns/indexes already exist - that's OK

-- Add turnaround_time column to labs_test if missing  
ALTER TABLE labs_test 
  ADD COLUMN turnaround_time VARCHAR(50) DEFAULT NULL;
