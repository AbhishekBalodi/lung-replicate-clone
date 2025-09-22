import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Users, Award, CheckCircle, Calendar } from "lucide-react";
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
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-foreground font-lexend">Professional Summary</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-livvic">
                    Dr. Naveen Kumar Ailawadi is an expert pulmonologist with over 17 years of experience in 
                    pulmonary medicine, critical care, allergies, and sleep disorders. He is committed to 
                    delivering the highest standard of care to his patients. Dr. Ailawadi routinely manages 
                    complex and critically ill cases, including pneumonia, asthma, TB, ILD, and COPD. His 
                    extensive clinical expertise ensures accurate diagnosis and effective treatment. He is 
                    known for his compassionate approach and dedication to patient care, making him one of 
                    the most trusted pulmonologists in the region.
                  </p>
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

            {/* Right Sidebar - Quick Stats */}
            <div className="lg:w-80">
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DoctorProfile;