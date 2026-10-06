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
      const res = await apiGet("/api/dashboard/hospital/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          const p = data.profile;
          setHospital({
            id: p.id,
            name: p.name || "",
            address: p.address || "",
            city: p.city || "",
            state: p.state || "",
            pincode: p.postal_code || "",
            phone: p.phone || "",
            email: p.email || "",
            website: p.website || "",
            established_year: p.established_year ? String(p.established_year) : "",
            bed_capacity: p.bed_count || 0,
            emergency_services: true,
            accreditation: Array.isArray(p.accreditations) ? p.accreditations.join(", ") : (p.accreditations || ""),
            working_hours: p.working_hours ? JSON.stringify(p.working_hours) : "24/7",
            description: p.description || "",
          });
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
      const res = await apiPut("/api/dashboard/hospital/profile", {
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        postal_code: hospital.pincode,
        phone: hospital.phone,
        email: hospital.email,
        website: hospital.website,
        established_year: hospital.established_year ? Number(hospital.established_year) : null,
        bed_count: hospital.bed_capacity,
        description: hospital.description,
        accreditations: hospital.accreditation ? [hospital.accreditation] : [],
        specializations: [],
        working_hours: { default: hospital.working_hours || "24/7" },
      });
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hospital Profile</h1>
            <p className="text-slate-500">Manage your hospital's basic information</p>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm hover:opacity-95"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? (saving ? "Saving..." : "Save Profile") : "Edit Profile"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs text-slate-500">Bed Capacity</p><p className="text-xl font-semibold text-slate-900 mt-1">{hospital.bed_capacity || 200}</p></CardContent></Card>
          <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs text-slate-500">Specialities</p><p className="text-xl font-semibold text-slate-900 mt-1">6</p></CardContent></Card>
          <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs text-slate-500">Established</p><p className="text-xl font-semibold text-slate-900 mt-1">{hospital.established_year || '2004'}</p></CardContent></Card>
          <Card className="border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs text-slate-500">Emergency</p><p className="text-xl font-semibold text-slate-900 mt-1">Available 24/7</p></CardContent></Card>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-800">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs text-slate-500">Hospital Name</p><p className="font-medium text-slate-900">{hospital.name || 'CareConsole Hospital'}</p></div>
            <div><p className="text-xs text-slate-500">Doctor Name</p><p className="font-medium text-slate-900">Dr. Sarav Wilson</p></div>
            <div><p className="text-xs text-slate-500">Established Year</p><p className="font-medium text-slate-900">{hospital.established_year || '2004'}</p></div>
            <div className="md:col-span-3"><p className="text-xs text-slate-500">Description</p><p className="text-slate-700">{hospital.description || 'A state-of-the-art multispeciality hospital committed to providing compassionate, high-quality healthcare services to the community.'}</p></div>
            <div><p className="text-xs text-slate-500">Bed Capacity</p><p className="font-medium text-slate-900">{hospital.bed_capacity || 200}</p></div>
            <div><p className="text-xs text-slate-500">Hospital Type</p><p className="font-medium text-slate-900">Multispeciality</p></div>
            <div><p className="text-xs text-slate-500">Accreditation</p><p className="font-medium text-slate-900">{hospital.accreditation || 'NABH, JCI, ISO 9001:2015'}</p></div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-800">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs text-slate-500">Address</p><p className="text-slate-900">{hospital.address || '14, Healthcare Boulevard, Sector 12'}</p></div>
            <div><p className="text-xs text-slate-500">City</p><p className="text-slate-900">{hospital.city || 'Bangalore'}</p></div>
            <div><p className="text-xs text-slate-500">Pincode</p><p className="text-slate-900">{hospital.pincode || '560001'}</p></div>
            <div><p className="text-xs text-slate-500">Phone</p><p className="text-slate-900">{hospital.phone || '+91 80 4567 8900'}</p></div>
            <div><p className="text-xs text-slate-500">Email</p><p className="text-slate-900">{hospital.email || 'info@careconsole.in'}</p></div>
            <div><p className="text-xs text-slate-500">Website</p><p className="text-slate-900">{hospital.website || 'www.careconsole.in'}</p></div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-800">Services & Timings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-500">Working Hours</p><p className="text-slate-900">{hospital.working_hours || '24/7'}</p></div>
            <div><p className="text-xs text-slate-500">Emergency Services</p><Badge className="bg-emerald-100 text-emerald-700">Available 24/7</Badge></div>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
