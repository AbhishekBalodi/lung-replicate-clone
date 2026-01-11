import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mail, Phone, Send, Settings, Check, X, Save } from "lucide-react";
import { useState } from "react";

export default function MessagingIntegrations() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const notificationTypes = [
    { name: "Appointment Confirmation", sms: true, email: true, whatsapp: true },
    { name: "Appointment Reminder", sms: true, email: true, whatsapp: true },
    { name: "Appointment Cancellation", sms: true, email: true, whatsapp: false },
    { name: "Payment Receipt", sms: false, email: true, whatsapp: true },
    { name: "Lab Results Ready", sms: true, email: true, whatsapp: true },
    { name: "Prescription Sent", sms: false, email: true, whatsapp: true },
    { name: "Follow-up Reminder", sms: true, email: true, whatsapp: true },
  ];

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SMS / Email / WhatsApp Integrations</h1>
            <p className="text-slate-600">Configure messaging services for patient communication</p>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>

        {/* Channel Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-slate-600">Twilio Integration</p>
                  </div>
                </div>
                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
              </div>
              {smsEnabled && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Credits</span>
                    <span className="font-medium">4,523</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-slate-600">SMTP / SendGrid</p>
                  </div>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
              {emailEnabled && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Sent Today</span>
                    <span className="font-medium">156</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-slate-600">Business API</p>
                  </div>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>
              {whatsappEnabled && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Phone</span>
                    <span className="font-medium">+91 98XXX XXXXX</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Settings</CardTitle>
            <CardDescription>Configure which notifications are sent via each channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Notification Type</th>
                    <th className="text-center py-2 px-4">SMS</th>
                    <th className="text-center py-2 px-4">Email</th>
                    <th className="text-center py-2 px-4">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationTypes.map((type) => (
                    <tr key={type.name} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{type.name}</td>
                      <td className="py-3 px-4 text-center">
                        <Switch defaultChecked={type.sms} disabled={!smsEnabled} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Switch defaultChecked={type.email} disabled={!emailEnabled} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Switch defaultChecked={type.whatsapp} disabled={!whatsappEnabled} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SMS Configuration (Twilio)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account SID</Label>
                <Input type="password" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label>Auth Token</Label>
                <Input type="password" placeholder="••••••••••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+1234567890" />
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" /> Test Connection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Configuration (SMTP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label>Security</Label>
                  <Input placeholder="TLS" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input placeholder="noreply@hospital.com" />
              </div>
              <Button variant="outline" className="w-full">
                <Send className="h-4 w-4 mr-2" /> Send Test Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
