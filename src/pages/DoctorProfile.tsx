import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Users, Award, CheckCircle, Calendar, Heart, Briefcase, GraduationCap, Grid3X3, MapPin, Phone, Mail, CreditCard, Shield, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import drMannImage from "@/assets/dr-mann-passport.jpg";
import { getDevTenantCode } from '@/components/DevTenantSwitcher';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useTenantContent } from '@/hooks/useTenantContent';

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const { tenantInfo } = useCustomAuth();
  const { content, isDrMannTenant, hasContent } = useTenantContent();
  const tenantCode = getDevTenantCode() || tenantInfo?.code || 'doctor_mann';
  const [doctorData, setDoctorData] = useState<any | null>(null);
  
  // Determine display values based on tenant
  const profileImage = isDrMannTenant 
    ? drMannImage 
    : (content.doctorImageUrl || null);
  
  const displayName = isDrMannTenant 
    ? 'Dr. Paramjeet Singh Mann' 
    : (content.doctorName || 'Doctor Name');
  
  const specialization = isDrMannTenant 
    ? 'MD (Tuberculosis & Chest Diseases), FCCP | Chest Physician & Pulmonologist'
    : (content.qualifications ? `${content.qualifications} | ${content.specialization || 'Specialist'}` : content.specialization || 'Medical Specialist');
  
  const experience = isDrMannTenant ? '40+' : (content.experience || 'N/A');
  
  const bioText = isDrMannTenant 
    ? `Dr. Paramjeet Singh Mann is a highly distinguished chest physician and pulmonologist with over 40 years of exceptional experience in respiratory medicine, sleep medicine, and critical care. He holds an M.D. in Tuberculosis and Chest Diseases from the prestigious Vallabhbhai Patel Chest Institute, Delhi University (WHO listed and Medical Council of India recognized). Dr. Mann has received numerous accolades including the Fellowship of the American College of Chest Physicians (FCCP) in 2009, the Rajshiri Dr. Ram Kishore Memorial Medal for topping the MD examination in 1988, and the Best Doctor Award in Oman in 1998. His extensive clinical expertise spans diagnosis and treatment of COPD, asthma, tuberculosis, pneumonia, sleep disorders, and all respiratory conditions, ensuring the highest standard of patient care.`
    : (content.bio || 'Professional biography not configured yet. Please update in Website Settings.');

  // Contact info
  const contactInfo = {
    clinicName: isDrMannTenant ? 'North Delhi Chest Centre' : (content.siteName || 'Clinic'),
    address: isDrMannTenant ? '321, Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009' : (content.address ? `${content.address}, ${content.city || ''}-${content.pincode || ''}` : 'Address not configured'),
    phone: isDrMannTenant ? '+91-9810589799' : (content.phone || 'Not configured'),
    altPhone: isDrMannTenant ? '+91-9810588799, +91-011-65101829' : (content.altPhone || ''),
    email: isDrMannTenant ? 'psmann58@yahoo.com' : (content.email || 'Not configured'),
  };

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const headers: Record<string,string> = {};
        const tenantCodeHeader = getDevTenantCode();
        if (tenantCodeHeader) headers['X-Tenant-Code'] = tenantCodeHeader;
        const res = await fetch(`/api/doctors`, { credentials: 'include', headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.doctors) && data.doctors.length) {
            setDoctorData(data.doctors[0]);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    if (tenantInfo?.type === 'hospital') loadDoctors();
  }, [tenantInfo]);

  // Tenant-aware stats
  const stats = isDrMannTenant ? [
    { label: "Patients Treated", value: "50,000+", icon: Users, color: "text-lung-blue" },
    { label: "Years Experience", value: "40+", icon: Calendar, color: "text-lung-green" },
    { label: "Patient Rating", value: "4.9/5", icon: Star, color: "text-yellow-500" },
    { label: "Success Rate", value: "98%", icon: CheckCircle, color: "text-lung-green" }
  ] : [
    { label: "Patients Treated", value: "-", icon: Users, color: "text-lung-blue" },
    { label: "Years Experience", value: content.experience || "-", icon: Calendar, color: "text-lung-green" },
    { label: "Patient Rating", value: "-", icon: Star, color: "text-yellow-500" },
    { label: "Success Rate", value: "-", icon: CheckCircle, color: "text-lung-green" }
  ];

  // Tenant-aware testimonials
  const testimonials = isDrMannTenant ? [
    { text: "I was struggling with chronic asthma for years. Dr. Mann provided the right treatment and I finally feel relief. Best chest specialist in Delhi!", author: "Rajesh Kumar", location: "South Delhi", rating: 5 },
    { text: "Highly professional and empathetic doctor. Got the best care for my father's COPD.", author: "Priya Sharma", location: "Delhi NCR", rating: 5 },
    { text: "The lung rehabilitation program has been life-changing. I can now do activities I couldn't do before.", author: "Amit Patel", location: "East Delhi", rating: 5 }
  ] : [];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20">
        {/* Doctor Hero Section */}
      <section className="bg-gradient-to-r from-lung-blue to-lung-blue/80 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-full bg-white p-2">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={displayName} 
                    onError={(e: any) => { e.currentTarget.onerror = null; e.currentTarget.src = drMannImage; }}
                    className="w-full h-full rounded-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                    <User className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <span className="bg-lung-green text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {content.specialization || 'Specialist'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-white mb-4 font-manrope">
                {displayName}
              </h1>
              <p className="text-white/90 text-lg mb-6 font-livvic">
                {specialization}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{experience} Years Experience</span>
                </div>
                {isDrMannTenant && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>FCCP, USA</span>
                  </div>
                )}
              </div>
              
              {isDrMannTenant && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-white/90">(4.9/5 - 1500 reviews)</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book-appointment">
                  <Button className="bg-lung-green hover:bg-lung-green-light text-white px-8 py-3 rounded-lg w-full">
                    Book Appointment
                  </Button>
                </Link>
                {contactInfo.phone !== 'Not configured' && (
                  <a href={`tel:${contactInfo.phone}`}>
                    <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-lung-blue px-8 py-3 w-full">
                      Call Now
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex gap-8 mb-8 border-b">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`py-4 px-2 font-medium transition-colors ${
                    activeTab === "about" 
                      ? "text-lung-blue border-b-2 border-lung-blue" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  About
                </button>
                {testimonials.length > 0 && (
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-4 px-2 font-medium transition-colors ${
                      activeTab === "reviews" 
                        ? "text-lung-blue border-b-2 border-lung-blue" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Reviews & Feedback
                  </button>
                )}
              </div>

              {activeTab === "about" && (
                <div className="space-y-12">
                  {/* Professional Summary */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Heart className="h-6 w-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-foreground font-lexend">Professional Summary</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-manrope">
                      {bioText}
                    </p>
                  </div>

                  {/* Work Experience - only for Dr Mann */}
                  {isDrMannTenant && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Briefcase className="h-6 w-6 text-lung-blue" />
                        <h2 className="text-2xl font-bold text-foreground font-lexend">Work Experience</h2>
                      </div>
                      <div className="space-y-6">
                        <div className="border-l-4 border-lung-blue pl-6">
                          <h3 className="text-xl font-bold text-foreground font-lexend mb-2">Director, North Delhi Chest Centre</h3>
                          <p className="text-lung-blue font-medium mb-2">Present</p>
                          <p className="text-muted-foreground font-livvic">
                            Leading comprehensive respiratory care, pulmonary function testing, bronchoscopy, sleep studies, and critical care services in North Delhi
                          </p>
                        </div>
                        <div className="border-l-4 border-lung-blue pl-6">
                          <h3 className="text-xl font-bold text-foreground font-lexend mb-2">Regional Tuberculosis Focal Point</h3>
                          <p className="text-lung-blue font-medium mb-2">South Sharqia Region, Sultanate of Oman (1991-2004)</p>
                          <p className="text-muted-foreground font-livvic">
                            Recognized by WHO Tuberculosis Control Program for outstanding efforts in tuberculosis control and management
                          </p>
                        </div>
                        <div className="border-l-4 border-lung-blue pl-6">
                          <h3 className="text-xl font-bold text-foreground font-lexend mb-2">Medical Officer</h3>
                          <p className="text-lung-blue font-medium mb-2">Rajan Babu Tuberculosis Hospital (1985-1990)</p>
                          <p className="text-muted-foreground font-livvic">
                            One of Asia's largest tuberculosis hospitals affiliated with Vallabhbhai Patel Chest Institute, University of Delhi
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Education & Training - only for Dr Mann */}
                  {isDrMannTenant && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <GraduationCap className="h-6 w-6 text-lung-green" />
                        <h2 className="text-2xl font-bold text-foreground font-lexend">Education & Training</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 bg-lung-green/5 border-lung-green/20">
                          <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">MD (Tuberculosis & Chest Diseases)</h3>
                          <p className="text-lung-green font-medium mb-2">Vallabhbhai Patel Chest Institute, Delhi University</p>
                          <p className="text-sm text-muted-foreground font-livvic">1988 | WHO Listed & MCI Recognized | Top Rank</p>
                        </Card>
                        <Card className="p-6 bg-lung-green/5 border-lung-green/20">
                          <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">Diploma (TB & Chest Diseases)</h3>
                          <p className="text-lung-green font-medium mb-2">Vallabhbhai Patel Chest Institute, Delhi University</p>
                          <p className="text-sm text-muted-foreground font-livvic">1985 | WHO Listed & MCI Recognized</p>
                        </Card>
                        <Card className="p-6 bg-lung-green/5 border-lung-green/20">
                          <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">MBBS</h3>
                          <p className="text-lung-green font-medium mb-2">Maulana Azad Medical College, Delhi University</p>
                          <p className="text-sm text-muted-foreground font-livvic">1981 | WHO Listed & MCI Recognized</p>
                        </Card>
                        <Card className="p-6 bg-lung-green/5 border-lung-green/20">
                          <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">FCCP</h3>
                          <p className="text-lung-green font-medium mb-2">American College of Chest Physicians</p>
                          <p className="text-sm text-muted-foreground font-livvic">2009 | Fellowship</p>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Specialty Interests - only for Dr Mann */}
                  {isDrMannTenant && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Grid3X3 className="h-6 w-6 text-lung-purple" />
                        <h2 className="text-2xl font-bold text-foreground font-lexend">Specialty Interests</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { name: "Tuberculosis Management", link: "/conditions/tb-treatment" },
                          { name: "COPD Treatment", link: "/conditions/copd-treatment" },
                          { name: "Asthma Care", link: "/conditions/asthma-treatment" },
                          { name: "Pneumonia", link: "/conditions/pneumonia-treatment" },
                          { name: "Sleep Disorders", link: "/conditions/sleep-apnea" },
                          { name: "Critical Care", link: "/services/critical-care" },
                          { name: "Bronchoscopy", link: "/services/bronchoscopy" },
                          { name: "Pulmonary Function Tests", link: "/services/pulmonary-function-test" },
                          { name: "Respiratory Medicine", link: "/" }
                        ].map((specialty, index) => (
                          <Link key={index} to={specialty.link}>
                            <Card className="p-4 bg-lung-purple/5 border-lung-purple/20 text-center hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer">
                              <p className="text-lung-purple font-medium font-livvic">{specialty.name}</p>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Memberships - only for Dr Mann */}
                  {isDrMannTenant && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Users className="h-6 w-6 text-lung-blue" />
                        <h2 className="text-2xl font-bold text-foreground font-lexend">Professional Memberships</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "American College of Chest Physicians (ACCP)",
                          "WHO Tuberculosis Control Program",
                          "European Respiratory Society (ERS)",
                          "Medical Council of India"
                        ].map((membership, index) => (
                          <Card key={index} className="p-4 bg-lung-blue/10 border-lung-blue/20">
                            <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-lung-blue" />
                              <p className="text-lung-blue font-medium font-livvic">{membership}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Placeholder for non-Dr Mann tenants */}
                  {!isDrMannTenant && !hasContent && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground max-w-md">
                        Detailed profile information will appear here once configured in the admin dashboard under Website Settings.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && testimonials.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 font-lexend">Patient Testimonials</h2>
                  <div className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                      <Card key={index} className="p-6 hover:shadow-strong transition-shadow">
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-muted-foreground italic mb-6 font-manrope">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-lung-blue/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-lung-blue" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground font-manrope">{testimonial.author}</p>
                            <p className="text-sm text-muted-foreground font-manrope">{testimonial.location}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* Quick Stats */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-lung-blue/10 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-lung-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground font-lexend">Quick Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={index} className="text-center p-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                          stat.color === "text-lung-blue" ? "bg-lung-blue/10" :
                          stat.color === "text-lung-green" ? "bg-lung-green/10" :
                          "bg-yellow-500/10"
                        }`}>
                          <IconComponent className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className={`text-2xl font-bold ${stat.color} font-lexend`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-muted-foreground font-livvic">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6 font-lexend">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-lung-blue mt-1" />
                    <div>
                      <p className="font-medium text-foreground font-livvic">{contactInfo.clinicName}</p>
                      <p className="text-sm text-muted-foreground font-livvic">{contactInfo.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-lung-green/5 rounded-lg">
                    <Phone className="h-5 w-5 text-lung-green" />
                    <div>
                      <p className="font-medium text-foreground font-livvic">{contactInfo.phone}</p>
                      {contactInfo.altPhone && <p className="text-sm text-muted-foreground font-livvic">{contactInfo.altPhone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-lung-blue" />
                    <div>
                      <p className="font-medium text-foreground font-livvic">{contactInfo.email}</p>
                      <p className="text-sm text-muted-foreground font-livvic">For appointments</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Facilities - only for Dr Mann */}
              {isDrMannTenant && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6 font-lexend">Facilities</h3>
                  <div className="space-y-3">
                    {[
                      "Vaccination for Lung Infections",
                      "Allergy Testing (S.P.T)",
                      "Pulmonary Function Test (PFT)",
                      "Pleural Fluid Tapping",
                      "Chest Tube Insertion",
                      "Sleep Study Testing",
                      "Chest X-Ray"
                    ].map((facility, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-lung-green" />
                        <p className="text-sm text-foreground font-livvic">{facility}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Awards & Recognition - only for Dr Mann */}
              {isDrMannTenant && (
                <Card className="p-6 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-xl font-bold text-foreground font-lexend">Awards & Recognition</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: "FCCP Fellowship (2009)", desc: "American College of Chest Physicians, USA" },
                      { title: "Best Doctor Award (1998)", desc: "South Sharquia Region, Sultanate of Oman" },
                      { title: "Rajshiri Dr. Ram Kishore Memorial Medal (1988)", desc: "Top Candidate in MD Examination, Delhi University" },
                    ].map((award, index) => (
                      <div key={index} className="p-4 bg-yellow-100 rounded-lg">
                        <div className="flex items-start gap-3 mb-2">
                          <Award className="h-6 w-6 text-yellow-600 mt-1" />
                          <div>
                            <p className="font-bold text-foreground font-livvic">{award.title}</p>
                            <p className="text-sm text-muted-foreground font-livvic">{award.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Safety Assured */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-lung-green" />
                  <h3 className="text-xl font-bold text-foreground font-lexend">Safety Assured</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-lung-green" />
                    <p className="text-sm text-foreground font-livvic">100% Safe & Secure Payments</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-lung-green" />
                    <p className="text-sm text-foreground font-livvic">Verified Doctor Profile</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-lung-green" />
                    <p className="text-sm text-foreground font-livvic">Free Cancellation</p>
                  </div>
                </div>
              </Card>

              {/* Payment Options */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-lung-blue" />
                  <h3 className="text-xl font-bold text-foreground font-lexend">Payment Options</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 bg-lung-blue text-white rounded-full text-xs font-medium flex items-center justify-center">Cards</span>
                  <span className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-medium flex items-center justify-center">UPI</span>
                  <span className="px-3 py-1.5 bg-purple-500 text-white rounded-full text-xs font-medium flex items-center justify-center">Wallet</span>
                  <span className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-medium flex items-center justify-center">Net Banking</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default DoctorProfile;
