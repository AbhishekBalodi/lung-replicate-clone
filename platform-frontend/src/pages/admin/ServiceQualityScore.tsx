import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Award, Users, Clock } from "lucide-react";

const qualityMetrics = [
  { name: "Patient Satisfaction", score: 92, target: 95, trend: "up", change: "+3%" },
  { name: "Wait Time Efficiency", score: 78, target: 85, trend: "up", change: "+5%" },
  { name: "Treatment Success Rate", score: 96, target: 95, trend: "up", change: "+2%" },
  { name: "Staff Responsiveness", score: 88, target: 90, trend: "down", change: "-1%" },
  { name: "Facility Cleanliness", score: 94, target: 95, trend: "up", change: "+4%" },
  { name: "Communication Quality", score: 85, target: 90, trend: "up", change: "+2%" },
];

const departmentScores = [
  { department: "Pulmonology", score: 95, rank: 1 },
  { department: "Cardiology", score: 93, rank: 2 },
  { department: "General Medicine", score: 90, rank: 3 },
  { department: "Orthopedics", score: 88, rank: 4 },
  { department: "Pediatrics", score: 92, rank: 5 },
];

export default function ServiceQualityScore() {
  const overallScore = Math.round(qualityMetrics.reduce((sum, m) => sum + m.score, 0) / qualityMetrics.length);

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Quality Score</h1>
          <p className="text-slate-600">Monitor overall service quality metrics and performance</p>
        </div>

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke="#10b981" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeDasharray={`${overallScore * 3.52} 352`}
                      strokeLinecap="round"
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{overallScore}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Overall Quality Score</h3>
                  <p className="text-slate-600">Based on 6 key metrics</p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">+2.5% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Metrics On Target</p>
                  <p className="text-2xl font-bold">{qualityMetrics.filter(m => m.score >= m.target).length}/{qualityMetrics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Quality Rank</p>
                  <p className="text-2xl font-bold">#3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Metrics</CardTitle>
              <CardDescription>Performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${metric.score >= metric.target ? "text-green-600" : "text-orange-600"}`}>
                          {metric.score}%
                        </span>
                        <span className="text-xs text-slate-500">/ {metric.target}%</span>
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={metric.score} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-slate-800" 
                        style={{ left: `${metric.target}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Quality Rankings</CardTitle>
              <CardDescription>Quality scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentScores.sort((a, b) => b.score - a.score).map((dept, index) => (
                  <div key={dept.department} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? "bg-yellow-500" :
                        index === 1 ? "bg-slate-400" :
                        index === 2 ? "bg-amber-600" :
                        "bg-slate-300"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{dept.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={dept.score} className="w-24 h-2" />
                      <span className="font-bold text-emerald-600">{dept.score}%</span>
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
