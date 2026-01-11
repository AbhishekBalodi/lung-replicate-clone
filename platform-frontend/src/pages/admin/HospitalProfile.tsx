import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Save, Edit2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "sonner";

interface HospitalData {
  id?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  established_year: string;
  bed_capacity: number;
  emergency_services: boolean;
  accreditation: string;
  working_hours: string;
  description: string;
}

export default function HospitalProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hospital, setHospital] = useState<HospitalData>({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    website: "",
    established_year: "",
    bed_capacity: 0,
    emergency_services: true,
    accreditation: "",
    working_hours: "24/7",
    description: ""
  });

  const fetchHospitalProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/hospital/profile");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setHospital(data);
        }
      }
    } catch (error) {
      console.error("Error fetching hospital profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitalProfile();
  }, [fetchHospitalProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiPut("/api/hospital/profile", hospital);
      if (res.ok) {
        toast.success("Hospital profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof HospitalData, value: string | number | boolean) => {
    setHospital(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <ConsoleShell>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospital Profile</h1>
            <p className="text-gray-600">Manage your hospital's basic information</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hospital Name</Label>
                <Input 
                  value={hospital.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={hospital.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Established Year</Label>
                  <Input 
                    value={hospital.established_year}
                    onChange={(e) => handleChange("established_year", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Bed Capacity</Label>
                  <Input 
                    type="number"
                    value={hospital.bed_capacity}
                    onChange={(e) => handleChange("bed_capacity", parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label>Accreditation</Label>
                <Input 
                  value={hospital.accreditation}
                  onChange={(e) => handleChange("accreditation", e.target.value)}
                  disabled={!isEditing}
                  placeholder="NABH, JCI, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Address
                </Label>
                <Textarea 
                  value={hospital.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input 
                    value={hospital.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input 
                    value={hospital.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input 
                    value={hospital.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </Label>
                  <Input 
                    value={hospital.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input 
                    value={hospital.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Website
                </Label>
                <Input 
                  value={hospital.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Services & Timings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Working Hours</Label>
                  <Input 
                    value={hospital.working_hours}
                    onChange={(e) => handleChange("working_hours", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 24/7 or 9 AM - 9 PM"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <Label>Emergency Services</Label>
                  <Badge variant={hospital.emergency_services ? "default" : "secondary"}>
                    {hospital.emergency_services ? "Available 24/7" : "Not Available"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
