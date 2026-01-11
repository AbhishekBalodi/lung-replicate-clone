import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockDoctorRatings = [
  { id: 1, name: "Dr. Mann", specialization: "Pulmonology", rating: 4.8, totalReviews: 156, trend: "up", satisfaction: 96 },
  { id: 2, name: "Dr. Raj", specialization: "General Medicine", rating: 4.5, totalReviews: 203, trend: "up", satisfaction: 92 },
  { id: 3, name: "Dr. Smith", specialization: "Cardiology", rating: 4.7, totalReviews: 89, trend: "down", satisfaction: 94 },
  { id: 4, name: "Dr. Patel", specialization: "Orthopedics", rating: 4.3, totalReviews: 124, trend: "up", satisfaction: 88 },
  { id: 5, name: "Dr. Kumar", specialization: "Pediatrics", rating: 4.9, totalReviews: 178, trend: "up", satisfaction: 98 },
];

const ratingDistribution = [
  { stars: 5, count: 450, percentage: 60 },
  { stars: 4, count: 200, percentage: 27 },
  { stars: 3, count: 60, percentage: 8 },
  { stars: 2, count: 25, percentage: 3 },
  { stars: 1, count: 15, percentage: 2 },
];

export default function DoctorRatings() {
  const overallRating = (mockDoctorRatings.reduce((sum, d) => sum + d.rating, 0) / mockDoctorRatings.length).toFixed(1);

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Ratings</h1>
          <p className="text-slate-600">Monitor and analyze doctor performance ratings</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-4xl font-bold">{overallRating}</p>
                <p className="text-sm text-slate-600">Overall Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{mockDoctorRatings.reduce((sum, d) => sum + d.totalReviews, 0)}</p>
                <p className="text-sm text-slate-600">Total Reviews</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{mockDoctorRatings.length}</p>
                <p className="text-sm text-slate-600">Active Doctors</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ratingDistribution.map((r) => (
                  <div key={r.stars} className="flex items-center gap-3">
                    <span className="text-sm w-8">{r.stars} ★</span>
                    <Progress value={r.percentage} className="flex-1 h-2" />
                    <span className="text-sm text-slate-600 w-12">{r.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Rankings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Doctor Rankings</CardTitle>
              <CardDescription>Based on patient ratings and reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDoctorRatings.sort((a, b) => b.rating - a.rating).map((doctor, index) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-slate-600">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold">{doctor.rating}</span>
                        </div>
                        <p className="text-xs text-slate-600">{doctor.totalReviews} reviews</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {doctor.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <Badge variant="outline">{doctor.satisfaction}% satisfied</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
