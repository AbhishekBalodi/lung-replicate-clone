import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Users, Calendar } from "lucide-react";

const Qualifications = () => {
  const qualifications = [
    {
      degree: "MBBS",
      institution: "National Medical College",
      years: "2006-2011",
      icon: GraduationCap
    },
    {
      degree: "MD (Internal Medicine)",
      institution: "State Medical University",
      years: "2014-2017",
      icon: GraduationCap
    },
    {
      degree: "Visiting Fellow",
      institution: "Harvard Medical School, Boston, USA",
      years: "",
      icon: Award
    }
  ];

  const awards = [
    "Certificate: Awarded during MBBS studies",
    "Best Research Presentation: Received during post-graduation",
    "First Division: Achieved MD (Internal Medicine) degree",
    "Academic Excellence: Acknowledged throughout medical school"
  ];

  const memberships = [
    "American Medical Association (AMA)",
    "American College of Physicians (ACP)",
    "International Medical Society (IMS)",
    "National Board of Medical Examiners (NBME)"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-lexend">
            My Qualifications & Awards
          </h1>
          <div className="w-20 h-1 bg-lung-blue mx-auto"></div>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <GraduationCap className="h-8 w-8 text-lung-blue" />
            <h2 className="text-3xl font-bold text-foreground font-lexend">Qualifications</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {qualifications.map((qual, index) => {
              const IconComponent = qual.icon;
              return (
                <Card key={index} className="p-8 text-center hover:shadow-strong transition-shadow">
                  <div className="w-16 h-16 bg-lung-blue rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 font-lexend">{qual.degree}</h3>
                  <p className="text-muted-foreground mb-2 font-livvic">{qual.institution}</p>
                  {qual.years && (
                    <div className="flex items-center justify-center gap-2 text-lung-blue font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>{qual.years}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Award className="h-8 w-8 text-lung-blue" />
            <h2 className="text-3xl font-bold text-foreground font-lexend">Awards & Recognition</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-lg border-l-4 border-lung-blue">
                <div className="w-2 h-2 bg-lung-blue rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-foreground font-livvic">{award}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Memberships */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Users className="h-8 w-8 text-lung-blue" />
            <h2 className="text-3xl font-bold text-foreground font-lexend">Professional Memberships</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberships.map((membership, index) => (
              <Card key={index} className="p-6 bg-lung-blue text-white hover:bg-lung-blue-dark transition-colors">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold font-lexend text-center">{membership}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Qualifications;