import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import medicalProcedure from "@/assets/medical-procedure.jpg";

const WhyChooseUs = () => {
  const features = [
    "Patient-Centered Approach",
    "Comprehensive Care",
    "Improved Quality of Life",
    "Preventive Care",
    "Healthcare Diplomacy",
    "Best Health Support"
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img 
              src={medicalProcedure} 
              alt="Medical Procedure" 
              className="w-full rounded-2xl shadow-strong"
            />
            
            {/* Blue overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-lung-blue/90 p-8 rounded-2xl">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center transform rotate-45">
                  <div className="w-8 h-8 bg-white rounded transform -rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why We're the Best Choice for Healthcare?
            </h2>
            
            <p className="text-muted-foreground mb-8 text-lg">
              We follow a collaborative team-based approach that actively involves 
              patients in their treatment journey. Our dedicated staff works closely with 
              the community to deliver effective and compassionate healthcare.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-1 bg-lung-green rounded-full">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Button className="bg-lung-green hover:bg-lung-green-light text-white px-8 py-3">
                Explore More →
              </Button>
              
              <div className="text-lung-blue">
                <p className="font-medium">Need an online consultation?</p>
                <Button variant="link" className="text-lung-blue p-0 h-auto font-normal underline">
                  Click Here →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;