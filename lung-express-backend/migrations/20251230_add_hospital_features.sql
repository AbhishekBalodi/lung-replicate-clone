-- Migration: add hospital features (blood bank, ambulances, rooms, pharmacy, reviews)
-- Run in platform DB to add platform-level tables used by admin UI

CREATE TABLE IF NOT EXISTS blood_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  group_name VARCHAR(10) NOT NULL,
  rh_factor ENUM('+','-') DEFAULT '+',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_bloodgroup (tenant_id, group_name, rh_factor)
);

CREATE TABLE IF NOT EXISTS blood_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  blood_group_id INT NOT NULL,
  units DECIMAL(10,2) DEFAULT 0,
  unit_type VARCHAR(20) DEFAULT 'ml',
  batch_number VARCHAR(100),
  expiry_date DATE,
  source ENUM('donation','purchase','other') DEFAULT 'donation',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
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

CREATE TABLE IF NOT EXISTS room_allotments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  room_id INT NOT NULL,
  patient_user_id INT,
  patient_name VARCHAR(255),
  doctor_id INT,
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

-- Blood Issued records (when units are issued to patients)
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

-- Feedback (messages from patients / staff)
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
