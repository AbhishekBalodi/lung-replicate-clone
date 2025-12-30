-- ============================================
-- SAAS PLATFORM SCHEMA (Main Database)
-- ============================================
-- This schema manages all tenants, subscriptions, domains, and platform users
-- Each tenant gets their own separate database schema

-- Create the platform database
CREATE DATABASE IF NOT EXISTS saas_platform;
USE saas_platform;

-- ============================================
-- TENANTS TABLE
-- ============================================
-- Stores all registered hospitals and individual doctors
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_code VARCHAR(50) NOT NULL UNIQUE,  -- Unique identifier for schema naming (e.g., 'hospital_abc', 'dr_john')
  name VARCHAR(255) NOT NULL,               -- Display name (e.g., "City Hospital", "Dr. John Smith")
  type ENUM('hospital', 'doctor') NOT NULL, -- Type of tenant
  email VARCHAR(255) NOT NULL,              -- Primary contact email
  phone VARCHAR(20),                        -- Contact phone
  address TEXT,                             -- Physical address
  logo_url VARCHAR(500),                    -- Logo image URL
  status ENUM('pending', 'active', 'suspended', 'cancelled') DEFAULT 'pending',
  subscription_plan ENUM('free', 'basic', 'professional', 'enterprise') DEFAULT 'free',
  subscription_start DATE,
  subscription_end DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TENANT DOMAINS TABLE
-- ============================================
-- Each tenant can have one or more custom domains
CREATE TABLE IF NOT EXISTS tenant_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,      -- e.g., 'www.drmaan.com', 'cityhospital.com'
  is_primary BOOLEAN DEFAULT FALSE,          -- Primary domain for this tenant
  ssl_status ENUM('pending', 'issued', 'failed') DEFAULT 'pending',
  verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  verification_token VARCHAR(100),           -- DNS TXT record value for verification
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ============================================
-- PLATFORM ADMINS TABLE
-- ============================================
-- Super admins who manage the entire SaaS platform
CREATE TABLE IF NOT EXISTS platform_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'support', 'billing') DEFAULT 'support',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TENANT USERS TABLE
-- ============================================
-- Users within each tenant (Super Admin for hospitals, Admin for doctors, Patients)
CREATE TABLE IF NOT EXISTS tenant_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),                -- NULL for patients (they use phone)
  phone VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'patient') NOT NULL,
  -- super_admin: Hospital owner/manager
  -- admin: Individual doctor or doctor within hospital
  -- patient: Patient of a doctor
  doctor_id INT NULL,                        -- For hospital tenants: which doctor this user belongs to (NULL for super_admin)
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_email (tenant_id, email)
);

-- ============================================
-- HOSPITAL DOCTORS TABLE
-- ============================================
-- For hospital tenants: list of doctors under the hospital
CREATE TABLE IF NOT EXISTS hospital_doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,                    -- Hospital tenant ID
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  specialization VARCHAR(255),
  qualifications TEXT,
  bio TEXT,
  photo_url VARCHAR(500),
  consultation_fee DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ============================================
-- TENANT SETTINGS TABLE
-- ============================================
-- Configuration settings for each tenant (branding, features, etc.)
CREATE TABLE IF NOT EXISTS tenant_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL UNIQUE,
  -- Branding
  primary_color VARCHAR(7) DEFAULT '#0066CC',
  secondary_color VARCHAR(7) DEFAULT '#004499',
  font_family VARCHAR(100) DEFAULT 'Manrope',
  -- Business Hours
  working_days VARCHAR(50) DEFAULT 'Mon-Sat',
  morning_start TIME DEFAULT '10:00:00',
  morning_end TIME DEFAULT '14:00:00',
  evening_start TIME DEFAULT '17:00:00',
  evening_end TIME DEFAULT '20:00:00',
  slot_duration INT DEFAULT 15,              -- In minutes
  -- Contact Info
  clinic_address TEXT,
  clinic_phone VARCHAR(20),
  clinic_email VARCHAR(255),
  google_maps_url VARCHAR(500),
  -- SMTP Settings
  smtp_host VARCHAR(255),
  smtp_port INT DEFAULT 587,
  smtp_user VARCHAR(255),
  smtp_password VARCHAR(255),
  smtp_from_email VARCHAR(255),
  smtp_from_name VARCHAR(255),
  -- Features Toggle
  enable_online_booking BOOLEAN DEFAULT TRUE,
  enable_patient_portal BOOLEAN DEFAULT TRUE,
  enable_sms_notifications BOOLEAN DEFAULT FALSE,
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ============================================
-- SUBSCRIPTION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  plan ENUM('free', 'basic', 'professional', 'enterprise') NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT,
  user_id INT,
  user_type ENUM('platform_admin', 'tenant_user'),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NEW FEATURE TABLES (Blood Bank / Ambulance / Rooms / Pharmacy / Reviews)
