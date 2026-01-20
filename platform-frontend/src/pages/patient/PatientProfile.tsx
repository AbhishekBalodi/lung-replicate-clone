import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Users, AlertCircle, Edit, Save, RefreshCw } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet, apiPut, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface Profile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  avatar_url: string | null;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  age: number;
  date_of_birth: string | null;
}

const PatientProfile = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({ id: 0, full_name: "", email: "", phone: "", date_of_birth: "", gender: "", blood_group: "", address: "", avatar_url: null });
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({ name: "", relationship: "", phone: "" });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/profile?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile({ ...data.profile, date_of_birth: data.profile.date_of_birth || "" });
        if (data.emergencyContact) setEmergencyContact(data.emergencyContact);
        setFamilyMembers(data.familyMembers || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) fetchProfile();
  }, [user?.email, fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiPut('/api/dashboard/patient/profile', { email: user?.email, full_name: profile.full_name, phone: profile.phone, date_of_birth: profile.date_of_birth, gender: profile.gender, blood_group: profile.blood_group, address: profile.address });
      if (res.ok) { setIsEditing(false); toast.success('Profile updated successfully'); } 
      else toast.error('Failed to update profile');
    } catch (error) { console.error('Error updating profile:', error); toast.error('Failed to update profile'); } 
    finally { setSaving(false); }
  };

  const handleSaveEmergencyContact = async () => {
    try {
      setSaving(true);
      const res = await apiPut('/api/dashboard/patient/emergency-contact', { email: user?.email, ...emergencyContact });
      if (res.ok) toast.success('Emergency contact updated'); else toast.error('Failed to update emergency contact');
    } catch (error) { console.error('Error updating emergency contact:', error); toast.error('Failed to update emergency contact'); } 
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading profile...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Profile & Family</h1><p className="text-muted-foreground">Manage your personal information</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchProfile}><RefreshCw className="h-4 w-4" /></Button>
          <Button variant={isEditing ? "default" : "outline"} onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={saving}>
            {isEditing ? <><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</> : <><Edit className="h-4 w-4 mr-2" />Edit Profile</>}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          <TabsTrigger value="family">Family Members</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24"><AvatarImage src={profile.avatar_url || ""} /><AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || "P"}</AvatarFallback></Avatar>
                  {isEditing && <Button variant="outline" size="sm">Change Photo</Button>}
                </div>
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={profile.email} disabled /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={profile.date_of_birth} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-2"><Label>Gender</Label><Input value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-2"><Label>Blood Group</Label><Input value={profile.blood_group} onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={!isEditing} /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />Emergency Contact</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Contact Name</Label><Input value={emergencyContact.name} onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Relationship</Label><Input value={emergencyContact.relationship} onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone Number</Label><Input value={emergencyContact.phone} onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} /></div>
              </div>
              <Button className="mt-4" onClick={handleSaveEmergencyContact} disabled={saving}>{saving ? 'Saving...' : 'Save Emergency Contact'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Family Members (Dependents)</CardTitle>
              <Button size="sm">Add Member</Button>
            </CardHeader>
            <CardContent>
              {familyMembers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No family members added</p></div>
              ) : (
                <div className="space-y-4">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
                        <div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.relationship} • {member.age} years old</p></div>
                      </div>
                      <Button variant="outline" size="sm">Switch Profile</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientProfile;
