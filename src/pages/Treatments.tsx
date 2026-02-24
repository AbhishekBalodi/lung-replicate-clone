import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Activity, AlertCircle, ChevronRight, HeartPulse, Microscope, Star, Stethoscope, TestTube, User, Wind, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { getDevTenantCode } from '@/components/DevTenantSwitcher';
import { useCustomAuth } from '@/contexts/CustomAuthContext';

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
    },

    {
  icon: Activity,
  title: "Eosinophilic Lung Diseases",
  description: "Diagnosis and care for eosinophilic pneumonias",
  slug: "eosinophilic-lung-diseases",
},
{
  icon: AlertCircle,
  title: "Multidrug-Resistant Tuberculosis (MDR-TB)",
  description: "Specialized care for multidrug-resistant tuberculosis",
  slug: "mdr-tb-treatment",
},
{
  icon: Microscope,
  title: "Lung Cancers",
  description: "Evaluation, staging, and coordinated treatment",
  slug: "lung-cancer",
},
{
  icon: TestTube,
  title: "Fungal Lung Diseases",
  description: "Expert diagnosis and antifungal therapy",
  slug: "fungal-lung-diseases",
},
{
  icon: AlertCircle,
  title: "Parasitic Lung Diseases",
  description: "Targeted therapy for rare parasitic infections",
  slug: "parasitic-lung-diseases",
}

  ];

  // Tenant-aware: only show testimonials for Dr Mann
  const { tenantInfo } = useCustomAuth();
  const tenantCode = getDevTenantCode() || tenantInfo?.code || 'doctor_mann';
  const isDrMann = tenantCode === 'doctor_mann' || tenantCode === 'drmann';

  const testimonials = isDrMann ? [
    {
      text: "I was struggling with chronic asthma for years. Dr. Mann provided the right treatment and I finally feel relief. Best chest specialist in Delhi!",
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
  ] : [];

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Respiratory Conditions Treatment | Best Chest Physician in Delhi"
        description="Expert treatment for COPD, Asthma, TB, Pneumonia, and other respiratory conditions. Specialized pulmonary care in Delhi with advanced therapies."
        keywords="COPD treatment, asthma specialist, TB treatment, pneumonia care, respiratory conditions, chest physician Delhi"
      />
      <Header />
      <div className="pt-20">
        {/* Hero Section */}
        <section id="treatments-top" className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <a href="/" className="text-white/80 hover:text-white transition-colors font-manrope text-sm">Home</a>
              <ChevronRight className="h-3 w-3 text-white/60" />
              <span className="text-white font-manrope text-sm">Treatments</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2 font-manrope">Conditions We Treat</h1>
            <p className="text-base text-white/90 max-w-3xl mx-auto font-manrope">
              We provide expert diagnosis and treatment for various respiratory conditions
            </p>
          </div>
        </section>

        {/* Conditions Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 font-manrope">Our Treatment Specialties</h2>
              <p className="text-lg text-muted-foreground font-manrope">
                Comprehensive care for all respiratory and pulmonary conditions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {conditions.map((condition, index) => {
                const IconComponent = condition.icon;
                return (
                  <Link key={index} to={`/conditions/${condition.slug}`}>
                    <Card className="p-6 text-center hover:shadow-strong transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-[280px] flex flex-col">
                      <div className="w-16 h-16 bg-lung-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lung-blue-dark transition-colors flex-shrink-0">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3 font-manrope line-clamp-2 flex-shrink-0">
                        {condition.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-manrope line-clamp-3">
                        {condition.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {testimonials.length > 0 && (
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
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Treatments;
