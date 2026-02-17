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
  age INT DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
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
  patient_uid VARCHAR(20) DEFAULT NULL,
  doctor_id INT NULL,
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
  first_visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  UNIQUE KEY unique_patient (email, phone),
  UNIQUE KEY unique_patient_uid (patient_uid),
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
  collection_date DATE,
  expiry_date DATE,
  source ENUM('donation','purchase','other') DEFAULT 'donation',
  location VARCHAR(100) DEFAULT 'Refrigerator 1',
  status ENUM('available','reserved','expired') DEFAULT 'available',
  donor_id INT DEFAULT NULL,
  notes TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (donor_id) REFERENCES blood_donors(id) ON DELETE SET NULL
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


-- ============================================
-- AMBULANCE CALLS
-- ============================================
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

-- ============================================
-- EMR - DIAGNOSIS NOTES
-- ============================================
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

-- ============================================
-- EMR - TREATMENT PLANS
-- ============================================
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

-- ============================================
-- EMR - PROGRESS NOTES
-- ============================================
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

-- ============================================
-- EMR - MEDICAL DOCUMENTS
-- ============================================
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

-- ============================================
-- FOLLOW-UPS
-- ============================================
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

-- ============================================
-- CARE PLANS
-- ============================================
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

-- ============================================
-- AUDIT LOGS
-- ============================================
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

-- ============================================
-- DATA ACCESS LOGS
-- ============================================
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

-- ============================================
-- SYSTEM ALERTS
-- ============================================
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

-- ============================================
-- NOTIFICATION SETTINGS
-- ============================================
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

-- ============================================
-- HOSPITAL PROFILE
-- ============================================
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

-- ============================================
-- DEPARTMENTS
-- ============================================
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

-- ============================================
-- HOSPITAL FACILITIES
-- ============================================
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

-- ============================================
-- HOSPITAL EQUIPMENT
-- ============================================
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

-- ============================================
-- INSURANCE CLAIMS
-- ============================================
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

-- ============================================
-- ACCESS CONTROL
-- ============================================
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

-- ============================================
-- STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(100),
  department_id INT,
  status ENUM('active','inactive','on_leave') DEFAULT 'active',
  join_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- SEED DEFAULT DATA
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
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
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
-- DOCTOR SCHEDULE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT,
  day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INT DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  INDEX idx_schedule_doctor (doctor_id),
  INDEX idx_schedule_day (day)
);

-- ============================================
-- LEAVE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  INDEX idx_leave_doctor (doctor_id),
  INDEX idx_leave_status (status)
);

-- ============================================
-- SCHEDULE SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT UNIQUE,
  default_slot_duration INT DEFAULT 15,
  buffer_time INT DEFAULT 5,
  booking_window_days INT DEFAULT 30,
  cancellation_hours INT DEFAULT 24,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT,
  patient_id INT,
  type ENUM('report', 'follow-up', 'emergency', 'lab', 'general') DEFAULT 'general',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
  status ENUM('pending', 'completed') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  INDEX idx_tasks_doctor (doctor_id),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_priority (priority)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Seed notification settings
INSERT IGNORE INTO notification_settings (category, setting_key, setting_name, enabled, email_enabled, sms_enabled) VALUES
('appointments', 'new_appointment', 'New Appointment', TRUE, TRUE, TRUE),
('appointments', 'appointment_reminder', 'Appointment Reminder', TRUE, TRUE, TRUE),
('appointments', 'appointment_cancelled', 'Appointment Cancelled', TRUE, TRUE, FALSE),
('billing', 'invoice_created', 'Invoice Created', TRUE, TRUE, FALSE),
('billing', 'payment_received', 'Payment Received', TRUE, TRUE, FALSE),
('lab', 'results_ready', 'Lab Results Ready', TRUE, TRUE, TRUE),
('system', 'system_alerts', 'System Alerts', TRUE, TRUE, FALSE);

-- Seed default access roles
INSERT IGNORE INTO access_roles (name, description) VALUES
('super_admin', 'Full system access'),
('admin', 'Doctor/Admin access'),
('staff', 'Staff access'),
('patient', 'Patient access');

-- Seed default schedule for doctors
INSERT IGNORE INTO doctor_schedule (doctor_id, day, start_time, end_time, slot_duration, is_active) VALUES
(1, 'Monday', '09:00:00', '13:00:00', 15, TRUE),
(1, 'Monday', '17:00:00', '20:00:00', 15, TRUE),
(1, 'Tuesday', '09:00:00', '13:00:00', 15, TRUE),
(1, 'Wednesday', '09:00:00', '13:00:00', 15, TRUE),
(1, 'Thursday', '09:00:00', '13:00:00', 15, TRUE),
(1, 'Friday', '09:00:00', '13:00:00', 15, TRUE),
(1, 'Saturday', '10:00:00', '14:00:00', 20, TRUE);
