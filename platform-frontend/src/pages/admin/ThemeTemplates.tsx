import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Save, Palette, LayoutTemplate, Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDevTenantCode } from "@/components/DevTenantSwitcher";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { cn } from "@/lib/utils";

// Color palette options
const colorPalettes = [
  {
    id: "emerald",
    name: "Emerald Green",
    description: "Professional medical green",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#ecfdf5",
  },
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Calm and trustworthy",
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    background: "#eff6ff",
  },
  {
    id: "teal",
    name: "Teal",
    description: "Modern healthcare feel",
    primary: "#14b8a6",
    secondary: "#0d9488",
    accent: "#2dd4bf",
    background: "#f0fdfa",
  },
  {
    id: "indigo",
    name: "Indigo",
    description: "Sophisticated and premium",
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#818cf8",
    background: "#eef2ff",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Warm and caring",
    primary: "#f43f5e",
    secondary: "#e11d48",
    accent: "#fb7185",
    background: "#fff1f2",
  },
  {
    id: "amber",
    name: "Amber Gold",
    description: "Luxurious and elegant",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    background: "#fffbeb",
  },
  {
    id: "purple",
    name: "Purple",
    description: "Creative and unique",
    primary: "#a855f7",
    secondary: "#9333ea",
    accent: "#c084fc",
    background: "#faf5ff",
  },
  {
    id: "slate",
    name: "Slate Gray",
    description: "Minimalist and modern",
    primary: "#64748b",
    secondary: "#475569",
    accent: "#94a3b8",
    background: "#f8fafc",
  },
];

