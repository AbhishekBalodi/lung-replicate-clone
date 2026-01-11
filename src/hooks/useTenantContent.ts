import { useState, useEffect } from "react";
import { getDevTenantCode } from "@/components/DevTenantSwitcher";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

export interface TenantContent {
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

const defaultContent: TenantContent = {
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

export function useTenantContent() {
  const { tenantInfo } = useCustomAuth();
  const tenantCode = tenantInfo?.code || getDevTenantCode() || "";
  const [content, setContent] = useState<TenantContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  // Check if this is the original doctor_mann tenant
  const isDrMannTenant = tenantCode === "doctor_mann" || tenantCode === "drmann";

  useEffect(() => {
    setLoading(true);
    const savedContent = localStorage.getItem(`website_content_${tenantCode}`);
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch {
        setContent(defaultContent);
      }
    } else {
      setContent(defaultContent);
    }
    setLoading(false);
  }, [tenantCode]);

  // Helper to check if content is configured (has at least some basic info)
  const hasContent = Boolean(
    content.siteName || 
    content.doctorName || 
    content.email || 
    content.phone || 
    content.address
  );

  return {
    content,
    loading,
    tenantCode,
    isDrMannTenant,
    hasContent,
  };
}
