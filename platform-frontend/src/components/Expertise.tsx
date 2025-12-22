import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Bed, Home, CircleSlash, Phone } from "lucide-react";
import doctorMain from "@/assets/doctor-main.jpg";

const Expertise = () => {
  const expertiseAreas = [
    {
      icon: Wind,
      title: "General Medicine",
      description: "Comprehensive primary healthcare services."
    },
    {
      icon: Bed,
      title: "Emergency Care",
      description: "24/7 urgent medical care services."
    },
    {
      icon: Home,
      title: "Preventive Medicine",
      description: "Health screenings and prevention programs."
    },
    {
      icon: CircleSlash,
      title: "Chronic Disease Management",
      description: "Long-term care for chronic conditions."
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="mb-6 lg:mb-8">
              <p className="text-lung-blue text-base lg:text-lg font-medium mb-2">Speciality</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 lg:mb-6">Our Medical Expertise</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {expertiseAreas.map((area, index) => {
                const IconComponent = area.icon;
                return (
                  <Card key={index} className="p-4 lg:p-6">
                    <div className="flex flex-col items-start gap-3 lg:gap-4">
                      <div className="p-2 lg:p-3 bg-lung-blue/10 rounded-2xl">
                        <IconComponent className="h-6 w-6 lg:h-8 lg:w-8 text-lung-blue" />
                      </div>
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-foreground">{area.title}</h3>
                        <p className="text-muted-foreground text-sm">{area.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <img 
              src={doctorMain} 
              alt="Professional Doctor" 
              className="w-full max-w-sm lg:max-w-lg mx-auto rounded-2xl shadow-strong"
            />
            
            {/* Emergency Call Button */}
            <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4">
              <Button className="bg-lung-blue hover:bg-lung-blue-dark text-white px-3 py-2 lg:px-6 lg:py-3 rounded-full shadow-lg text-xs lg:text-sm">
                <Phone className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <div className="text-left">
                  <div>Emergency Call</div>
                  <div className="text-xs">+1 555-123-4567</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Expertise;