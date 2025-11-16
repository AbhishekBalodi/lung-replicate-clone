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
