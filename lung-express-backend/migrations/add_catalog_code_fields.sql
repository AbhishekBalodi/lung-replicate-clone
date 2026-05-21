-- Idempotent migration: add catalog code fields and unique indexes

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'medicines_catalog'
      AND COLUMN_NAME = 'medicine_code'
    ),
    'SELECT "medicine_code exists";',
    'ALTER TABLE medicines_catalog ADD COLUMN medicine_code VARCHAR(100);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lab_catalogue'
      AND COLUMN_NAME = 'test_code'
    ),
    'SELECT "test_code exists";',
    'ALTER TABLE lab_catalogue ADD COLUMN test_code VARCHAR(100);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'procedure_catalogue'
      AND COLUMN_NAME = 'procedure_code'
    ),
    'SELECT "procedure_code exists";',
    'ALTER TABLE procedure_catalogue ADD COLUMN procedure_code VARCHAR(100);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'procedure_catalogue'
      AND COLUMN_NAME = 'department'
    ),
    'SELECT "department exists";',
    'ALTER TABLE procedure_catalogue ADD COLUMN department VARCHAR(100);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'medicines_catalog'
      AND INDEX_NAME = 'idx_medicine_code'
    ),
    'SELECT "idx_medicine_code exists";',
    'CREATE UNIQUE INDEX idx_medicine_code ON medicines_catalog(medicine_code);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lab_catalogue'
      AND INDEX_NAME = 'idx_test_code'
    ),
    'SELECT "idx_test_code exists";',
    'CREATE UNIQUE INDEX idx_test_code ON lab_catalogue(test_code);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'procedure_catalogue'
      AND INDEX_NAME = 'idx_procedure_code'
    ),
    'SELECT "idx_procedure_code exists";',
    'CREATE UNIQUE INDEX idx_procedure_code ON procedure_catalogue(procedure_code);'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
