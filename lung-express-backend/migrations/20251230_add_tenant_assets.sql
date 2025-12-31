-- Migration: add tenant asset and doctor metadata support
-- This version uses conditional checks (information_schema) to work on older MySQL servers
-- Alter platform tables (tenants, hospital_doctors) to store photo URLs and doctor metadata

-- Helper: run conditional ALTER for each column (safe across MySQL versions)

-- tenants table columns
SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_photo_url';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_photo_url VARCHAR(500) DEFAULT NULL', 'SELECT "skip doctor_photo_url"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_bio';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_bio TEXT DEFAULT NULL', 'SELECT "skip doctor_bio"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_specialty';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_specialty VARCHAR(255) DEFAULT NULL', 'SELECT "skip doctor_specialty"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_degrees';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_degrees JSON DEFAULT NULL', 'SELECT "skip doctor_degrees"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_awards';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_awards JSON DEFAULT NULL', 'SELECT "skip doctor_awards"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_years_experience';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_years_experience INT DEFAULT NULL', 'SELECT "skip doctor_years_experience"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_age';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.tenants ADD COLUMN doctor_age INT DEFAULT NULL', 'SELECT "skip doctor_age"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'doctor_gender';
SET @sql = IF(@cnt = 0, "ALTER TABLE saas_platform.tenants ADD COLUMN doctor_gender ENUM('male','female','other') DEFAULT NULL", 'SELECT "skip doctor_gender"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- hospital_doctors table columns
SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'years_experience';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.hospital_doctors ADD COLUMN years_experience INT DEFAULT NULL', 'SELECT "skip years_experience"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'degrees';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.hospital_doctors ADD COLUMN degrees JSON DEFAULT NULL', 'SELECT "skip degrees"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'awards';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.hospital_doctors ADD COLUMN awards JSON DEFAULT NULL', 'SELECT "skip awards"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'age';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.hospital_doctors ADD COLUMN age INT DEFAULT NULL', 'SELECT "skip age"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'gender';
SET @sql = IF(@cnt = 0, "ALTER TABLE saas_platform.hospital_doctors ADD COLUMN gender ENUM('male','female','other') DEFAULT NULL", 'SELECT "skip gender"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'profile_photo_url';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.hospital_doctors ADD COLUMN profile_photo_url VARCHAR(500) DEFAULT NULL', 'SELECT "skip profile_photo_url"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'saas_platform' AND TABLE_NAME = 'hospital_doctors' AND COLUMN_NAME = 'hero_image_url';
SET @sql = IF(@cnt = 0, 'ALTER TABLE saas_platform.hospital_doctors ADD COLUMN hero_image_url VARCHAR(500) DEFAULT NULL', 'SELECT "skip hero_image_url"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Note: For tenant-specific (per-tenant) "doctors" table inside tenant schemas, we update the template (hospital_schema_template.sql)
-- and for already-created tenant databases, a DBA migration should be applied per schema (not automated here).