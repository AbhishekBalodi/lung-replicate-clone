import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Star,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  department: string;
  lastVisit: string;
  rating?: number;
}

const PatientFeedback = () => {
  const { toast } = useToast();

  const [doctors] = useState<Doctor[]>([
    { id: "1", name: "Dr. Smith", department: "Cardiology", lastVisit: "2026-01-10", rating: 4 },
    { id: "2", name: "Dr. Patel", department: "Orthopedics", lastVisit: "2026-01-05", rating: 5 },
    { id: "3", name: "Dr. Johnson", department: "General Medicine", lastVisit: "2025-12-28" },
  ]);

  const [hospitalFeedback, setHospitalFeedback] = useState("");
  const [complaint, setComplaint] = useState("");
  const [selectedRating, setSelectedRating] = useState<Record<string, number>>({});

  const handleDoctorRating = (doctorId: string, rating: number) => {
    setSelectedRating((prev) => ({ ...prev, [doctorId]: rating }));
    toast({
      title: "Rating Submitted",
      description: "Thank you for rating the doctor!",
    });
  };

  const handleHospitalFeedback = () => {
    if (hospitalFeedback.trim()) {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setHospitalFeedback("");
    }
  };

  const handleComplaint = () => {
    if (complaint.trim()) {
      toast({
        title: "Complaint Registered",
        description: "We'll look into your concern and get back to you.",
      });
      setComplaint("");
    }
  };

  const StarRating = ({
    doctorId,
    currentRating,
  }: {
    doctorId: string;
    currentRating?: number;
  }) => {
    const rating = selectedRating[doctorId] || currentRating || 0;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleDoctorRating(doctorId, star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback & Ratings</h1>
          <p className="text-muted-foreground">
            Share your experience with us
          </p>
        </div>

        <Tabs defaultValue="doctors">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctors">Rate Doctors</TabsTrigger>
            <TabsTrigger value="hospital">Hospital Feedback</TabsTrigger>
            <TabsTrigger value="complaint">Submit Complaint</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Rate Your Doctors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-full">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doctor.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last visit:{" "}
                          {new Date(doctor.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StarRating
                        doctorId={doctor.id}
                        currentRating={doctor.rating}
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedRating[doctor.id] || doctor.rating
                          ? `${selectedRating[doctor.id] || doctor.rating}/5 stars`
                          : "Rate this doctor"}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hospital" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Hospital Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Share your experience with our hospital</Label>
                  <Textarea
                    placeholder="Tell us about your overall experience..."
                    value={hospitalFeedback}
                    onChange={(e) => setHospitalFeedback(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button
                  onClick={handleHospitalFeedback}
                  disabled={!hospitalFeedback.trim()}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaint" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Submit a Complaint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    We take all complaints seriously. Please provide as much
                    detail as possible.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Describe your concern</Label>
                  <Textarea
                    placeholder="Please describe the issue..."
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={handleComplaint}
                  disabled={!complaint.trim()}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submit Complaint
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientFeedback;
