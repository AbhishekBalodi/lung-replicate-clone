import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, UserCheck, CheckCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import drMannImage from "@/assets/dr-mann-passport.png";

interface DashboardAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DashboardAppointmentDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: DashboardAppointmentDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
    name: "Dr. Paramjeet Singh Mann",
    specialty: "Pulmonologist",
    image: drMannImage
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
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
    } else if (currentStep === 2) {
      if (!formData.date || !formData.time) {
        toast({
          title: "Validation Error",
          description: "Please select both date and time.",
          variant: "destructive"
        });
        return false;
      }
      
      const [hours] = formData.time.split(':').map(Number);
      const isValidTimeSlot = 
        (hours >= 10 && hours < 15) || 
        (hours >= 17 && hours < 20);
      
      if (!isValidTimeSlot) {
        toast({
          title: "Invalid Time",
          description: "Please select a time between 10 AM - 3 PM or 5 PM - 8 PM.",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.doctor) {
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
        const response = await fetch(`/api/appointment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            appointment_date: formData.date,
            appointment_time: formData.time,
            selected_doctor: formData.doctor,
            message: formData.message || '',
            reports_uploaded: !!formData.reports
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to book appointment');
        }

        onOpenChange(false);
        setShowConfirmModal(true);
        if (onSuccess) onSuccess();
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

  const updateFormData = (field: string, value: string | File | null) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData("reports", file);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
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
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
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
    onOpenChange(open);
  };

  return (
    <>
      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lung-green/10">
              <CheckCircle className="h-8 w-8 text-lung-green" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Thank You for Booking!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Thank you for booking an appointment with us. Our representative will call you soon to confirm your appointment details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleCloseModal}
              className="bg-lung-green hover:bg-lung-green/90 text-white px-8"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Appointment Form Dialog */}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Book an Appointment</DialogTitle>
            <DialogDescription>
              Fill in the details to book your appointment
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8 mt-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-lung-green text-white shadow-lg"
                        : isCompleted
                        ? "bg-lung-green text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-center mt-2 hidden sm:block">
                    <p className={`text-xs font-medium ${isActive ? "text-lung-green" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute h-0.5 top-6 transition-all ${
                        isCompleted ? "bg-lung-green" : "bg-gray-200"
                      }`}
                      style={{
                        left: `${(idx + 0.5) * (100 / steps.length)}%`,
                        width: `${100 / steps.length}%`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Patient Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="10-13 digit phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Appointment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData("date", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Appointment Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateFormData("time", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available slots: 10:00 AM - 3:00 PM and 5:00 PM - 8:00 PM
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Select Doctor */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Label>Select Doctor *</Label>
              <div 
                onClick={() => updateFormData("doctor", doctor.name)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  formData.doctor === doctor.name 
                    ? "border-lung-green bg-lung-green/5" 
                    : "border-gray-200 hover:border-lung-green/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{doctor.name}</h4>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Any specific concerns or symptoms you'd like to mention..."
                  value={formData.message}
                  onChange={(e) => updateFormData("message", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="reports">Upload Medical Reports (Optional)</Label>
                <div className="mt-2">
                  <label 
                    htmlFor="reports"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-lung-green transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.reports ? formData.reports.name : "Click to upload files"}
                    </span>
                  </label>
                  <input
                    id="reports"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-lg mb-3">Confirm Your Details</h4>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{formData.fullName}</span>
                  
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                  
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                  
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.date}</span>
                  
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formData.time}</span>
                  
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{formData.doctor}</span>
                  
                  {formData.message && (
                    <>
                      <span className="text-gray-600">Message:</span>
                      <span className="font-medium">{formData.message}</span>
                    </>
                  )}
                  
                  <span className="text-gray-600">Reports:</span>
                  <span className="font-medium">
                    {formData.reports ? formData.reports.name : "No files uploaded"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-6">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 1}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-lung-green hover:bg-lung-green/90 text-white"
            >
              {currentStep === 4 ? "Submit Booking" : "Next"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
