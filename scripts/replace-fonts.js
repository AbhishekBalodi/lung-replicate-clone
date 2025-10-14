const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/BookAppointment.tsx',
  'src/pages/ConditionDetail.tsx',
  'src/pages/Contact.tsx',
  'src/pages/DoctorProfile.tsx',
  'src/pages/Qualifications.tsx',
  'src/pages/ServiceDetail.tsx',
  'src/pages/Treatments.tsx',
  'src/pages/Services.tsx'
];

filesToUpdate.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace font-lexend with font-manrope
    content = content.replace(/font-lexend/g, 'font-manrope');
    
    // Replace font-livvic with font-manrope
    content = content.replace(/font-livvic/g, 'font-manrope');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
});

console.log('\n✨ Font replacement complete!');
