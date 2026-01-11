import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppointmentBooking from "@/components/AppointmentBooking";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FloatingCTA from "@/components/FloatingCTA";
import Qualifications from "@/components/Qualifications";
import QuickStats from "@/components/QuickStats";
import { useTenantContent } from "@/hooks/useTenantContent";

const Index = () => {
  const { content, isDrMannTenant } = useTenantContent();

  // Dr. Mann's default map
  const DR_MANN_MAP =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.8596070160745!2d77.2063281!3d28.7101888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfde33ddc19cd%3A0xea30c606efbfc496!2sNorth%20Delhi%20Chest%20Centre%20and%20Quit%20Smoking%20Centre%20and%20Vaccination%20Centre!5e0!3m2!1sen!2sin!4v1730464800000!5m2!1sen!2sin";

  // Use tenant's map if configured, otherwise Dr. Mann's for that tenant, or undefined for others
  const mapSrc = isDrMannTenant 
    ? DR_MANN_MAP 
    : (content.mapEmbedUrl || undefined);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": content.siteName || (isDrMannTenant ? "Delhi Chest Physician - Best Chest Physician in Delhi" : "Medical Practice"),
    "description": content.description || (isDrMannTenant 
      ? "Leading chest physician & pulmonologist in Delhi providing expert treatment for COPD, Asthma, TB, Pneumonia, Sleep Apnea & all respiratory diseases"
      : "Professional medical services"),
    "url": "https://www.yoursite.com",
    "telephone": content.phone || (isDrMannTenant ? "+91-555-123-4567" : ""),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": content.address || (isDrMannTenant ? "123 Main Street, Medical District" : ""),
      "addressLocality": content.city || (isDrMannTenant ? "Delhi" : ""),
      "addressRegion": content.state || (isDrMannTenant ? "DL" : ""),
      "postalCode": content.pincode || (isDrMannTenant ? "110001" : ""),
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.7101888,
      "longitude": 77.2063281,
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        "opens": "09:00",
        "closes": "19:00",
      },
    ],
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "156",
      "bestRating": "5",
      "worstRating": "1",
    },
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={content.siteName || (isDrMannTenant ? "Best Chest Physician in Delhi | Pulmonologist | Lung Specialist" : "Medical Practice")}
        description={content.description || (isDrMannTenant ? "Leading chest physician & pulmonologist in Delhi. Expert treatment for COPD, Asthma, TB, Pneumonia, Sleep Apnea & all respiratory diseases. Book appointment today!" : "Professional medical services. Book an appointment today.")}
        keywords="chest physician delhi, pulmonologist delhi, lung specialist delhi, asthma doctor delhi, COPD treatment delhi, sleep study delhi, bronchoscopy delhi"
        canonicalUrl="https://www.yoursite.com/"
        structuredData={structuredData}
      />

      <Header />
      <FloatingCTA />

      <div className="pt-20">
        <Hero />
        <QuickStats />
        <Qualifications />
        <AppointmentBooking />
        <Services />

        {/* Pass the tenant-aware map src */}
        <Contact mapSrc={mapSrc} />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
