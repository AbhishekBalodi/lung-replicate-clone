import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDevTenantCode, setDevTenantCode } from '@/components/DevTenantSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { apiFetch } from '@/lib/api';

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
   🔹 HELPER: All API calls now use apiFetch from @/lib/api
   which handles base URL, tenant headers, credentials, etc.
   ============================================================ */

/**
 * Check if running on legacy Dr Mann site
 */
const isLegacyDrMannSite = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname.includes('delhichestphysician') || hostname.includes('drmann');
};

/* ============================================================
   🔹 PROVIDER
   ============================================================ */

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantInfo, setTenantInfo] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

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
      const tenantCode = getDevTenantCode();
      const queryParam = tenantCode ? `?tenantCode=${tenantCode}` : '';
      
      const res = await apiFetch(`/api/platform/auth/tenant-info${queryParam}`);

      if (res.ok) {
        const data = await res.json();
        if (data.tenant) {
          setTenantInfo(data.tenant);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tenant info:', err);
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
          const t = JSON.parse(storedTenant);
          setTenant(t);
          // ✅ Re-hydrate tenant code for apiFetch headers
          if (t.code) setDevTenantCode(t.code);
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
      localStorage.setItem('customUser', JSON.stringify(userData));
      return { user: userData, error: null };
    }

    try {
      const tenantCode = getDevTenantCode();
      
      const res = await apiFetch('/api/platform/auth/tenant-login', {
        method: 'POST',
        body: JSON.stringify({ email, password, tenantCode, loginType: 'admin' })
      });

      if (!res.ok) {
        const err = await res.json();
        return { user: undefined, error: { message: err.error || 'Login failed' } };
      }

      const data = await res.json();

      setUser(data.user);
      setTenant(data.tenant || null);
      // Persist for page refresh
      localStorage.setItem('customUser', JSON.stringify(data.user));
      if (data.tenant) {
        localStorage.setItem('customTenant', JSON.stringify(data.tenant));
        // ✅ CRITICAL: Set tenant code so all subsequent apiFetch calls
        // include X-Tenant-Code header for tenant-resolver middleware
        setDevTenantCode(data.tenant.code || tenantCode);
      }
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
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: phone, loginType: 'patient' })
      });

      if (!res.ok) {
        const err = await res.json();
        return { user: undefined, error: { message: err.error || 'Login failed' } };
      }

      const data = await res.json();

      setUser(data.user);
      localStorage.setItem('customUser', JSON.stringify(data.user));
      return { user: data.user, error: null };
    } catch (e: any) {
      return { user: undefined, error: { message: e.message || 'Network error' } };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Silent fail on logout
    }
    setUser(null);
    setTenant(null);
    localStorage.removeItem('customUser');
    localStorage.removeItem('customTenant');
    setDevTenantCode(null);
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
