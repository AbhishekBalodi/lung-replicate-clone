import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Clock } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.jpg";

const Hero = () => {
  return (
    <section className="bg-hero-gradient min-h-[600px] flex items-center py-16 px-4" id="home">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-white space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-medium opacity-90">Complete Healthcare Solutions</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Best Medical &{" "}
              <span className="text-medical-light">Health Care</span>{" "}
              Solutions
            </h1>
            <p className="text-lg opacity-90 max-w-lg">
              Trusted by thousands, we deliver expert care with compassion and precision 
              to meet all your health needs with advanced medical technology.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-medical-green hover:bg-medical-green-light text-white font-semibold px-8 py-6 text-lg"
            >
              Make Appointment
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-medical-blue font-semibold px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10">
            <img 
              src={heroDoctor} 
              alt="Professional Doctor" 
              className="w-full max-w-md mx-auto rounded-2xl shadow-strong"
            />
            
            {/* Floating Cards */}
            <Card className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm p-4 shadow-medium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-medical-green rounded-full">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">50+</p>
                  <p className="text-sm text-muted-foreground">Awards Won</p>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 bg-medical-blue text-white p-4 shadow-medium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Opening Hours</p>
                  <p className="text-sm opacity-90">Mon-Sat: 9AM - 7PM</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;