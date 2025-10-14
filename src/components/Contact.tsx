import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      details: "123 Healthcare Avenue\nMedical City, MC 12345"
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: "+1 (555) 123-4567\nEmergency: +1 (555) 911-HELP"
    },
    {
      icon: Mail,
      title: "Email Address",
      details: "info@healthcareplus.com\nsupport@healthcareplus.com"
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: "Mon - Sat: 9:00 AM - 7:00 PM\nSun: 10:00 AM - 4:00 PM"
    }
  ];

  return (
    <section className="py-6 px-4 bg-medical-light/30" id="contact">
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

            {/* Map Placeholder */}
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Find Us</h4>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Interactive Map</p>
                  <p className="text-sm">123 Healthcare Avenue, Medical City</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8 shadow-medium">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    required
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
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="What is this regarding?"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe how we can help you..."
                  required
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white py-6 text-lg font-semibold"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;