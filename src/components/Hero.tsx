import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Clock } from "lucide-react";
import doctorMain from "@/assets/doctor-main.jpg";

const Hero = () => {
  return (
    <section className="bg-hero-gradient min-h-[600px] flex items-center py-16 px-4" id="home">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-foreground space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-medium text-muted-foreground">Solution For Healthcare Needs</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Best Medical & <span className="text-lung-light-blue">Health Care</span> Solutions
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Trusted by thousands, we deliver expert care with compassion and precision to meet your health needs.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/book-appointment">
              <Button 
                size="lg" 
                className="bg-lung-green hover:bg-lung-green-light text-white font-semibold px-8 py-6 text-lg"
              >
                Make Appointment
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-white font-semibold px-8 py-6 text-lg"
            >
              Read More
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10">
            <img 
              src={doctorMain} 
              alt="Professional Doctor" 
              className="w-full max-w-md mx-auto rounded-2xl shadow-strong"
            />
            
            {/* Floating Cards */}
            <Card className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm p-4 shadow-medium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lung-green rounded-full">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Over 50+</p>
                  <p className="text-sm text-muted-foreground">Award Wins</p>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 bg-lung-blue text-white p-4 shadow-medium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Opening Hours</p>
                  <p className="text-sm opacity-90">Mon-Sat: 9:00 AM - 07:00 PM</p>
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