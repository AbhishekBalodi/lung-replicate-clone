import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, User, Mail, Phone, Award, Stethoscope, Clock, IndianRupee, Upload, Bell, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DoctorProfileSettings() {
  const [profile, setProfile] = useState({
    name: "Dr. Priya Mehta",
    email: "priya.mehta@clinic.com",
    phone: "+91 98765 43210",
    specialization: "Cardiology",
    qualification: "MBBS, MD (Cardiology), DM",
    experience: "15 years",
    consultationFee: "1500",
    bio: "Senior Cardiologist with extensive experience in interventional cardiology and cardiac care. Specializing in heart disease prevention and management.",
    registrationNumber: "MCI-12345",
    languages: ["English", "Hindi", "Gujarati"],
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    whatsapp: false,
    appointmentReminders: true,
    labResults: true,
    emergencyAlerts: true,
  });

  const [signature, setSignature] = useState<string | null>(null);

  const specializations = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "ENT",
    "Ophthalmology",
    "Neurology",
    "Psychiatry",
  ];

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your personal and professional information</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Personal Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-2xl">PM</AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.specialization}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        className="pl-10"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration">Registration Number</Label>
                    <Input
                      id="registration"
                      value={profile.registrationNumber}
                      onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="min-h-[100px]"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Update your specialization and consultation details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select
                      value={profile.specialization}
                      onValueChange={(value) => setProfile({ ...profile, specialization: value })}
                    >
                      <SelectTrigger>
                        <Stethoscope className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="qualification"
                        className="pl-10"
                        value={profile.qualification}
                        onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="experience"
                        className="pl-10"
                        value={profile.experience}
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">Consultation Fee (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fee"
                        type="number"
                        className="pl-10"
                        value={profile.consultationFee}
                        onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                    <Button variant="outline" size="sm">+ Add Language</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signature" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Signature</CardTitle>
                <CardDescription>Upload your signature for prescriptions and documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {signature ? (
                    <div className="space-y-4">
                      <img src={signature} alt="Signature" className="max-h-24 mx-auto" />
                      <Button variant="outline" onClick={() => setSignature(null)}>
                        Remove Signature
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium">Upload your signature</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG up to 2MB. Transparent background recommended.</p>
                      </div>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview on Prescription</h4>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-right">
                      <div className="h-16 w-32 ml-auto border-b border-gray-300 flex items-end justify-center text-sm text-muted-foreground">
                        {signature ? <img src={signature} alt="Signature" className="max-h-12" /> : "Your signature"}
                      </div>
                      <p className="text-sm font-medium mt-2">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">{profile.qualification}</p>
                      <p className="text-xs text-muted-foreground">Reg. No: {profile.registrationNumber}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Communication Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label>Email Notifications</Label>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Label>SMS Notifications</Label>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Label>WhatsApp Notifications</Label>
                      </div>
                      <Switch
                        checked={notifications.whatsapp}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Appointment Reminders</Label>
                        <p className="text-xs text-muted-foreground">Get notified about upcoming appointments</p>
                      </div>
                      <Switch
                        checked={notifications.appointmentReminders}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lab Results</Label>
                        <p className="text-xs text-muted-foreground">Notifications when lab results are ready</p>
                      </div>
                      <Switch
                        checked={notifications.labResults}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, labResults: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Emergency Alerts</Label>
                        <p className="text-xs text-muted-foreground">Critical lab values and patient emergencies</p>
                      </div>
                      <Switch
                        checked={notifications.emergencyAlerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emergencyAlerts: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
