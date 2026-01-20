import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface Doctor {
  id: number;
  name: string;
  department: string;
  last_visit: string;
  my_rating: number | null;
}

const PatientFeedback = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitalFeedback, setHospitalFeedback] = useState("");
  const [complaint, setComplaint] = useState("");
  const [selectedRating, setSelectedRating] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/feedback/doctors?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors || []);
        // Initialize ratings from API
        const ratings: Record<number, number> = {};
        data.doctors?.forEach((d: Doctor) => {
          if (d.my_rating) ratings[d.id] = d.my_rating;
        });
        setSelectedRating(ratings);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchDoctors();
    }
  }, [user?.email, fetchDoctors]);

  const handleDoctorRating = async (doctorId: number, rating: number) => {
    setSelectedRating((prev) => ({ ...prev, [doctorId]: rating }));
    
    try {
      const res = await apiPost('/api/dashboard/patient/feedback/doctor-rating', {
        email: user?.email,
        doctor_id: doctorId,
        rating,
      });

      if (res.ok) {
        toast.success('Rating submitted!');
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleHospitalFeedback = async () => {
    if (!hospitalFeedback.trim()) return;

    try {
      setSubmitting(true);
      const res = await apiPost('/api/dashboard/patient/feedback/hospital', {
        email: user?.email,
        feedback: hospitalFeedback,
      });

      if (res.ok) {
        toast.success('Thank you for your feedback!');
        setHospitalFeedback("");
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplaint = async () => {
    if (!complaint.trim()) return;

    try {
      setSubmitting(true);
      const res = await apiPost('/api/dashboard/patient/feedback/complaint', {
        email: user?.email,
        complaint,
      });

      if (res.ok) {
        toast.success("Complaint registered. We'll look into your concern.");
        setComplaint("");
      } else {
        toast.error('Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    doctorId,
    currentRating,
  }: {
    doctorId: number;
    currentRating: number;
  }) => {
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
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feedback & Ratings</h1>
          <p className="text-muted-foreground">Share your experience with us</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDoctors}>
          <RefreshCw className="h-4 w-4" />
        </Button>
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
              {doctors.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No doctors to rate yet</p>
                  <p className="text-sm">Complete a visit to rate your doctor</p>
                </div>
              ) : (
                doctors.map((doctor) => (
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
                        <p className="text-sm text-muted-foreground">{doctor.department}</p>
                        <p className="text-xs text-muted-foreground">
                          Last visit: {new Date(doctor.last_visit).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StarRating
                        doctorId={doctor.id}
                        currentRating={selectedRating[doctor.id] || 0}
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedRating[doctor.id]
                          ? `${selectedRating[doctor.id]}/5 stars`
                          : "Rate this doctor"}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
                disabled={!hospitalFeedback.trim() || submitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
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
                  We take all complaints seriously. Please provide as much detail as possible.
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
                disabled={!complaint.trim() || submitting}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientFeedback;
