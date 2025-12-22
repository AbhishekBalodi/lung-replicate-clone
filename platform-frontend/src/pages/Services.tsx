import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { 
  Wind, Microscope, Moon, TestTube, Cigarette, 
  HeartPulse, Activity, AlertCircle, ChevronRight,
  Stethoscope, User, Star, Search, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
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
      icon: Activity,
      title: "Lung Rehabilitation Programs",
      description: "Exercise and education programs for lung health",
      slug: "lung-rehabilitation"
    },
    {
      icon: AlertCircle,
      title: "Critical Care & ICU Support",
      description: "Advanced critical care for severe respiratory conditions",
      slug: "critical-care"
    },
    {
      icon: Search,
      title: "Lung Cancer Screening",
      description: "Early detection with low-dose CT scan for high-risk patients",
      slug: "lung-cancer-screening"
    },

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
}

  ];

  const testimonials = [
    {
      text: "I was struggling with chronic asthma for years. Dr. Smith provided the right treatment and I finally feel relief. Best chest specialist in Delhi!",
      author: "Rajesh Kumar",
      location: "South Delhi",
      rating: 5
    },
    {
      text: "Highly professional and empathetic doctor. Got the best care for my father's COPD.",
      author: "Priya Sharma",
      location: "Delhi NCR",
      rating: 5
    },
    {
      text: "The lung rehabilitation program has been life-changing. I can now do activities I couldn't do before.",
      author: "Amit Patel",
      location: "East Delhi",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20">
      {/* Hero Section */}
      <section id="services-top" className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <a href="/" className="text-white/80 hover:text-white transition-colors font-manrope text-sm">Home</a>
            <ChevronRight className="h-3 w-3 text-white/60" />
            <span className="text-white font-manrope text-sm">Our Services</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2 font-manrope">Our Services</h1>
          <p className="text-base text-white/90 max-w-3xl mx-auto font-manrope">
            Discover how we provide advanced pulmonary care and holistic treatment
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-manrope">Services Offered</h2>
            <p className="text-lg text-muted-foreground font-manrope">
              Our clinic provides a wide range of pulmonary and respiratory services in Delhi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Patient Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-manrope">Patient Testimonials</h2>
            <p className="text-lg text-muted-foreground font-manrope">
              Hear from our satisfied patients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-strong transition-shadow">
                <div className="flex gap-1 mb-4 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6 font-manrope text-center">
                  "{testimonial.text}"
                </p>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <User className="h-4 w-4 text-lung-blue" />
                    <p className="font-semibold text-foreground font-manrope">{testimonial.author}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-manrope">{testimonial.location}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default Services;