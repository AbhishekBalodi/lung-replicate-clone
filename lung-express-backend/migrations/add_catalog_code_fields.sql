-- ============================================================
-- Migration: Add code fields to catalog tables
-- Run this on EXISTING tenant schemas (hospital or doctor)
-- Usage: mysql -u <user> -p <schema_name> < add_catalog_code_fields.sql
-- ============================================================

-- 1. Medicines Catalog: Add medicine_code
ALTER TABLE medicines_catalog ADD COLUMN IF NOT EXISTS medicine_code VARCHAR(100) AFTER name;
ALTER TABLE medicines_catalog ADD UNIQUE INDEX idx_medicine_code (medicine_code);

-- 2. Lab Catalogue: Add test_code
ALTER TABLE lab_catalogue ADD COLUMN IF NOT EXISTS test_code VARCHAR(100) AFTER name;
ALTER TABLE lab_catalogue ADD UNIQUE INDEX idx_test_code (test_code);

-- 3. Procedure Catalogue: Add procedure_code and department
ALTER TABLE procedure_catalogue ADD COLUMN IF NOT EXISTS procedure_code VARCHAR(100) AFTER name;
ALTER TABLE procedure_catalogue ADD COLUMN IF NOT EXISTS department VARCHAR(100) AFTER procedure_code;
ALTER TABLE procedure_catalogue ADD UNIQUE INDEX idx_procedure_code (procedure_code);
