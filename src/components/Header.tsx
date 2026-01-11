import { Button } from "@/components/ui/button";
import { Phone, User, Menu, X, Building2 } from "lucide-react";
import logoImage from "@/assets/delhi-chest-physician-logo.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { getDevTenantCode } from '@/components/DevTenantSwitcher';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, tenantInfo } = useCustomAuth();
  
  const tenantCode = tenantInfo?.code || getDevTenantCode() || 'doctor_mann';
  const isDrMann = tenantCode === 'doctor_mann' || tenantCode === 'drmann';
  const clinicName = tenantInfo?.name || (isDrMann ? 'Delhi Chest Physician' : 'Healthcare');
  const phoneNumber = isDrMann ? '+91-9810589799' : null;

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-md">
      {/* Main Navigation */}
      <nav className="bg-white shadow-soft py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label={`${clinicName} - Home`}>
            {isDrMann ? (
              <img 
                src={logoImage} 
                alt="Delhi Chest Physician - Best Chest Physician in Delhi" 
                className="h-10 sm:h-12 lg:h-14 w-auto"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-lung-blue" />
                <span className="font-bold text-lg text-lung-blue">{clinicName}</span>
              </div>
            )}
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="/" className="text-foreground hover:text-lung-blue transition-colors font-medium">
              Home
            </a>
            <a href="/about" className="text-foreground hover:text-lung-blue transition-colors font-medium">
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
            {phoneNumber && (
              <a href={`tel:${phoneNumber}`} className="hidden lg:flex items-center gap-2 text-lung-blue font-semibold text-sm hover:text-lung-green transition-colors">
                <Phone className="h-4 w-4" />
                <span>{phoneNumber}</span>
              </a>
            )}
            <a href="/book-appointment">
              <Button className="bg-lung-green hover:bg-lung-green-light text-white text-xs lg:text-sm px-3 lg:px-4 py-2 rounded-lg">
                Book Appointment
              </Button>
            </a>
            {user ? (
              <Link to="/dashboard">
                <Button 
                  variant="outline" 
                  className="border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white text-xs lg:text-sm px-3 lg:px-4 py-2"
                >
                  <User className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white text-xs lg:text-sm px-3 lg:px-4 py-2"
                >
                  <User className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Login
                </Button>
              </Link>
            )}
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
                href="/about" 
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
                {phoneNumber && (
                  <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 text-lung-blue font-semibold text-sm hover:text-lung-green transition-colors">
                    <Phone className="h-4 w-4" />
                    <span>{phoneNumber}</span>
                  </a>
                )}
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full border-lung-purple text-lung-purple hover:bg-lung-purple hover:text-white"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
