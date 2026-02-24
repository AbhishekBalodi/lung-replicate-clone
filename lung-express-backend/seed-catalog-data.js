#!/usr/bin/env node
/**
 * ============================================================
 *  Catalog Data Seeder
 * ============================================================
 *  Seeds medicines, procedures, and lab tests into a tenant schema.
 *
 *  USAGE:
 *    node seed-catalog-data.js <SCHEMA_NAME>
 *
 *  EXAMPLE:
 *    node seed-catalog-data.js hosp_raj_dulai_hospital
 * ============================================================
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const SCHEMA = process.argv[2];

if (!SCHEMA) {
  console.error('❌ Usage: node seed-catalog-data.js <SCHEMA_NAME>');
  console.error('   Example: node seed-catalog-data.js hosp_raj_dulai_hospital');
  process.exit(1);
}

console.log(`\n🌱 Seeding catalog data into schema: ${SCHEMA}\n`);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: SCHEMA,
  waitForConnections: true,
  connectionLimit: 5,
});

// ─── Helper: check column exists ───
async function columnExists(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [SCHEMA, table, column]
  );
  return rows.length > 0;
}

// ─── Helper: ensure column ───
async function ensureColumn(conn, table, column, def) {
  if (!(await columnExists(conn, table, column))) {
    try { await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`); } catch (e) { /* ignore */ }
  }
}

