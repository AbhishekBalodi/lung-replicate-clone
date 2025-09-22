import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, UserCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AppointmentBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    doctor: "",
    message: ""
  });
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Patient Details", subtitle: "Enter your info", icon: User },
    { id: 2, title: "Date & Time", subtitle: "Pick appointment time", icon: Calendar },
    { id: 3, title: "Doctor", subtitle: "Choose your doctor", icon: UserCheck },
    { id: 4, title: "Confirm Details", subtitle: "Finalize booking", icon: CheckCircle },
  ];

  const doctors = [
    "Dr. Sarah Johnson - Cardiology",
    "Dr. Michael Chen - Pulmonology", 
    "Dr. Emily Davis - Orthopedics",
    "Dr. James Wilson - General Medicine"
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled.",
      });
      setCurrentStep(1);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        doctor: "",
        message: ""
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <section className="py-16 px-4 bg-medical-light/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-lexend">
            Book an Appointment & You're Done!
          </h2>
          <p className="text-lg text-muted-foreground font-livvic">
            Looking for the best & quick pulmonary treatments without a long waiting time?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/book-appointment">
              <Button className="bg-lung-green hover:bg-lung-green-light text-white px-8 py-3">
                Book Now →
              </Button>
            </a>
            <Button variant="outline" className="border-lung-blue text-lung-blue hover:bg-lung-blue hover:text-white px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      currentStep === step.id 
                        ? "bg-medical-blue text-white" 
                        : currentStep > step.id
                        ? "bg-medical-green text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-medical-green" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-8 shadow-medium">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 text-medical-blue">Personal Information</h3>
              <p className="text-muted-foreground mb-6">Please provide your details for the appointment</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateFormData("message", e.target.value)}
                    placeholder="Any additional information"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 text-medical-blue">Select Date & Time</h3>
              <p className="text-muted-foreground mb-6">Choose your preferred appointment date and time</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => updateFormData("time", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 text-medical-blue">Choose Doctor</h3>
              <p className="text-muted-foreground mb-6">Select your preferred doctor for the appointment</p>
              
              <div className="grid gap-3">
                {doctors.map((doctor) => (
                  <label key={doctor} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="doctor"
                      value={doctor}
                      checked={formData.doctor === doctor}
                      onChange={(e) => updateFormData("doctor", e.target.value)}
                      className="text-medical-blue"
                    />
                    <span className="font-medium">{doctor}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 text-medical-blue">Confirm Your Appointment</h3>
              <p className="text-muted-foreground mb-6">Please review your appointment details</p>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Patient Name:</p>
                    <p className="text-muted-foreground">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p className="text-muted-foreground">{formData.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Phone:</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Date & Time:</p>
                    <p className="text-muted-foreground">{formData.date} at {formData.time}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-semibold">Doctor:</p>
                    <p className="text-muted-foreground">{formData.doctor}</p>
                  </div>
                  {formData.message && (
                    <div className="md:col-span-2">
                      <p className="font-semibold">Message:</p>
                      <p className="text-muted-foreground">{formData.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 4
            </span>
            
            <Button
              onClick={handleNext}
              className="bg-medical-blue hover:bg-medical-blue-dark text-white"
            >
              {currentStep === 4 ? "Book Appointment" : "Next"}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AppointmentBooking;