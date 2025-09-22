import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import medicalIcon from "@/assets/medical-icon.jpg";

const Footer = () => {
  const quickLinks = [
    "About Us",
    "Our Services", 
    "Our Doctors",
    "Appointments",
    "Patient Portal",
    "Insurance"
  ];

  const services = [
    "Emergency Care",
    "Cardiology",
    "Neurology", 
    "Orthopedics",
    "Pediatrics",
    "Radiology"
  ];

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={medicalIcon} alt="HealthCare Plus" className="h-10 w-10" />
              <div>
                <h3 className="text-xl font-bold">HealthCare Plus</h3>
                <p className="text-sm opacity-80">Advanced Medical Solutions</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Providing exceptional healthcare services with compassion, expertise, and 
              state-of-the-art medical technology for over a decade.
            </p>
            <div className="flex gap-4">
              <div className="p-2 bg-white/10 rounded-full hover:bg-medical-green transition-colors cursor-pointer">
                <Facebook className="h-4 w-4" />
              </div>
              <div className="p-2 bg-white/10 rounded-full hover:bg-medical-green transition-colors cursor-pointer">
                <Twitter className="h-4 w-4" />
              </div>
              <div className="p-2 bg-white/10 rounded-full hover:bg-medical-green transition-colors cursor-pointer">
                <Instagram className="h-4 w-4" />
              </div>
              <div className="p-2 bg-white/10 rounded-full hover:bg-medical-green transition-colors cursor-pointer">
                <Youtube className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm opacity-90 hover:opacity-100 hover:text-medical-green transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <a href="#" className="text-sm opacity-90 hover:opacity-100 hover:text-medical-green transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-medical-green flex-shrink-0" />
                <div className="text-sm opacity-90">
                  <p>123 Healthcare Avenue</p>
                  <p>Medical City, MC 12345</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-medical-green flex-shrink-0" />
                <div className="text-sm opacity-90">
                  <p>+1 (555) 123-4567</p>
                  <p className="text-xs">Emergency: +1 (555) 911-HELP</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-medical-green flex-shrink-0" />
                <div className="text-sm opacity-90">
                  <p>info@healthcareplus.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm font-semibold text-medical-green">Working Hours</p>
              <p className="text-xs opacity-90">Mon-Sat: 9AM - 7PM</p>
              <p className="text-xs opacity-90">Sunday: 10AM - 4PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-80">
            © 2024 HealthCare Plus. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Privacy Policy
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              Terms of Service
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
              HIPAA Notice
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;