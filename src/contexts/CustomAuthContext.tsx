import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDevTenantCode } from '@/components/DevTenantSwitcher';

interface CustomUser {
  id: number | null;
  email: string;
  phone: string;
  name: string;
  role: 'super_admin' | 'admin' | 'patient';
  doctorId?: number | null;
  doctorInfo?: {
    id: number;
    name: string;
    specialization?: string;
    email?: string;
  } | null;
  tenantType?: 'hospital' | 'doctor';
}

interface Tenant {
  id: number;
  code: string;
  name: string;
  type: 'hospital' | 'doctor';
}

interface CustomAuthContextType {
  user: CustomUser | null;
  tenant: Tenant | null;
  tenantInfo: Tenant | null;
  loginAsAdmin: (email: string, password: string) => Promise<{ user?: CustomUser; error: any }>;
  loginAsSuperAdmin: (email: string, password: string) => Promise<{ user?: CustomUser; error: any }>;
  loginAsPatient: (email: string, phone: string) => Promise<{ user?: CustomUser; error: any }>;
  logout: () => void;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isPatient: boolean;
  isHospitalTenant: boolean;
  fetchTenantInfo: () => Promise<void>;
}

const CustomAuthContext = createContext<CustomAuthContextType | undefined>(undefined);

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantInfo, setTenantInfo] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const getApiBaseUrl = () => {
    const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

    // If env is empty, use same-origin (relative URLs like /api/...)
    if (!envUrl) return "";

    // If env points to localhost but we're on a real domain, ignore it to avoid net::ERR_CONNECTION_REFUSED
    if (typeof window !== "undefined") {
      const isProdHost = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
      const isLocalEnv = /localhost|127\.0\.0\.1/i.test(envUrl);
      if (isProdHost && isLocalEnv) return "";
    }

    // Normalize (no trailing slash)
    return envUrl.replace(/\/+$/, "");
  };

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const tenantCode = getDevTenantCode();
    if (tenantCode) {
      headers['X-Tenant-Code'] = tenantCode;
    }
    return headers;
  };

  // Fetch tenant info on mount (for login page to know if it's a hospital)
  const fetchTenantInfo = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      // Skip if no API URL configured (production may not need tenant-info for single-tenant)
      if (!baseUrl) {
        console.log('No API base URL configured, skipping tenant info fetch');
        return;
      }
      
      const tenantCode = getDevTenantCode();
      const response = await fetch(
        `${baseUrl}/api/platform/auth/tenant-info${tenantCode ? `?tenantCode=${tenantCode}` : ''}`,
        { 
          headers: getHeaders(),
          // Add timeout to prevent long waits if backend is down
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.tenant) {
          setTenantInfo({
            id: data.tenant.id,
            code: data.tenant.code,
            name: data.tenant.name,
            type: data.tenant.type
          });
        }
      }
    } catch (error) {
      // Silently fail - tenant info is optional for single-tenant deployments
      console.log('Could not fetch tenant info (this is OK for single-tenant deployments):', error);
    }
  };

  const parseJsonOrText = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return { json: await response.json(), text: null as string | null };
    }
    const text = await response.text();
    return { json: null as any, text };
  };

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('customUser');
    const storedTenant = localStorage.getItem('customTenant');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('customUser');
      }
    }
    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant));
      } catch (e) {
        localStorage.removeItem('customTenant');
      }
    }
    
    // Fetch tenant info for login page
    fetchTenantInfo();
    setLoading(false);
  }, []);

  // Re-fetch tenant info when tenant code changes
  useEffect(() => {
    const handleStorageChange = () => {
      fetchTenantInfo();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      const tenantCode = getDevTenantCode();
      
      const response = await fetch(`${getApiBaseUrl()}/api/platform/auth/tenant-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          email, 
          password, 
          loginType: 'admin',
          tenantCode: tenantCode || undefined
        })
      });

      const { json, text } = await parseJsonOrText(response);
      const data = json || {};

      if (!response.ok) {
        return {
          error: {
            message:
              (data as any).error ||
              (text ? `Backend error (${response.status}). Please try again.` : 'Login failed'),
          },
        };
      }

      // For admin login (doctor in hospital), check if role is 'admin' specifically
      if (data.user.role !== 'admin' && data.user.role !== 'super_admin') {
        return { error: { message: 'Invalid admin credentials' } };
      }

      // If hospital tenant and user is super_admin, reject (should use Super Admin tab)
      if (data.tenant?.type === 'hospital' && data.user.role === 'super_admin') {
        return { error: { message: 'Please use the Super Admin tab to login' } };
      }

      const userData: CustomUser = {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone || '',
        name: data.user.name,
        role: data.user.role,
        doctorId: data.user.doctorId,
        doctorInfo: data.user.doctorInfo,
        tenantType: data.tenant?.type
      };
      
      const tenantData: Tenant | null = data.tenant ? {
        id: data.tenant.id,
        code: data.tenant.code,
        name: data.tenant.name,
        type: data.tenant.type
      } : null;

      setUser(userData);
      setTenant(tenantData);
      localStorage.setItem('customUser', JSON.stringify(userData));
      if (tenantData) {
        localStorage.setItem('customTenant', JSON.stringify(tenantData));
      }
      return { user: userData, error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const loginAsSuperAdmin = async (email: string, password: string) => {
    try {
      const tenantCode = getDevTenantCode();
      
      const response = await fetch(`${getApiBaseUrl()}/api/platform/auth/tenant-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          email, 
          password, 
          loginType: 'admin',
          tenantCode: tenantCode || undefined
        })
      });

      const { json, text } = await parseJsonOrText(response);
      const data = json || {};

      if (!response.ok) {
        return {
          error: {
            message:
              (data as any).error ||
              (text ? `Backend error (${response.status}). Please try again.` : 'Login failed'),
          },
        };
      }

      // Super Admin login requires super_admin role
      if (data.user.role !== 'super_admin') {
        return { error: { message: 'Invalid Super Admin credentials' } };
      }

      const userData: CustomUser = {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone || '',
        name: data.user.name,
        role: data.user.role,
        doctorId: data.user.doctorId,
        doctorInfo: data.user.doctorInfo,
        tenantType: data.tenant?.type
      };
      
      const tenantData: Tenant | null = data.tenant ? {
        id: data.tenant.id,
        code: data.tenant.code,
        name: data.tenant.name,
        type: data.tenant.type
      } : null;

      setUser(userData);
      setTenant(tenantData);
      localStorage.setItem('customUser', JSON.stringify(userData));
      if (tenantData) {
        localStorage.setItem('customTenant', JSON.stringify(tenantData));
      }
      return { user: userData, error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const loginAsPatient = async (email: string, phone: string) => {
    try {
      const tenantCode = getDevTenantCode();
      
      const response = await fetch(`${getApiBaseUrl()}/api/platform/auth/tenant-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          email, 
          phone, 
          loginType: 'patient',
          tenantCode: tenantCode || undefined
        })
      });

      const { json, text } = await parseJsonOrText(response);
      const data = json || {};

      if (!response.ok) {
        return {
          error: {
            message:
              (data as any).error ||
              (text ? `Backend error (${response.status}). Please try again.` : 'Login failed'),
          },
        };
      }

      const userData: CustomUser = {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone || '',
        name: data.user.name,
        role: data.user.role,
        doctorId: data.user.doctorId,
        tenantType: data.tenant?.type
      };
      
      const tenantData: Tenant | null = data.tenant ? {
        id: data.tenant.id,
        code: data.tenant.code,
        name: data.tenant.name,
        type: data.tenant.type
      } : null;

      setUser(userData);
      setTenant(tenantData);
      localStorage.setItem('customUser', JSON.stringify(userData));
      if (tenantData) {
        localStorage.setItem('customTenant', JSON.stringify(tenantData));
      }
      return { user: userData, error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    localStorage.removeItem('customUser');
    localStorage.removeItem('customTenant');
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isPatient = user?.role === 'patient';
  const isHospitalTenant = tenant?.type === 'hospital' || tenantInfo?.type === 'hospital';

  return (
    <CustomAuthContext.Provider value={{ 
      user, 
      tenant,
      tenantInfo,
      loginAsAdmin, 
      loginAsSuperAdmin,
      loginAsPatient, 
      logout, 
      loading,
      isSuperAdmin,
      isAdmin,
      isPatient,
      isHospitalTenant,
      fetchTenantInfo
    }}>
      {children}
    </CustomAuthContext.Provider>
  );
};

export const useCustomAuth = () => {
  const context = useContext(CustomAuthContext);
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within a CustomAuthProvider');
  }
  return context;
};
