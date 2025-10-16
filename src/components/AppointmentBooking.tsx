import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, UserCheck, CheckCircle, Upload } from "lucide-react";
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
    message: "",
    reports: null as File | null
  });
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Patient Details", subtitle: "Enter your info", icon: User },
    { id: 2, title: "Date & Time", subtitle: "Pick appointment time", icon: Calendar },
    { id: 3, title: "Doctor", subtitle: "Choose your doctor", icon: UserCheck },
    { id: 4, title: "Confirm Details", subtitle: "Finalize booking", icon: CheckCircle },
  ];

  const doctor = {
    name: "Dr. Vikas Mann",
    specialty: "Pulmonologist",
    image: "/src/assets/dr-mann-passport.png"
  };

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
        message: "",
        reports: null
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string | File | null) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData("reports", file);
    }
  };

  return (
    <section className="py-8 px-4 bg-medical-light/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 lg:mb-4 font-manrope">
            Book an Appointment & You're Done!
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground font-manrope px-4">
            Looking for the best & quick medical treatments without a long waiting time?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <a href="/book-appointment" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-lung-green hover:bg-lung-green-light text-white px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base rounded-lg">
                Make Appointment
              </Button>
            </a>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-6 overflow-x-auto pb-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-max px-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center justify-center w-24 sm:w-32">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-colors mx-auto ${
                      currentStep === step.id 
                        ? "bg-lung-blue text-white" 
                        : currentStep > step.id
                        ? "bg-lung-green text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      <IconComponent className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-center w-full">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block text-center w-full">{step.subtitle}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 flex-shrink-0 ${
                      currentStep > step.id ? "bg-lung-green" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-4 sm:p-5 shadow-medium">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-medical-blue">Personal Information</h3>
              <p className="text-muted-foreground mb-4 text-sm">Please provide your details for the appointment</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <div className="lg:col-span-2">
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateFormData("message", e.target.value)}
                    placeholder="Any additional information"
                    className="mt-1"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="reports">Upload Reports (Optional)</Label>
                  <div className="mt-1">
                    <label 
                      htmlFor="reports" 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-lung-blue transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        {formData.reports ? (
                          <p className="text-sm text-gray-700 font-medium">{formData.reports.name}</p>
                        ) : (
                          <>
                            <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload reports</span></p>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC files accepted</p>
                          </>
                        )}
                      </div>
                      <Input
                        id="reports"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-medical-blue">Select Date & Time</h3>
              <p className="text-muted-foreground mb-4 text-sm">Choose your preferred appointment date and time</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-medical-blue">Choose Doctor</h3>
              <p className="text-muted-foreground mb-4 text-sm">Select your preferred doctor for the appointment</p>
              
              <div className="flex justify-center">
                <div 
                  onClick={() => updateFormData("doctor", `${doctor.name} - ${doctor.specialty}`)}
                  className={`cursor-pointer border-2 rounded-lg p-6 transition-all hover:shadow-lg w-64 text-center ${
                    formData.doctor === `${doctor.name} - ${doctor.specialty}` 
                      ? "border-lung-blue bg-lung-blue/5" 
                      : "border-gray-200 hover:border-lung-blue/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-24 h-24 rounded-full object-contain border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-base text-foreground">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-medical-blue">Confirm Your Appointment</h3>
              <p className="text-muted-foreground mb-4 text-sm">Please review your appointment details</p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Patient Name:</p>
                    <p className="text-muted-foreground text-sm lg:text-base">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Email:</p>
                    <p className="text-muted-foreground text-sm lg:text-base">{formData.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Phone:</p>
                    <p className="text-muted-foreground text-sm lg:text-base">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm lg:text-base">Date & Time:</p>
                    <p className="text-muted-foreground text-sm lg:text-base">{formData.date} at {formData.time}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="font-semibold text-sm lg:text-base">Doctor:</p>
                    <p className="text-muted-foreground text-sm lg:text-base">{formData.doctor}</p>
                  </div>
                  {formData.message && (
                    <div className="lg:col-span-2">
                      <p className="font-semibold text-sm lg:text-base">Message:</p>
                      <p className="text-muted-foreground text-sm lg:text-base">{formData.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            
            <span className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">
              Step {currentStep} of 4
            </span>
            
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto bg-lung-green hover:bg-lung-green/90 text-white"
            >
              {currentStep === 4 ? "Submit Form" : "Next"}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AppointmentBooking;