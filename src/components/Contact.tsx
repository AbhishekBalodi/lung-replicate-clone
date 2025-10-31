import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
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
    if (isSubmitting) return;
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields (marked with *).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (formData.phone) {
      const phoneRegex = /^\d{10,13}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        alert('Phone number must contain 10-13 digits only.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone || '',
          subject: formData.subject || 'General Inquiry',
          message: formData.message.trim()
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed');
      alert('Message sent!');
      setFormData({ firstName:"", lastName:"", email:"", phone:"", subject:"", message:"" });
    } catch (err:any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

       {/* Map (same as Contact page) */}
  <div className="relative">
    <div className="bg-gray-200 rounded-lg overflow-hidden h-64 sm:h-80 lg:h-96">
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
  </div>




        <Card className="p-8 shadow-medium self-start">
          <h3 className="text-2xl font-semibold mb-6 text-foreground">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                  required minLength={2} maxLength={50} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                  required minLength={2} maxLength={50} />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                required pattern="[^\s@]+@[^\s@]+\.[^\s@]+" maxLength={255} />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={formData.phone}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 13) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
                placeholder="10-13 digits"
                pattern="[0-9]{10,13}"
                maxLength={13} />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })} 
                required minLength={3} maxLength={200} />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })} 
                required minLength={10} maxLength={2000} className="min-h-[80px]" />
            </div>

            <Button type="submit" disabled={isSubmitting}
              className="w-full bg-lung-green hover:bg-lung-green/90 text-white py-6 text-lg font-semibold rounded-full disabled:opacity-50 mt-4">
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default Contact;