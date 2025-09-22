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

const BookAppointment = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
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
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
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
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <Label className="text-sm font-medium">Reports (Optional)</Label>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-lung-blue transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lung-blue font-medium cursor-pointer">Click to upload reports</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, PNG, DOC files accepted</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {formData.reports && (
                <p className="mt-2 text-sm text-lung-green">
                  ✓ {formData.reports.name} uploaded successfully
                </p>
              )}
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
                  formData.selectedDoctor === "dr-naveen" ? "border-lung-blue bg-lung-blue/5" : "border-gray-200 hover:border-lung-blue/50"
                }`}
                onClick={() => setFormData({...formData, selectedDoctor: "dr-naveen"})}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-lung-blue rounded-full flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground font-lexend">Dr. Naveen Kumar Ailawadi</h3>
                    <p className="text-muted-foreground font-livvic">Pulmonologist & Respiratory Medicine</p>
                    <p className="text-sm text-lung-blue font-medium">17+ Years Experience</p>
                  </div>
                  {formData.selectedDoctor === "dr-naveen" && (
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
                  <div><span className="font-medium">Doctor:</span> Dr. Naveen Kumar Ailawadi</div>
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
  );
};

export default BookAppointment;