# Font Update - Replace Lexend Deca with Manrope

This document tracks the global font replacement from Lexend Deca to Manrope across the entire website.

## Files Updated:

### Core Configuration
- ✅ index.html - Updated Google Font import to Manrope
- ✅ tailwind.config.ts - Changed font family to Manrope
- ✅ index.css - Changed body and heading fonts to Manrope

### Components
- ✅ src/components/AppointmentBooking.tsx - Replaced font-lexend with font-manrope
- ✅ src/components/Footer.tsx - Replaced font-lexend with font-manrope
- ✅ src/components/LoginModal.tsx - Replaced font-lexend with font-manrope
- ✅ src/components/SignUpModal.tsx - Replaced font-lexend with font-manrope

### Pages (Need bulk replacement of font-lexend and font-livvic)
- ⏳ src/pages/BookAppointment.tsx
- ⏳ src/pages/ConditionDetail.tsx
- ⏳ src/pages/Contact.tsx
- ⏳ src/pages/DoctorProfile.tsx
- ⏳ src/pages/Qualifications.tsx
- ⏳ src/pages/ServiceDetail.tsx
- ⏳ src/pages/Treatments.tsx
- ⏳ src/pages/Services.tsx (if has font references)

## Global Replace Instructions:
Find: `font-lexend` OR `font-livvic`
Replace: `font-manrope`

## Verification:
- [ ] All pages render with Manrope font
- [ ] No console warnings about missing fonts
- [ ] Typography looks consistent across site
