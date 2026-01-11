import { useState, useEffect } from "react";
import { getDevTenantCode } from "@/components/DevTenantSwitcher";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

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

// Color palette definitions
export const colorPalettes: Record<string, {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}> = {
  emerald: {
    name: "Emerald Green",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#ecfdf5",
    foreground: "#064e3b",
  },
  blue: {
    name: "Ocean Blue",
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    background: "#eff6ff",
    foreground: "#1e3a8a",
  },
  teal: {
    name: "Teal",
    primary: "#14b8a6",
    secondary: "#0d9488",
    accent: "#2dd4bf",
    background: "#f0fdfa",
    foreground: "#134e4a",
  },
  indigo: {
    name: "Indigo",
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#818cf8",
    background: "#eef2ff",
    foreground: "#312e81",
  },
  rose: {
    name: "Rose",
    primary: "#f43f5e",
    secondary: "#e11d48",
    accent: "#fb7185",
    background: "#fff1f2",
    foreground: "#881337",
  },
  amber: {
    name: "Amber Gold",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    background: "#fffbeb",
    foreground: "#78350f",
  },
  purple: {
    name: "Purple",
    primary: "#a855f7",
    secondary: "#9333ea",
    accent: "#c084fc",
    background: "#faf5ff",
    foreground: "#581c87",
  },
  slate: {
    name: "Slate Gray",
    primary: "#64748b",
    secondary: "#475569",
    accent: "#94a3b8",
    background: "#f8fafc",
    foreground: "#1e293b",
  },
};

const defaultSettings: ThemeSettings = {
  colorPalette: "emerald",
  templateLayout: "classic",
};

export function useTenantTheme() {
  const { tenantInfo } = useCustomAuth();
  const tenantCode = tenantInfo?.code || getDevTenantCode() || "";
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const savedSettings = localStorage.getItem(`theme_settings_${tenantCode}`);
    if (savedSettings) {
      try {
        setThemeSettings(JSON.parse(savedSettings));
      } catch {
        setThemeSettings(defaultSettings);
      }
    } else {
      setThemeSettings(defaultSettings);
    }
    setLoading(false);
  }, [tenantCode]);

  const palette = colorPalettes[themeSettings.colorPalette] || colorPalettes.emerald;

  return {
    themeSettings,
    palette,
    templateLayout: themeSettings.templateLayout,
    loading,
    tenantCode,
  };
}
