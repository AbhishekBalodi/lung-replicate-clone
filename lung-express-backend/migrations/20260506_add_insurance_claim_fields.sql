-- Migration: add missing insurance claim fields used by admin UI forms
-- Safe to re-run

SET @db_name := DATABASE();

CREATE TABLE IF NOT EXISTS insurance_claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NULL,
  patient_name VARCHAR(255),
  insurance_provider VARCHAR(255),
  policy_number VARCHAR(100),
  claim_number VARCHAR(100) UNIQUE,
  claim_amount DECIMAL(12,2) DEFAULT 0,
  approved_amount DECIMAL(12,2) DEFAULT 0,
  claim_date DATE,
  submitted_date DATE,
  diagnosis TEXT,
  treatment TEXT,
  treatment_type VARCHAR(100),
  documents JSON,
  notes TEXT,
  remarks TEXT,
  status ENUM('pending','submitted','approved','rejected','partial','partially_approved') DEFAULT 'pending',
  rejection_reason TEXT,
  approved_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE table_schema = @db_name AND table_name = 'insurance_claims' AND column_name = 'submitted_date'
    ),
    'SELECT "submitted_date exists"',
    'ALTER TABLE insurance_claims ADD COLUMN submitted_date DATE NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE table_schema = @db_name AND table_name = 'insurance_claims' AND column_name = 'treatment_type'
    ),
    'SELECT "treatment_type exists"',
    'ALTER TABLE insurance_claims ADD COLUMN treatment_type VARCHAR(100) NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE table_schema = @db_name AND table_name = 'insurance_claims' AND column_name = 'remarks'
    ),
    'SELECT "remarks exists"',
    'ALTER TABLE insurance_claims ADD COLUMN remarks TEXT NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