// Template layout options
const templateLayouts = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout with hero section, services grid, and contact form",
    preview: (
      <div className="w-full h-32 bg-gray-100 rounded border p-2 flex flex-col gap-1">
        <div className="h-8 bg-gray-300 rounded" /> {/* Hero */}
        <div className="flex-1 flex gap-1">
          <div className="flex-1 bg-gray-200 rounded" /> {/* Content */}
          <div className="w-1/3 bg-gray-200 rounded" /> {/* Sidebar */}
        </div>
        <div className="h-4 bg-gray-300 rounded" /> {/* Footer */}
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern",
    description: "Full-width sections with large imagery and bold typography",
    preview: (
      <div className="w-full h-32 bg-gray-100 rounded border p-2 flex flex-col gap-1">
        <div className="h-12 bg-gray-300 rounded" /> {/* Large Hero */}
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="bg-gray-200 rounded" />
          <div className="bg-gray-200 rounded" />
          <div className="bg-gray-200 rounded" />
        </div>
        <div className="h-4 bg-gray-300 rounded" />
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, simple design with lots of white space",
    preview: (
      <div className="w-full h-32 bg-white rounded border p-2 flex flex-col gap-2">
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="flex-1 flex flex-col gap-1 items-center justify-center">
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
      </div>
    ),
  },
  {
    id: "card-based",
    name: "Card-Based",
    description: "Everything in cards with subtle shadows and rounded corners",
    preview: (
      <div className="w-full h-32 bg-gray-50 rounded border p-2 flex flex-col gap-1">
        <div className="h-6 bg-white rounded shadow-sm" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-white rounded shadow-sm" />
          <div className="bg-white rounded shadow-sm" />
          <div className="bg-white rounded shadow-sm" />
          <div className="bg-white rounded shadow-sm" />
        </div>
      </div>
    ),
  },
  {
    id: "split",
    name: "Split Layout",
    description: "Two-column layout with image on one side, content on the other",
    preview: (
      <div className="w-full h-32 bg-gray-100 rounded border p-2 flex gap-1">
        <div className="w-1/2 bg-gray-300 rounded" /> {/* Image */}
        <div className="w-1/2 flex flex-col gap-1">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="flex-1 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "centered",
    name: "Centered",
    description: "All content centered with focus on readability",
    preview: (
      <div className="w-full h-32 bg-gray-100 rounded border p-2 flex flex-col items-center gap-1">
        <div className="h-8 w-3/4 bg-gray-300 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        <div className="flex-1 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/4 bg-gray-300 rounded" />
      </div>
    ),
  },
];

export interface ThemeSettings {
  colorPalette: string;
  templateLayout: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
}

const defaultSettings: ThemeSettings = {
  colorPalette: "emerald",
  templateLayout: "classic",
};

export default function ThemeTemplates() {
  const { toast } = useToast();
  const { tenantInfo } = useCustomAuth();
  const tenantCode = tenantInfo?.code || getDevTenantCode() || "";
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem(`theme_settings_${tenantCode}`);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // ignore parse errors
      }
    }
  }, [tenantCode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(`theme_settings_${tenantCode}`, JSON.stringify(settings));
      toast({
        title: "Theme Settings Saved",
        description: "Your website theme and template have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPalette = colorPalettes.find((p) => p.id === settings.colorPalette);

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Theme & Templates</h1>
            <p className="text-muted-foreground">
              Customize the look and feel of your public website
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open("/", "_blank")}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Site
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color Palette
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Layout Templates
            </TabsTrigger>
          </TabsList>

          {/* Color Palette Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Choose Your Color Palette
                </CardTitle>
                <CardDescription>
                  Select a color scheme that matches your brand and creates the right impression for
                  patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {colorPalettes.map((palette) => (
                    <div
                      key={palette.id}
                      onClick={() => setSettings((prev) => ({ ...prev, colorPalette: palette.id }))}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
                        settings.colorPalette === palette.id
                          ? "border-emerald-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {settings.colorPalette === palette.id && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      
                      {/* Color Preview */}
                      <div className="flex gap-1 mb-3">
                        <div
                          className="h-8 w-8 rounded-full border"
                          style={{ backgroundColor: palette.primary }}
                          title="Primary"
                        />
                        <div
                          className="h-8 w-8 rounded-full border"
                          style={{ backgroundColor: palette.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="h-8 w-8 rounded-full border"
                          style={{ backgroundColor: palette.accent }}
                          title="Accent"
                        />
                        <div
                          className="h-8 w-8 rounded-full border"
                          style={{ backgroundColor: palette.background }}
                          title="Background"
                        />
                      </div>
                      
                      <h3 className="font-medium text-sm">{palette.name}</h3>
                      <p className="text-xs text-muted-foreground">{palette.description}</p>
                    </div>
                  ))}
                </div>

                {/* Selected Palette Preview */}
                {selectedPalette && (
                  <div className="mt-6 p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-medium mb-3">Preview: {selectedPalette.name}</h4>
                    <div
                      className="rounded-lg p-4 space-y-3"
                      style={{ backgroundColor: selectedPalette.background }}
                    >
                      <div
                        className="h-10 rounded-md flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: selectedPalette.primary }}
                      >
                        Primary Button
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="flex-1 h-8 rounded-md flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: selectedPalette.secondary }}
                        >
                          Secondary
                        </div>
                        <div
                          className="flex-1 h-8 rounded-md flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: selectedPalette.accent }}
                        >
                          Accent
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: selectedPalette.secondary }}>
                        This is how your text links will appear
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5" />
                  Choose Your Layout Template
                </CardTitle>
                <CardDescription>
                  Select how your homepage, about page, and other public pages will be arranged
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={settings.templateLayout}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, templateLayout: value }))
                  }
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {templateLayouts.map((template) => (
                    <Label
                      key={template.id}
                      htmlFor={template.id}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
                        settings.templateLayout === template.id
                          ? "border-emerald-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <RadioGroupItem
                        value={template.id}
                        id={template.id}
                        className="absolute top-3 right-3"
                      />
                      
                      {/* Template Preview */}
                      <div className="mb-3">{template.preview}</div>
                      
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </Label>
                  ))}
                </RadioGroup>

                {/* Selected Template Info */}
                <div className="mt-6 p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-medium mb-2">
                    Selected: {templateLayouts.find((t) => t.id === settings.templateLayout)?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {templateLayouts.find((t) => t.id === settings.templateLayout)?.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This template will be applied to your Homepage, About page, Contact page, and
                    Book Appointment page.
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
