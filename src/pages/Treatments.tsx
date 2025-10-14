import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { 
  Wind, HeartPulse, AlertCircle, Activity,
  TestTube, Stethoscope, Zap, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const Treatments = () => {
  const conditions = [
    {
      icon: Wind,
      title: "COPD Treatment",
      description: "Helping patients breathe easier with advanced therapies",
      slug: "copd-treatment"
    },
    {
      icon: HeartPulse,
      title: "Asthma Specialist",
      description: "Individualized care for chronic and seasonal asthma",
      slug: "asthma-treatment"
    },
    {
      icon: AlertCircle,
      title: "Tuberculosis (TB) Treatment",
      description: "Evidence-based, complete TB care",
      slug: "tb-treatment"
    },
    {
      icon: Activity,
      title: "Pneumonia Treatment",
      description: "Fast diagnosis and effective recovery plans",
      slug: "pneumonia-treatment"
    },
    {
      icon: TestTube,
      title: "Sarcoidosis Treatment",
      description: "Specialized care for rare lung conditions",
      slug: "sarcoidosis-treatment"
    },
    {
      icon: Stethoscope,
      title: "Pleural Diseases",
      description: "Treatment for effusion, pneumothorax & other pleural conditions",
      slug: "pleural-diseases"
    },
    {
      icon: Stethoscope,
      title: "Influenza / Seasonal Flu",
      description: "Advanced treatment to prevent complications",
      slug: "flu-treatment"
    },
    {
      icon: Zap,
      title: "Sleep Apnea",
      description: "CPAP therapy and expert care for sleep disorders",
      slug: "sleep-apnea"
    }
  ];

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Respiratory Conditions Treatment | Best Chest Physician in Delhi"
        description="Expert treatment for COPD, Asthma, TB, Pneumonia, and other respiratory conditions. Specialized pulmonary care in Delhi with advanced therapies."
        keywords="COPD treatment, asthma specialist, TB treatment, pneumonia care, respiratory conditions, chest physician Delhi"
      />
      <Header />
      <div className="pt-32">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <a href="/" className="text-white/80 hover:text-white transition-colors font-livvic">Home</a>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <span className="text-white font-livvic">Treatments</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-lexend">Conditions We Treat</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-livvic">
              We provide expert diagnosis and treatment for various respiratory conditions
            </p>
          </div>
        </section>

        {/* Conditions Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 font-lexend">Our Treatment Specialties</h2>
              <p className="text-lg text-muted-foreground font-livvic">
                Comprehensive care for all respiratory and pulmonary conditions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {conditions.map((condition, index) => {
                const IconComponent = condition.icon;
                return (
                  <Link key={index} to={`/conditions/${condition.slug}`}>
                    <Card className="p-6 text-center hover:shadow-strong transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-full">
                      <div className="w-16 h-16 bg-lung-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lung-blue-dark transition-colors">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3 font-lexend">
                        {condition.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-lexend">
                        {condition.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Treatments;
