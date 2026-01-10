import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mockFeedback = [
  { id: 1, patient: "John Doe", doctor: "Dr. Mann", date: "2026-01-08", rating: 5, feedback: "Excellent care and attention. Very satisfied with the treatment.", category: "Treatment", status: "positive" },
  { id: 2, patient: "Jane Smith", doctor: "Dr. Raj", date: "2026-01-07", rating: 4, feedback: "Good experience overall. Wait time was a bit long.", category: "Experience", status: "positive" },
  { id: 3, patient: "Mike Johnson", doctor: "Dr. Mann", date: "2026-01-06", rating: 3, feedback: "Average experience. Could improve communication.", category: "Communication", status: "neutral" },
  { id: 4, patient: "Sarah Williams", doctor: "Dr. Smith", date: "2026-01-05", rating: 5, feedback: "Outstanding service! Highly recommend.", category: "Service", status: "positive" },
  { id: 5, patient: "Robert Brown", doctor: "Dr. Raj", date: "2026-01-04", rating: 2, feedback: "Long waiting time and rushed consultation.", category: "Experience", status: "negative" },
];

export default function PatientFeedback() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredFeedback = mockFeedback.filter(f => {
    if (filterCategory !== "all" && f.category !== filterCategory) return false;
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    return true;
  });

  const avgRating = (mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length).toFixed(1);

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Feedback</h1>
          <p className="text-slate-600">View and manage patient feedback and satisfaction</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Average Rating</p>
                  <p className="text-2xl font-bold">{avgRating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Positive</p>
                  <p className="text-2xl font-bold">{mockFeedback.filter(f => f.status === "positive").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Negative</p>
                  <p className="text-2xl font-bold">{mockFeedback.filter(f => f.status === "negative").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{mockFeedback.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Feedback</CardTitle>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Treatment">Treatment</SelectItem>
                    <SelectItem value="Experience">Experience</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFeedback.map((f) => (
                <div key={f.id} className="border rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{f.patient}</span>
                        <Badge variant="outline">{f.category}</Badge>
                        <Badge className={
                          f.status === "positive" ? "bg-green-100 text-green-800" :
                          f.status === "negative" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {f.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Doctor: {f.doctor} • {f.date}</p>
                      <p className="text-sm mt-2">{f.feedback}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < f.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
