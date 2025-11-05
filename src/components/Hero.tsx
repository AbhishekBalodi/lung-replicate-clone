import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Clock } from "lucide-react";
import doctorMain from "@/assets/dr-mann-passport.png";

const Hero = () => {
  return (
    <section className="bg-hero-gradient min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex items-center py-6 sm:py-8 lg:py-10 px-4" id="home">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center w-full">
        <div className="text-foreground space-y-3 lg:space-y-4 text-center lg:text-left">
          <div className="space-y-2 lg:space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              Best Chest Physician in <span className="text-lung-light-blue">Delhi</span> - Expert Pulmonology Care
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Leading pulmonologist in Delhi specializing in COPD, Asthma, TB, Sleep Apnea, and all respiratory conditions. Book your consultation today!
            </p>
          </div>
          
          <div className="flex justify-center lg:justify-start">
            <a href="/book-appointment" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-lung-green hover:bg-lung-green-light text-white font-semibold px-5 lg:px-6 py-3 lg:py-4 text-sm lg:text-base rounded-lg"
              >
                Book Appointment
              </Button>
            </a>
          </div>
        </div>

        <div className="relative order-first lg:order-last">
          <div className="relative z-10">
            <img 
              src={doctorMain} 
              alt="Best chest physician and pulmonologist in Delhi - Expert respiratory care specialist"
              loading="lazy"
              width="400"
              height="500"
              className="w-full max-w-[250px] sm:max-w-[280px] lg:max-w-[320px] mx-auto rounded-2xl shadow-strong"
            />
            
            {/* Floating Cards */}
            <Card className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 bg-white/95 backdrop-blur-sm p-2 sm:p-3 shadow-medium">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-2 bg-lung-green rounded-full">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm">Over 50+</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Award Wins</p>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 bg-lung-blue text-white p-3 sm:p-4 shadow-medium rounded-lg w-72 sm:w-80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-xs sm:text-sm">Opening Hours</p>
                  <div className="space-y-0.5">
                    <p className="text-[10px] sm:text-xs opacity-90">10 AM - 3 PM Daily</p>
                    <p className="text-[9px] sm:text-[10px] opacity-75">Sant Parmanand Hospital, Civil Lines</p>
                    <p className="text-[10px] sm:text-xs opacity-90 mt-1">5 PM - 8 PM Daily</p>
                    <p className="text-[9px] sm:text-[10px] opacity-75">North Delhi Chest Center</p>
                  </div>
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