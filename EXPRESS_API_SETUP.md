# Express.js API Setup Guide

This project requires an Express.js backend to handle contact form submissions and appointment bookings.

## Required API Endpoints

Your Express.js server needs to implement these two endpoints:

### 1. Contact Form Endpoint
**POST** `/api/contact`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string (optional)",
  "subject": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### 2. Appointment Booking Endpoint
**POST** `/api/appointment`

**Request Body:**
```json
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:MM",
  "selected_doctor": "string",
  "message": "string",
  "reports_uploaded": boolean
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully"
}
```

## Environment Configuration

### For Local Development:
1. Create a `.env` file in the project root (already exists)
2. Set your local Express.js API URL:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### For Production:
Update the `.env` file with your production API URL:
```env
VITE_API_BASE_URL=https://your-production-api.com
```

## MySQL Database Tables

Make sure your MySQL database has these tables:

### `contacts` table:
```sql
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `appointments` table:
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  selected_doctor VARCHAR(200) NOT NULL,
  reports_uploaded TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Running the Project

1. **Start your Express.js server** (with MySQL connected)
2. **Update `.env`** with your API URL
3. **Run the frontend:**
```bash
npm install
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

The `dist` folder will contain the production build ready for deployment.

## CORS Configuration

Make sure your Express.js server has CORS enabled to allow requests from your frontend:

```javascript
const cors = require('cors');
app.use(cors({
  origin: '*', // Or specify your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

## Example Express.js Route

```javascript
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
});

// Contact form endpoint
router.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    await pool.execute(
      'INSERT INTO contacts (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, phone || '', subject, message]
    );
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Appointment booking endpoint
router.post('/api/appointment', async (req, res) => {
  try {
    const {
      full_name, email, phone, appointment_date,
      appointment_time, selected_doctor, message, reports_uploaded
    } = req.body;
    
    await pool.execute(
      'INSERT INTO appointments (full_name, email, phone, message, appointment_date, appointment_time, selected_doctor, reports_uploaded, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [full_name, email, phone, message || '', appointment_date, appointment_time, selected_doctor, reports_uploaded ? 1 : 0]
    );
    
    res.json({ success: true, message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to book appointment' });
  }
});

module.exports = router;
```
