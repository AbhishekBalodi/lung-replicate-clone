import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, MapPin, Phone, Mail, Building2, User, Image, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDevTenantCode } from "@/components/DevTenantSwitcher";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

interface WebsiteContent {
  // Basic Info
  siteName: string;
  tagline: string;
  description: string;
  
  // Doctor/Hospital Info
  doctorName: string;
  specialization: string;
  qualifications: string;
  experience: string;
  bio: string;
  
  // Contact Info
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Map
  mapEmbedUrl: string;
  
  // Opening Hours
  openingHours: string;
  
  // Social Links
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  
  // Images (URLs)
  logoUrl: string;
  heroImageUrl: string;
  doctorImageUrl: string;
}

const defaultContent: WebsiteContent = {
  siteName: "",
  tagline: "",
  description: "",
  doctorName: "",
  specialization: "",
  qualifications: "",
  experience: "",
  bio: "",
  email: "",
  phone: "",
  altPhone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  mapEmbedUrl: "",
  openingHours: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  logoUrl: "",
  heroImageUrl: "",
  doctorImageUrl: "",
};

export default function WebsiteSettings() {
  const { toast } = useToast();
  const { tenantInfo } = useCustomAuth();
  const tenantCode = tenantInfo?.code || getDevTenantCode() || "";
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Load saved settings from localStorage (in production, this would come from backend API)
  useEffect(() => {
    const savedContent = localStorage.getItem(`website_content_${tenantCode}`);
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch {
        // ignore parse errors
      }
    }
  }, [tenantCode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, this would save to the backend API
      // For now, save to localStorage
      localStorage.setItem(`website_content_${tenantCode}`, JSON.stringify(content));
      
      toast({
        title: "Settings Saved",
        description: "Your website content has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof WebsiteContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Website Settings</h1>
            <p className="text-muted-foreground">Manage your public website content and information</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="doctor">Doctor/Hospital</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="map">Location & Map</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Basic Website Information
                </CardTitle>
                <CardDescription>Configure your website's name, tagline, and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Website Name</Label>
                    <Input
                      id="siteName"
                      placeholder="e.g., Dr. Smith's Clinic"
                      value={content.siteName}
                      onChange={(e) => updateField("siteName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      placeholder="e.g., Expert Care for Your Lungs"
                      value={content.tagline}
                      onChange={(e) => updateField("tagline", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Website Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your practice for SEO and visitors"
                    value={content.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingHours">Opening Hours</Label>
                  <Textarea
                    id="openingHours"
                    placeholder="e.g., Mon-Sat: 9:00 AM - 7:00 PM, Sunday: Closed"
                    value={content.openingHours}
                    onChange={(e) => updateField("openingHours", e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor/Hospital Tab */}
          <TabsContent value="doctor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Doctor / Hospital Information
                </CardTitle>
                <CardDescription>Information displayed on the About and Profile pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Doctor / Hospital Name</Label>
                    <Input
                      id="doctorName"
                      placeholder="e.g., Dr. John Smith"
                      value={content.doctorName}
                      onChange={(e) => updateField("doctorName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g., Pulmonologist & Chest Physician"
                      value={content.specialization}
                      onChange={(e) => updateField("specialization", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      placeholder="e.g., MBBS, MD, FCCP"
                      value={content.qualifications}
                      onChange={(e) => updateField("qualifications", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      placeholder="e.g., 20+ Years"
                      value={content.experience}
                      onChange={(e) => updateField("experience", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About</Label>
                  <Textarea
                    id="bio"
                    placeholder="Detailed biography or about text for the doctor/hospital..."
                    value={content.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Phone, email, and address displayed on your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      value={content.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Primary Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91-9876543210"
                      value={content.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altPhone">Alternate Phone (Optional)</Label>
                  <Input
                    id="altPhone"
                    type="tel"
                    placeholder="+91-1234567890"
                    value={content.altPhone}
                    onChange={(e) => updateField("altPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street, Medical District"
                    value={content.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Delhi"
                      value={content.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Delhi"
                      value={content.state}
                      onChange={(e) => updateField("state", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      placeholder="110001"
                      value={content.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">Social Media Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        placeholder="https://facebook.com/..."
                        value={content.facebook}
                        onChange={(e) => updateField("facebook", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter / X</Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/..."
                        value={content.twitter}
                        onChange={(e) => updateField("twitter", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/..."
                        value={content.instagram}
                        onChange={(e) => updateField("instagram", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/..."
                        value={content.linkedin}
                        onChange={(e) => updateField("linkedin", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        placeholder="https://youtube.com/..."
                        value={content.youtube}
                        onChange={(e) => updateField("youtube", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location & Map Tab */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Map
                </CardTitle>
                <CardDescription>Configure your Google Maps embed URL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapEmbedUrl">Google Maps Embed URL</Label>
                  <Textarea
                    id="mapEmbedUrl"
                    placeholder='Paste your Google Maps embed URL here (e.g., https://www.google.com/maps/embed?pb=...)'
                    value={content.mapEmbedUrl}
                    onChange={(e) => updateField("mapEmbedUrl", e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    To get this URL: Go to Google Maps → Find your location → Click "Share" → Select "Embed a map" → Copy the src URL from the iframe code
                  </p>
                </div>

                {/* Map Preview */}
                {content.mapEmbedUrl && (
                  <div className="space-y-2">
                    <Label>Map Preview</Label>
                    <div className="bg-gray-200 rounded-lg overflow-hidden h-64">
                      <iframe
                        src={content.mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Location Preview"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Website Images
                </CardTitle>
                <CardDescription>Configure image URLs for your website (logo, hero, doctor photo)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://example.com/logo.png"
                    value={content.logoUrl}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                  />
                  {content.logoUrl && (
                    <div className="mt-2 p-4 bg-gray-100 rounded-lg inline-block">
                      <img src={content.logoUrl} alt="Logo Preview" className="h-16 object-contain" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroImageUrl">Hero / Banner Image URL</Label>
                  <Input
                    id="heroImageUrl"
                    placeholder="https://example.com/hero.jpg"
                    value={content.heroImageUrl}
                    onChange={(e) => updateField("heroImageUrl", e.target.value)}
                  />
                  {content.heroImageUrl && (
                    <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                      <img src={content.heroImageUrl} alt="Hero Preview" className="h-32 w-full object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctorImageUrl">Doctor / Profile Image URL</Label>
                  <Input
                    id="doctorImageUrl"
                    placeholder="https://example.com/doctor.jpg"
                    value={content.doctorImageUrl}
                    onChange={(e) => updateField("doctorImageUrl", e.target.value)}
                  />
                  {content.doctorImageUrl && (
                    <div className="mt-2 p-4 bg-gray-100 rounded-lg inline-block">
                      <img src={content.doctorImageUrl} alt="Doctor Preview" className="h-32 w-32 object-cover rounded-full" />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tip: Uploading Images</h4>
                  <p className="text-sm text-blue-800">
                    For now, please host your images on a service like Imgur, Cloudinary, or your own server and paste the URL here. 
                    Direct image upload functionality will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
