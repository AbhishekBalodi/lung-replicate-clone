import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  patientName: string;
  currentDate: string;
  currentTime: string;
  onSuccess: () => void;
}

// Generate time slots: 10 AM - 3 PM, 5 PM - 8 PM in 15-min intervals
const generateTimeSlots = () => {
  const slots: string[] = [];
  // Morning: 10:00 - 15:00
  for (let h = 10; h < 15; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  // Evening: 17:00 - 20:00
  for (let h = 17; h < 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return slots;
};

const ALL_TIME_SLOTS = generateTimeSlots();

const formatTimeDisplay = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
};

export default function RescheduleModal({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  currentDate,
  currentTime,
  onSuccess,
}: RescheduleModalProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(`/api/appointment?date=${dateStr}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Exclude current appointment from booked slots
          const slots = data
            .filter((appt: any) => appt.id !== appointmentId)
            .map((appt: any) => appt.appointment_time);
          setBookedSlots(slots);
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, appointmentId]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select date and time",
        description: "Please select both a date and time slot.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await fetch(`/api/appointment/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date: dateStr,
          appointment_time: selectedTime,
          status: "rescheduled",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to reschedule");

      toast({
        title: "Rescheduled",
        description: "Appointment has been rescheduled successfully.",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    onClose();
  };

  const isSlotBooked = (slot: string) => bookedSlots.includes(slot);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Reschedule Appointment
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Patient: <span className="font-medium text-foreground">{patientName}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {new Date(currentDate).toLocaleDateString()} at {currentTime}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Select New Date
              </div>
              <div className="border rounded-lg p-3 bg-card">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date.getDay() === 0;
                  }}
                  className="pointer-events-auto"
                />
              </div>
              {selectedDate && (
                <p className="text-sm text-primary font-medium">
                  Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
              )}
            </div>

            {/* Time Slots Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Select New Time
              </div>

              {!selectedDate ? (
                <div className="border rounded-lg p-8 bg-muted/30 text-center">
                  <p className="text-muted-foreground">Please select a date first</p>
                </div>
              ) : loadingSlots ? (
                <div className="border rounded-lg p-8 bg-muted/30 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading available slots...</p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-card max-h-[320px] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_TIME_SLOTS.map((slot) => {
                      const booked = isSlotBooked(slot);
                      const isSelected = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          onClick={() => !booked && setSelectedTime(slot)}
                          disabled={booked}
                          className={cn(
                            "py-2 px-3 text-sm rounded-md border transition-all duration-200",
                            booked
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50 line-through"
                              : isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-background hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
                          )}
                        >
                          {formatTimeDisplay(slot)}
                          {booked && (
                            <span className="block text-[10px] font-normal">(Booked)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedTime && (
                <p className="text-sm text-primary font-medium">
                  Selected: {formatTimeDisplay(selectedTime)}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime || submitting}
              className="min-w-[120px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : (
                "Confirm Reschedule"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
