import { Card } from "@/components/ui/card";
import { 
  Wind,
  Microscope,
  Moon,
  TestTube,
  Cigarette,
  HeartPulse
} from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  // Most popular respiratory services
  const services = [
    {
      icon: Wind,
      title: "Pulmonary Function Test (PFT)",
      description: "Comprehensive lung capacity and breathing assessment",
      slug: "pulmonary-function-test"
    },
    {
      icon: Microscope,
      title: "Bronchoscopy",
      description: "Advanced examination of airways and lungs",
      slug: "bronchoscopy"
    },
    {
      icon: Moon,
      title: "Sleep Study (Polysomnography)",
      description: "Detailed analysis of sleep patterns and disorders",
      slug: "sleep-study"
    },
    {
      icon: TestTube,
      title: "Allergy Testing",
      description: "Allergy testing for asthma & respiratory issues",
      slug: "allergy-testing"
    },
    {
      icon: Cigarette,
      title: "Smoking Cessation Programs",
      description: "Personalized programs to help you quit smoking",
      slug: "smoking-cessation"
    },
    {
      icon: HeartPulse,
      title: "Oxygen Therapy",
      description: "Supplemental oxygen treatment for respiratory conditions",
      slug: "oxygen-therapy"
    }
  ];


  return (
    <section className="pt-6 px-4 pb-0" id="services">
      <div className="container mx-auto max-w-6xl">
        {/* Services Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4">Our Medical Services</h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            We provide comprehensive healthcare services with advanced medical technology 
            and experienced professionals to ensure the best patient care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Link key={index} to={`/services/${service.slug}`}>
                <Card className="h-[180px] p-4 lg:p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 lg:hover:-translate-y-2 group cursor-pointer flex flex-col">
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="p-2 lg:p-3 bg-lung-blue/10 rounded-full group-hover:bg-lung-blue group-hover:text-white transition-all duration-300 flex-shrink-0">
                      <IconComponent className="h-6 w-6 lg:h-8 lg:w-8 text-lung-blue group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg lg:text-xl font-semibold mb-2 text-foreground line-clamp-2">{service.title}</h3>
                      <p className="text-sm lg:text-base text-muted-foreground line-clamp-3">{service.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;