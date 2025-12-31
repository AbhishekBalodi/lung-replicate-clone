
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

---

# Tenant assets migration

Run the migration file `lung-express-backend/migrations/20251230_add_tenant_assets.sql` against your platform DB (saas_platform) to add columns for tenant doctor assets and metadata.

Example:

mysql -u root -p saas_platform < lung-express-backend/migrations/20251230_add_tenant_assets.sql

Note: The registration endpoint `/api/tenants/register` now accepts optional doctor/hospital metadata and image data URLs (base64 data URIs) as part of the JSON body to allow uploading assets during onboarding. Supported optional fields (examples):

- `doctorPhotoBase64` (data URL string)
- `logoBase64` (data URL string)
- `heroBase64` (data URL string)
- `doctorBio`, `doctorSpecialty`, `doctorDegrees`, `doctorAwards`, `doctorYearsExperience`, `doctorAge`, `doctorGender`

Image size should ideally be < 5 MB; large images may be rejected or truncated. For production, prefer uploading via tenant dashboard to S3/CDN.

---

# Installing backend dependencies

Before running the backend, install Node dependencies in the `lung-express-backend` folder:

cd lung-express-backend
npm install

Note: `sharp` is used for image processing. On some Windows environments it may require additional build tools or prebuilt binaries; if install fails, try installing the optional prerequisites (platform build tools) or use the prebuilt sharp binaries per https://sharp.pixelplumbing.com/install.

