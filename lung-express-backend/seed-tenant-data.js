#!/usr/bin/env node
/**
 * ============================================================
 *  Tenant Data Seeder
 * ============================================================
 *  Seeds dummy patients and doctors into a specific tenant schema.
 *
 *  USAGE:
 *    node seed-tenant-data.js <SCHEMA_NAME>
 *
 *  EXAMPLE:
 *    node seed-tenant-data.js hosp_raj_dulai_hospital
 *
 *  Prerequisite:
 *    - The schema must already exist (created via onboarding)
 *    - MySQL credentials from .env are used
 *
 *  What it does:
 *    1. Ensures age, gender, state, address columns exist on patients
 *    2. Ensures patient_uid column exists on patients
 *    3. Inserts 200 patients (skips duplicates by email)
 *    4. Auto-generates patient_uid for each patient
 *    5. Inserts 38 doctors (skips duplicates by email)
 *    6. Randomly assigns patients to doctors via doctor_id
 * ============================================================
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const SCHEMA = process.argv[2];

if (!SCHEMA) {
  console.error('❌ Usage: node seed-tenant-data.js <SCHEMA_NAME>');
  console.error('   Example: node seed-tenant-data.js hosp_raj_dulai_hospital');
  process.exit(1);
}

console.log(`\n🌱 Seeding data into schema: ${SCHEMA}\n`);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: SCHEMA,
  waitForConnections: true,
  connectionLimit: 5,
});

// ─── Patient Data (200 records) ───
const patients = [
  { full_name: "Aarav Sharma", email: "aarav.sharma1@testmail.com", phone: "9876543201", concern: "Fever and headache", age: 25, gender: "Male", state: "Delhi", address: "Lajpat Nagar" },
  { full_name: "Priya Verma", email: "priya.verma2@testmail.com", phone: "9876543202", concern: "Back pain", age: 32, gender: "Female", state: "Haryana", address: "Sector 15, Gurgaon" },
  { full_name: "Rahul Gupta", email: "rahul.gupta3@testmail.com", phone: "9876543203", concern: "Stomach ache", age: 41, gender: "Male", state: "Uttar Pradesh", address: "Indirapuram, Ghaziabad" },
  { full_name: "Neha Singh", email: "neha.singh4@testmail.com", phone: "9876543204", concern: "Skin allergy", age: 29, gender: "Female", state: "Delhi", address: "Rohini Sector 8" },
  { full_name: "Amit Kumar", email: "amit.kumar5@testmail.com", phone: "9876543205", concern: "Cold and cough", age: 36, gender: "Male", state: "Bihar", address: "Patliputra Colony" },
  { full_name: "Pooja Mehta", email: "pooja.mehta6@testmail.com", phone: "9876543206", concern: "Migraine", age: 27, gender: "Female", state: "Rajasthan", address: "Vaishali Nagar" },
  { full_name: "Rohan Das", email: "rohan.das7@testmail.com", phone: "9876543207", concern: "Knee pain", age: 45, gender: "Male", state: "West Bengal", address: "Salt Lake" },
  { full_name: "Sneha Patel", email: "sneha.patel8@testmail.com", phone: "9876543208", concern: "Weakness", age: 31, gender: "Female", state: "Gujarat", address: "Navrangpura" },
  { full_name: "Vikram Yadav", email: "vikram.yadav9@testmail.com", phone: "9876543209", concern: "Chest pain", age: 52, gender: "Male", state: "Uttar Pradesh", address: "Gomti Nagar" },
  { full_name: "Anjali Jain", email: "anjali.jain10@testmail.com", phone: "9876543210", concern: "Anxiety", age: 24, gender: "Female", state: "Delhi", address: "Janakpuri" },
  { full_name: "Karan Malhotra", email: "karan.malhotra11@testmail.com", phone: "9876543211", concern: "High BP", age: 48, gender: "Male", state: "Punjab", address: "Model Town" },
  { full_name: "Kavita Nair", email: "kavita.nair12@testmail.com", phone: "9876543212", concern: "Diabetes check", age: 55, gender: "Female", state: "Kerala", address: "MG Road" },
  { full_name: "Arjun Kapoor", email: "arjun.kapoor13@testmail.com", phone: "9876543213", concern: "Eye irritation", age: 33, gender: "Male", state: "Delhi", address: "Dwarka" },
  { full_name: "Meera Iyer", email: "meera.iyer14@testmail.com", phone: "9876543214", concern: "Thyroid issue", age: 39, gender: "Female", state: "Tamil Nadu", address: "Anna Nagar" },
  { full_name: "Suresh Patel", email: "suresh.patel15@testmail.com", phone: "9876543215", concern: "Joint pain", age: 60, gender: "Male", state: "Gujarat", address: "Vastrapur" },
  { full_name: "Ritu Saxena", email: "ritu.saxena16@testmail.com", phone: "9876543216", concern: "Hair fall", age: 28, gender: "Female", state: "Delhi", address: "Pitampura" },
  { full_name: "Mohit Bansal", email: "mohit.bansal17@testmail.com", phone: "9876543217", concern: "Acidity", age: 35, gender: "Male", state: "Haryana", address: "Faridabad Sector 21" },
  { full_name: "Nisha Arora", email: "nisha.arora18@testmail.com", phone: "9876543218", concern: "Fever", age: 22, gender: "Female", state: "Punjab", address: "Amritsar Cantt" },
  { full_name: "Deepak Mishra", email: "deepak.mishra19@testmail.com", phone: "9876543219", concern: "Fatigue", age: 44, gender: "Male", state: "Uttar Pradesh", address: "Aliganj" },
  { full_name: "Simran Kaur", email: "simran.kaur20@testmail.com", phone: "9876543220", concern: "PCOS concern", age: 30, gender: "Female", state: "Punjab", address: "Ludhiana City" },
  { full_name: "Rajesh Khanna", email: "rajesh.khanna21@testmail.com", phone: "9876543221", concern: "Heartburn", age: 50, gender: "Male", state: "Delhi", address: "Karol Bagh" },
  { full_name: "Tanya Chawla", email: "tanya.chawla22@testmail.com", phone: "9876543222", concern: "Depression", age: 26, gender: "Female", state: "Delhi", address: "Vasant Kunj" },
  { full_name: "Naveen Joshi", email: "naveen.joshi23@testmail.com", phone: "9876543223", concern: "Sinus problem", age: 38, gender: "Male", state: "Uttarakhand", address: "Haldwani" },
  { full_name: "Asha Rani", email: "asha.rani24@testmail.com", phone: "9876543224", concern: "Ear pain", age: 47, gender: "Female", state: "Haryana", address: "Panipat" },
  { full_name: "Varun Aggarwal", email: "varun.aggarwal25@testmail.com", phone: "9876543225", concern: "Vomiting", age: 34, gender: "Male", state: "Delhi", address: "Saket" },
  { full_name: "Rekha Pillai", email: "rekha.pillai26@testmail.com", phone: "9876543226", concern: "Asthma", age: 53, gender: "Female", state: "Kerala", address: "Kochi" },
  { full_name: "Sunil Chauhan", email: "sunil.chauhan27@testmail.com", phone: "9876543227", concern: "Leg injury", age: 40, gender: "Male", state: "Rajasthan", address: "Kota" },
  { full_name: "Divya Bharti", email: "divya.bharti28@testmail.com", phone: "9876543228", concern: "Fever", age: 21, gender: "Female", state: "Bihar", address: "Kankarbagh" },
  { full_name: "Imran Khan", email: "imran.khan29@testmail.com", phone: "9876543229", concern: "Cough", age: 37, gender: "Male", state: "Delhi", address: "Jamia Nagar" },
  { full_name: "Komal Shah", email: "komal.shah30@testmail.com", phone: "9876543230", concern: "Allergy", age: 29, gender: "Female", state: "Gujarat", address: "Satellite" },
  { full_name: "Manish Pandey", email: "manish.pandey31@testmail.com", phone: "9876543231", concern: "Body pain", age: 46, gender: "Male", state: "Uttar Pradesh", address: "Kanpur" },
  { full_name: "Alka Tiwari", email: "alka.tiwari32@testmail.com", phone: "9876543232", concern: "Thyroid", age: 42, gender: "Female", state: "Madhya Pradesh", address: "Bhopal" },
  { full_name: "Gaurav Singh", email: "gaurav.singh33@testmail.com", phone: "9876543233", concern: "Fever", age: 31, gender: "Male", state: "Delhi", address: "Mayur Vihar" },
  { full_name: "Shalini Roy", email: "shalini.roy34@testmail.com", phone: "9876543234", concern: "Migraine", age: 27, gender: "Female", state: "West Bengal", address: "Howrah" },
  { full_name: "Pradeep Nair", email: "pradeep.nair35@testmail.com", phone: "9876543235", concern: "Diabetes", age: 58, gender: "Male", state: "Kerala", address: "Trivandrum" },
  { full_name: "Riya Kapoor", email: "riya.kapoor36@testmail.com", phone: "9876543236", concern: "Cold", age: 23, gender: "Female", state: "Delhi", address: "Rajouri Garden" },
  { full_name: "Sanjay Verma", email: "sanjay.verma37@testmail.com", phone: "9876543237", concern: "Knee pain", age: 49, gender: "Male", state: "Haryana", address: "Karnal" },
  { full_name: "Pankaj Arora", email: "pankaj.arora38@testmail.com", phone: "9876543238", concern: "Back pain", age: 36, gender: "Male", state: "Delhi", address: "Paschim Vihar" },
  { full_name: "Heena Sheikh", email: "heena.sheikh39@testmail.com", phone: "9876543239", concern: "Skin rash", age: 28, gender: "Female", state: "Maharashtra", address: "Mumbai Andheri" },
  { full_name: "Rohit Jain", email: "rohit.jain40@testmail.com", phone: "9876543240", concern: "Eye checkup", age: 45, gender: "Male", state: "Delhi", address: "Chandni Chowk" },
  { full_name: "Preeti Gupta", email: "preeti.gupta41@testmail.com", phone: "9876543241", concern: "Weakness", age: 33, gender: "Female", state: "Uttar Pradesh", address: "Noida Sector 62" },
  { full_name: "Ajay Yadav", email: "ajay.yadav42@testmail.com", phone: "9876543242", concern: "BP check", age: 52, gender: "Male", state: "Bihar", address: "Muzaffarpur" },
  { full_name: "Kiran Bala", email: "kiran.bala43@testmail.com", phone: "9876543243", concern: "Fever", age: 39, gender: "Female", state: "Punjab", address: "Patiala" },
  { full_name: "Vivek Sinha", email: "vivek.sinha44@testmail.com", phone: "9876543244", concern: "Stomach pain", age: 41, gender: "Male", state: "Jharkhand", address: "Ranchi" },
  { full_name: "Monika Sharma", email: "monika.sharma45@testmail.com", phone: "9876543245", concern: "Anxiety", age: 26, gender: "Female", state: "Delhi", address: "Uttam Nagar" },
  { full_name: "Tarun Mehta", email: "tarun.mehta46@testmail.com", phone: "9876543246", concern: "Cold", age: 35, gender: "Male", state: "Rajasthan", address: "Ajmer" },
  { full_name: "Payal Gupta", email: "payal.gupta47@testmail.com", phone: "9876543247", concern: "Hair fall", age: 29, gender: "Female", state: "Delhi", address: "Shalimar Bagh" },
  { full_name: "Ashok Kumar", email: "ashok.kumar48@testmail.com", phone: "9876543248", concern: "Joint pain", age: 61, gender: "Male", state: "Haryana", address: "Sonipat" },
  { full_name: "Nikita Arora", email: "nikita.arora49@testmail.com", phone: "9876543249", concern: "PCOS", age: 24, gender: "Female", state: "Delhi", address: "Tilak Nagar" },
  { full_name: "Hemant Patel", email: "hemant.patel50@testmail.com", phone: "9876543250", concern: "Diabetes", age: 57, gender: "Male", state: "Gujarat", address: "Surat" },
  { full_name: "Aditya Singh", email: "aditya.singh51@testmail.com", phone: "9876543251", concern: "Fever", age: 28, gender: "Male", state: "Delhi", address: "Shahdara" },
  { full_name: "Bhavna Gupta", email: "bhavna.gupta52@testmail.com", phone: "9876543252", concern: "Back pain", age: 34, gender: "Female", state: "Uttar Pradesh", address: "Noida Sector 18" },
  { full_name: "Chirag Patel", email: "chirag.patel53@testmail.com", phone: "9876543253", concern: "Skin infection", age: 42, gender: "Male", state: "Gujarat", address: "Ellis Bridge" },
  { full_name: "Dimple Kaur", email: "dimple.kaur54@testmail.com", phone: "9876543254", concern: "Cold and cough", age: 23, gender: "Female", state: "Punjab", address: "Jalandhar" },
  { full_name: "Eshan Verma", email: "eshan.verma55@testmail.com", phone: "9876543255", concern: "Migraine", age: 37, gender: "Male", state: "Haryana", address: "Gurgaon Sector 56" },
  { full_name: "Farah Khan", email: "farah.khan56@testmail.com", phone: "9876543256", concern: "Anxiety", age: 31, gender: "Female", state: "Maharashtra", address: "Bandra West" },
  { full_name: "Gopal Sharma", email: "gopal.sharma57@testmail.com", phone: "9876543257", concern: "Joint pain", age: 59, gender: "Male", state: "Rajasthan", address: "Malviya Nagar" },
  { full_name: "Hina Ali", email: "hina.ali58@testmail.com", phone: "9876543258", concern: "Fever", age: 26, gender: "Female", state: "Delhi", address: "Okhla" },
  { full_name: "Ishant Yadav", email: "ishant.yadav59@testmail.com", phone: "9876543259", concern: "Stomach ache", age: 39, gender: "Male", state: "Uttar Pradesh", address: "Meerut Cantt" },
  { full_name: "Juhi Jain", email: "juhi.jain60@testmail.com", phone: "9876543260", concern: "Thyroid", age: 45, gender: "Female", state: "Delhi", address: "Vivek Vihar" },
  { full_name: "Kunal Mehta", email: "kunal.mehta61@testmail.com", phone: "9876543261", concern: "Chest pain", age: 51, gender: "Male", state: "Gujarat", address: "Maninagar" },
  { full_name: "Lata Nair", email: "lata.nair62@testmail.com", phone: "9876543262", concern: "Diabetes", age: 62, gender: "Female", state: "Kerala", address: "Kollam" },
  { full_name: "Manav Bansal", email: "manav.bansal63@testmail.com", phone: "9876543263", concern: "Cold", age: 24, gender: "Male", state: "Delhi", address: "Rohini Sector 24" },
  { full_name: "Nandini Iyer", email: "nandini.iyer64@testmail.com", phone: "9876543264", concern: "Hair fall", age: 29, gender: "Female", state: "Tamil Nadu", address: "T Nagar" },
  { full_name: "Om Prakash", email: "om.prakash65@testmail.com", phone: "9876543265", concern: "Knee pain", age: 55, gender: "Male", state: "Bihar", address: "Rajendra Nagar" },
  { full_name: "Priti Shah", email: "priti.shah66@testmail.com", phone: "9876543266", concern: "Allergy", age: 33, gender: "Female", state: "Gujarat", address: "Paldi" },
  { full_name: "Qasim Sheikh", email: "qasim.sheikh67@testmail.com", phone: "9876543267", concern: "Cough", age: 36, gender: "Male", state: "Maharashtra", address: "Kurla" },
  { full_name: "Rakesh Kumar", email: "rakesh.kumar68@testmail.com", phone: "9876543268", concern: "BP check", age: 48, gender: "Male", state: "Delhi", address: "Nangloi" },
  { full_name: "Sakshi Arora", email: "sakshi.arora69@testmail.com", phone: "9876543269", concern: "PCOS", age: 27, gender: "Female", state: "Punjab", address: "Mohali" },
  { full_name: "Tanmay Roy", email: "tanmay.roy70@testmail.com", phone: "9876543270", concern: "Eye irritation", age: 35, gender: "Male", state: "West Bengal", address: "Park Street" },
  { full_name: "Usha Devi", email: "usha.devi71@testmail.com", phone: "9876543271", concern: "Weakness", age: 53, gender: "Female", state: "Bihar", address: "Gaya" },
  { full_name: "Varsha Singh", email: "varsha.singh72@testmail.com", phone: "9876543272", concern: "Fever", age: 22, gender: "Female", state: "Uttar Pradesh", address: "Lucknow" },
  { full_name: "Wasim Akhtar", email: "wasim.akhtar73@testmail.com", phone: "9876543273", concern: "Asthma", age: 41, gender: "Male", state: "Delhi", address: "Seelampur" },
  { full_name: "Xenia Dsouza", email: "xenia.dsouza74@testmail.com", phone: "9876543274", concern: "Skin rash", age: 30, gender: "Female", state: "Goa", address: "Panaji" },
  { full_name: "Yogesh Chauhan", email: "yogesh.chauhan75@testmail.com", phone: "9876543275", concern: "Back pain", age: 46, gender: "Male", state: "Haryana", address: "Hisar" },
  { full_name: "Zoya Khan", email: "zoya.khan76@testmail.com", phone: "9876543276", concern: "Depression", age: 25, gender: "Female", state: "Delhi", address: "Batla House" },
  { full_name: "Ankit Tiwari", email: "ankit.tiwari77@testmail.com", phone: "9876543277", concern: "Stomach pain", age: 38, gender: "Male", state: "Madhya Pradesh", address: "Indore" },
  { full_name: "Bhumika Sharma", email: "bhumika.sharma78@testmail.com", phone: "9876543278", concern: "Cold", age: 21, gender: "Female", state: "Delhi", address: "Ashok Vihar" },
  { full_name: "Chetan Arora", email: "chetan.arora79@testmail.com", phone: "9876543279", concern: "Knee pain", age: 49, gender: "Male", state: "Punjab", address: "Bathinda" },
  { full_name: "Dolly Verma", email: "dolly.verma80@testmail.com", phone: "9876543280", concern: "Migraine", age: 32, gender: "Female", state: "Uttar Pradesh", address: "Kanpur" },
  { full_name: "Ekta Kapoor", email: "ekta.kapoor81@testmail.com", phone: "9876543281", concern: "Thyroid", age: 44, gender: "Female", state: "Delhi", address: "Preet Vihar" },
  { full_name: "Faisal Khan", email: "faisal.khan82@testmail.com", phone: "9876543282", concern: "Fever", age: 29, gender: "Male", state: "Maharashtra", address: "Thane" },
  { full_name: "Gauri Patel", email: "gauri.patel83@testmail.com", phone: "9876543283", concern: "Hair fall", age: 26, gender: "Female", state: "Gujarat", address: "Rajkot" },
  { full_name: "Harish Nair", email: "harish.nair84@testmail.com", phone: "9876543284", concern: "Diabetes", age: 60, gender: "Male", state: "Kerala", address: "Kozhikode" },
  { full_name: "Isha Gupta", email: "isha.gupta85@testmail.com", phone: "9876543285", concern: "Anxiety", age: 23, gender: "Female", state: "Delhi", address: "Punjabi Bagh" },
  { full_name: "Jatin Malhotra", email: "jatin.malhotra86@testmail.com", phone: "9876543286", concern: "Chest pain", age: 52, gender: "Male", state: "Haryana", address: "Ambala" },
  { full_name: "Kavya Iyer", email: "kavya.iyer87@testmail.com", phone: "9876543287", concern: "Allergy", age: 31, gender: "Female", state: "Tamil Nadu", address: "Velachery" },
  { full_name: "Lokesh Yadav", email: "lokesh.yadav88@testmail.com", phone: "9876543288", concern: "Cold", age: 34, gender: "Male", state: "Uttar Pradesh", address: "Agra" },
  { full_name: "Mehak Jain", email: "mehak.jain89@testmail.com", phone: "9876543289", concern: "PCOS", age: 28, gender: "Female", state: "Delhi", address: "Krishna Nagar" },
  { full_name: "Nitin Sharma", email: "nitin.sharma90@testmail.com", phone: "9876543290", concern: "BP check", age: 47, gender: "Male", state: "Delhi", address: "Burari" },
  { full_name: "Ojas Shah", email: "ojas.shah91@testmail.com", phone: "9876543291", concern: "Eye checkup", age: 39, gender: "Male", state: "Gujarat", address: "Anand" },
  { full_name: "Poonam Devi", email: "poonam.devi92@testmail.com", phone: "9876543292", concern: "Weakness", age: 56, gender: "Female", state: "Bihar", address: "Darbhanga" },
  { full_name: "Rajat Verma", email: "rajat.verma93@testmail.com", phone: "9876543293", concern: "Fever", age: 27, gender: "Male", state: "Uttar Pradesh", address: "Bareilly" },
  { full_name: "Shreya Kapoor", email: "shreya.kapoor94@testmail.com", phone: "9876543294", concern: "Migraine", age: 33, gender: "Female", state: "Delhi", address: "Model Town" },
  { full_name: "Tushar Gupta", email: "tushar.gupta95@testmail.com", phone: "9876543295", concern: "Back pain", age: 45, gender: "Male", state: "Haryana", address: "Rohtak" },
  { full_name: "Urvashi Mehta", email: "urvashi.mehta96@testmail.com", phone: "9876543296", concern: "Skin allergy", age: 24, gender: "Female", state: "Rajasthan", address: "Udaipur" },
  { full_name: "Vikas Singh", email: "vikas.singh97@testmail.com", phone: "9876543297", concern: "Joint pain", age: 58, gender: "Male", state: "Uttar Pradesh", address: "Varanasi" },
  { full_name: "Wajid Ali", email: "wajid.ali98@testmail.com", phone: "9876543298", concern: "Cough", age: 36, gender: "Male", state: "Delhi", address: "Zakir Nagar" },
  { full_name: "Yashika Arora", email: "yashika.arora99@testmail.com", phone: "9876543299", concern: "Thyroid", age: 40, gender: "Female", state: "Punjab", address: "Hoshiarpur" },
  { full_name: "Zubair Ahmed", email: "zubair.ahmed100@testmail.com", phone: "9876543300", concern: "Fever", age: 35, gender: "Male", state: "Delhi", address: "Jamia Nagar" },
  { full_name: "Abhishek Rana", email: "abhishek.rana101@testmail.com", phone: "9876543301", concern: "Fever", age: 30, gender: "Male", state: "Delhi", address: "Trilokpuri" },
  { full_name: "Aditi Chauhan", email: "aditi.chauhan102@testmail.com", phone: "9876543302", concern: "Migraine", age: 27, gender: "Female", state: "Haryana", address: "Gurgaon Sector 22" },
  { full_name: "Ajay Sharma", email: "ajay.sharma103@testmail.com", phone: "9876543303", concern: "Back pain", age: 44, gender: "Male", state: "Rajasthan", address: "Bani Park" },
  { full_name: "Akanksha Singh", email: "akanksha.singh104@testmail.com", phone: "9876543304", concern: "Anxiety", age: 25, gender: "Female", state: "Uttar Pradesh", address: "Alambagh" },
  { full_name: "Akash Verma", email: "akash.verma105@testmail.com", phone: "9876543305", concern: "Cold and cough", age: 33, gender: "Male", state: "Delhi", address: "Dilshad Garden" },
  { full_name: "Akriti Jain", email: "akriti.jain106@testmail.com", phone: "9876543306", concern: "Hair fall", age: 29, gender: "Female", state: "Delhi", address: "Laxmi Nagar" },
  { full_name: "Aman Gupta", email: "aman.gupta107@testmail.com", phone: "9876543307", concern: "Stomach pain", age: 38, gender: "Male", state: "Punjab", address: "Patiala" },
  { full_name: "Amisha Patel", email: "amisha.patel108@testmail.com", phone: "9876543308", concern: "Skin rash", age: 31, gender: "Female", state: "Gujarat", address: "Bharuch" },
  { full_name: "Anil Kumar", email: "anil.kumar109@testmail.com", phone: "9876543309", concern: "Joint pain", age: 57, gender: "Male", state: "Bihar", address: "Purnia" },
  { full_name: "Anjali Yadav", email: "anjali.yadav110@testmail.com", phone: "9876543310", concern: "Fever", age: 23, gender: "Female", state: "Uttar Pradesh", address: "Prayagraj" },
  { full_name: "Ankit Sharma", email: "ankit.sharma111@testmail.com", phone: "9876543311", concern: "BP check", age: 49, gender: "Male", state: "Delhi", address: "Mangolpuri" },
  { full_name: "Ankita Verma", email: "ankita.verma112@testmail.com", phone: "9876543312", concern: "PCOS", age: 26, gender: "Female", state: "Delhi", address: "Mayur Vihar Phase 3" },
  { full_name: "Ankur Singh", email: "ankur.singh113@testmail.com", phone: "9876543313", concern: "Chest pain", age: 52, gender: "Male", state: "Haryana", address: "Sonipat" },
  { full_name: "Anshika Kapoor", email: "anshika.kapoor114@testmail.com", phone: "9876543314", concern: "Thyroid", age: 41, gender: "Female", state: "Delhi", address: "Patel Nagar" },
  { full_name: "Anuj Mishra", email: "anuj.mishra115@testmail.com", phone: "9876543315", concern: "Cold", age: 35, gender: "Male", state: "Uttar Pradesh", address: "Sitapur" },
  { full_name: "Anusha Nair", email: "anusha.nair116@testmail.com", phone: "9876543316", concern: "Diabetes", age: 54, gender: "Female", state: "Kerala", address: "Alappuzha" },
  { full_name: "Arpit Jain", email: "arpit.jain117@testmail.com", phone: "9876543317", concern: "Migraine", age: 32, gender: "Male", state: "Delhi", address: "Shastri Nagar" },
  { full_name: "Arti Sharma", email: "arti.sharma118@testmail.com", phone: "9876543318", concern: "Weakness", age: 47, gender: "Female", state: "Rajasthan", address: "Alwar" },
  { full_name: "Arun Verma", email: "arun.verma119@testmail.com", phone: "9876543319", concern: "Knee pain", age: 59, gender: "Male", state: "Delhi", address: "Najafgarh" },
  { full_name: "Asha Singh", email: "asha.singh120@testmail.com", phone: "9876543320", concern: "Allergy", age: 28, gender: "Female", state: "Uttar Pradesh", address: "Faizabad" },
  { full_name: "Ashish Gupta", email: "ashish.gupta121@testmail.com", phone: "9876543321", concern: "Fever", age: 36, gender: "Male", state: "Delhi", address: "Kalkaji" },
  { full_name: "Ashok Yadav", email: "ashok.yadav122@testmail.com", phone: "9876543322", concern: "Joint pain", age: 61, gender: "Male", state: "Haryana", address: "Bhiwani" },
  { full_name: "Ashwini Patel", email: "ashwini.patel123@testmail.com", phone: "9876543323", concern: "Skin allergy", age: 34, gender: "Female", state: "Gujarat", address: "Jamnagar" },
  { full_name: "Atul Sharma", email: "atul.sharma124@testmail.com", phone: "9876543324", concern: "Stomach ache", age: 42, gender: "Male", state: "Delhi", address: "Palam" },
  { full_name: "Babita Kumari", email: "babita.kumari125@testmail.com", phone: "9876543325", concern: "Fever", age: 39, gender: "Female", state: "Bihar", address: "Begusarai" },
  { full_name: "Bharat Singh", email: "bharat.singh126@testmail.com", phone: "9876543326", concern: "Back pain", age: 48, gender: "Male", state: "Rajasthan", address: "Sikar" },
  { full_name: "Bharti Gupta", email: "bharti.gupta127@testmail.com", phone: "9876543327", concern: "Thyroid", age: 45, gender: "Female", state: "Delhi", address: "Kirti Nagar" },
  { full_name: "Bhavesh Shah", email: "bhavesh.shah128@testmail.com", phone: "9876543328", concern: "Diabetes", age: 58, gender: "Male", state: "Gujarat", address: "Bhavnagar" },
  { full_name: "Bhawna Arora", email: "bhawna.arora129@testmail.com", phone: "9876543329", concern: "Anxiety", age: 24, gender: "Female", state: "Delhi", address: "Hari Nagar" },
  { full_name: "Brijesh Kumar", email: "brijesh.kumar130@testmail.com", phone: "9876543330", concern: "BP check", age: 53, gender: "Male", state: "Uttar Pradesh", address: "Gorakhpur" },
  { full_name: "Chandan Singh", email: "chandan.singh131@testmail.com", phone: "9876543331", concern: "Fever", age: 29, gender: "Male", state: "Delhi", address: "Badarpur" },
  { full_name: "Charu Jain", email: "charu.jain132@testmail.com", phone: "9876543332", concern: "Migraine", age: 31, gender: "Female", state: "Delhi", address: "Civil Lines" },
  { full_name: "Chetna Sharma", email: "chetna.sharma133@testmail.com", phone: "9876543333", concern: "Hair fall", age: 27, gender: "Female", state: "Haryana", address: "Panchkula" },
  { full_name: "Darpan Gupta", email: "darpan.gupta134@testmail.com", phone: "9876543334", concern: "Cold", age: 34, gender: "Male", state: "Delhi", address: "Mehrauli" },
  { full_name: "Deepika Singh", email: "deepika.singh135@testmail.com", phone: "9876543335", concern: "PCOS", age: 28, gender: "Female", state: "Uttar Pradesh", address: "Mathura" },
  { full_name: "Devendra Yadav", email: "devendra.yadav136@testmail.com", phone: "9876543336", concern: "Joint pain", age: 60, gender: "Male", state: "Bihar", address: "Chapra" },
  { full_name: "Dharmendra Kumar", email: "dharmendra.kumar137@testmail.com", phone: "9876543337", concern: "Stomach pain", age: 46, gender: "Male", state: "Delhi", address: "Seemapuri" },
  { full_name: "Dinesh Sharma", email: "dinesh.sharma138@testmail.com", phone: "9876543338", concern: "Diabetes", age: 55, gender: "Male", state: "Rajasthan", address: "Jhunjhunu" },
  { full_name: "Divya Gupta", email: "divya.gupta139@testmail.com", phone: "9876543339", concern: "Fever", age: 22, gender: "Female", state: "Delhi", address: "Geeta Colony" },
  { full_name: "Ekta Sharma", email: "ekta.sharma140@testmail.com", phone: "9876543340", concern: "Anxiety", age: 33, gender: "Female", state: "Delhi", address: "Sarita Vihar" },
  { full_name: "Gaurav Jain", email: "gaurav.jain141@testmail.com", phone: "9876543341", concern: "Back pain", age: 41, gender: "Male", state: "Haryana", address: "Rewari" },
  { full_name: "Geeta Devi", email: "geeta.devi142@testmail.com", phone: "9876543342", concern: "Weakness", age: 52, gender: "Female", state: "Bihar", address: "Siwan" },
  { full_name: "Girish Patel", email: "girish.patel143@testmail.com", phone: "9876543343", concern: "BP check", age: 49, gender: "Male", state: "Gujarat", address: "Mehsana" },
  { full_name: "Harish Sharma", email: "harish.sharma144@testmail.com", phone: "9876543344", concern: "Cold and cough", age: 37, gender: "Male", state: "Delhi", address: "Narela" },
  { full_name: "Heena Gupta", email: "heena.gupta145@testmail.com", phone: "9876543345", concern: "Skin rash", age: 26, gender: "Female", state: "Delhi", address: "Subhash Nagar" },
  { full_name: "Himanshu Verma", email: "himanshu.verma146@testmail.com", phone: "9876543346", concern: "Fever", age: 31, gender: "Male", state: "Uttar Pradesh", address: "Hapur" },
  { full_name: "Jyoti Singh", email: "jyoti.singh147@testmail.com", phone: "9876543347", concern: "Migraine", age: 35, gender: "Female", state: "Delhi", address: "Shahdara" },
  { full_name: "Kamal Sharma", email: "kamal.sharma148@testmail.com", phone: "9876543348", concern: "Joint pain", age: 62, gender: "Male", state: "Rajasthan", address: "Churu" },
  { full_name: "Kanchan Gupta", email: "kanchan.gupta149@testmail.com", phone: "9876543349", concern: "Thyroid", age: 43, gender: "Female", state: "Delhi", address: "Rohini Sector 3" },
  { full_name: "Kapil Yadav", email: "kapil.yadav150@testmail.com", phone: "9876543350", concern: "Chest pain", age: 50, gender: "Male", state: "Haryana", address: "Jhajjar" },
  { full_name: "Aakash Mehra", email: "aakash.mehra151@testmail.com", phone: "9876543351", concern: "Fever", age: 28, gender: "Male", state: "Delhi", address: "Govindpuri" },
  { full_name: "Aarti Singh", email: "aarti.singh152@testmail.com", phone: "9876543352", concern: "Migraine", age: 34, gender: "Female", state: "Uttar Pradesh", address: "Noida Sector 50" },
  { full_name: "Abhay Gupta", email: "abhay.gupta153@testmail.com", phone: "9876543353", concern: "Back pain", age: 45, gender: "Male", state: "Haryana", address: "Gurgaon Sector 10" },
  { full_name: "Abhilasha Jain", email: "abhilasha.jain154@testmail.com", phone: "9876543354", concern: "Thyroid", age: 39, gender: "Female", state: "Delhi", address: "Uttam Nagar" },
  { full_name: "Abhinav Sharma", email: "abhinav.sharma155@testmail.com", phone: "9876543355", concern: "Cold and cough", age: 31, gender: "Male", state: "Rajasthan", address: "Mansarovar" },
  { full_name: "Aishwarya Patel", email: "aishwarya.patel156@testmail.com", phone: "9876543356", concern: "Skin allergy", age: 26, gender: "Female", state: "Gujarat", address: "Nadiad" },
  { full_name: "Ajit Kumar", email: "ajit.kumar157@testmail.com", phone: "9876543357", concern: "Joint pain", age: 58, gender: "Male", state: "Bihar", address: "Arrah" },
  { full_name: "Akansha Verma", email: "akansha.verma158@testmail.com", phone: "9876543358", concern: "Hair fall", age: 24, gender: "Female", state: "Delhi", address: "Tilak Nagar" },
  { full_name: "Akhilesh Yadav", email: "akhilesh.yadav159@testmail.com", phone: "9876543359", concern: "BP check", age: 52, gender: "Male", state: "Uttar Pradesh", address: "Etawah" },
  { full_name: "Alok Mishra", email: "alok.mishra160@testmail.com", phone: "9876543360", concern: "Stomach pain", age: 40, gender: "Male", state: "Delhi", address: "Mayapuri" },
  { full_name: "Alka Sharma", email: "alka.sharma161@testmail.com", phone: "9876543361", concern: "Weakness", age: 47, gender: "Female", state: "Delhi", address: "Ashram" },
  { full_name: "Aman Verma", email: "aman.verma162@testmail.com", phone: "9876543362", concern: "Fever", age: 29, gender: "Male", state: "Haryana", address: "Faridabad Sector 9" },
  { full_name: "Amita Gupta", email: "amita.gupta163@testmail.com", phone: "9876543363", concern: "Anxiety", age: 36, gender: "Female", state: "Delhi", address: "Karawal Nagar" },
  { full_name: "Amol Patel", email: "amol.patel164@testmail.com", phone: "9876543364", concern: "Diabetes", age: 55, gender: "Male", state: "Gujarat", address: "Vapi" },
  { full_name: "Amrita Singh", email: "amrita.singh165@testmail.com", phone: "9876543365", concern: "Migraine", age: 32, gender: "Female", state: "Uttar Pradesh", address: "Lucknow" },
  { full_name: "Anant Jain", email: "anant.jain166@testmail.com", phone: "9876543366", concern: "Chest pain", age: 49, gender: "Male", state: "Delhi", address: "Rajinder Nagar" },
  { full_name: "Ananya Kapoor", email: "ananya.kapoor167@testmail.com", phone: "9876543367", concern: "PCOS", age: 23, gender: "Female", state: "Delhi", address: "Dwarka Sector 12" },
  { full_name: "Anil Verma", email: "anil.verma168@testmail.com", phone: "9876543368", concern: "Knee pain", age: 61, gender: "Male", state: "Rajasthan", address: "Jodhpur" },
  { full_name: "Anita Kumari", email: "anita.kumari169@testmail.com", phone: "9876543369", concern: "Fever", age: 38, gender: "Female", state: "Bihar", address: "Samastipur" },
  { full_name: "Ankit Gupta", email: "ankit.gupta170@testmail.com", phone: "9876543370", concern: "Back pain", age: 35, gender: "Male", state: "Delhi", address: "Badli" },
  { full_name: "Ankita Singh", email: "ankita.singh171@testmail.com", phone: "9876543371", concern: "Thyroid", age: 42, gender: "Female", state: "Delhi", address: "Janakpuri" },
  { full_name: "Anoop Sharma", email: "anoop.sharma172@testmail.com", phone: "9876543372", concern: "Cold", age: 33, gender: "Male", state: "Haryana", address: "Rohtak" },
  { full_name: "Ansh Gupta", email: "ansh.gupta173@testmail.com", phone: "9876543373", concern: "Allergy", age: 27, gender: "Male", state: "Delhi", address: "Mukherjee Nagar" },
  { full_name: "Anshu Jain", email: "anshu.jain174@testmail.com", phone: "9876543374", concern: "Hair fall", age: 30, gender: "Female", state: "Delhi", address: "Pitampura" },
  { full_name: "Anuj Sharma", email: "anuj.sharma175@testmail.com", phone: "9876543375", concern: "Fever", age: 41, gender: "Male", state: "Uttar Pradesh", address: "Kanpur" },
  { full_name: "Anupama Singh", email: "anupama.singh176@testmail.com", phone: "9876543376", concern: "Migraine", age: 37, gender: "Female", state: "Delhi", address: "Rohini Sector 11" },
  { full_name: "Anurag Verma", email: "anurag.verma177@testmail.com", phone: "9876543377", concern: "BP check", age: 54, gender: "Male", state: "Haryana", address: "Karnal" },
  { full_name: "Anuradha Gupta", email: "anuradha.gupta178@testmail.com", phone: "9876543378", concern: "Weakness", age: 48, gender: "Female", state: "Delhi", address: "Saket" },
  { full_name: "Arjun Singh", email: "arjun.singh179@testmail.com", phone: "9876543379", concern: "Joint pain", age: 60, gender: "Male", state: "Rajasthan", address: "Bikaner" },
  { full_name: "Arti Verma", email: "arti.verma180@testmail.com", phone: "9876543380", concern: "Anxiety", age: 26, gender: "Female", state: "Delhi", address: "Seelampur" },
  { full_name: "Arun Kumar", email: "arun.kumar181@testmail.com", phone: "9876543381", concern: "Diabetes", age: 56, gender: "Male", state: "Bihar", address: "Sitamarhi" },
  { full_name: "Asha Gupta", email: "asha.gupta182@testmail.com", phone: "9876543382", concern: "Fever", age: 34, gender: "Female", state: "Delhi", address: "Burari" },
  { full_name: "Ashish Jain", email: "ashish.jain183@testmail.com", phone: "9876543383", concern: "Back pain", age: 43, gender: "Male", state: "Delhi", address: "Shahdara" },
  { full_name: "Ashok Verma", email: "ashok.verma184@testmail.com", phone: "9876543384", concern: "Chest pain", age: 62, gender: "Male", state: "Haryana", address: "Hisar" },
  { full_name: "Ashwini Singh", email: "ashwini.singh185@testmail.com", phone: "9876543385", concern: "Thyroid", age: 39, gender: "Female", state: "Delhi", address: "Lajpat Nagar" },
  { full_name: "Atul Gupta", email: "atul.gupta186@testmail.com", phone: "9876543386", concern: "Cold", age: 31, gender: "Male", state: "Uttar Pradesh", address: "Varanasi" },
  { full_name: "Babita Sharma", email: "babita.sharma187@testmail.com", phone: "9876543387", concern: "Migraine", age: 45, gender: "Female", state: "Delhi", address: "Nangloi" },
  { full_name: "Balram Yadav", email: "balram.yadav188@testmail.com", phone: "9876543388", concern: "Knee pain", age: 57, gender: "Male", state: "Bihar", address: "Motihari" },
  { full_name: "Bhavna Jain", email: "bhavna.jain189@testmail.com", phone: "9876543389", concern: "Hair fall", age: 29, gender: "Female", state: "Delhi", address: "Krishna Nagar" },
  { full_name: "Bhupendra Singh", email: "bhupendra.singh190@testmail.com", phone: "9876543390", concern: "Fever", age: 36, gender: "Male", state: "Rajasthan", address: "Ajmer" },
  { full_name: "Bindu Gupta", email: "bindu.gupta191@testmail.com", phone: "9876543391", concern: "Weakness", age: 52, gender: "Female", state: "Delhi", address: "Madangir" },
  { full_name: "Brij Mohan", email: "brij.mohan192@testmail.com", phone: "9876543392", concern: "BP check", age: 59, gender: "Male", state: "Haryana", address: "Sirsa" },
  { full_name: "Chanchal Sharma", email: "chanchal.sharma193@testmail.com", phone: "9876543393", concern: "Anxiety", age: 28, gender: "Female", state: "Delhi", address: "Kalkaji" },
  { full_name: "Chetan Gupta", email: "chetan.gupta194@testmail.com", phone: "9876543394", concern: "Stomach pain", age: 40, gender: "Male", state: "Uttar Pradesh", address: "Ghaziabad" },
  { full_name: "Daya Singh", email: "daya.singh195@testmail.com", phone: "9876543395", concern: "Joint pain", age: 63, gender: "Male", state: "Delhi", address: "Najafgarh" },
  { full_name: "Deepa Verma", email: "deepa.verma196@testmail.com", phone: "9876543396", concern: "Thyroid", age: 41, gender: "Female", state: "Delhi", address: "Vasant Vihar" },
  { full_name: "Deepak Sharma", email: "deepak.sharma197@testmail.com", phone: "9876543397", concern: "Fever", age: 33, gender: "Male", state: "Haryana", address: "Panipat" },
  { full_name: "Dev Kumar", email: "dev.kumar198@testmail.com", phone: "9876543398", concern: "Cold and cough", age: 27, gender: "Male", state: "Bihar", address: "Katihar" },
  { full_name: "Dimple Gupta", email: "dimple.gupta199@testmail.com", phone: "9876543399", concern: "PCOS", age: 25, gender: "Female", state: "Delhi", address: "Mayur Vihar" },
  { full_name: "Dinesh Yadav", email: "dinesh.yadav200@testmail.com", phone: "9876543400", concern: "Diabetes", age: 58, gender: "Male", state: "Uttar Pradesh", address: "Gorakhpur" },
];

// ─── Doctor Data (38 records) ───
const doctors = [
  { name: "Dr. Amit Sharma", email: "amit.sharma@hospitaltest.com", phone: "9811000001", specialization: "General Physician", consultation_fee: 500 },
  { name: "Dr. Priya Verma", email: "priya.verma@hospitaltest.com", phone: "9811000002", specialization: "Gynecologist", consultation_fee: 700 },
  { name: "Dr. Rahul Gupta", email: "rahul.gupta@hospitaltest.com", phone: "9811000003", specialization: "Cardiologist", consultation_fee: 1200 },
  { name: "Dr. Neha Singh", email: "neha.singh@hospitaltest.com", phone: "9811000004", specialization: "Dermatologist", consultation_fee: 800 },
  { name: "Dr. Arjun Mehta", email: "arjun.mehta@hospitaltest.com", phone: "9811000005", specialization: "Orthopedic", consultation_fee: 900 },
  { name: "Dr. Kavita Nair", email: "kavita.nair@hospitaltest.com", phone: "9811000006", specialization: "Pediatrician", consultation_fee: 600 },
  { name: "Dr. Vikram Yadav", email: "vikram.yadav@hospitaltest.com", phone: "9811000007", specialization: "Neurologist", consultation_fee: 1500 },
  { name: "Dr. Sneha Patel", email: "sneha.patel@hospitaltest.com", phone: "9811000008", specialization: "Gynecologist", consultation_fee: 750 },
  { name: "Dr. Mohit Bansal", email: "mohit.bansal@hospitaltest.com", phone: "9811000009", specialization: "ENT Specialist", consultation_fee: 650 },
  { name: "Dr. Anjali Jain", email: "anjali.jain@hospitaltest.com", phone: "9811000010", specialization: "Dentist", consultation_fee: 500 },
  { name: "Dr. Karan Malhotra", email: "karan.malhotra@hospitaltest.com", phone: "9811000011", specialization: "Psychiatrist", consultation_fee: 1000 },
  { name: "Dr. Meera Iyer", email: "meera.iyer@hospitaltest.com", phone: "9811000012", specialization: "Endocrinologist", consultation_fee: 1100 },
  { name: "Dr. Rohan Das", email: "rohan.das@hospitaltest.com", phone: "9811000013", specialization: "Pulmonologist", consultation_fee: 900 },
  { name: "Dr. Pooja Kapoor", email: "pooja.kapoor@hospitaltest.com", phone: "9811000014", specialization: "Ophthalmologist", consultation_fee: 700 },
  { name: "Dr. Suresh Kumar", email: "suresh.kumar@hospitaltest.com", phone: "9811000015", specialization: "General Physician", consultation_fee: 500 },
  { name: "Dr. Nisha Arora", email: "nisha.arora@hospitaltest.com", phone: "9811000016", specialization: "Dermatologist", consultation_fee: 800 },
  { name: "Dr. Deepak Mishra", email: "deepak.mishra@hospitaltest.com", phone: "9811000017", specialization: "Cardiologist", consultation_fee: 1300 },
  { name: "Dr. Simran Kaur", email: "simran.kaur@hospitaltest.com", phone: "9811000018", specialization: "Gynecologist", consultation_fee: 750 },
  { name: "Dr. Rajesh Khanna", email: "rajesh.khanna@hospitaltest.com", phone: "9811000019", specialization: "Orthopedic", consultation_fee: 950 },
  { name: "Dr. Tanya Chawla", email: "tanya.chawla@hospitaltest.com", phone: "9811000020", specialization: "Dentist", consultation_fee: 550 },
  { name: "Dr. Naveen Joshi", email: "naveen.joshi@hospitaltest.com", phone: "9811000021", specialization: "Neurologist", consultation_fee: 1400 },
  { name: "Dr. Asha Rani", email: "asha.rani@hospitaltest.com", phone: "9811000022", specialization: "Pediatrician", consultation_fee: 600 },
  { name: "Dr. Varun Aggarwal", email: "varun.aggarwal@hospitaltest.com", phone: "9811000023", specialization: "ENT Specialist", consultation_fee: 650 },
  { name: "Dr. Rekha Pillai", email: "rekha.pillai@hospitaltest.com", phone: "9811000024", specialization: "Endocrinologist", consultation_fee: 1200 },
  { name: "Dr. Sunil Chauhan", email: "sunil.chauhan@hospitaltest.com", phone: "9811000025", specialization: "Pulmonologist", consultation_fee: 900 },
  { name: "Dr. Divya Bharti", email: "divya.bharti@hospitaltest.com", phone: "9811000026", specialization: "Gynecologist", consultation_fee: 700 },
  { name: "Dr. Imran Khan", email: "imran.khan@hospitaltest.com", phone: "9811000027", specialization: "Cardiologist", consultation_fee: 1250 },
  { name: "Dr. Komal Shah", email: "komal.shah@hospitaltest.com", phone: "9811000028", specialization: "Dermatologist", consultation_fee: 850 },
  { name: "Dr. Manish Pandey", email: "manish.pandey@hospitaltest.com", phone: "9811000029", specialization: "General Physician", consultation_fee: 550 },
  { name: "Dr. Alka Tiwari", email: "alka.tiwari@hospitaltest.com", phone: "9811000030", specialization: "Dentist", consultation_fee: 500 },
  { name: "Dr. Gaurav Singh", email: "gaurav.singh@hospitaltest.com", phone: "9811000031", specialization: "Orthopedic", consultation_fee: 900 },
  { name: "Dr. Shalini Roy", email: "shalini.roy@hospitaltest.com", phone: "9811000032", specialization: "Psychiatrist", consultation_fee: 1100 },
  { name: "Dr. Pradeep Nair", email: "pradeep.nair@hospitaltest.com", phone: "9811000033", specialization: "Neurologist", consultation_fee: 1500 },
  { name: "Dr. Riya Kapoor", email: "riya.kapoor@hospitaltest.com", phone: "9811000034", specialization: "Pediatrician", consultation_fee: 650 },
  { name: "Dr. Sanjay Verma", email: "sanjay.verma@hospitaltest.com", phone: "9811000035", specialization: "Cardiologist", consultation_fee: 1200 },
  { name: "Dr. Pankaj Arora", email: "pankaj.arora@hospitaltest.com", phone: "9811000036", specialization: "ENT Specialist", consultation_fee: 700 },
  { name: "Dr. Heena Sheikh", email: "heena.sheikh@hospitaltest.com", phone: "9811000037", specialization: "Dermatologist", consultation_fee: 800 },
  { name: "Dr. Rohit Jain", email: "rohit.jain@hospitaltest.com", phone: "9811000038", specialization: "Ophthalmologist", consultation_fee: 700 },
];


// ─── Helper: ensure columns exist ───
async function ensureColumns(conn) {
  const checks = [
    { table: 'patients', column: 'age', def: 'INT DEFAULT NULL' },
    { table: 'patients', column: 'gender', def: "VARCHAR(10) DEFAULT NULL" },
    { table: 'patients', column: 'state', def: "VARCHAR(100) DEFAULT NULL" },
    { table: 'patients', column: 'address', def: "TEXT DEFAULT NULL" },
    { table: 'patients', column: 'patient_uid', def: "VARCHAR(20) DEFAULT NULL" },
    { table: 'patients', column: 'notes', def: "TEXT DEFAULT NULL" },
    { table: 'patients', column: 'doctor_id', def: "INT DEFAULT NULL" },
    { table: 'patients', column: 'is_active', def: "TINYINT(1) DEFAULT 1" },
  ];

  for (const { table, column, def } of checks) {
    try {
      const [cols] = await conn.execute(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
      );
      if (cols.length === 0) {
        await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
        console.log(`  ✅ Added column ${table}.${column}`);
      }
    } catch (e) {
      // Column may already exist
    }
  }

  // Ensure unique index on patient_uid
  try {
    await conn.execute(`ALTER TABLE patients ADD UNIQUE KEY unique_patient_uid (patient_uid)`);
  } catch { /* may already exist */ }
}

