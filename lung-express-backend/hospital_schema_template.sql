-- ============================================
-- HOSPITAL SCHEMA TEMPLATE
-- ============================================
-- This template is used for hospital tenants (multi-doctor facilities)
-- Uses doctor_id INT for doctor reference (supports multiple doctors)
-- Replace {{TENANT_CODE}} with the actual tenant code

-- Create the tenant database
CREATE DATABASE IF NOT EXISTS {{TENANT_CODE}};
USE {{TENANT_CODE}};

-- ============================================
-- LOCAL DOCTORS TABLE (synced from platform)
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform_doctor_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  specialization VARCHAR(100),
  qualifications TEXT,
  bio TEXT,
  consultation_fee DECIMAL(10, 2),
  -- New metadata fields for tenant-managed doctor profiles
  profile_photo_url VARCHAR(500) DEFAULT NULL,
  hero_image_url VARCHAR(500) DEFAULT NULL,
  years_experience INT DEFAULT NULL,
  degrees JSON DEFAULT NULL,
  awards JSON DEFAULT NULL,
  age INT DEFAULT NULL,
  gender ENUM('male','female','other') DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_platform_doctor (platform_doctor_id),
  INDEX idx_doctors_name (name)
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  message TEXT,
  status ENUM('pending', 'confirmed', 'rescheduled', 'cancelled', 'done') DEFAULT 'pending',
  reports_uploaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  INDEX idx_appointments_date (appointment_date),
  INDEX idx_appointments_status (status),
  INDEX idx_appointments_email (email),
  INDEX idx_appointments_doctor (doctor_id)
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  blood_group VARCHAR(5),
  emergency_contact VARCHAR(20),
  medical_history TEXT,
  allergies TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  first_visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  UNIQUE KEY unique_patient (email, phone),
  INDEX idx_patients_name (full_name),
  INDEX idx_patients_phone (phone),
  INDEX idx_patients_doctor (doctor_id)
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
-- PRESCRIBED MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescribed_medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_id INT,
  doctor_id INT NULL,
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
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  FOREIGN KEY (medicine_id) REFERENCES medicines_catalog(id) ON DELETE SET NULL,
  INDEX idx_prescribed_patient (patient_id),
  INDEX idx_prescribed_date (prescribed_date),
  INDEX idx_prescribed_doctor (doctor_id)
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
  doctor_id INT NULL,
  lab_id INT,
  test_name VARCHAR(255) NOT NULL,
  notes TEXT,
  status ENUM('ordered', 'sample_collected', 'in_progress', 'completed') DEFAULT 'ordered',
  result TEXT,
  turnaround_time VARCHAR(50),
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  FOREIGN KEY (lab_id) REFERENCES lab_catalogue(id) ON DELETE SET NULL,
  INDEX idx_labs_patient (patient_id),
  INDEX idx_labs_status (status),
  INDEX idx_labs_doctor (doctor_id)
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
  doctor_id INT NULL,
  procedure_id INT,
  procedure_name VARCHAR(255) NOT NULL,
  notes TEXT,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  scheduled_date TIMESTAMP NULL,
  completed_date TIMESTAMP NULL,
  prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  FOREIGN KEY (procedure_id) REFERENCES procedure_catalogue(id) ON DELETE SET NULL,
  INDEX idx_procedures_patient (patient_id),
  INDEX idx_procedures_status (status),
  INDEX idx_procedures_doctor (doctor_id)
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

-- ============================================
-- ADDITIONAL HOSPITAL FEATURE TABLES
-- (Blood Bank, Ambulances, Rooms, Pharmacy, Reviews)
-- ============================================

CREATE TABLE IF NOT EXISTS blood_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(10) NOT NULL,
  rh_factor ENUM('+','-') DEFAULT '+',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blood_group_id INT NOT NULL,
  units DECIMAL(10,2) DEFAULT 0,
  unit_type VARCHAR(20) DEFAULT 'ml',
  batch_number VARCHAR(100),
  expiry_date DATE,
  source ENUM('donation','purchase','other') DEFAULT 'donation',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  dob DATE,
  gender ENUM('male','female','other') DEFAULT 'male',
  blood_group_id INT,
  last_donation_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ambulances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(50) NOT NULL,
  model VARCHAR(255),
  driver_name VARCHAR(255),
  driver_contact VARCHAR(20),
  status ENUM('available','on-trip','maintenance','offline') DEFAULT 'available',
  current_location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL,
  room_type_id INT,
  bed_count INT DEFAULT 1,
  status ENUM('vacant','occupied','maintenance') DEFAULT 'vacant',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS room_allotments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  patient_user_id INT,
  patient_name VARCHAR(255),
  doctor_id INT,
  from_date DATETIME NOT NULL,
  to_date DATETIME,
  status ENUM('active','completed','cancelled') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pharmacy_medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  sku VARCHAR(100),
  unit_type VARCHAR(50) DEFAULT 'tablet',
  unit_price DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  batch_number VARCHAR(100),
  expiry_date DATE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES pharmacy_medicines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_type ENUM('doctor','hospital','service') NOT NULL,
  resource_id INT NOT NULL,
  patient_user_id INT,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Pending Tasks (tenant-level)
-- ============================================
CREATE TABLE IF NOT EXISTS pending_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME,
  priority ENUM('low','medium','high') DEFAULT 'medium',
  status ENUM('pending','done','cancelled') DEFAULT 'pending',
  assigned_to_user_id INT,
  created_by_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- BILLING TABLES (Invoices, Invoice Items, Payments)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  patient_id INT NULL,
  patient_name VARCHAR(255),
  patient_email VARCHAR(255),
  patient_phone VARCHAR(20),
  created_by_user_id INT,
  status ENUM('draft','unpaid','paid','cancelled') DEFAULT 'draft',
  sub_total DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  issued_date DATE DEFAULT NULL,
  due_date DATE NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(512) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  line_total DECIMAL(12,2) DEFAULT 0,
  service_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method_id INT,
  transaction_reference VARCHAR(255),
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed common payment methods if missing
INSERT INTO payment_methods (name, code)
SELECT 'Cash', 'cash' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE code = 'cash');
INSERT INTO payment_methods (name, code)
SELECT 'Card', 'card' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE code = 'card');
INSERT INTO payment_methods (name, code)
SELECT 'UPI', 'upi' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE code = 'upi');

-- Seed common blood groups if missing
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'A','+' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'A' AND rh_factor = '+');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'A','-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'A' AND rh_factor = '-');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'B','+' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'B' AND rh_factor = '+');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'B','-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'B' AND rh_factor = '-');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'AB','+' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'AB' AND rh_factor = '+');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'AB','-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'AB' AND rh_factor = '-');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'O','+' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'O' AND rh_factor = '+');
INSERT INTO blood_groups (group_name, rh_factor)
SELECT 'O','-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM blood_groups WHERE group_name = 'O' AND rh_factor = '-');

