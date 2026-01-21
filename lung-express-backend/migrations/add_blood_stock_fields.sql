-- ============================================
-- MIGRATION: Add missing fields to blood_stock table
-- Run this on existing tenant databases
-- Compatible with MySQL 5.7+ and 8.x
-- ============================================

-- collection_date
SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'blood_stock'
        AND column_name = 'collection_date'
    ),
    'SELECT "collection_date already exists";',
    'ALTER TABLE blood_stock ADD COLUMN collection_date DATE AFTER batch_number;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- location
SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'blood_stock'
        AND column_name = 'location'
    ),
    'SELECT "location already exists";',
    'ALTER TABLE blood_stock ADD COLUMN location VARCHAR(100) DEFAULT ''Refrigerator 1'' AFTER source;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- status
SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'blood_stock'
        AND column_name = 'status'
    ),
    'SELECT "status already exists";',
    'ALTER TABLE blood_stock ADD COLUMN status ENUM(''available'',''reserved'',''expired'') DEFAULT ''available'' AFTER location;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- donor_id
SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'blood_stock'
        AND column_name = 'donor_id'
    ),
    'SELECT "donor_id already exists";',
    'ALTER TABLE blood_stock ADD COLUMN donor_id INT DEFAULT NULL AFTER status;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- notes
SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'blood_stock'
        AND column_name = 'notes'
    ),
    'SELECT "notes already exists";',
    'ALTER TABLE blood_stock ADD COLUMN notes TEXT AFTER donor_id;'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Insert default blood groups
INSERT IGNORE INTO blood_groups (group_name, rh_factor, description) VALUES
('A', '+', 'A Positive'),
('A', '-', 'A Negative'),
('B', '+', 'B Positive'),
('B', '-', 'B Negative'),
('AB', '+', 'AB Positive'),
('AB', '-', 'AB Negative'),
('O', '+', 'O Positive'),
('O', '-', 'O Negative');
