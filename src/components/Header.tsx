import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Facebook, Twitter, Instagram } from "lucide-react";
import medicalIcon from "@/assets/medical-icon.jpg";

const Header = () => {
  return (
    <header className="w-full">
      {/* Top Info Bar */}
      <div className="bg-medical-blue text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-6 mb-2 md:mb-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>123 Healthcare Ave, Medical City, MC 12345</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Mon-Sat: 9:00 AM - 7:00 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Follow Us:</span>
            <div className="flex gap-2">
              <Facebook className="h-4 w-4 cursor-pointer hover:text-medical-green transition-colors" />
              <Twitter className="h-4 w-4 cursor-pointer hover:text-medical-green transition-colors" />
              <Instagram className="h-4 w-4 cursor-pointer hover:text-medical-green transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-soft py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={medicalIcon} alt="HealthCare Plus" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">HealthCare Plus</h1>
              <p className="text-sm text-muted-foreground">Advanced Medical Solutions</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-medical-green transition-colors font-medium">
              Home
            </a>
            <a href="#services" className="text-foreground hover:text-medical-green transition-colors font-medium">
              Services
            </a>
            <a href="#doctors" className="text-foreground hover:text-medical-green transition-colors font-medium">
              Doctors
            </a>
            <a href="#contact" className="text-foreground hover:text-medical-green transition-colors font-medium">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-medical-blue font-semibold">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <Button variant="default" className="bg-medical-green hover:bg-medical-green-light text-white">
              Book Appointment
            </Button>
            <Button variant="outline" className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
              Login
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;