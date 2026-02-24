import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { User, Calendar as CalendarIcon, UserCheck, CheckCircle, Upload } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import drMannImage from "@/assets/dr-mann-passport.jpg";
import { getDevTenantCode } from "@/components/DevTenantSwitcher";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiFetch } from "@/lib/api";

// Generate time slots for the allowed periods (15-min intervals)
const generateTimeSlots = () => {
  const slots: string[] = [];
  // Morning slots: 10:00 AM - 3:00 PM
  for (let hour = 10; hour < 15; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  // Evening slots: 5:00 PM - 8:00 PM
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

// DateTimeStep component
const DateTimeStep = ({ formData, updateFormData }: { 
  formData: { date: string; time: string }; 
  updateFormData: (field: string, value: string) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.date ? new Date(formData.date) : undefined
  );
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async (date: Date) => {
      setLoadingSlots(true);
      try {
        const tenantCode = getDevTenantCode();
        if (!tenantCode) {
          setBookedSlots([]);
          return;
        }

        const dateStr = format(date, 'yyyy-MM-dd');
        const response = await apiFetch(`/api/appointment?date=${dateStr}`, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          const times = data.appointments?.map((apt: any) => apt.appointment_time) || [];
          setBookedSlots(times);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      } finally {
        setLoadingSlots(false);
      }
    };


    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateFormData("date", format(date, 'yyyy-MM-dd'));
      updateFormData("time", "");
    }
  };

  const isSlotBooked = (time: string) => bookedSlots.includes(time);
  const selectedIsSunday = selectedDate ? selectedDate.getDay() === 0 : false;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3 text-medical-blue">Select Date & Time</h3>
      <p className="text-muted-foreground mb-4 text-sm">Choose your preferred appointment date and time</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <Label className="font-semibold mb-4 block text-lung-green">Select Date</Label>
          <div className="border rounded-lg p-4 flex justify-center bg-white shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return true;
                if (date.getDay() === 0) return true;
                return false;
              }}
              className="pointer-events-auto"
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Note:</span> Sundays are closed — you cannot book appointments on Sundays.
          </p>
        </div>

        {/* Time Slots */}
        <div>
          <Label className="font-semibold mb-4 block text-lung-green">
            Select Time {selectedDate && `• ${format(selectedDate, "MMM d, yyyy")}`}
          </Label>
          
          {!selectedDate ? (
            <div className="text-center py-10 text-gray-500 bg-gray-100 rounded-xl">
              Please select a date first
            </div>
          ) : selectedIsSunday ? (
            <div className="text-center py-10 text-red-600 bg-red-50 rounded-xl border border-red-100">
              <strong>Clinic Closed:</strong> Appointments cannot be booked on Sundays.
            </div>
          ) : loadingSlots ? (
            <div className="text-center py-10 text-gray-500 bg-gray-100 rounded-xl">
              Loading available slots...
            </div>
          ) : (
            <div className="max-h-[350px] overflow-y-auto pr-2 grid gap-3">
              {ALL_TIME_SLOTS.map((time) => {
                const booked = isSlotBooked(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !booked && updateFormData("time", time)}
                    disabled={booked}
                    className={`w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      booked
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                        : formData.time === time
                        ? "bg-lung-green text-white border-lung-green"
                        : "bg-white text-lung-green border-lung-green/30 hover:border-lung-green hover:bg-lung-green/5"
                    }`}
                  >
                    {formatTimeDisplay(time)} {booked && "(Booked)"}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentBooking = () => {
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
    { id: 2, title: "Date & Time", subtitle: "Pick appointment time", icon: CalendarIcon },
    { id: 3, title: "Doctor", subtitle: "Choose your doctor", icon: UserCheck },
    { id: 4, title: "Confirm Details", subtitle: "Finalize booking", icon: CheckCircle },
  ];

  const { tenantInfo } = useCustomAuth();
  const tenantCode = getDevTenantCode() || tenantInfo?.code || "";
  const doctor = {
    name: tenantInfo?.name || (tenantCode ? "Doctor" : "Doctor"),
    specialty: "Pulmonologist",
    image: tenantCode ? `/tenants/${tenantCode}/dr-mann-passport.jpg` : drMannImage,
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
      
      // Validate time is within allowed hours
      const [hours] = formData.time.split(':').map(Number);
      const isValidTimeSlot = 
        (hours >= 10 && hours < 15) || // 10 AM to 3 PM
        (hours >= 17 && hours < 20);   // 5 PM to 8 PM
      
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
        const tenantCode = getDevTenantCode() || tenantInfo?.code;
        if (!tenantCode) {
          toast({
            title: "Tenant not selected",
            description: "Please select the correct tenant (doctor/hospital) before booking an appointment.",
            variant: "destructive",
          });
          return;
        }

        const response = await apiFetch(`/api/appointment`, {
          method: "POST",
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            appointment_date: formData.date,
            appointment_time: formData.time,
            selected_doctor: formData.doctor,
            message: formData.message || "",
            reports_uploaded: !!formData.reports,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to book appointment");
        }

        // Show confirmation modal
        setShowConfirmModal(true);
      } catch (error: any) {
        console.error("Error booking appointment:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to book appointment. Please try again.",
          variant: "destructive",
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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  return (
    <>
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
                    required
                    minLength={2}
                    maxLength={100}
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
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 13) {
                        updateFormData("phone", value);
                      }
                    }}
                    placeholder="Enter 10-13 digit phone number"
                    className="mt-1"
                    pattern="[0-9]{10,13}"
                    maxLength={13}
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
            <DateTimeStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
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
                      onError={(e: any) => { e.currentTarget.onerror = null; e.currentTarget.src = drMannImage; }}
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
    </>
  );
};

export default AppointmentBooking;