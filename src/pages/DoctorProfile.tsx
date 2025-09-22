import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Users, Award, CheckCircle, Calendar, Heart, Briefcase, GraduationCap, Grid3X3, MapPin, Phone, Mail, CreditCard, Shield } from "lucide-react";
import { useState } from "react";

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState("about");

  const stats = [
    { label: "Patients Treated", value: "25,000+", icon: Users, color: "text-lung-blue" },
    { label: "Years Experience", value: "17+", icon: Calendar, color: "text-lung-green" },
    { label: "Patient Rating", value: "4.9/5", icon: Star, color: "text-yellow-500" },
    { label: "Success Rate", value: "98%", icon: CheckCircle, color: "text-lung-green" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Doctor Hero Section */}
      <section className="bg-gradient-to-r from-lung-blue to-lung-blue/80 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-white p-2">
                <img 
                  src="/api/placeholder/200/200" 
                  alt="Dr. Naveen Kumar Ailawadi" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <span className="bg-lung-green text-white px-3 py-1 rounded-full text-sm font-medium">
                  Pulmonologist
                </span>
                <span className="bg-lung-blue-dark text-white px-3 py-1 rounded-full text-sm font-medium">
                  Respiratory Medicine
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-white mb-4 font-lexend">
                Dr. Naveen Kumar Ailawadi
              </h1>
              <p className="text-white/90 text-lg mb-6 font-livvic">
                Director & Unit Head - Respiratory Medicine, Allergy & Sleep Disorder Centre
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>17+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>Max Healthcare</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-white/90">(4.9/5 - 1500 reviews)</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-lung-blue hover:bg-white/90 px-8 py-3">
                  Book Appointment
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-lung-blue px-8 py-3">
                  Call Now
                </Button>
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
              </div>

              {activeTab === "about" && (
                <div className="space-y-12">
                  {/* Professional Summary */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Heart className="h-6 w-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-foreground font-lexend">Professional Summary</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-livvic">
                      Dr. Naveen Kumar Ailawadi is an expert pulmonologist with over 17 years of experience in 
                      pulmonary medicine, critical care, allergies, and sleep disorders. He is committed to 
                      delivering the highest standard of care to his patients. Dr. Ailawadi routinely manages 
                      complex and critically ill cases, including pneumonia, asthma, TB, ILD, and COPD. His 
                      extensive clinical expertise ensures accurate diagnosis and effective treatment. He is 
                      known for his patient-centric approach and dedication to respiratory health.
                    </p>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Briefcase className="h-6 w-6 text-lung-blue" />
                      <h2 className="text-2xl font-bold text-foreground font-lexend">Work Experience</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="border-l-4 border-lung-blue pl-6">
                        <h3 className="text-xl font-bold text-foreground font-lexend mb-2">Director & Unit Head, BLK Max Hospital</h3>
                        <p className="text-lung-blue font-medium mb-2">Max Healthcare</p>
                        <p className="text-muted-foreground font-livvic">
                          Leading respiratory medicine, TB, asthma, ILD, COPD, and other various lung diseases
                        </p>
                      </div>
                      <div className="border-l-4 border-lung-blue pl-6">
                        <h3 className="text-xl font-bold text-foreground font-lexend mb-2">Senior Consultant</h3>
                        <p className="text-lung-blue font-medium mb-2">Max Super Speciality Hospital, Patparganj</p>
                        <p className="text-muted-foreground font-livvic">
                          Department of Pulmonology & Sleep Medicine at Max Super Speciality Hospital, Shalimar Bagh, New Delhi
                        </p>
                      </div>
                      <div className="border-l-4 border-lung-blue pl-6">
                        <h3 className="text-xl font-bold text-foreground font-lexend mb-2">Senior Resident</h3>
                        <p className="text-lung-blue font-medium mb-2">Rajan Babu Institute of Pulmonary Medicine & TB</p>
                        <p className="text-muted-foreground font-livvic">
                          Department of Pulmonary Medicine
                        </p>
                      </div>
                      <Button variant="link" className="text-lung-blue font-livvic">Read More</Button>
                    </div>
                  </div>

                  {/* Education & Training */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <GraduationCap className="h-6 w-6 text-lung-green" />
                      <h2 className="text-2xl font-bold text-foreground font-lexend">Education & Training</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 bg-lung-green/5 border-lung-green/20">
                        <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">MD (Pulmonology Medicine)</h3>
                        <p className="text-lung-green font-medium mb-2">Government Medical College, Amritsar</p>
                        <p className="text-sm text-muted-foreground font-livvic">First Division</p>
                      </Card>
                      <Card className="p-6 bg-lung-green/5 border-lung-green/20">
                        <h3 className="text-lg font-bold text-foreground mb-2 font-lexend">MBBS</h3>
                        <p className="text-lung-green font-medium mb-2">SN Medical College Agra</p>
                        <p className="text-sm text-muted-foreground font-livvic">Merit Certificate</p>
                      </Card>
                    </div>
                  </div>

                  {/* Specialty Interests */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Grid3X3 className="h-6 w-6 text-lung-purple" />
                      <h2 className="text-2xl font-bold text-foreground font-lexend">Specialty Interests</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        "Tuberculosis (TB)", "Asthma", "Bronchial Asthma",
                        "Bronchitis", "Bronchiectasis", "Chronic Obstructive Pulmonary Disease",
                        "Chronic Bronchitis", "Emphysema", "Occupational Lung Disease"
                      ].map((specialty, index) => (
                        <Card key={index} className="p-4 bg-lung-purple/5 border-lung-purple/20 text-center">
                          <p className="text-lung-purple font-medium font-livvic">{specialty}</p>
                        </Card>
                      ))}
                    </div>
                    <Button variant="link" className="text-lung-blue font-livvic mt-4">Read More</Button>
                  </div>

                  {/* Professional Memberships */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="h-6 w-6 text-lung-blue" />
                      <h2 className="text-2xl font-bold text-foreground font-lexend">Professional Memberships</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "National College of Chest Physician (NCCP)",
                        "Indian Chest Society (ICS)",
                        "European Chest Society (ERS)",
                        "Chest Council of India (CCI)"
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
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 font-lexend">Patient Reviews</h2>
                  <div className="space-y-4">
                    {[1,2,3].map((review) => (
                      <Card key={review} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-lung-blue/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-lung-blue" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[1,2,3,4,5].map((star) => (
                                  <Star key={star} className="h-4 w-4 fill-current" />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">Patient #{review}</span>
                            </div>
                            <p className="text-muted-foreground font-livvic">
                              Excellent care and treatment. Dr. Ailawadi is very knowledgeable and takes time to explain everything clearly.
                            </p>
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
                      <p className="font-medium text-foreground font-livvic">Save Lung Center Clinic</p>
                      <p className="text-sm text-muted-foreground font-livvic">Adarsh Nagar, New Delhi - 110033</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-lung-blue mt-1" />
                    <div>
                      <p className="font-medium text-foreground font-livvic">BLK-Max Super Speciality Hospital</p>
                      <p className="text-sm text-muted-foreground font-livvic">Pusa Road, New Delhi - 110005</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-lung-green/5 rounded-lg">
                    <Phone className="h-5 w-5 text-lung-green" />
                    <div>
                      <p className="font-medium text-foreground font-livvic">91 8586805004</p>
                      <p className="text-sm text-muted-foreground font-livvic">24/7 Helpline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-lung-blue" />
                    <div>
                      <p className="font-medium text-foreground font-livvic">savelungcenter@gmail.com</p>
                      <p className="text-sm text-muted-foreground font-livvic">For appointments</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Facilities */}
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
                <Button variant="link" className="text-lung-blue font-livvic mt-4 p-0">Read More</Button>
              </Card>

              {/* Awards & Recognition */}
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-foreground font-lexend">Awards & Recognition</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground font-livvic">Merit Certificate in MBBS</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground font-livvic">First Division in MD</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground font-livvic">Best Poster Presentation during MD</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground font-livvic">European Respiratory Society (ERS) Member</p>
                  </div>
                </div>
              </Card>

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
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-lung-blue text-white rounded-full text-xs font-medium">Cards</span>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">UPI</span>
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">Wallet</span>
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">Net Banking</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DoctorProfile;