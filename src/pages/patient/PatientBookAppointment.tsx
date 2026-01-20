import { useState } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

const PatientBookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    department: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });

  const departments = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Gynecology",
  ];

  const doctors = [
    { id: "1", name: "Dr. Smith", department: "Cardiology" },
    { id: "2", name: "Dr. Johnson", department: "General Medicine" },
    { id: "3", name: "Dr. Patel", department: "Orthopedics" },
    { id: "4", name: "Dr. Lee", department: "Dermatology" },
  ];

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const filteredDoctors = formData.department
    ? doctors.filter((d) => d.department === formData.department)
    : doctors;

  const handleSubmit = () => {
    toast({
      title: "Appointment Booked!",
      description: "Your appointment has been successfully scheduled.",
    });
    navigate("/patient/appointments");
  };

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
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step > s
                      ? "bg-blue-600"
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
                Select Department & Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Department</Label>
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
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept}
                        value={dept}
                      >
                        {dept}
                      </SelectItem>
                    ))}
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
                    {filteredDoctors.map((doc) => (
                      <SelectItem
                        key={doc.id}
                        value={doc.id}
                      >
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={
                  !formData.department ||
                  !formData.doctor
                }
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
                  min={new Date()
                    .toISOString()
                    .split("T")[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={
                        formData.time === slot
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          time: slot,
                        })
                      }
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={
                    !formData.date ||
                    !formData.time
                  }
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
                <Label>
                  Reason for Visit (Optional)
                </Label>
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
                <h3 className="font-medium">
                  Appointment Summary
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">
                      Department:
                    </span>{" "}
                    {formData.department}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Doctor:
                    </span>{" "}
                    {
                      doctors.find(
                        (d) =>
                          d.id === formData.doctor
                      )?.name
                    }
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Date:
                    </span>{" "}
                    {new Date(
                      formData.date
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Time:
                    </span>{" "}
                    {formData.time}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                >
                  Confirm Booking
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
