import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Facebook, Twitter, Instagram, User, Menu, X } from "lucide-react";
import logoImage from "@/assets/delhi-chest-physician-logo.png";
import SignUpModal from "@/components/SignUpModal";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";

const Header = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
      />
      
      <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-md">
      {/* Top Info Bar */}
      <div className="bg-lung-blue text-white py-2 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center text-xs lg:text-sm">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 mb-2 lg:mb-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-center lg:text-left">321, Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>10 AM - 3 PM Daily - Sant Parmanand Hospital | 5 PM - 8 PM Daily - North Delhi Chest Center</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Follow Us:</span>
            <div className="flex gap-2">
              <Facebook className="h-3 w-3 lg:h-4 lg:w-4 cursor-pointer hover:text-lung-green transition-colors" />
              <Twitter className="h-3 w-3 lg:h-4 lg:w-4 cursor-pointer hover:text-lung-green transition-colors" />
              <Instagram className="h-3 w-3 lg:h-4 lg:w-4 cursor-pointer hover:text-lung-green transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-soft py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="Delhi Chest Physician - Home">
            <img 
              src={logoImage} 
              alt="Delhi Chest Physician - Best Chest Physician in Delhi" 
              className="h-10 sm:h-12 lg:h-14 w-auto"
            />
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="/" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Home
            </a>
            <a href="/doctors/paramjeet-singh-mann" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              About
            </a>
            <a href="/services" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Services
            </a>
            <a href="/treatments" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Treatments
            </a>
            <a href="/contact" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Contact
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-4">
            <a href="tel:+919810589799" className="hidden lg:flex items-center gap-2 text-lung-blue font-semibold text-sm hover:text-lung-green transition-colors">
              <Phone className="h-4 w-4" />
              <span>+91-9810589799</span>
            </a>
            <a href="/book-appointment">
              <Button className="bg-lung-green hover:bg-lung-green-light text-white text-xs lg:text-sm px-3 lg:px-4 py-2 rounded-lg">
                Make Appointment
              </Button>
            </a>
            <Button 
              variant="outline" 
              className="border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white text-xs lg:text-sm px-3 lg:px-4 py-2"
              onClick={() => setIsLoginOpen(true)}
            >
              <User className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              Login
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <a href="/book-appointment">
              <Button size="sm" className="bg-lung-green hover:bg-lung-green-light text-white text-xs px-2 py-1">
                Book
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t shadow-lg z-40">
            <div className="px-4 py-4 space-y-4">
              <a 
                href="/" 
                className="block py-2 text-foreground hover:text-lung-blue transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="/doctors/paramjeet-singh-mann" 
                className="block py-2 text-foreground hover:text-lung-blue transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="/services" 
                className="block py-2 text-foreground hover:text-lung-blue transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="/treatments" 
                className="block py-2 text-foreground hover:text-lung-blue transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Treatments
              </a>
              <a 
                href="/contact" 
                className="block py-2 text-foreground hover:text-lung-blue transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="border-t pt-4 space-y-3">
                <a href="tel:+919810589799" className="flex items-center gap-2 text-lung-blue font-semibold text-sm hover:text-lung-green transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+91-9810589799</span>
                </a>
                <Button 
                  variant="outline" 
                  className="w-full border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white"
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
      </header>
    </>
  );
};

export default Header;