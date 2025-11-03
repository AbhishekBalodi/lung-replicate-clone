
## SQL
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(40),
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(16) NOT NULL,
  selected_doctor VARCHAR(120) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  form VARCHAR(50),
  strength VARCHAR(50),
  default_frequency VARCHAR(100),
  duration VARCHAR(50),
  route VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
