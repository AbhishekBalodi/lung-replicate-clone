import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Savelungcenter */}
            <div>
              <h3 className="text-xl font-bold mb-6 font-lexend">Savelungcenter</h3>
              <p className="text-gray-300 leading-relaxed font-livvic">
                From wellness tips to expert advice, we're here to support your journey to a 
                healthier you. Our team of dedicated healthcare providers has years of experience.
              </p>
            </div>

            {/* Useful Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 font-lexend">Useful Links</h4>
              <ul className="space-y-3">
                <li><a href="/doctors/naveen-kumar" className="text-gray-300 hover:text-white transition-colors font-livvic">Doctors</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors font-livvic">Contact Us</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-white transition-colors font-livvic">Services</a></li>
              </ul>
            </div>

            {/* Explore Pages */}
            <div>
              <h4 className="text-lg font-semibold mb-6 font-lexend">Explore Pages</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors font-livvic">Home</a></li>
                <li><a href="#appointment" className="text-gray-300 hover:text-white transition-colors font-livvic">Book Appointment</a></li>
              </ul>
            </div>

            {/* Opening Hour */}
            <div>
              <h4 className="text-lg font-semibold mb-6 font-lexend">Opening Hour</h4>
              <div className="space-y-2 text-gray-300 font-livvic">
                <div className="flex justify-between">
                  <span>Mon - Tues</span>
                  <span>09:00AM - 7:00PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Wed - Thu</span>
                  <span>09:00AM - 7:00PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri - Sat</span>
                  <span>09:00AM - 7:00PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-red-400">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards Section */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Medical Address */}
            <div className="bg-lung-blue p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-6 w-6 text-white" />
                <h5 className="font-semibold text-white font-lexend">MEDICAL ADDRESS</h5>
              </div>
              <p className="text-white/90 font-livvic">
                B-42 Rajan Babu Road, Adarsh Nagar, Delhi-110033
              </p>
            </div>

            {/* Email Address */}
            <div className="bg-lung-blue p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-6 w-6 text-white" />
                <h5 className="font-semibold text-white font-lexend">EMAIL ADDRESS</h5>
              </div>
              <p className="text-white/90 font-livvic">
                Savelungcenter@gmail.com
              </p>
            </div>

            {/* Emergency Call */}
            <div className="bg-lung-blue p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-6 w-6 text-white" />
                <h5 className="font-semibold text-white font-lexend">EMERGENCY CALL</h5>
              </div>
              <p className="text-white/90 font-livvic">
                +91 858-680-5004
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm font-livvic">
            Copyright © 2023-25 All Rights Reserved | Code Get Solution
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="w-10 h-10 bg-lung-blue rounded-full flex items-center justify-center hover:bg-lung-blue-dark transition-colors cursor-pointer">
              <Facebook className="h-5 w-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-lung-blue rounded-full flex items-center justify-center hover:bg-lung-blue-dark transition-colors cursor-pointer">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-lung-blue rounded-full flex items-center justify-center hover:bg-lung-blue-dark transition-colors cursor-pointer">
              <Twitter className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;