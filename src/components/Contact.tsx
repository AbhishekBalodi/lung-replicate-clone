import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Save to Supabase database
      const { error } = await supabase
        .from('contacts')
        .insert({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim(),
          message: formData.message.trim()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
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

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      details: "North Delhi Chest Centre\n321, Main Road, Bhai Parmanand Colony,\nNear Dr. Mukherjee Nagar, Delhi-110009"
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: "+91-9810589799, +91-9810588799\n+91-011-65101829"
    },
    {
      icon: Mail,
      title: "Email Address",
      details: "psmann58@yahoo.com"
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: "Mon - Sat: 06:00 PM - 08:00 PM\nSunday: Closed"
    }
  ];

  return (
    <section className="pt-6 pb-6 px-4 bg-medical-light/30" id="contact">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground">
            Have questions or need to schedule an appointment? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Contact Information</h3>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="p-6 hover:shadow-medium transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-medical-green/10 rounded-full">
                          <IconComponent className="h-6 w-6 text-medical-green" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">{info.title}</h4>
                          <p className="text-muted-foreground whitespace-pre-line">{info.details}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Map */}
            <div className="relative">
              <div className="bg-gray-200 rounded-lg overflow-hidden h-64">
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
              <Card className="absolute top-4 left-4 p-4 bg-white shadow-medium max-w-xs">
                <h4 className="font-semibold text-foreground mb-1">North Delhi Chest Centre</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  321, Main Road, Bhai Parmanand Colony, Near Dr. Mukherjee Nagar, Delhi-110009
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                  <span className="text-sm text-muted-foreground">4.9</span>
                  <span className="text-sm text-medical-blue">2,150 reviews</span>
                </div>
                <Button variant="link" className="text-medical-blue p-0 h-auto text-sm">
                  View larger map
                </Button>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 shadow-medium self-start">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  maxLength={255}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  maxLength={20}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  maxLength={200}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe how we can help you..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  maxLength={2000}
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-medical-green hover:bg-medical-green/90 text-white py-6 text-lg font-semibold rounded-full disabled:opacity-50 mt-4"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;