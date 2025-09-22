import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Bed, Home, CircleSlash, Phone } from "lucide-react";
import doctorMain from "@/assets/doctor-main.jpg";

const Expertise = () => {
  const expertiseAreas = [
    {
      icon: Wind,
      title: "Interventional Pulmonology",
      description: "Minimally invasive lung procedures."
    },
    {
      icon: Bed,
      title: "Respiratory Critical Care",
      description: "Advanced care for lung emergencies."
    },
    {
      icon: Home,
      title: "Treating Specific Lung Conditions",
      description: "Focused care for lung diseases."
    },
    {
      icon: CircleSlash,
      title: "Pulmonary Rehabilitation & Smoking Cessation",
      description: "Rehab programs and quit smoking."
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-8">
              <p className="text-lung-blue text-lg font-medium mb-2">Speciality</p>
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Expertise</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {expertiseAreas.map((area, index) => {
                const IconComponent = area.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex flex-col items-start gap-4">
                      <div className="p-3 bg-lung-blue/10 rounded-2xl">
                        <IconComponent className="h-8 w-8 text-lung-blue" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">{area.title}</h3>
                        <p className="text-muted-foreground text-sm">{area.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <img 
              src={doctorMain} 
              alt="Professional Doctor" 
              className="w-full max-w-lg mx-auto rounded-2xl shadow-strong"
            />
            
            {/* Emergency Call Button */}
            <div className="absolute bottom-4 right-4">
              <Button className="bg-lung-blue hover:bg-lung-blue-dark text-white px-6 py-3 rounded-full shadow-lg">
                <Phone className="h-4 w-4 mr-2" />
                Emergency Call
                <br />
                <span className="text-xs">+91 8586805004</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Expertise;