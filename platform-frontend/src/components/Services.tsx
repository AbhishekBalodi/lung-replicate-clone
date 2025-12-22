import { Card } from "@/components/ui/card";
import { Activity, AlertCircle, Cigarette, HeartPulse, Microscope, Moon, TestTube, Wind } from "lucide-react";
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
    },
    {
      icon: Wind,
      title: "Lung Rehabilitation",
      description: "Exercise and education programs for lung health",
      slug: "lung-rehabilitation"
    },
    {
      icon: Microscope,
      title: "Critical Care Support",
      description: "Advanced critical care for severe respiratory conditions",
      slug: "critical-care"
    }
  ,
{
  icon: Activity,
  title: "Spirometry",
  description: "Accurate test to assess airflow and lung capacity",
  slug: "spirometry",
},
{
  icon: TestTube,
  title: "Pleural Aspiration",
  description: "Safe fluid removal from pleural space for relief and diagnosis",
  slug: "pleural-aspiration",
},
{
  icon: AlertCircle,
  title: "Intercostal Chest Tube (ICT) Insertion",
  description: "Chest drain placement to remove air, blood, or fluid",
  slug: "ict-insertion",
},
{
  icon: Microscope,
  title: "Pleuroscopy",
  description: "Minimally invasive visual examination of pleural cavity",
  slug: "pleuroscopy",
},
{
  icon: TestTube,
  title: "Arterial Blood Gas (ABG) Analysis",
  description: "On-site test for oxygen, CO₂, and pH to guide therapy",
  slug: "abg-analysis",
},
{
  icon: Moon,
  title: "CPAP & BiPAP Therapy",
  description: "Non-invasive breathing support for sleep apnea & COPD",
  slug: "cpap-bipap-therapy",
}];


  return (
    <section className="pt-6 px-4 pb-0" id="services">
      <div className="container mx-auto max-w-7xl">
        {/* Services Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4">Our Medical Services</h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            We provide comprehensive healthcare services with advanced medical technology 
            and experienced professionals to ensure the best patient care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Link key={index} to={`/services/${service.slug}`}>
                <Card className="p-6 text-center hover:shadow-strong transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-[280px] flex flex-col">
                  <div className="w-16 h-16 bg-lung-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lung-blue-dark transition-colors flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3 font-manrope line-clamp-2 flex-shrink-0">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-manrope line-clamp-3">
                    {service.description}
                  </p>
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