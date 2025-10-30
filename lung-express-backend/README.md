# Lung Express Backend (for `lung-replicate-clone`)

This is a minimal Express + MySQL API wired for your existing database **Doctor_Mann** with tables **contact** and **appointment**.

## Quickstart
1. Extract this ZIP into a folder named `server/` next to your React/Vite project.
2. Run: `npm install`
3. Copy `.env.example` to `.env` and fill your MySQL username/password (DB already set to `Doctor_Mann`).
4. Start: `npm run dev`
5. In your React app `.env`, set `VITE_API_BASE_URL=http://localhost:5050`
6. Test endpoints:
   - `GET http://localhost:5050/api/ping`
   - `POST http://localhost:5050/api/contact`
   - `POST http://localhost:5050/api/appointment`

## Endpoints

### POST /api/contact
Body:
```json
{ "name": "string", "email": "string", "subject": "string", "message": "string" }
```
Inserts into table `contact` (column names configurable in `src/routes/contact.js`).

### POST /api/appointment
Body:
```json
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:mm",
  "selected_doctor": "string",
  "message": "string",
  "reports_uploaded": true
}
```
Inserts into table `appointment` (column names configurable in `src/routes/appointment.js`).

## Notes
- If your actual column names differ, update the `COLUMN` object at the top of each route file.
- CORS allows `http://localhost:5173` by default. Add more origins via `CORS_ORIGIN` (comma-separated).



## Email (no Supabase)
This backend sends emails directly using SMTP via Nodemailer.
1. Fill SMTP_* and MAIL_FROM in `.env` (use your domain SMTP or a service like Resend/Mailgun's SMTP).
2. Set `DOCTORS_EMAIL` to receive doctor notifications.
3. Emails are sent to the user and to the doctor after a successful DB insert.
