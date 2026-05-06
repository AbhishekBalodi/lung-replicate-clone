ALTER TABLE medicines_catalog 
ADD COLUMN medicine_code VARCHAR(100);

ALTER TABLE lab_catalogue 
ADD COLUMN test_code VARCHAR(100);

ALTER TABLE procedure_catalogue 
ADD COLUMN procedure_code VARCHAR(100);

ALTER TABLE procedure_catalogue 
ADD COLUMN department VARCHAR(100); 


CREATE UNIQUE INDEX idx_medicine_code ON medicines_catalog(medicine_code);
CREATE UNIQUE INDEX idx_test_code ON lab_catalogue(test_code);
CREATE UNIQUE INDEX idx_procedure_code ON procedure_catalogue(procedure_code);