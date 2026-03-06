import { useEffect } from "react";
import { getDevTenantCode } from "@/components/DevTenantSwitcher";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

// Color palette definitions matching ThemeTemplates.tsx
const colorPalettes: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}> = {
  emerald: { primary: "#10b981", secondary: "#059669", accent: "#34d399", background: "#ecfdf5", foreground: "#064e3b" },
  blue: { primary: "#3b82f6", secondary: "#2563eb", accent: "#60a5fa", background: "#eff6ff", foreground: "#1e3a8a" },
  teal: { primary: "#14b8a6", secondary: "#0d9488", accent: "#2dd4bf", background: "#f0fdfa", foreground: "#134e4a" },
  indigo: { primary: "#6366f1", secondary: "#4f46e5", accent: "#818cf8", background: "#eef2ff", foreground: "#312e81" },
  rose: { primary: "#f43f5e", secondary: "#e11d48", accent: "#fb7185", background: "#fff1f2", foreground: "#881337" },
  amber: { primary: "#f59e0b", secondary: "#d97706", accent: "#fbbf24", background: "#fffbeb", foreground: "#78350f" },
  purple: { primary: "#a855f7", secondary: "#9333ea", accent: "#c084fc", background: "#faf5ff", foreground: "#581c87" },
  slate: { primary: "#64748b", secondary: "#475569", accent: "#94a3b8", background: "#f8fafc", foreground: "#1e293b" },
};

function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Applies the saved tenant theme (color palette) as CSS custom properties on :root.
 * This makes the theme affect all components using the design system tokens.
 */
export default function ThemeApplicator() {
  const { tenantInfo } = useCustomAuth();
  const tenantCode = getDevTenantCode() || tenantInfo?.code || "";

  useEffect(() => {
    if (!tenantCode) return;

    const savedSettings = localStorage.getItem(`theme_settings_${tenantCode}`);
    if (!savedSettings) return;

    try {
      const settings = JSON.parse(savedSettings);
      const palette = colorPalettes[settings.colorPalette];
      if (!palette) return;

      const root = document.documentElement;
      
      // Apply theme colors as CSS variables
      root.style.setProperty("--tenant-primary", palette.primary);
      root.style.setProperty("--tenant-secondary", palette.secondary);
      root.style.setProperty("--tenant-accent", palette.accent);
      root.style.setProperty("--tenant-bg", palette.background);
      root.style.setProperty("--tenant-fg", palette.foreground);

      // Also override the shadcn/tailwind primary HSL tokens so buttons, badges etc. update
      root.style.setProperty("--primary", hexToHSL(palette.primary));
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", hexToHSL(palette.accent));
      root.style.setProperty("--accent-foreground", hexToHSL(palette.foreground));

      return () => {
        // Cleanup: remove overrides when component unmounts
        root.style.removeProperty("--tenant-primary");
        root.style.removeProperty("--tenant-secondary");
        root.style.removeProperty("--tenant-accent");
        root.style.removeProperty("--tenant-bg");
        root.style.removeProperty("--tenant-fg");
        root.style.removeProperty("--primary");
        root.style.removeProperty("--primary-foreground");
        root.style.removeProperty("--accent");
        root.style.removeProperty("--accent-foreground");
      };
    } catch {
      // Ignore parse errors
    }
  }, [tenantCode]);

  // Listen for storage events so theme updates immediately after save
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("theme_settings_")) {
        // Re-trigger by forcing re-render
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
}
