import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CheckCircle, User, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import drMannImage from "@/assets/dr-mann-passport.jpg";

// Generate time slots for the allowed periods
const generateTimeSlots = () => {
  const slots: string[] = [];
  
  // Morning slots: 10:00 AM - 3:00 PM (15-min intervals)
  for (let hour = 10; hour < 15; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  // Evening slots: 5:00 PM - 8:00 PM (15-min intervals)
  for (let hour = 17; hour < 20; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  return slots;
};

const formatTimeDisplay = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  // Calculate end time (15 min later)
  let endHours = hours;
  let endMinutes = minutes + 15;
  if (endMinutes >= 60) {
    endMinutes = 0;
    endHours += 1;
  }
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const endDisplayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
  
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period} - ${endDisplayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
};

const ALL_TIME_SLOTS = generateTimeSlots();

export default function NewAppointment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useCustomAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    date: null as Date | null,
    time: "",
    message: "",
  });

  const doctor = {
    name: "Dr. Paramjeet Singh Mann",
    specialty: "Pulmonologist",
    image: drMannImage
  };

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Fetch booked appointments when date changes
  useEffect(() => {
    if (formData.date) {
      fetchBookedSlots(formData.date);
    }
  }, [formData.date]);

  const fetchBookedSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointment?date=${dateStr}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Extract booked times for the selected date
        const booked = data.data
          .filter((apt: any) => apt.appointment_date === dateStr)
          .map((apt: any) => apt.appointment_time?.substring(0, 5)); // Get HH:MM format
        setBookedSlots(booked);
      } else {
        setBookedSlots([]);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
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
        description: "Phone number must contain 10-13 digits.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time.",
        variant: "destructive"
      });
      return;
    }

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
          appointment_date: format(formData.date, 'yyyy-MM-dd'),
          appointment_time: formData.time,
          selected_doctor: doctor.name,
          message: formData.message || '',
          reports_uploaded: false
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to book appointment');
      }

      setShowConfirmModal(true);
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    navigate("/appointments");
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const isSlotBooked = (time: string) => {
    return bookedSlots.includes(time);
  };

  if (loading) {
    return <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <>
      {/* Success Modal */}
      <Dialog open={showConfirmModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Appointment Booked!
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              The appointment has been successfully booked. The patient will receive a confirmation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleCloseModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              View Appointments
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-emerald-50/30">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-emerald-900">Book New Appointment</h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Step Indicators */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <User className="w-5 h-5" />
              </div>
              <span className={`font-medium ${currentStep >= 1 ? "text-emerald-600" : "text-gray-500"}`}>
                Patient Details
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? "bg-emerald-600" : "bg-gray-200"}`} />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className={`font-medium ${currentStep >= 2 ? "text-emerald-600" : "text-gray-500"}`}>
                Date & Time
              </span>
            </div>
          </div>

          {/* Step 1: Patient Details */}
          {currentStep === 1 && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-center mb-8">BOOK APPOINTMENT</h2>
                
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter patient's full name"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      className="mt-1.5 h-12 rounded-full border-slate-300 px-4"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="mt-1.5 h-12 rounded-full border-slate-300 px-4"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="10-13 digit phone number"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="mt-1.5 h-12 rounded-full border-slate-300 px-4"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium">Additional Notes (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Any specific concerns or symptoms..."
                      value={formData.message}
                      onChange={(e) => updateFormData("message", e.target.value)}
                      className="mt-1.5 border-slate-300 rounded-2xl px-4 py-3"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="flex-1 h-12 rounded-full text-base font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-center mb-8">SELECT DATE & TIME</h2>
              
              {/* Doctor Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{doctor.name}</h4>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h3 className="font-semibold mb-4 text-emerald-800">Select Date</h3>
                  <div className="border rounded-lg p-4 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={formData.date || undefined}
                      onSelect={(date) => {
                        updateFormData("date", date);
                        updateFormData("time", ""); // Reset time when date changes
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="pointer-events-auto"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-semibold mb-4 text-emerald-800">
                    Select Time {formData.date && `- ${format(formData.date, 'MMMM d, yyyy')}`}
                  </h3>
                  
                  {!formData.date ? (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg">
                      Please select a date first
                    </div>
                  ) : loadingSlots ? (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg">
                      Loading available slots...
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                      {ALL_TIME_SLOTS.map((time) => {
                        const booked = isSlotBooked(time);
                        const selected = formData.time === time;
                        
                        return (
                          <button
                            key={time}
                            onClick={() => !booked && updateFormData("time", time)}
                            disabled={booked}
                            className={`w-full py-3 px-4 rounded-lg border-2 text-center font-medium transition-all ${
                              booked
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                : selected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
                            }`}
                          >
                            {formatTimeDisplay(time)}
                            {booked && <span className="ml-2 text-xs">(Booked)</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary & Actions */}
              <div className="mt-8 pt-6 border-t">
                {formData.date && formData.time && (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Booking Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium">{formData.fullName}</span>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{format(formData.date, 'MMMM d, yyyy')}</span>
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTimeDisplay(formData.time)}</span>
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium">{doctor.name}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="flex-1 h-12 rounded-full text-base font-medium"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.date || !formData.time}
                    className="flex-1 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium disabled:opacity-50"
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
