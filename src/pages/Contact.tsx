import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Mail, Phone, ChevronRight, Send, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenantContent } from "@/hooks/useTenantContent";

type ContactProps = {
  mapSrc?: string; // optional prop to pass custom Google Map link
};

const Contact : React.FC<ContactProps> = ({ mapSrc }) => {
  const { toast } = useToast();
  const { content, isDrMannTenant, hasContent } = useTenantContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Dr. Mann's default data
  const drMannData = {
    address: "North Delhi Chest Centre,\n321, Main Road, Bhai Parmanand Colony,\nNear Dr. Mukherjee Nagar,\nDelhi-110009",
    shortAddress: "321, Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009",
    email: "psmann58@yahoo.com",
    phone: "+91-9810589799",
    altPhone: "+91-9810588799",
    landline: "+91-011-65101829",
    clinicName: "North Delhi Chest Centre",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.8596070160745!2d77.2063281!3d28.7101888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfde33ddc19cd%3A0xea30c606efbfc496!2sNorth%20Delhi%20Chest%20Centre%20and%20Quit%20Smoking%20Centre%20and%20Vaccination%20Centre!5e0!3m2!1sen!2sin!4v1730464800000!5m2!1sen!2sin"
  };

  // Determine display data based on tenant
  const displayData = {
    clinicName: isDrMannTenant ? drMannData.clinicName : (content.siteName || "Clinic Name"),
    address: isDrMannTenant 
      ? drMannData.address 
      : (content.address 
          ? `${content.address}${content.city ? `,\n${content.city}` : ""}${content.state ? `, ${content.state}` : ""}${content.pincode ? `-${content.pincode}` : ""}`
          : "Address not configured"),
    shortAddress: isDrMannTenant 
      ? drMannData.shortAddress 
      : (content.address 
          ? `${content.address}${content.city ? `, ${content.city}` : ""}${content.pincode ? `-${content.pincode}` : ""}`
          : "Address not configured"),
    email: isDrMannTenant ? drMannData.email : (content.email || "email@example.com"),
    phone: isDrMannTenant ? drMannData.phone : (content.phone || "+91-XXXXXXXXXX"),
    altPhone: isDrMannTenant ? drMannData.altPhone : (content.altPhone || ""),
    landline: isDrMannTenant ? drMannData.landline : "",
    mapUrl: mapSrc || (isDrMannTenant ? drMannData.mapUrl : content.mapEmbedUrl),
    isConfigured: isDrMannTenant || hasContent
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Send to Express.js API
      
      const response = await fetch(`/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: '',
          subject: formData.subject || "General Inquiry",
          message: formData.message.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll respond as soon as possible.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20 sm:pt-28 lg:pt-20">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <a href="/" className="text-white/80 hover:text-white transition-colors font-livvic text-sm">Home</a>
            <ChevronRight className="h-3 w-3 text-white/60" />
            <span className="text-white font-livvic text-sm">Contact Us</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-lexend">Contact Us</h1>
          <p className="text-base text-white/90 max-w-3xl mx-auto font-livvic px-4">
            Get in touch with us and let's start a conversation
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 lg:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
            {/* Visit Us */}
            <Card className="p-6 lg:p-8 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-lung-blue rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <MapPin className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 lg:mb-4 font-lexend">Visit Us</h3>
              <p className="text-muted-foreground font-livvic leading-relaxed text-sm lg:text-base whitespace-pre-line">
                {displayData.address}
              </p>
            </Card>

            {/* Email Us */}
            <Card className="p-6 lg:p-8 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-lung-purple rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Mail className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 lg:mb-4 font-lexend">Email Us</h3>
              <p className="text-muted-foreground font-livvic text-sm lg:text-base">
                {displayData.email}
              </p>
            </Card>

            {/* Call Us */}
            <Card className="p-6 lg:p-8 text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-lung-purple rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Phone className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 lg:mb-4 font-lexend">Call Us</h3>
              <div className="text-muted-foreground font-livvic text-sm lg:text-base">
                <div>Mobile: <a href={`tel:${displayData.phone}`} className="hover:text-lung-blue transition-colors">{displayData.phone}</a>
                  {displayData.altPhone && <>, <a href={`tel:${displayData.altPhone}`} className="hover:text-lung-blue transition-colors">{displayData.altPhone}</a></>}
                </div>
                {displayData.landline && (
                  <div>Phone: <a href={`tel:${displayData.landline}`} className="hover:text-lung-blue transition-colors">{displayData.landline}</a></div>
                )}
              </div>
            </Card>
          </div>

          {/* Map and Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Map */}
            <div className="relative">
              <div className="bg-gray-200 rounded-lg overflow-hidden h-64 sm:h-80 lg:h-96">
                {displayData.mapUrl ? (
                  <iframe
                    src={displayData.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Clinic Location"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
                    <MapPin className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Location Map</p>
                    <p className="text-sm">Map not configured yet</p>
                  </div>
                )}
              </div>
              
              {/* Map Info Card */}
              {displayData.mapUrl && (
                <Card className="absolute top-3 left-3 lg:top-4 lg:left-4 p-3 lg:p-4 bg-white shadow-strong max-w-xs">
                  <h4 className="font-bold text-foreground mb-1 font-lexend text-sm lg:text-base">{displayData.clinicName}</h4>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-2 font-livvic">
                    {displayData.shortAddress}
                  </p>
                  {isDrMannTenant && (
                    <>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-yellow-500 text-sm">★★★★★</span>
                        <span className="text-xs lg:text-sm text-muted-foreground">4.9</span>
                        <span className="text-xs lg:text-sm text-lung-blue">2,150 reviews</span>
                      </div>
                      <Button variant="link" className="text-lung-blue p-0 h-auto text-xs lg:text-sm font-livvic">
                        View larger map
                      </Button>
                    </>
                  )}
                </Card>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-slate-800 rounded-lg p-6 lg:p-8 text-white">
              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 font-lexend">Contact Us</h3>
              <p className="text-gray-300 mb-6 lg:mb-8 font-livvic text-sm lg:text-base">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 font-livvic">Your Name *</label>
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                      required
                      minLength={2}
                      maxLength={200}
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
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      maxLength={255}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 font-livvic">Subject</label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Book Appointment">Book Appointment</SelectItem>
                      <SelectItem value="General Consultation">General Consultation</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 font-livvic">Message *</label>
                  <Textarea
                    placeholder="Your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 min-h-24 lg:min-h-32"
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-lung-blue hover:bg-lung-blue-dark text-sm lg:text-base py-2 lg:py-3 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Submit Now"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Need Medical Assistance */}
      <section className="py-12 lg:py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 lg:mb-6 font-lexend">Need Medical Assistance?</h2>
          <p className="text-muted-foreground mb-6 lg:mb-8 text-base lg:text-lg font-livvic px-4">
            For urgent matters or immediate medical support, don't hesitate to reach out to us directly. Our 
            team is available to help you with any questions or concerns.
          </p>
          <Button 
            className="bg-lung-green hover:bg-lung-green-light text-white px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base"
            onClick={() => window.location.href = `tel:${displayData.phone}`}
          >
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