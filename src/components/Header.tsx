import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Facebook, Twitter, Instagram, User } from "lucide-react";
import lungIcon from "@/assets/lung-icon.png";
import SignUpModal from "@/components/SignUpModal";
import { useState } from "react";

const Header = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <SignUpModal 
        isOpen={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpOpen(false);
          setIsLoginOpen(true);
        }}
      />
      
      <header className="w-full">
      {/* Top Info Bar */}
      <div className="bg-lung-blue text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-6 mb-2 md:mb-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Savelung Center, B-42 Rajan Babu Road, Adarsh Nagar, Delhi-110033</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Mon-Sat: 9:00 AM - 07:00 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Follow Us:</span>
            <div className="flex gap-2">
              <Facebook className="h-4 w-4 cursor-pointer hover:text-lung-green transition-colors" />
              <Twitter className="h-4 w-4 cursor-pointer hover:text-lung-green transition-colors" />
              <Instagram className="h-4 w-4 cursor-pointer hover:text-lung-green transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-soft py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lungIcon} alt="Save Lung Center" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">SAVE LUNG CENTER</h1>
              <p className="text-sm text-muted-foreground">Your Family Pulmonologist</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Home
            </a>
            <a href="/doctors/naveen-kumar" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Doctors
            </a>
            <a href="/services" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Services
            </a>
            <a href="/contact" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lung-blue font-semibold">
              <Phone className="h-4 w-4" />
              <span>+91 858-680-5004</span>
            </div>
            <a href="/book-appointment">
              <Button className="bg-lung-green hover:bg-lung-green-light text-white">
                Appointment →
              </Button>
            </a>
            <Button 
              variant="outline" 
              className="border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white"
              onClick={() => setIsSignUpOpen(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Login →
            </Button>
          </div>
        </div>
      </nav>
      </header>
    </>
  );
};

export default Header;