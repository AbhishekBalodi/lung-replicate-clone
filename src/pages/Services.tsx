import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { 
  Syringe, Hand, Wind, Droplets, Activity, Stethoscope, 
  Search, Heart, CloudRain, Zap, Download, Users, 
  TestTube, ChevronRight 
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Syringe,
      title: "Vaccination for Lung Infections",
      description: "Prevent respiratory diseases"
    },
    {
      icon: Hand,
      title: "Allergy Testing (S.P.T)",
      description: "Detect allergic reactions"
    },
    {
      icon: Wind,
      title: "Pulmonary Function Test (PFT)",
      description: "Measure lung capacity"
    },
    {
      icon: Droplets,
      title: "Pleural Fluid Tapping",
      description: "Drain chest fluid"
    },
    {
      icon: Activity,
      title: "Chest Tube Insertion",
      description: "Treat collapsed lung"
    },
    {
      icon: Stethoscope,
      title: "Sleep Study Testing",
      description: "Analyze sleep patterns"
    },
    {
      icon: Search,
      title: "Thoracoscopy",
      description: "Examine chest cavity"
    },
    {
      icon: Heart,
      title: "ECG",
      description: "Monitor heart rhythm"
    },
    {
      icon: CloudRain,
      title: "FeNO",
      description: "Measure airway inflammation"
    },
    {
      icon: Zap,
      title: "FOT",
      description: "Assess airway resistance"
    },
    {
      icon: Download,
      title: "EBUS",
      description: "Endoscopic ultrasound biopsy"
    },
    {
      icon: Users,
      title: "6 Minutes Walk Test",
      description: "Evaluate physical endurance"
    },
    {
      icon: TestTube,
      title: "Lung Biopsy",
      description: "Analyze lung tissue"
    },
    {
      icon: CloudRain,
      title: "Nebulization Therapy",
      description: "Relieve breathing difficulties"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <a href="/" className="text-white/80 hover:text-white transition-colors font-livvic">Home</a>
            <ChevronRight className="h-4 w-4 text-white/60" />
            <span className="text-white font-livvic">Our Services</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-lexend">Our Services</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-livvic">
            Discover how we provide advanced pulmonary care and holistic treatment
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-lexend">What We Offer</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-strong transition-shadow group">
                  <div className="w-16 h-16 bg-lung-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lung-blue-dark transition-colors">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3 font-lexend">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-livvic">
                    {service.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;