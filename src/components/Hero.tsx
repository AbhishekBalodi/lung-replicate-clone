import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Clock } from "lucide-react";
import doctorMain from "@/assets/doctor-main.jpg";

const Hero = () => {
  return (
    <section className="bg-hero-gradient min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center py-8 sm:py-12 lg:py-16 px-4" id="home">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
        <div className="text-foreground space-y-4 lg:space-y-6 text-center lg:text-left">
          <div className="space-y-2 lg:space-y-4">
            <p className="text-base lg:text-lg font-medium text-muted-foreground">Solution For Healthcare Needs</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Best Chest Physician in <span className="text-lung-light-blue">Delhi</span> - Expert Pulmonology Care
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Leading pulmonologist in Delhi specializing in COPD, Asthma, TB, Sleep Apnea, and all respiratory conditions. Book your consultation today!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-center lg:items-start">
            <a href="/book-appointment" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-lung-green hover:bg-lung-green-light text-white font-semibold px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg"
              >
                Make Appointment
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto border-2 border-foreground text-foreground hover:bg-foreground hover:text-white font-semibold px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg"
            >
              Read More
            </Button>
          </div>
        </div>

        <div className="relative order-first lg:order-last">
          <div className="relative z-10">
            <img 
              src={doctorMain} 
              alt="Best chest physician and pulmonologist in Delhi - Expert respiratory care specialist"
              loading="lazy"
              width="500"
              height="600"
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto rounded-2xl shadow-strong"
            />
            
            {/* Floating Cards */}
            <Card className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 bg-white/95 backdrop-blur-sm p-2 sm:p-4 shadow-medium">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1 sm:p-2 bg-lung-green rounded-full">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-lg">Over 50+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Award Wins</p>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 bg-lung-blue text-white p-2 sm:p-4 shadow-medium">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1 sm:p-2 bg-white/20 rounded-full">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Opening Hours</p>
                  <p className="text-xs opacity-90">Mon-Sat: 9AM - 7PM</p>
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