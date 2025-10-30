import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="py-12 lg:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Delhi Chest Physician */}
            <div>
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 font-manrope">Delhi Chest Physician</h3>
              <p className="text-gray-300 leading-relaxed font-manrope text-sm lg:text-base">
                From wellness tips to expert advice, we're here to support your journey to a 
                healthier you. Our team of dedicated healthcare providers has years of experience.
              </p>
            </div>

            {/* Useful Links */}
            <div>
              <h4 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6 font-manrope">Useful Links</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">About</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">Services</Link></li>
                <li><Link to="/book-appointment" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">Book Appointment</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">Contact Us</Link></li>
              </ul>
            </div>

            {/* Explore Pages */}
            <div>
              <h4 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6 font-manrope">Explore Pages</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li><Link to="/treatments" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">Treatments</Link></li>
                <li><Link to="/qualifications" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">Qualifications</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors font-manrope text-sm lg:text-base">All Services</Link></li>
              </ul>
              
              {/* Social Media Links */}
              <div className="mt-4 lg:mt-6">
                <h4 className="font-semibold mb-3 font-manrope text-sm lg:text-base">Follow Us</h4>
                <div className="flex gap-3 lg:gap-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 lg:w-10 lg:h-10 bg-lung-blue rounded-full flex items-center justify-center hover:bg-lung-blue-dark transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 lg:w-10 lg:h-10 bg-lung-blue rounded-full flex items-center justify-center hover:bg-lung-blue-dark transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 lg:w-10 lg:h-10 bg-lung-blue rounded-full flex items-center justify-center hover:bg-lung-blue-dark transition-all"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hour */}
            <div>
              <h4 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6 font-manrope">Opening Hours</h4>
              <div className="space-y-2 text-gray-300 font-manrope text-sm lg:text-base">
                <div>
                  <p>10 AM - 3 PM Daily</p>
                  <p className="text-xs opacity-75">Sant Parmanand Hospital, Civil Lines</p>
                </div>
                <div className="mt-3">
                  <p>5 PM - 8 PM Daily</p>
                  <p className="text-xs opacity-75">North Delhi Chest Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards Section */}
      <div className="py-6 lg:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Medical Address */}
            <div className="bg-lung-blue p-4 lg:p-6 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <MapPin className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                <h5 className="font-semibold text-white font-manrope text-sm lg:text-base">MEDICAL ADDRESS</h5>
              </div>
              <p className="text-white/90 font-manrope text-sm lg:text-base">
                North Delhi Chest Centre, 321, Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009
              </p>
            </div>

            {/* Email Address */}
            <div className="bg-lung-blue p-4 lg:p-6 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                <h5 className="font-semibold text-white font-manrope text-sm lg:text-base">EMAIL ADDRESS</h5>
              </div>
              <p className="text-white/90 font-manrope text-sm lg:text-base">
                psmann58@yahoo.com
              </p>
            </div>

            {/* Emergency Call */}
            <div className="bg-lung-blue p-4 lg:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <Phone className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                <h5 className="font-semibold text-white font-manrope text-sm lg:text-base">EMERGENCY CALL</h5>
              </div>
              <div className="text-white/90 font-manrope text-sm lg:text-base space-y-1">
                <a href="tel:+919810589799" className="block hover:text-lung-green transition-colors">+91-9810589799</a>
                <a href="tel:+919810588799" className="block hover:text-lung-green transition-colors">+91-9810588799</a>
                <a href="tel:+91011-65101829" className="block hover:text-lung-green transition-colors">+91-011-65101829</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-4 lg:py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <p className="text-gray-400 text-xs lg:text-sm font-manrope text-center">
            Copyright © 2023-25 All Rights Reserved | Delhi Chest Physician | Made by{' '}
            <a 
              href="https://brandingidiots.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-lung-blue hover:underline"
            >
              BrandingIdiots
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;