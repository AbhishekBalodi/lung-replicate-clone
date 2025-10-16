import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppointmentBooking from "@/components/AppointmentBooking";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FloatingCTA from "@/components/FloatingCTA";
import Qualifications from "@/components/Qualifications";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Delhi Chest Physician - Best Chest Physician in Delhi",
    "description": "Leading chest physician & pulmonologist in Delhi providing expert treatment for COPD, Asthma, TB, Pneumonia, Sleep Apnea & all respiratory diseases",
    "url": "https://www.yoursite.com",
    "telephone": "+91-555-123-4567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street, Medical District",
      "addressLocality": "Delhi",
      "addressRegion": "DL",
      "postalCode": "110001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    }
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
      <div className="pt-32">
      <Hero />
      <Qualifications />
      <AppointmentBooking />
      <Services />
        <Contact />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
