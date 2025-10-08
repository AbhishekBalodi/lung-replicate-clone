# Font Update - Replace font-livvic with font-lexend

This document tracks the global font replacement from Livvic to Lexend Deca across the entire website.

## Files Updated:

### Core Configuration
- ✅ index.html - Removed Livvic font import
- ✅ tailwind.config.ts - Removed Livvic from fontFamily
- ✅ index.css - Changed body font to Lexend Deca

### Components
- ✅ src/components/AppointmentBooking.tsx
- ✅ src/components/Footer.tsx
- ✅ src/components/Header.tsx (no livvic usage)
- ✅ src/components/Hero.tsx (no livvic usage)
- ✅ src/components/Services.tsx (no livvic usage)
- ✅ src/components/FloatingCTA.tsx (no livvic usage)

### Pages
- ✅ src/pages/Services.tsx
- ⏳ src/pages/ConditionDetail.tsx - NEEDS UPDATE
- ⏳ src/pages/ServiceDetail.tsx - NEEDS UPDATE
- ⏳ src/pages/Contact.tsx - NEEDS UPDATE
- ⏳ src/pages/BookAppointment.tsx - NEEDS UPDATE
- ⏳ src/pages/DoctorProfile.tsx - NEEDS UPDATE
- ⏳ src/pages/Qualifications.tsx - NEEDS UPDATE

## Global Replace Command:
Find: `font-livvic`
Replace: `font-lexend`

## Test Checklist:
- [ ] All pages render with Lexend Deca font
- [ ] No console warnings about missing fonts
- [ ] All text is readable (no white on white)
- [ ] CTA buttons have proper contrast
