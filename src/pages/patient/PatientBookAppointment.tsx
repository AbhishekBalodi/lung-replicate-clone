import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, apiGet } from "@/lib/api";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  qualifications?: string;
  consultation_fee?: number;
  profile_photo_url?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const PatientBookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useCustomAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState({
    department: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });

  // Fetch doctors and specializations from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await apiGet('/api/dashboard/patient/doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data.doctors || []);
          setSpecializations(data.specializations || []);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // Fetch available time slots when doctor and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!formData.doctor || !formData.date) {
        return;
      }
      
      try {
        setLoadingSlots(true);
        const res = await apiGet(`/api/schedule/available-slots?doctor_id=${formData.doctor}&date=${formData.date}`);
        if (res.ok) {
          const data = await res.json();
          setTimeSlots(data.slots || []);
        } else {
          // Fallback to default slots if API fails
          setTimeSlots(getDefaultTimeSlots());
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        // Fallback to default slots
        setTimeSlots(getDefaultTimeSlots());
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [formData.doctor, formData.date]);

  // Default time slots as fallback
  const getDefaultTimeSlots = (): TimeSlot[] => [
    { time: "09:00 AM", available: true },
    { time: "09:30 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "10:30 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "11:30 AM", available: true },
    { time: "02:00 PM", available: true },
    { time: "02:30 PM", available: true },
    { time: "03:00 PM", available: true },
    { time: "03:30 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "04:30 PM", available: true },
  ];

  const filteredDoctors = formData.department
    ? doctors.filter((d) => d.specialization === formData.department)
    : doctors;

  const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctor);

  // Convert 12-hour format (e.g., "02:00 PM") to 24-hour format (e.g., "14:00")
  const convertTo24Hour = (time12h: string): string => {
    // If already in 24h format, return as-is
    if (/^\d{2}:\d{2}$/.test(time12h)) {
      return time12h;
    }
    
    const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
      // Invalid format, return as-is and let backend handle
      return time12h;
    }
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Convert time to 24-hour format for backend
      const time24h = convertTo24Hour(formData.time);
      
      const response = await apiFetch('/api/appointment', {
        method: 'POST',
        body: JSON.stringify({
          full_name: user?.name || 'Patient',
          email: user?.email || '',
          phone: user?.phone || '',
          appointment_date: formData.date,
          appointment_time: time24h,
          selected_doctor: selectedDoctor?.name || formData.doctor,
          doctor_id: selectedDoctor?.id ? Number(selectedDoctor.id) : null,
          message: formData.reason || '',
        }),
      });

      if (response.ok) {
        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully scheduled.",
        });
        navigate("/patient/appointments");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Booking error response:', errorData);
        throw new Error(errorData.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctors) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading doctors...</span>
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.available);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Book New Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule your visit in a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step > s
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Specialty & Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select
                  value={formData.department}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      department: v,
                      doctor: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.length > 0 ? (
                      specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="general" disabled>
                        No specializations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      doctor: v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          <div className="flex flex-col">
                            <span>{doc.name}</span>
                            {doc.specialization && (
                              <span className="text-xs text-muted-foreground">
                                {doc.specialization}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No doctors available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctor && selectedDoctor.consultation_fee && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Consultation Fee:</span>{" "}
                    <span className="font-medium">₹{selectedDoctor.consultation_fee}</span>
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!formData.doctor}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                      time: "", // Reset time when date changes
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading slots...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={formData.time === slot.time ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            time: slot.time,
                          })
                        }
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                ) : formData.date ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No available slots for this date. Please select another date.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Please select a date to see available slots.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!formData.date || !formData.time}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirm Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for Visit (Optional)</Label>
                <Textarea
                  placeholder="Describe your symptoms..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reason: e.target.value,
                    })
                  }
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-medium">Appointment Summary</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Specialty:</span>{" "}
                    {formData.department || selectedDoctor?.specialization || 'N/A'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Doctor:</span>{" "}
                    {selectedDoctor?.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(formData.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    {formData.time}
                  </p>
                  {selectedDoctor?.consultation_fee && (
                    <p>
                      <span className="text-muted-foreground">Fee:</span>{" "}
                      ₹{selectedDoctor.consultation_fee}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientBookAppointment;
