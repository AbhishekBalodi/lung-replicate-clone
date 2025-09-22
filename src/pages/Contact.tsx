import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Mail, Phone, ChevronRight, Send } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-32">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <a href="/" className="text-white/80 hover:text-white transition-colors font-livvic">Home</a>
            <ChevronRight className="h-4 w-4 text-white/60" />
            <span className="text-white font-livvic">Contact Us</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-lexend">Contact Us</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-livvic">
            Get in touch with us and let's start a conversation
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Visit Us */}
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-lung-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 font-lexend">Visit Us</h3>
              <p className="text-muted-foreground font-livvic leading-relaxed">
                Dr. Naveen Ailawadi Chest Clinic,<br />
                Shop no. 1, B-42 Rajan Babu Road,<br />
                Adarsh Nagar, New Delhi, 110033
              </p>
            </Card>

            {/* Email Us */}
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-lung-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 font-lexend">Email Us</h3>
              <p className="text-muted-foreground font-livvic">
                savelungcenter@gmail.com
              </p>
            </Card>

            {/* Call Us */}
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-lung-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 font-lexend">Call Us</h3>
              <p className="text-muted-foreground font-livvic">
                +91 858 680 5004
              </p>
            </Card>
          </div>

          {/* Map and Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="relative">
              <div className="bg-gray-200 rounded-lg overflow-hidden h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.0!2d77.1733!3d28.6667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQwJzAwLjEiTiA3N8KwMTAnMjMuOSJF!5e0!3m2!1sen!2sin!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Clinic Location"
                />
              </div>
              
              {/* Map Info Card */}
              <Card className="absolute top-4 left-4 p-4 bg-white shadow-strong max-w-xs">
                <h4 className="font-bold text-foreground mb-1 font-lexend">Dr Naveen Ailawadi</h4>
                <p className="text-sm text-muted-foreground mb-2 font-livvic">
                  gate no 1, metro station, B, 42, Rajan Babu Rd, near Adarsh nagar, Adarsh Nagar, Delhi, 110033
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-sm text-muted-foreground">4.9</span>
                  <span className="text-sm text-lung-blue">1,524 reviews</span>
                </div>
                <Button variant="link" className="text-lung-blue p-0 h-auto text-sm font-livvic">
                  View larger map
                </Button>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-800 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4 font-lexend">Let's talk...</h3>
              <p className="text-gray-300 mb-8 font-livvic">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 font-livvic">Your Name *</label>
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 font-livvic">Your Email *</label>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 font-livvic">Subject</label>
                  <Select onValueChange={(value) => setFormData({...formData, subject: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">Book Appointment</SelectItem>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Textarea
                    placeholder="Your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-32"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-lung-blue hover:bg-lung-blue-dark">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Need Immediate Assistance */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6 font-lexend">Need Immediate Assistance?</h2>
          <p className="text-muted-foreground mb-8 text-lg font-livvic">
            For urgent matters or immediate support, don't hesitate to reach out to us directly. Our 
            team is available to help you with any questions or concerns.
          </p>
          <Button className="bg-lung-green hover:bg-lung-green-light text-white px-8 py-3">
            <Phone className="h-4 w-4 mr-2" />
            Call Now
          </Button>
        </div>
      </section>

        <Footer />
      </div>
    </div>
  );
};

export default Contact;