-- ============================================

-- Blood Groups (reference list per tenant)
CREATE TABLE IF NOT EXISTS blood_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  group_name VARCHAR(10) NOT NULL,           -- e.g., A, B, AB, O
  rh_factor ENUM('+','-') DEFAULT '+',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_bloodgroup (tenant_id, group_name, rh_factor)
);

-- Blood Stock (actual inventory)
CREATE TABLE IF NOT EXISTS blood_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  blood_group_id INT NOT NULL,
  units DECIMAL(10,2) DEFAULT 0,             -- units in ml or as configured
  unit_type VARCHAR(20) DEFAULT 'ml',
  batch_number VARCHAR(100),
  expiry_date DATE,
  source ENUM('donation', 'purchase', 'other') DEFAULT 'donation',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE CASCADE
);

-- Blood Donors
CREATE TABLE IF NOT EXISTS blood_donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  dob DATE,
  gender ENUM('male','female','other') DEFAULT 'male',
  blood_group_id INT,
  last_donation_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE SET NULL
);

-- Ambulances
CREATE TABLE IF NOT EXISTS ambulances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  model VARCHAR(255),
  driver_name VARCHAR(255),
  driver_contact VARCHAR(20),
  status ENUM('available','on-trip','maintenance','offline') DEFAULT 'available',
  current_location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vehicle_per_tenant (tenant_id, vehicle_number)
);

-- Room Types & Rooms
CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,                 -- e.g., ICU, Private, General
  description TEXT,
  price_per_day DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_roomtype_per_tenant (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type_id INT,
  bed_count INT DEFAULT 1,
  status ENUM('vacant','occupied','maintenance') DEFAULT 'vacant',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL,
  UNIQUE KEY unique_roomnumber_per_tenant (tenant_id, room_number)
);

-- Room Allotments
CREATE TABLE IF NOT EXISTS room_allotments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_id INT NOT NULL,
  patient_user_id INT,                         -- optional reference to a tenant_users entry (if patient registered)
  patient_name VARCHAR(255),
  doctor_id INT,                               -- hospital_doctors.id
  from_date DATETIME NOT NULL,
  to_date DATETIME,
  status ENUM('active','completed','cancelled') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
  FOREIGN KEY (doctor_id) REFERENCES hospital_doctors(id) ON DELETE SET NULL
);

-- Pharmacy: medicines and inventory
CREATE TABLE IF NOT EXISTS pharmacy_medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  sku VARCHAR(100),
  unit_type VARCHAR(50) DEFAULT 'tablet',
  unit_price DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_medicine_per_tenant (tenant_id, name, brand)
);

CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  batch_number VARCHAR(100),
  expiry_date DATE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES pharmacy_medicines(id) ON DELETE CASCADE
);

-- Reviews (doctors, hospital services etc.)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  resource_type ENUM('doctor','hospital','service') NOT NULL,
  resource_id INT NOT NULL,
  patient_user_id INT,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL
);

-- Blood Issued records
CREATE TABLE IF NOT EXISTS blood_issued (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  blood_group_id INT,
  blood_stock_id INT,
  units DECIMAL(10,2) DEFAULT 0,
  unit_type VARCHAR(20) DEFAULT 'ml',
  issued_to_name VARCHAR(255),
  issued_to_contact VARCHAR(100),
  issued_by_user_id INT,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE SET NULL,
  FOREIGN KEY (blood_stock_id) REFERENCES blood_stock(id) ON DELETE SET NULL
);

-- Feedback (patient messages)
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  patient_user_id INT,
  subject VARCHAR(255),
  message TEXT,
  status ENUM('new','resolved') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_tenant_domains_domain ON tenant_domains(domain);
CREATE INDEX idx_tenant_users_email ON tenant_users(email);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);
CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================
-- INSERT DEFAULT PLATFORM ADMIN
-- ============================================
-- Password: admin123 (should be changed immediately)
INSERT INTO platform_admins (email, password_hash, name, role) 
VALUES ('admin@saasplatform.com', '$2b$10$placeholder_hash_change_me', 'Platform Admin', 'super_admin')
ON DUPLICATE KEY UPDATE email = email;
