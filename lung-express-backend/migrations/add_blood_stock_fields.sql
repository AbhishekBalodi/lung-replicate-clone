-- ============================================
-- MIGRATION: Add missing fields to blood_stock table
-- Run this on existing tenant databases
-- ============================================

-- Add collection_date column
ALTER TABLE blood_stock 
ADD COLUMN IF NOT EXISTS collection_date DATE AFTER batch_number;

-- Add location column
ALTER TABLE blood_stock 
ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Refrigerator 1' AFTER source;

-- Add status column  
ALTER TABLE blood_stock 
ADD COLUMN IF NOT EXISTS status ENUM('available','reserved','expired') DEFAULT 'available' AFTER location;

-- Add donor_id column with foreign key
ALTER TABLE blood_stock 
ADD COLUMN IF NOT EXISTS donor_id INT DEFAULT NULL AFTER status;

-- Add notes column
ALTER TABLE blood_stock 
ADD COLUMN IF NOT EXISTS notes TEXT AFTER donor_id;

-- Add foreign key constraint for donor_id (if blood_donors table exists)
-- Note: Run this separately after ensuring blood_donors table exists
-- ALTER TABLE blood_stock ADD FOREIGN KEY (donor_id) REFERENCES blood_donors(id) ON DELETE SET NULL;

-- Insert default blood groups if not present
INSERT IGNORE INTO blood_groups (group_name, rh_factor, description) VALUES
('A', '+', 'A Positive'),
('A', '-', 'A Negative'),
('B', '+', 'B Positive'),
('B', '-', 'B Negative'),
('AB', '+', 'AB Positive'),
('AB', '-', 'AB Negative'),
('O', '+', 'O Positive'),
('O', '-', 'O Negative');
