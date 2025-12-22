import { Card } from "@/components/ui/card";
import { Users, Calendar, Star, CheckCircle } from "lucide-react";

const QuickStats = () => {
  const stats = [
    { label: "Patients Treated", value: "50,000+", icon: Users, color: "text-lung-blue" },
    { label: "Years Experience", value: "40+", icon: Calendar, color: "text-lung-green" },
    { label: "Patient Rating", value: "4.9/5", icon: Star, color: "text-yellow-500" },
    { label: "Success Rate", value: "98%", icon: CheckCircle, color: "text-lung-green" }
  ];

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-medium transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                  stat.color === "text-lung-blue" ? "bg-lung-blue/10" :
                  stat.color === "text-lung-green" ? "bg-lung-green/10" :
                  "bg-yellow-500/10"
                }`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} font-lexend mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-livvic">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickStats;
