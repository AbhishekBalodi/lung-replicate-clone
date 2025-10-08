import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, ArrowLeft } from "lucide-react";

const ServiceDetail = () => {
  const { slug } = useParams();

  const serviceDetails: Record<string, any> = {
    "pulmonary-function-test": {
      title: "Pulmonary Function Test (PFT)",
      description: "Comprehensive lung capacity and breathing assessment to diagnose and monitor respiratory conditions.",
      fullDescription: "A Pulmonary Function Test (PFT) is a non-invasive diagnostic procedure that measures how well your lungs work. The test provides detailed information about lung capacity, volume, rates of flow, and gas exchange. This helps our specialists diagnose conditions such as asthma, COPD, and other respiratory disorders.",
      benefits: [
        "Accurate diagnosis of lung conditions",
        "Monitor progression of lung diseases",
        "Evaluate treatment effectiveness",
        "Pre-surgical assessment",
        "Occupational health screening"
      ],
      whatToExpect: "The test typically takes 30-45 minutes. You'll breathe into a mouthpiece connected to a spirometer, following specific breathing instructions. The procedure is painless and safe."
    },
    "bronchoscopy": {
      title: "Bronchoscopy",
      description: "Advanced examination of airways and lungs using a flexible tube with a camera.",
      fullDescription: "Bronchoscopy is a procedure that allows our specialists to look inside your airways and lungs using a thin, flexible tube called a bronchoscope. This diagnostic tool helps identify lung diseases, infections, tumors, and other respiratory issues.",
      benefits: [
        "Direct visualization of airways",
        "Biopsy collection for accurate diagnosis",
        "Removal of foreign objects or mucus",
        "Treatment of airway bleeding",
        "Placement of stents in blocked airways"
      ],
      whatToExpect: "The procedure is performed under sedation for your comfort. A bronchoscope is gently inserted through your nose or mouth into your lungs. The entire procedure takes about 30-60 minutes."
    },
    "sleep-study": {
      title: "Sleep Study (Polysomnography)",
      description: "Detailed analysis of sleep patterns and disorders including sleep apnea.",
      fullDescription: "Polysomnography is a comprehensive sleep study that records your brain waves, oxygen levels, heart rate, and breathing patterns during sleep. This helps diagnose sleep disorders like sleep apnea, which can have serious health implications if left untreated.",
      benefits: [
        "Diagnose sleep apnea and other sleep disorders",
        "Identify causes of daytime fatigue",
        "Evaluate treatment effectiveness",
        "Reduce risk of cardiovascular complications",
        "Improve overall quality of life"
      ],
      whatToExpect: "You'll spend a night at our sleep lab where sensors are attached to monitor various body functions. The environment is designed to be comfortable and home-like. Our technicians monitor you throughout the night."
    },
    "allergy-testing": {
      title: "Allergy Testing for Asthma & Respiratory Issues",
      description: "Identify allergens triggering your respiratory symptoms through comprehensive testing.",
      fullDescription: "Allergy testing helps identify specific allergens that trigger asthma attacks and other respiratory problems. We use skin prick tests and blood tests to determine your allergic triggers, enabling targeted treatment and avoidance strategies.",
      benefits: [
        "Identify specific allergen triggers",
        "Develop personalized treatment plans",
        "Reduce asthma attacks and symptoms",
        "Improve quality of life",
        "Guide immunotherapy decisions"
      ],
      whatToExpect: "Skin prick testing involves placing small amounts of allergens on your skin. Results are available within 15-20 minutes. Blood tests may also be used and results typically take a few days."
    },
    "smoking-cessation": {
      title: "Smoking Cessation Programs",
      description: "Personalized programs combining counseling and medication to help you quit smoking.",
      fullDescription: "Our smoking cessation programs offer comprehensive support including behavioral counseling, nicotine replacement therapy, and prescription medications. We provide individualized treatment plans to help you successfully quit smoking and maintain long-term abstinence.",
      benefits: [
        "Reduce risk of lung disease and cancer",
        "Improve cardiovascular health",
        "Increase life expectancy",
        "Save money on cigarettes",
        "Improve overall quality of life"
      ],
      whatToExpect: "You'll work with our specialized team to develop a personalized quit plan. This includes regular follow-ups, counseling sessions, and medication management. Support is available throughout your quitting journey."
    },
    "oxygen-therapy": {
      title: "Oxygen Therapy",
      description: "Supplemental oxygen treatment for patients with chronic respiratory conditions.",
      fullDescription: "Oxygen therapy provides supplemental oxygen to patients whose blood oxygen levels are too low. This treatment is essential for managing conditions like COPD, pulmonary fibrosis, and severe asthma, helping improve quality of life and reduce complications.",
      benefits: [
        "Improve blood oxygen levels",
        "Reduce shortness of breath",
        "Increase energy and stamina",
        "Better sleep quality",
        "Reduce strain on heart and organs"
      ],
      whatToExpect: "We'll assess your oxygen needs through pulse oximetry and blood gas tests. If prescribed, we'll help you set up home oxygen equipment and teach you how to use it safely and effectively."
    },
    "lung-rehabilitation": {
      title: "Lung Rehabilitation Programs",
      description: "Comprehensive exercise and education programs to improve lung function and quality of life.",
      fullDescription: "Pulmonary rehabilitation is a supervised program that includes exercise training, education, and support. It's designed for people with chronic lung diseases to improve physical fitness, reduce symptoms, and enhance overall well-being.",
      benefits: [
        "Improve exercise capacity",
        "Reduce breathlessness",
        "Enhance quality of life",
        "Decrease hospitalizations",
        "Better disease management skills"
      ],
      whatToExpect: "The program typically lasts 6-12 weeks with sessions 2-3 times per week. Each session includes supervised exercise, breathing techniques, and educational components tailored to your needs."
    },
    "critical-care": {
      title: "Critical Care & ICU Support",
      description: "Advanced critical care for severe respiratory conditions and emergencies.",
      fullDescription: "Our critical care team provides intensive medical care for patients with severe respiratory failure, acute respiratory distress syndrome (ARDS), and other life-threatening lung conditions. We use advanced ventilator support and monitoring in our state-of-the-art ICU.",
      benefits: [
        "24/7 specialized monitoring",
        "Advanced ventilator support",
        "Multidisciplinary care team",
        "Latest life-support technologies",
        "Rapid response to complications"
      ],
      whatToExpect: "Patients requiring critical care are closely monitored with continuous assessment of vital signs, oxygen levels, and organ function. Family members receive regular updates and support from our care team."
    }
  };

  const service = slug ? serviceDetails[slug] : null;

  if (!service) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Service not found</h1>
          <Link to="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-32">
        {/* Breadcrumb */}
        <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="text-white/80 hover:text-white transition-colors font-livvic">Home</Link>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <Link to="/services" className="text-white/80 hover:text-white transition-colors font-livvic">Services</Link>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <span className="text-white font-livvic">{service.title}</span>
            </div>
            <Link to="/services">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-lung-blue">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Button>
            </Link>
          </div>
        </section>

        {/* Service Details */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-lexend">{service.title}</h1>
            <p className="text-xl text-muted-foreground mb-8 font-livvic">{service.description}</p>
            
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 font-lexend">About This Service</h2>
              <p className="text-muted-foreground mb-6 font-livvic leading-relaxed">{service.fullDescription}</p>
              
              <h3 className="text-xl font-bold text-foreground mb-4 font-lexend">Benefits</h3>
              <ul className="space-y-2 mb-6">
                {service.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-lung-blue mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-livvic">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold text-foreground mb-4 font-lexend">What to Expect</h3>
              <p className="text-muted-foreground font-livvic leading-relaxed">{service.whatToExpect}</p>
            </Card>

            <div className="text-center">
              <Link to="/book-appointment">
                <Button size="lg" className="bg-lung-blue hover:bg-lung-blue-dark">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;