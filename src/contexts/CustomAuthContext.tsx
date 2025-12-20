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
  loginAsAdmin: (email: string, password: string) => Promise<{ user?: CustomUser; error: any }>;
  loginAsPatient: (email: string, phone: string) => Promise<{ user?: CustomUser; error: any }>;
  logout: () => void;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isPatient: boolean;
}

const CustomAuthContext = createContext<CustomAuthContextType | undefined>(undefined);

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, []);

  const getApiBaseUrl = () => {
    // Use environment variable if set, otherwise use relative path for production
    return import.meta.env.VITE_API_BASE_URL || '';
  };

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const tenantCode = getDevTenantCode();
    if (tenantCode) {
      headers['X-Tenant-Code'] = tenantCode;
    }
    return headers;
  };

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      const tenantCode = getDevTenantCode();
      
      // Use platform auth for tenant login
      const response = await fetch(`${getApiBaseUrl()}/api/platform/auth/tenant-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          email, 
          password, 
          loginType: 'admin',
          tenantCode 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Login failed' } };
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
          tenantCode 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Login failed' } };
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

  return (
    <CustomAuthContext.Provider value={{ 
      user, 
      tenant,
      loginAsAdmin, 
      loginAsPatient, 
      logout, 
      loading,
      isSuperAdmin,
      isAdmin,
      isPatient
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
