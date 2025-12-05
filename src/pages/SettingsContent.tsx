import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Loader2, Mail, Lock, Server, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_ROOT = import.meta.env.VITE_API_ROOT || "http://localhost:5050";

export default function SettingsContent() {
  const { user, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    smtp_secure: "false",
    smtp_from: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role === "admin") {
      fetchSettings();
    }
  }, [user, authLoading]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/smtp-settings`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setFormData(data.settings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.smtp_host || !formData.smtp_user || !formData.smtp_pass || !formData.smtp_from) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_ROOT}/api/smtp-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("SMTP settings saved successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!formData.smtp_from) {
      toast.error("Please enter a 'From' email address");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_ROOT}/api/smtp-settings/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ test_email: formData.smtp_from }),
      });

      if (response.ok) {
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send test email");
      }
    } catch (error) {
      toast.error("Failed to send test email");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">Email Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure SMTP settings to send appointment notifications to patients
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong>Important:</strong> After configuring SMTP, patients will automatically receive email notifications when:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>A new appointment is booked</li>
            <li>An appointment is rescheduled</li>
            <li>An appointment is marked as done</li>
            <li>An appointment is cancelled</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>
            Set up your email server to send automated notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp_host">
                  <Server className="h-4 w-4 inline mr-2" />
                  SMTP Host *
                </Label>
                <Input
                  id="smtp_host"
                  placeholder="smtp.gmail.com"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500">
                  Gmail: smtp.gmail.com | Yahoo: smtp.mail.yahoo.com | Outlook: smtp-mail.outlook.com
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp_port">Port *</Label>
                  <Select
                    value={formData.smtp_port}
                    onValueChange={(value) => setFormData({ ...formData, smtp_port: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select port" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="587">587 (TLS)</SelectItem>
                      <SelectItem value="465">465 (SSL)</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="smtp_secure">Security</Label>
                  <Select
                    value={formData.smtp_secure}
                    onValueChange={(value) => setFormData({ ...formData, smtp_secure: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select security" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">TLS (Port 587)</SelectItem>
                      <SelectItem value="true">SSL (Port 465)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_user">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="smtp_user"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={formData.smtp_user}
                  onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_pass">
                  <Lock className="h-4 w-4 inline mr-2" />
                  App Password *
                </Label>
                <Input
                  id="smtp_pass"
                  type="password"
                  placeholder="Enter app-specific password"
                  value={formData.smtp_pass}
                  onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
                  required
                />
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-xs text-yellow-900">
                    <strong>For Gmail:</strong> You must use an App Password, not your regular password.
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to your Google Account settings</li>
                      <li>Enable 2-Step Verification</li>
                      <li>Go to Security → 2-Step Verification → App passwords</li>
                      <li>Generate a new app password and use it here</li>
                    </ol>
                    <a 
                      href="https://support.google.com/accounts/answer/185833" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block mt-2"
                    >
                      Learn more about App Passwords →
                    </a>
                  </AlertDescription>
                </Alert>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_from">From Email Address *</Label>
                <Input
                  id="smtp_from"
                  type="email"
                  placeholder="noreply@yourclinic.com"
                  value={formData.smtp_from}
                  onChange={(e) => setFormData({ ...formData, smtp_from: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500">
                  This email will appear as the sender in patient notifications
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleTestEmail}
                disabled={saving || !formData.smtp_from}
              >
                Send Test Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider-Specific Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-red-900">Gmail</h3>
            <p className="text-sm text-slate-600 mt-1">
              Host: smtp.gmail.com, Port: 587, Security: TLS
              <br />
              You must create an App Password (requires 2FA enabled)
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-purple-900">Yahoo</h3>
            <p className="text-sm text-slate-600 mt-1">
              Host: smtp.mail.yahoo.com, Port: 587, Security: TLS
              <br />
              Generate an app password at Yahoo Account Security settings
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-blue-900">Outlook/Office 365</h3>
            <p className="text-sm text-slate-600 mt-1">
              Host: smtp-mail.outlook.com, Port: 587, Security: TLS
              <br />
              Use your regular Outlook password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