// ─── Medicines Data (100 records) ───
const medicines = [
  { name: "Paracetamol", medicine_code: "MED001", form: "tablet", strength: "500mg", default_frequency: "Thrice daily", duration: "5 days", route: "Oral" },
  { name: "Amoxicillin", medicine_code: "MED002", form: "capsule", strength: "500mg", default_frequency: "Thrice daily", duration: "7 days", route: "Oral" },
  { name: "Ibuprofen", medicine_code: "MED003", form: "tablet", strength: "400mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Azithromycin", medicine_code: "MED004", form: "tablet", strength: "500mg", default_frequency: "Once daily", duration: "3 days", route: "Oral" },
  { name: "Metformin", medicine_code: "MED005", form: "tablet", strength: "500mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Amlodipine", medicine_code: "MED006", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Losartan", medicine_code: "MED007", form: "tablet", strength: "50mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Atorvastatin", medicine_code: "MED008", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Omeprazole", medicine_code: "MED009", form: "capsule", strength: "20mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Pantoprazole", medicine_code: "MED010", form: "tablet", strength: "40mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Cefixime", medicine_code: "MED011", form: "tablet", strength: "200mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Ciprofloxacin", medicine_code: "MED012", form: "tablet", strength: "500mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Doxycycline", medicine_code: "MED013", form: "capsule", strength: "100mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Levocetirizine", medicine_code: "MED014", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "5 days", route: "Oral" },
  { name: "Cetirizine", medicine_code: "MED015", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "5 days", route: "Oral" },
  { name: "Montelukast", medicine_code: "MED016", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Salbutamol", medicine_code: "MED017", form: "inhaler", strength: "100mcg", default_frequency: "As needed", duration: "30 days", route: "Inhalation" },
  { name: "Budesonide", medicine_code: "MED018", form: "inhaler", strength: "200mcg", default_frequency: "Twice daily", duration: "30 days", route: "Inhalation" },
  { name: "Insulin Glargine", medicine_code: "MED019", form: "injection", strength: "100IU/ml", default_frequency: "Once daily", duration: "30 days", route: "Subcutaneous" },
  { name: "Insulin Regular", medicine_code: "MED020", form: "injection", strength: "100IU/ml", default_frequency: "Twice daily", duration: "30 days", route: "Subcutaneous" },
  { name: "Glimepiride", medicine_code: "MED021", form: "tablet", strength: "2mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Gliclazide", medicine_code: "MED022", form: "tablet", strength: "80mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Sitagliptin", medicine_code: "MED023", form: "tablet", strength: "100mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Linagliptin", medicine_code: "MED024", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Clopidogrel", medicine_code: "MED025", form: "tablet", strength: "75mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Aspirin", medicine_code: "MED026", form: "tablet", strength: "75mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Warfarin", medicine_code: "MED027", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Apixaban", medicine_code: "MED028", form: "tablet", strength: "5mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Rivaroxaban", medicine_code: "MED029", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Furosemide", medicine_code: "MED030", form: "tablet", strength: "40mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Spironolactone", medicine_code: "MED031", form: "tablet", strength: "25mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Hydrochlorothiazide", medicine_code: "MED032", form: "tablet", strength: "25mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Carvedilol", medicine_code: "MED033", form: "tablet", strength: "6.25mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Metoprolol", medicine_code: "MED034", form: "tablet", strength: "50mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Propranolol", medicine_code: "MED035", form: "tablet", strength: "40mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Telmisartan", medicine_code: "MED036", form: "tablet", strength: "40mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Valsartan", medicine_code: "MED037", form: "tablet", strength: "80mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Ramipril", medicine_code: "MED038", form: "capsule", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Enalapril", medicine_code: "MED039", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Lisinopril", medicine_code: "MED040", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Prednisolone", medicine_code: "MED041", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "5 days", route: "Oral" },
  { name: "Dexamethasone", medicine_code: "MED042", form: "tablet", strength: "4mg", default_frequency: "Once daily", duration: "5 days", route: "Oral" },
  { name: "Hydrocortisone", medicine_code: "MED043", form: "cream", strength: "1%", default_frequency: "Twice daily", duration: "7 days", route: "Topical" },
  { name: "Clindamycin", medicine_code: "MED044", form: "capsule", strength: "300mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Linezolid", medicine_code: "MED045", form: "tablet", strength: "600mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Nitrofurantoin", medicine_code: "MED046", form: "capsule", strength: "100mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Fluconazole", medicine_code: "MED047", form: "tablet", strength: "150mg", default_frequency: "Once daily", duration: "3 days", route: "Oral" },
  { name: "Itraconazole", medicine_code: "MED048", form: "capsule", strength: "100mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Albendazole", medicine_code: "MED049", form: "tablet", strength: "400mg", default_frequency: "Single dose", duration: "1 day", route: "Oral" },
  { name: "Ivermectin", medicine_code: "MED050", form: "tablet", strength: "12mg", default_frequency: "Single dose", duration: "1 day", route: "Oral" },
  { name: "Ondansetron", medicine_code: "MED051", form: "tablet", strength: "4mg", default_frequency: "Twice daily", duration: "3 days", route: "Oral" },
  { name: "Domperidone", medicine_code: "MED052", form: "tablet", strength: "10mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Metoclopramide", medicine_code: "MED053", form: "tablet", strength: "10mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Ranitidine", medicine_code: "MED054", form: "tablet", strength: "150mg", default_frequency: "Twice daily", duration: "14 days", route: "Oral" },
  { name: "Famotidine", medicine_code: "MED055", form: "tablet", strength: "20mg", default_frequency: "Twice daily", duration: "14 days", route: "Oral" },
  { name: "Esomeprazole", medicine_code: "MED056", form: "capsule", strength: "40mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Rabeprazole", medicine_code: "MED057", form: "tablet", strength: "20mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Sucralfate", medicine_code: "MED058", form: "syrup", strength: "10ml", default_frequency: "Thrice daily", duration: "7 days", route: "Oral" },
  { name: "Lactulose", medicine_code: "MED059", form: "syrup", strength: "15ml", default_frequency: "Once daily", duration: "7 days", route: "Oral" },
  { name: "Bisacodyl", medicine_code: "MED060", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "3 days", route: "Oral" },
  { name: "Diclofenac", medicine_code: "MED061", form: "tablet", strength: "50mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Naproxen", medicine_code: "MED062", form: "tablet", strength: "250mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Tramadol", medicine_code: "MED063", form: "tablet", strength: "50mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Morphine", medicine_code: "MED064", form: "injection", strength: "10mg/ml", default_frequency: "As prescribed", duration: "5 days", route: "IV" },
  { name: "Codeine", medicine_code: "MED065", form: "tablet", strength: "30mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Sertraline", medicine_code: "MED066", form: "tablet", strength: "50mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Fluoxetine", medicine_code: "MED067", form: "capsule", strength: "20mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Escitalopram", medicine_code: "MED068", form: "tablet", strength: "10mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Alprazolam", medicine_code: "MED069", form: "tablet", strength: "0.5mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Clonazepam", medicine_code: "MED070", form: "tablet", strength: "0.5mg", default_frequency: "Once daily", duration: "14 days", route: "Oral" },
  { name: "Diazepam", medicine_code: "MED071", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "7 days", route: "Oral" },
  { name: "Olanzapine", medicine_code: "MED072", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Risperidone", medicine_code: "MED073", form: "tablet", strength: "2mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Quetiapine", medicine_code: "MED074", form: "tablet", strength: "25mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Haloperidol", medicine_code: "MED075", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Levetiracetam", medicine_code: "MED076", form: "tablet", strength: "500mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Sodium Valproate", medicine_code: "MED077", form: "tablet", strength: "500mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Carbamazepine", medicine_code: "MED078", form: "tablet", strength: "200mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Phenytoin", medicine_code: "MED079", form: "capsule", strength: "100mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Gabapentin", medicine_code: "MED080", form: "capsule", strength: "300mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Pregabalin", medicine_code: "MED081", form: "capsule", strength: "75mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Levothyroxine", medicine_code: "MED082", form: "tablet", strength: "50mcg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Methimazole", medicine_code: "MED083", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Propylthiouracil", medicine_code: "MED084", form: "tablet", strength: "50mg", default_frequency: "Twice daily", duration: "30 days", route: "Oral" },
  { name: "Tamsulosin", medicine_code: "MED085", form: "capsule", strength: "0.4mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Finasteride", medicine_code: "MED086", form: "tablet", strength: "5mg", default_frequency: "Once daily", duration: "30 days", route: "Oral" },
  { name: "Sildenafil", medicine_code: "MED087", form: "tablet", strength: "50mg", default_frequency: "As needed", duration: "30 days", route: "Oral" },
  { name: "Tadalafil", medicine_code: "MED088", form: "tablet", strength: "10mg", default_frequency: "As needed", duration: "30 days", route: "Oral" },
  { name: "Azelastine", medicine_code: "MED089", form: "other", strength: "140mcg", default_frequency: "Twice daily", duration: "30 days", route: "Intranasal" },
  { name: "Fluticasone", medicine_code: "MED090", form: "other", strength: "50mcg", default_frequency: "Once daily", duration: "30 days", route: "Intranasal" },
  { name: "Mometasone", medicine_code: "MED091", form: "cream", strength: "0.10%", default_frequency: "Once daily", duration: "7 days", route: "Topical" },
  { name: "Clotrimazole", medicine_code: "MED092", form: "cream", strength: "1%", default_frequency: "Twice daily", duration: "14 days", route: "Topical" },
  { name: "Miconazole", medicine_code: "MED093", form: "cream", strength: "2%", default_frequency: "Twice daily", duration: "14 days", route: "Topical" },
  { name: "Ketoconazole", medicine_code: "MED094", form: "other", strength: "2%", default_frequency: "Twice weekly", duration: "14 days", route: "Topical" },
  { name: "Acyclovir", medicine_code: "MED095", form: "tablet", strength: "400mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Valacyclovir", medicine_code: "MED096", form: "tablet", strength: "500mg", default_frequency: "Twice daily", duration: "7 days", route: "Oral" },
  { name: "Oseltamivir", medicine_code: "MED097", form: "capsule", strength: "75mg", default_frequency: "Twice daily", duration: "5 days", route: "Oral" },
  { name: "Ceftriaxone", medicine_code: "MED098", form: "injection", strength: "1g", default_frequency: "Once daily", duration: "5 days", route: "IV" },
  { name: "Meropenem", medicine_code: "MED099", form: "injection", strength: "1g", default_frequency: "Thrice daily", duration: "7 days", route: "IV" },
  { name: "Vancomycin", medicine_code: "MED100", form: "injection", strength: "1g", default_frequency: "Twice daily", duration: "7 days", route: "IV" },
];

// ─── Procedures Data ───
const procedures = [
  { name: "Bronchoscopy", procedure_code: "PROC001", department: "Pulmonology", category: "Diagnostic", duration: "30–45 minutes", description: "Endoscopic examination of airways", preparation_instructions: "Fasting 6–8 hours" },
  { name: "Upper GI Endoscopy", procedure_code: "PROC002", department: "Gastroenterology", category: "Diagnostic", duration: "15–30 minutes", description: "Examination of esophagus and stomach", preparation_instructions: "Fasting 6–8 hours" },
  { name: "Colonoscopy", procedure_code: "PROC003", department: "Gastroenterology", category: "Diagnostic", duration: "30–60 minutes", description: "Examination of colon using scope", preparation_instructions: "Bowel preparation required" },
  { name: "Cystoscopy", procedure_code: "PROC004", department: "Urology", category: "Diagnostic", duration: "20–30 minutes", description: "Visualization of urinary bladder", preparation_instructions: "Fasting 6 hours" },
  { name: "Bone Marrow Aspiration", procedure_code: "PROC005", department: "Hematology", category: "Diagnostic", duration: "30 minutes", description: "Collection of bone marrow sample", preparation_instructions: "Consent required" },
  { name: "Lumbar Puncture", procedure_code: "PROC006", department: "Neurology", category: "Diagnostic", duration: "30 minutes", description: "CSF collection from spinal canal", preparation_instructions: "Consent required" },
  { name: "Thoracentesis", procedure_code: "PROC007", department: "Pulmonology", category: "Therapeutic", duration: "30–45 minutes", description: "Removal of pleural fluid", preparation_instructions: "Consent required" },
  { name: "Paracentesis", procedure_code: "PROC008", department: "Gastroenterology", category: "Therapeutic", duration: "30–45 minutes", description: "Removal of abdominal fluid", preparation_instructions: "Fasting 6 hours" },
  { name: "Central Line Insertion", procedure_code: "PROC009", department: "Critical Care", category: "Therapeutic", duration: "45–60 minutes", description: "Central venous catheter placement", preparation_instructions: "Consent required" },
  { name: "Hemodialysis", procedure_code: "PROC010", department: "Nephrology", category: "Therapeutic", duration: "3–4 hours", description: "Blood filtration for kidney failure", preparation_instructions: "Light meal allowed" },
  { name: "Blood Transfusion", procedure_code: "PROC011", department: "General Medicine", category: "Therapeutic", duration: "2–4 hours", description: "Administration of blood products", preparation_instructions: "Cross-match required" },
  { name: "Chemotherapy Session", procedure_code: "PROC012", department: "Oncology", category: "Therapeutic", duration: "1–3 hours", description: "Administration of chemotherapy drugs", preparation_instructions: "As advised" },
  { name: "Angiography", procedure_code: "PROC013", department: "Cardiology", category: "Diagnostic", duration: "60–90 minutes", description: "Imaging of blood vessels", preparation_instructions: "Fasting 6–8 hours" },
  { name: "Angioplasty", procedure_code: "PROC014", department: "Cardiology", category: "Surgical", duration: "1–2 hours", description: "Opening blocked coronary arteries", preparation_instructions: "Fasting 6–8 hours" },
  { name: "Pacemaker Implantation", procedure_code: "PROC015", department: "Cardiology", category: "Surgical", duration: "1–2 hours", description: "Implantation of heart rhythm device", preparation_instructions: "Fasting 6 hours" },
  { name: "Appendectomy", procedure_code: "PROC016", department: "General Surgery", category: "Surgical", duration: "1 hour", description: "Removal of inflamed appendix", preparation_instructions: "Fasting 8 hours" },
  { name: "Cholecystectomy", procedure_code: "PROC017", department: "General Surgery", category: "Surgical", duration: "1–2 hours", description: "Removal of gallbladder", preparation_instructions: "Fasting 8 hours" },
  { name: "Hernia Repair", procedure_code: "PROC018", department: "General Surgery", category: "Surgical", duration: "1–2 hours", description: "Repair of abdominal wall hernia", preparation_instructions: "Fasting 8 hours" },
  { name: "Tonsillectomy", procedure_code: "PROC019", department: "ENT", category: "Surgical", duration: "45–60 minutes", description: "Removal of tonsils", preparation_instructions: "Fasting 6 hours" },
  { name: "Cataract Surgery", procedure_code: "PROC020", department: "Ophthalmology", category: "Surgical", duration: "20–30 minutes", description: "Removal of cloudy lens", preparation_instructions: "No food 6 hours prior" },
  { name: "LASIK Surgery", procedure_code: "PROC021", department: "Ophthalmology", category: "Surgical", duration: "15–20 minutes", description: "Vision correction surgery", preparation_instructions: "Avoid eye makeup" },
  { name: "Cesarean Section", procedure_code: "PROC022", department: "Obstetrics & Gynecology", category: "Surgical", duration: "45–60 minutes", description: "Surgical delivery of baby", preparation_instructions: "Fasting 8 hours" },
  { name: "Normal Vaginal Delivery", procedure_code: "PROC023", department: "Obstetrics & Gynecology", category: "Obstetric", duration: "6–12 hours", description: "Natural childbirth", preparation_instructions: "As per labor protocol" },
  { name: "Hysterectomy", procedure_code: "PROC024", department: "Obstetrics & Gynecology", category: "Surgical", duration: "1–3 hours", description: "Removal of uterus", preparation_instructions: "Fasting 8 hours" },
  { name: "Prostatectomy", procedure_code: "PROC025", department: "Urology", category: "Surgical", duration: "2–3 hours", description: "Removal of prostate gland", preparation_instructions: "Fasting 8 hours" },
  { name: "TURP", procedure_code: "PROC026", department: "Urology", category: "Surgical", duration: "1–2 hours", description: "Transurethral prostate resection", preparation_instructions: "Fasting 8 hours" },
  { name: "Circumcision", procedure_code: "PROC027", department: "Urology", category: "Minor Surgical", duration: "30–45 minutes", description: "Removal of foreskin", preparation_instructions: "Local hygiene required" },
  { name: "Incision & Drainage", procedure_code: "PROC028", department: "General Surgery", category: "Minor Surgical", duration: "20–30 minutes", description: "Drainage of abscess", preparation_instructions: "Local cleaning required" },
  { name: "Arthroscopy Knee", procedure_code: "PROC029", department: "Orthopedics", category: "Surgical", duration: "1 hour", description: "Minimally invasive knee surgery", preparation_instructions: "Fasting 6–8 hours" },
  { name: "Total Knee Replacement", procedure_code: "PROC030", department: "Orthopedics", category: "Surgical", duration: "2–3 hours", description: "Replacement of knee joint", preparation_instructions: "Fasting 8 hours" },
  { name: "Total Hip Replacement", procedure_code: "PROC031", department: "Orthopedics", category: "Surgical", duration: "2–3 hours", description: "Replacement of hip joint", preparation_instructions: "Fasting 8 hours" },
  { name: "Spinal Fusion", procedure_code: "PROC032", department: "Orthopedics", category: "Surgical", duration: "3–4 hours", description: "Stabilization of spine", preparation_instructions: "Fasting 8 hours" },
  { name: "Thyroidectomy", procedure_code: "PROC033", department: "General Surgery", category: "Surgical", duration: "1–2 hours", description: "Removal of thyroid gland", preparation_instructions: "Fasting 8 hours" },
  { name: "Mastectomy", procedure_code: "PROC034", department: "General Surgery", category: "Surgical", duration: "2–3 hours", description: "Removal of breast tissue", preparation_instructions: "Fasting 8 hours" },
  { name: "Endometrial Biopsy", procedure_code: "PROC035", department: "Obstetrics & Gynecology", category: "Diagnostic", duration: "20 minutes", description: "Sampling uterine lining", preparation_instructions: "As advised" },
  { name: "D&C", procedure_code: "PROC036", department: "Obstetrics & Gynecology", category: "Surgical", duration: "30–45 minutes", description: "Removal of uterine tissue", preparation_instructions: "Fasting 6 hours" },
  { name: "Vasectomy", procedure_code: "PROC037", department: "Urology", category: "Minor Surgical", duration: "30 minutes", description: "Male sterilization", preparation_instructions: "Local hygiene required" },
  { name: "Tubectomy", procedure_code: "PROC038", department: "Obstetrics & Gynecology", category: "Surgical", duration: "45–60 minutes", description: "Female sterilization", preparation_instructions: "Fasting 6 hours" },
  { name: "Tracheostomy", procedure_code: "PROC039", department: "ENT", category: "Surgical", duration: "30–45 minutes", description: "Surgical airway opening", preparation_instructions: "Fasting if planned" },
  { name: "Liver Biopsy", procedure_code: "PROC040", department: "Gastroenterology", category: "Diagnostic", duration: "30 minutes", description: "Sampling liver tissue", preparation_instructions: "Fasting 6 hours" },
  { name: "Kidney Biopsy", procedure_code: "PROC041", department: "Nephrology", category: "Diagnostic", duration: "45 minutes", description: "Sampling kidney tissue", preparation_instructions: "Fasting 6 hours" },
  { name: "Cardiac Catheterization", procedure_code: "PROC042", department: "Cardiology", category: "Diagnostic", duration: "60 minutes", description: "Heart vessel examination", preparation_instructions: "Fasting 6 hours" },
  { name: "ECT", procedure_code: "PROC043", department: "Psychiatry", category: "Therapeutic", duration: "10–20 minutes", description: "Electrical brain stimulation", preparation_instructions: "Fasting 6 hours" },
  { name: "Laparoscopy", procedure_code: "PROC044", department: "General Surgery", category: "Surgical", duration: "1–2 hours", description: "Minimally invasive abdominal surgery", preparation_instructions: "Fasting 8 hours" },
  { name: "Septoplasty", procedure_code: "PROC045", department: "ENT", category: "Surgical", duration: "1 hour", description: "Correction of nasal septum", preparation_instructions: "Fasting 6 hours" },
  { name: "CABG", procedure_code: "PROC046", department: "Cardiology", category: "Surgical", duration: "4–6 hours", description: "Coronary bypass surgery", preparation_instructions: "Fasting 8 hours" },
  { name: "Hemorrhoidectomy", procedure_code: "PROC047", department: "General Surgery", category: "Surgical", duration: "45–60 minutes", description: "Removal of hemorrhoids", preparation_instructions: "Bowel preparation" },
  { name: "ERCP", procedure_code: "PROC048", department: "Gastroenterology", category: "Diagnostic", duration: "45–90 minutes", description: "Endoscopic bile duct imaging", preparation_instructions: "Fasting 8 hours" },
  { name: "Craniotomy", procedure_code: "PROC049", department: "Neurosurgery", category: "Surgical", duration: "3–5 hours", description: "Brain surgery procedure", preparation_instructions: "Fasting 8 hours" },
  { name: "Lithotripsy (ESWL)", procedure_code: "PROC050", department: "Urology", category: "Therapeutic", duration: "45–60 minutes", description: "Kidney stone fragmentation", preparation_instructions: "Fasting 6 hours" },
];

// ─── Lab Tests Data (first 100) ───
const labTests = [
  { name: "Complete Blood Count (CBC)", test_code: "LAB001", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Hemoglobin (Hb)", test_code: "LAB002", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "ESR", test_code: "LAB003", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Platelet Count", test_code: "LAB004", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Peripheral Smear", test_code: "LAB005", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Prothrombin Time (PT/INR)", test_code: "LAB006", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Avoid anticoagulant dose before test" },
  { name: "Blood Group & Rh Typing", test_code: "LAB007", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Fasting Blood Sugar (FBS)", test_code: "LAB008", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Fasting required for 8-12 hours" },
  { name: "Postprandial Blood Sugar (PPBS)", test_code: "LAB009", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "2 hours after meal" },
  { name: "Random Blood Sugar (RBS)", test_code: "LAB010", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "HbA1c", test_code: "LAB011", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No fasting required" },
  { name: "Blood Urea", test_code: "LAB012", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Serum Creatinine", test_code: "LAB013", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Uric Acid", test_code: "LAB014", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Fasting preferred" },
  { name: "Liver Function Test (LFT)", test_code: "LAB015", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Fasting 8 hours preferred" },
  { name: "Kidney Function Test (KFT)", test_code: "LAB016", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Lipid Profile", test_code: "LAB017", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Fasting required 8-12 hours" },
  { name: "Serum Bilirubin", test_code: "LAB018", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "SGOT (AST)", test_code: "LAB019", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No alcohol 24 hrs prior" },
  { name: "SGPT (ALT)", test_code: "LAB020", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No alcohol 24 hrs prior" },
  { name: "Thyroid Profile (T3, T4, TSH)", test_code: "LAB021", category: "Hormone", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No fasting required" },
  { name: "TSH", test_code: "LAB022", category: "Hormone", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No fasting required" },
  { name: "Free T3", test_code: "LAB023", category: "Hormone", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No fasting required" },
  { name: "Free T4", test_code: "LAB024", category: "Hormone", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No fasting required" },
  { name: "Vitamin D (25-OH)", test_code: "LAB025", category: "Vitamins", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Vitamin B12", test_code: "LAB026", category: "Vitamins", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Serum Calcium", test_code: "LAB027", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Iron Studies", test_code: "LAB028", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Fasting preferred" },
  { name: "Serum Ferritin", test_code: "LAB029", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "C-Reactive Protein (CRP)", test_code: "LAB030", category: "Immunology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Rheumatoid Factor (RF)", test_code: "LAB031", category: "Immunology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "HIV 1 & 2", test_code: "LAB032", category: "Serology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Consent required" },
  { name: "HBsAg", test_code: "LAB033", category: "Serology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Anti-HCV", test_code: "LAB034", category: "Serology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Dengue NS1", test_code: "LAB035", category: "Serology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Widal Test", test_code: "LAB036", category: "Serology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Malaria Parasite (MP)", test_code: "LAB037", category: "Microbiology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Blood Culture", test_code: "LAB038", category: "Microbiology", sample_type: "Blood", turnaround_time: "72 hours", preparation_instructions: "Before starting antibiotics" },
  { name: "Urine Routine & Microscopy", test_code: "LAB039", category: "Clinical Pathology", sample_type: "Urine", turnaround_time: "24 hours", preparation_instructions: "Clean catch midstream sample" },
  { name: "Urine Culture", test_code: "LAB040", category: "Microbiology", sample_type: "Urine", turnaround_time: "72 hours", preparation_instructions: "Clean catch sample" },
  { name: "Sputum AFB", test_code: "LAB041", category: "Microbiology", sample_type: "Sputum", turnaround_time: "48 hours", preparation_instructions: "Early morning sample" },
  { name: "D-Dimer", test_code: "LAB042", category: "Hematology", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Troponin I", test_code: "LAB043", category: "Cardiac Marker", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "CK-MB", test_code: "LAB044", category: "Cardiac Marker", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "PSA", test_code: "LAB045", category: "Hormone", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Avoid ejaculation 48 hrs prior" },
  { name: "X-Ray Chest PA View", test_code: "LAB046", category: "Radiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Ultrasound Whole Abdomen", test_code: "LAB047", category: "Radiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "Fasting 6–8 hours" },
  { name: "CT Brain Plain", test_code: "LAB048", category: "Radiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "Remove metal objects" },
  { name: "MRI Brain", test_code: "LAB049", category: "Radiology", sample_type: "Imaging", turnaround_time: "48 hours", preparation_instructions: "Remove metal objects, screen for implants" },
  { name: "ECG", test_code: "LAB050", category: "Cardiology", sample_type: "Imaging", turnaround_time: "Same day", preparation_instructions: "No special preparation" },
  { name: "Echocardiography (2D Echo)", test_code: "LAB051", category: "Cardiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Stress Test (TMT)", test_code: "LAB052", category: "Cardiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "Wear comfortable clothing" },
  { name: "HRCT Chest", test_code: "LAB053", category: "Radiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "CT Angiography", test_code: "LAB054", category: "Radiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "Fasting 6 hours, kidney function test required" },
  { name: "Mammography", test_code: "LAB055", category: "Radiology", sample_type: "Imaging", turnaround_time: "24 hours", preparation_instructions: "Avoid deodorant/powder" },
  { name: "Serum Sodium", test_code: "LAB056", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Serum Potassium", test_code: "LAB057", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "No special preparation" },
  { name: "Arterial Blood Gas (ABG)", test_code: "LAB058", category: "Biochemistry", sample_type: "Arterial Blood", turnaround_time: "6 hours", preparation_instructions: "No special preparation" },
  { name: "PET-CT Scan", test_code: "LAB059", category: "Nuclear Medicine", sample_type: "Imaging", turnaround_time: "48 hours", preparation_instructions: "Fasting 6 hours" },
  { name: "Serum Amylase", test_code: "LAB060", category: "Biochemistry", sample_type: "Blood", turnaround_time: "24 hours", preparation_instructions: "Fasting preferred" },
];

// ─── Main Seed Function ───
async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('🔧 Step 1: Ensuring catalog columns exist...');
    
    // Ensure new columns exist
    await ensureColumn(conn, 'medicines_catalog', 'medicine_code', 'VARCHAR(100) AFTER name');
    await ensureColumn(conn, 'medicines_catalog', 'form', "VARCHAR(50) DEFAULT 'tablet'");
    await ensureColumn(conn, 'medicines_catalog', 'strength', 'VARCHAR(50)');
    await ensureColumn(conn, 'medicines_catalog', 'default_frequency', 'VARCHAR(100)');
    await ensureColumn(conn, 'medicines_catalog', 'duration', 'VARCHAR(50)');
    await ensureColumn(conn, 'medicines_catalog', 'route', 'VARCHAR(50)');
    
    await ensureColumn(conn, 'lab_catalogue', 'test_code', 'VARCHAR(100) AFTER name');
    
    await ensureColumn(conn, 'procedure_catalogue', 'procedure_code', 'VARCHAR(100) AFTER name');
    await ensureColumn(conn, 'procedure_catalogue', 'department', 'VARCHAR(100) AFTER procedure_code');
    await ensureColumn(conn, 'procedure_catalogue', 'duration', 'VARCHAR(50)');
    
    // Check available columns
    const hasMedCode = await columnExists(conn, 'medicines_catalog', 'medicine_code');
    const hasTestCode = await columnExists(conn, 'lab_catalogue', 'test_code');
    const hasProcCode = await columnExists(conn, 'procedure_catalogue', 'procedure_code');
    const hasDepartment = await columnExists(conn, 'procedure_catalogue', 'department');
    const hasDuration = await columnExists(conn, 'procedure_catalogue', 'duration');

    // ─── Seed Medicines ───
    console.log('\n💊 Step 2: Seeding medicines catalog...');
    let medInserted = 0, medSkipped = 0;
    for (const med of medicines) {
      const [existing] = await conn.execute('SELECT id FROM medicines_catalog WHERE name = ?', [med.name]);
      if (existing.length > 0) { medSkipped++; continue; }

      const cols = ['name'];
      const vals = [med.name];
      const ph = ['?'];

      if (hasMedCode) { cols.push('medicine_code'); vals.push(med.medicine_code); ph.push('?'); }
      cols.push('form'); vals.push(med.form); ph.push('?');
      cols.push('strength'); vals.push(med.strength); ph.push('?');
      cols.push('default_frequency'); vals.push(med.default_frequency); ph.push('?');
      cols.push('duration'); vals.push(med.duration); ph.push('?');
      cols.push('route'); vals.push(med.route); ph.push('?');

      await conn.execute(`INSERT INTO medicines_catalog (${cols.join(',')}) VALUES (${ph.join(',')})`, vals);
      medInserted++;
    }
    console.log(`  ✅ Medicines: ${medInserted} inserted, ${medSkipped} skipped`);

    // ─── Seed Procedures ───
    console.log('\n🏥 Step 3: Seeding procedures catalog...');
    let procInserted = 0, procSkipped = 0;
    for (const proc of procedures) {
      const [existing] = await conn.execute('SELECT id FROM procedure_catalogue WHERE name = ?', [proc.name]);
      if (existing.length > 0) { procSkipped++; continue; }

      const cols = ['name', 'category', 'description', 'preparation_instructions'];
      const vals = [proc.name, proc.category, proc.description, proc.preparation_instructions];
      const ph = ['?', '?', '?', '?'];

      if (hasProcCode) { cols.push('procedure_code'); vals.push(proc.procedure_code); ph.push('?'); }
      if (hasDepartment) { cols.push('department'); vals.push(proc.department); ph.push('?'); }
      if (hasDuration) { cols.push('duration'); vals.push(proc.duration); ph.push('?'); }

      await conn.execute(`INSERT INTO procedure_catalogue (${cols.join(',')}) VALUES (${ph.join(',')})`, vals);
      procInserted++;
    }
    console.log(`  ✅ Procedures: ${procInserted} inserted, ${procSkipped} skipped`);

    // ─── Seed Lab Tests ───
    console.log('\n🧪 Step 4: Seeding lab tests catalog...');
    let labInserted = 0, labSkipped = 0;
    for (const lab of labTests) {
      const [existing] = await conn.execute('SELECT id FROM lab_catalogue WHERE name = ?', [lab.name]);
      if (existing.length > 0) { labSkipped++; continue; }

      const cols = ['name', 'category', 'sample_type', 'turnaround_time', 'preparation_instructions'];
      const vals = [lab.name, lab.category, lab.sample_type, lab.turnaround_time, lab.preparation_instructions];
      const ph = ['?', '?', '?', '?', '?'];

      if (hasTestCode) { cols.push('test_code'); vals.push(lab.test_code); ph.push('?'); }

      await conn.execute(`INSERT INTO lab_catalogue (${cols.join(',')}) VALUES (${ph.join(',')})`, vals);
      labInserted++;
    }
    console.log(`  ✅ Lab Tests: ${labInserted} inserted, ${labSkipped} skipped`);

    console.log('\n🎉 Catalog seeding complete!');
    console.log(`   Schema: ${SCHEMA}`);
    console.log(`   Medicines: ${medInserted + medSkipped} total (${medInserted} new)`);
    console.log(`   Procedures: ${procInserted + procSkipped} total (${procInserted} new)`);
    console.log(`   Lab Tests: ${labInserted + labSkipped} total (${labInserted} new)`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
