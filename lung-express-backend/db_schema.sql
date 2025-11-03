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
