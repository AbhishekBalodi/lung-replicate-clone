import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CustomUser {
  id?: number;
  email: string;
  phone?: string;
  name: string;
  role: 'admin' | 'patient';
}

interface CustomAuthContextType {
  user: CustomUser | null;
  loginAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  loginAsPatient: (email: string, phone: string) => Promise<{ error: any }>;
  logout: () => void;
  loading: boolean;
}

const CustomAuthContext = createContext<CustomAuthContextType | undefined>(undefined);

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('customUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('customUser');
      }
    }
    setLoading(false);
  }, []);

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: 'admin' })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Login failed' } };
      }

      const userData = data.user;
      setUser(userData);
      localStorage.setItem('customUser', JSON.stringify(userData));
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const loginAsPatient = async (email: string, phone: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: phone, loginType: 'patient' })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Login failed' } };
      }

      const userData = data.user;
      setUser(userData);
      localStorage.setItem('customUser', JSON.stringify(userData));
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('customUser');
  };

  return (
    <CustomAuthContext.Provider value={{ user, loginAsAdmin, loginAsPatient, logout, loading }}>
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