// ─── Generate patient UID ───
function generateUID(id) {
  const year = new Date().getFullYear();
  return `PT-${year}-${String(id).padStart(6, '0')}`;
}

// ─── Main seed function ───
async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('📋 Step 1: Ensuring required columns exist...');
    await ensureColumns(conn);

    // ─── Seed Doctors ───
    console.log('\n👨‍⚕️ Step 2: Seeding doctors...');
    let doctorIds = [];
    let doctorsInserted = 0;
    let doctorsSkipped = 0;

    // Check once if platform_doctor_id column exists
    const [pdCols] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors' AND COLUMN_NAME = 'platform_doctor_id'`
    );
    const hasPlatformDoctorId = pdCols.length > 0;

    for (const doc of doctors) {
      const [existing] = await conn.execute(
        'SELECT id FROM doctors WHERE email = ?', [doc.email]
      );
      if (existing.length > 0) {
        doctorIds.push(existing[0].id);
        doctorsSkipped++;
        continue;
      }

      let insertSql, insertParams;
      if (hasPlatformDoctorId) {
        insertSql = `INSERT INTO doctors (name, email, phone, specialization, consultation_fee, is_active, platform_doctor_id, created_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`;
        insertParams = [doc.name, doc.email, doc.phone, doc.specialization, doc.consultation_fee];
      } else {
        insertSql = `INSERT INTO doctors (name, email, phone, specialization, consultation_fee, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, 1, NOW())`;
        insertParams = [doc.name, doc.email, doc.phone, doc.specialization, doc.consultation_fee];
      }

      const [result] = await conn.execute(insertSql, insertParams);
      doctorIds.push(result.insertId);
      doctorsInserted++;
    }
    console.log(`  ✅ Doctors: ${doctorsInserted} inserted, ${doctorsSkipped} skipped (already exist)`);

    // ─── Seed Patients ───
    console.log('\n🏥 Step 3: Seeding patients...');
    let patientsInserted = 0;
    let patientsSkipped = 0;

    for (let i = 0; i < patients.length; i++) {
      const p = patients[i];
      const [existing] = await conn.execute(
        'SELECT id FROM patients WHERE email = ?', [p.email]
      );
      if (existing.length > 0) {
        patientsSkipped++;
        continue;
      }

      // Randomly assign a doctor
      const doctorId = doctorIds.length > 0
        ? doctorIds[Math.floor(Math.random() * doctorIds.length)]
        : null;

      const [result] = await conn.execute(
        `INSERT INTO patients (full_name, email, phone, age, gender, state, address, notes, doctor_id, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [p.full_name, p.email, p.phone, p.age, p.gender, p.state, p.address, p.concern, doctorId]
      );

      // Generate and set UID
      const uid = generateUID(result.insertId);
      await conn.execute('UPDATE patients SET patient_uid = ? WHERE id = ?', [uid, result.insertId]);

      patientsInserted++;
    }
    console.log(`  ✅ Patients: ${patientsInserted} inserted, ${patientsSkipped} skipped (already exist)`);

    // ─── Backfill UIDs for any existing patients without one ───
    console.log('\n🔖 Step 4: Backfilling UIDs for existing patients...');
    const [noUid] = await conn.execute(
      `SELECT id FROM patients WHERE patient_uid IS NULL OR patient_uid = '' ORDER BY id ASC`
    );
    let backfilled = 0;
    for (const row of noUid) {
      const uid = generateUID(row.id);
      await conn.execute('UPDATE patients SET patient_uid = ? WHERE id = ?', [uid, row.id]);
      backfilled++;
    }
    console.log(`  ✅ Backfilled UIDs for ${backfilled} existing patients`);

    console.log('\n🎉 Seeding complete!');
    console.log(`   Schema: ${SCHEMA}`);
    console.log(`   Doctors: ${doctorsInserted + doctorsSkipped} total (${doctorsInserted} new)`);
    console.log(`   Patients: ${patientsInserted + patientsSkipped} total (${patientsInserted} new)`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
