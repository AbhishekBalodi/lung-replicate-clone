// Custom Auth Context - Multi-tenant authentication
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDevTenantCode } from '@/components/DevTenantSwitcher';
import { supabase } from '@/integrations/supabase/client';

/* ============================================================
   🔹 TYPES
   ============================================================ */

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

/** ✅ FIX: strict union return type */
type AuthResult =
  | { user: CustomUser; error: null }
  | { user?: undefined; error: { message: string } };

interface CustomAuthContextType {
  user: CustomUser | null;
  tenant: Tenant | null;
  tenantInfo: Tenant | null;

  loginAsAdmin: (email: string, password: string) => Promise<AuthResult>;
  loginAsSuperAdmin: (email: string, password: string) => Promise<AuthResult>;
  loginAsPatient: (email: string, phone: string) => Promise<AuthResult>;

  logout: () => Promise<void>;
  loading: boolean;

  isSuperAdmin: boolean;
  isAdmin: boolean;
  isPatient: boolean;
  isHospitalTenant: boolean;

  fetchTenantInfo: () => Promise<void>;
}

const CustomAuthContext = createContext<CustomAuthContextType | undefined>(undefined);

/* ============================================================
   🔹 PROVIDER
   ============================================================ */

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantInfo, setTenantInfo] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const isLegacyDrMannSite = () => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname.toLowerCase();
    return hostname.includes('delhichestphysician') || hostname.includes('drmann');
  };

  const getApiBaseUrl = () => {
    // DEV: use same-origin '/api' via Vite proxy so cookies appear on localhost:8080
    if (import.meta.env.DEV) return '';
    if (isLegacyDrMannSite()) return '';
    const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
    if (!envUrl) return '';
    return envUrl.replace(/\/+$/, '');
  };

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const tenantCode = getDevTenantCode();
    if (tenantCode) headers['X-Tenant-Code'] = tenantCode;
    return headers;
  };

  /* ============================================================
     🔹 TENANT INFO
     ============================================================ */
  const fetchTenantInfo = async () => {
    if (isLegacyDrMannSite()) {
      setTenantInfo({
        id: 1,
        code: 'drmann',
        name: 'Dr. Mann Clinic',
        type: 'doctor'
      });
      return;
    }

    try {
      const baseUrl = getApiBaseUrl();
      const tenantCode = getDevTenantCode();
      // In development we allow relative requests (baseUrl may be empty), so build URL accordingly
      const url = `${baseUrl || ''}/api/platform/auth/tenant-info${tenantCode ? `?tenantCode=${tenantCode}` : ''}`;
      const res = await fetch(url, { headers: getHeaders(), credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        if (data.tenant) setTenantInfo(data.tenant);
      }
    } catch {
      // silent
    }
  };

  // Try to hydrate user from localStorage on mount (for page refreshes)
  useEffect(() => {
    const hydrateFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem('customUser');
        const storedTenant = localStorage.getItem('customTenant');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedTenant) {
          setTenant(JSON.parse(storedTenant));
        }
      } catch {
        // ignore parse errors
      }
      await fetchTenantInfo();
      setLoading(false);
    };
    hydrateFromStorage();
  }, []);

  /* ============================================================
     🔹 LOGIN FUNCTIONS
     ============================================================ */

  const loginAsAdmin = async (email: string, password: string): Promise<AuthResult> => {
    if (isLegacyDrMannSite()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return { user: undefined, error: { message: error?.message || 'Login failed' } };
      }

      const userData: CustomUser = {
        id: null,
        email: data.user.email || email,
        phone: '',
        name: data.user.user_metadata?.full_name || 'Admin',
        role: 'admin',
        tenantType: 'doctor'
      };

      setUser(userData);
      return { user: userData, error: null };
    }

    try {
      const tenantCode = getDevTenantCode();
      const res = await fetch(`${getApiBaseUrl()}/api/platform/auth/tenant-login`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, password, tenantCode, loginType: 'admin' })
      });

      const data = await res.json();
      if (!res.ok) {
        return { user: undefined, error: { message: data.error || 'Login failed' } };
      }

      setUser(data.user);
      setTenant(data.tenant || null);
      // Persist for page refresh
      localStorage.setItem('customUser', JSON.stringify(data.user));
      if (data.tenant) localStorage.setItem('customTenant', JSON.stringify(data.tenant));
      return { user: data.user, error: null };
    } catch (e: any) {
      return { user: undefined, error: { message: e.message || 'Network error' } };
    }
  };

  const loginAsSuperAdmin = async (email: string, password: string): Promise<AuthResult> => {
    const result = await loginAsAdmin(email, password);
    if (result.user && result.user.role !== 'super_admin') {
      return { user: undefined, error: { message: 'Invalid Super Admin credentials' } };
    }
    return result;
  };

  const loginAsPatient = async (email: string, phone: string): Promise<AuthResult> => {
    try {
      const tenantCode = getDevTenantCode();
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
           email,
          password: phone,
          loginType: 'patient' 
            })
      });

      const data = await res.json();
      if (!res.ok) {
        return { user: undefined, error: { message: data.error || 'Login failed' } };
      }

      setUser(data.user);
      //setTenant(data.tenant || null);
      return { user: data.user, error: null };
    } catch (e: any) {
      return { user: undefined, error: { message: e.message || 'Network error' } };
    }
  };

  const logout = async () => {
    await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    setTenant(null);
    localStorage.removeItem('customUser');
    localStorage.removeItem('customTenant');
  };

  /* ============================================================
     🔹 FLAGS
     ============================================================ */

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isPatient = user?.role === 'patient';
  const isHospitalTenant = tenant?.type === 'hospital' || tenantInfo?.type === 'hospital';

  return (
    <CustomAuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </CustomAuthContext.Provider>
  );
};

export const useCustomAuth = () => {
  const ctx = useContext(CustomAuthContext);
  if (!ctx) throw new Error('useCustomAuth must be used within CustomAuthProvider');
  return ctx;
};
