import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  User, Calendar, Stethoscope, CheckCircle, 
  Upload, ChevronLeft, ChevronRight 
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BookAppointment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Step 1 - Patient Details
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    medicalHistory: "",
    currentSymptoms: "",
    // Step 2 - Date & Time
    preferredDate: "",
    preferredTime: "",
    // Step 3 - Doctor
    selectedDoctor: "",
    // Step 4 - Additional
    reports: null as File | null,
    notes: ""
  });

  const steps = [
    { number: 1, title: "Patient Details", subtitle: "Enter your info", icon: User },
    { number: 2, title: "Date & Time", subtitle: "Pick appointment time", icon: Calendar },
    { number: 3, title: "Doctor", subtitle: "Choose your doctor", icon: Stethoscope },
    { number: 4, title: "Confirm Details", subtitle: "Finalize booking", icon: CheckCircle }
  ];

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || 
          !formData.age.trim() || !formData.gender) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (marked with *).",
          variant: "destructive"
        });
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return false;
      }
      
      const phoneRegex = /^\d{10,13}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must contain 10-13 digits only.",
          variant: "destructive"
        });
        return false;
      }

      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) {
        toast({
          title: "Invalid Age",
          description: "Please enter a valid age between 1 and 120.",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.preferredDate || !formData.preferredTime) {
        toast({
          title: "Validation Error",
          description: "Please select both date and time.",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.selectedDoctor) {
        toast({
          title: "Validation Error",
          description: "Please select a doctor.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      if (validateStep()) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      try {
        // Send to Express.js API
        
        const response = await fetch(`/api/appointment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            appointment_date: formData.preferredDate,
            appointment_time: formData.preferredTime,
            selected_doctor: "Dr. Paramjeet Singh Mann - Pulmonologist",
            message: `${formData.notes || ''}\nAge: ${formData.age}\nGender: ${formData.gender}\nAddress: ${formData.address}\nMedical History: ${formData.medicalHistory}\nSymptoms: ${formData.currentSymptoms}`,
            reports_uploaded: !!formData.reports
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to book appointment');
        }

        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully scheduled. A confirmation email has been sent.",
        });
        
        // Reset form and go back to step 1
        setCurrentStep(1);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          age: "",
          gender: "",
          address: "",
          medicalHistory: "",
          currentSymptoms: "",
          preferredDate: "",
          preferredTime: "",
          selectedDoctor: "",
          reports: null,
          notes: ""
        });
      } catch (error: any) {
        console.error("Error booking appointment:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to book appointment. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({...formData, reports: file});
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <User className="h-6 w-6 text-lung-blue" />
              <h2 className="text-2xl font-bold text-foreground font-lexend">Personal Information</h2>
            </div>
            <p className="text-muted-foreground mb-8 font-livvic">
              Please provide your details for the appointment
            </p>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-13 digit phone number"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 13) {
                        setFormData({...formData, phone: value});
                      }
                    }}
                    required
                    pattern="[0-9]{10,13}"
                    maxLength={13}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="age" className="text-sm font-medium mb-2 block">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                    min="1"
                    max="120"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium mb-2 block">Gender *</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium mb-2 block">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="medicalHistory" className="text-sm font-medium mb-2 block">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Any previous medical conditions, surgeries, or ongoing treatments"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                  className="min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="currentSymptoms" className="text-sm font-medium mb-2 block">Current Symptoms</Label>
                <Textarea
                  id="currentSymptoms"
                  placeholder="Describe your current symptoms or reason for consultation"
                  value={formData.currentSymptoms}
                  onChange={(e) => setFormData({...formData, currentSymptoms: e.target.value})}
                  className="min-h-20"
                />
              </div>
            </div>

            {/* Reports Upload Section */}
            <div className="mt-8">
              <Label htmlFor="reports" className="text-sm font-medium mb-2 block">Upload Reports (Optional)</Label>
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
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-6 w-6 text-lung-blue" />
              <h2 className="text-2xl font-bold text-foreground font-lexend">Select Date & Time</h2>
            </div>
            <p className="text-muted-foreground mb-8 font-livvic">
              Choose your preferred appointment date and time
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium mb-2 block">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              <div>
                <Label htmlFor="time" className="text-sm font-medium mb-2 block">Preferred Time *</Label>
                <select
                  id="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="">Select Time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Stethoscope className="h-6 w-6 text-lung-blue" />
              <h2 className="text-2xl font-bold text-foreground font-lexend">Choose Doctor</h2>
            </div>
            <p className="text-muted-foreground mb-8 font-livvic">
              Select your preferred doctor for the consultation
            </p>
            
            <div className="grid gap-4">
              <Card 
                className={`p-6 cursor-pointer border-2 transition-colors ${
                  formData.selectedDoctor === "dr-mann" ? "border-lung-blue bg-lung-blue/5" : "border-gray-200 hover:border-lung-blue/50"
                }`}
                onClick={() => setFormData({...formData, selectedDoctor: "dr-mann"})}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src="/src/assets/dr-mann-passport.png" 
                    alt="Dr. Paramjeet Singh Mann"
                    className="w-16 h-16 rounded-full object-contain border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground font-lexend">Dr. Paramjeet Singh Mann</h3>
                    <p className="text-muted-foreground font-livvic">Pulmonologist & Respiratory Medicine</p>
                    <p className="text-sm text-lung-blue font-medium">40+ Years Experience</p>
                  </div>
                  {formData.selectedDoctor === "dr-mann" && (
                    <CheckCircle className="h-6 w-6 text-lung-blue" />
                  )}
                </div>
              </Card>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="h-6 w-6 text-lung-blue" />
              <h2 className="text-2xl font-bold text-foreground font-lexend">Confirm Details</h2>
            </div>
            <p className="text-muted-foreground mb-8 font-livvic">
              Please review your appointment details before confirmation
            </p>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 font-lexend">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {formData.fullName}</div>
                  <div><span className="font-medium">Phone:</span> {formData.phone}</div>
                  <div><span className="font-medium">Email:</span> {formData.email}</div>
                  <div><span className="font-medium">Age:</span> {formData.age}</div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 font-lexend">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Date:</span> {formData.preferredDate}</div>
                  <div><span className="font-medium">Time:</span> {formData.preferredTime}</div>
                  <div><span className="font-medium">Doctor:</span> Dr. Paramjeet Singh Mann</div>
                  <div><span className="font-medium">Type:</span> Pulmonology Consultation</div>
                </div>
              </Card>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information or special requests"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="min-h-20"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-32">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-lung-blue to-lung-blue-dark py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-lexend">Book an Appointment & You're Done!</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-livvic">
            Looking for the best & quick pulmonary treatments without a long waiting time?
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? "bg-lung-blue text-white" : 
                      isCompleted ? "bg-lung-green text-white" : 
                      "bg-gray-200 text-gray-500"
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isActive ? "text-lung-blue" : "text-muted-foreground"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-lung-green" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground font-livvic">
                Step {currentStep} of {steps.length}
              </span>
              
              <Button
                onClick={handleNext}
                className="bg-lung-blue hover:bg-lung-blue-dark text-white flex items-center gap-2"
              >
                {currentStep === 4 ? "Confirm Booking" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default BookAppointment;