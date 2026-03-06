-- ============================================================
-- SQL Migration: Add password_hash to patients, ensure hospital_staff table
-- Run this on EXISTING tenant databases
-- ============================================================

-- 1. Add password_hash to patients table (if not exists)
SET @db = DATABASE();

-- Check and add password_hash column to patients
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'password_hash';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE patients ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Create hospital_staff table (if not exists)
CREATE TABLE IF NOT EXISTS hospital_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100) DEFAULT 'staff',
  department VARCHAR(100),
  designation VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  platform_user_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Ensure password_hash column exists on tenant_users in platform DB
-- (Run this on the saas_platform database)
-- ALTER TABLE tenant_users ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL;
-- (This column likely already exists from onboarding)

SELECT 'Migration complete!' AS status;
