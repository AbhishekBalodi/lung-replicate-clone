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

const Index = () => {
  // Single source of truth for the clinic location (same as Contact page)
  const MAP_EMBED_SRC =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.8596070160745!2d77.2063281!3d28.7101888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfde33ddc19cd%3A0xea30c606efbfc496!2sNorth%20Delhi%20Chest%20Centre%20and%20Quit%20Smoking%20Centre%20and%20Vaccination%20Centre!5e0!3m2!1sen!2sin!4v1730464800000!5m2!1sen!2sin";
                  
  // (Alternatively, you can use your long Google “Place” URL here.)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Delhi Chest Physician - Best Chest Physician in Delhi",
    "description":
      "Leading chest physician & pulmonologist in Delhi providing expert treatment for COPD, Asthma, TB, Pneumonia, Sleep Apnea & all respiratory diseases",
    "url": "https://www.yoursite.com",
    "telephone": "+91-555-123-4567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street, Medical District",
      "addressLocality": "Delhi",
      "addressRegion": "DL",
      "postalCode": "110001",
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
        title="Best Chest Physician in Delhi | Pulmonologist | Lung Specialist"
        description="Leading chest physician & pulmonologist in Delhi. Expert treatment for COPD, Asthma, TB, Pneumonia, Sleep Apnea & all respiratory diseases. Book appointment today!"
        keywords="chest physician delhi, pulmonologist delhi, lung specialist delhi, asthma doctor delhi, COPD treatment delhi, sleep study delhi, bronchoscopy delhi"
        canonicalUrl="https://www.yoursite.com/"
        structuredData={structuredData}
      />

      <Header />
      <FloatingCTA />

      <div className="pt-0">
        <Hero />
        <QuickStats />
        <Qualifications />
        <AppointmentBooking />
        <Services />

        {/* Pass the exact same map src used on the Contact page */}
        <Contact mapSrc={MAP_EMBED_SRC} />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
