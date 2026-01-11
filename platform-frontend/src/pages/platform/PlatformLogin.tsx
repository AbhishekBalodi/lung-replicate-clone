import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Shield, Building2, User, Crown } from 'lucide-react';

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5050';
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '';
};

type LoginMode = 'platform_admin' | 'tenant';
type TenantLoginType = 'super_admin' | 'admin';

const PlatformLogin = () => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<LoginMode>('tenant');
  const [tenantLoginType, setTenantLoginType] = useState<TenantLoginType>('super_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlatformAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/platform/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('platformUser', JSON.stringify(data.user));
      toast.success('Login successful');
      navigate('/platform-dashboard');

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!tenantCode.trim()) {
      toast.error('Please enter your Tenant Code');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/platform/auth/tenant-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Code': tenantCode.trim()
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          tenantCode: tenantCode.trim(),
          loginType: tenantLoginType 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tenant user session
      localStorage.setItem('customUser', JSON.stringify(data.user));
      localStorage.setItem('tenantInfo', JSON.stringify(data.tenant));
      // Keep dashboard API calls consistent (they read dev_tenant_code via DevTenantSwitcher)
      localStorage.setItem('dev_tenant_code', tenantCode.trim());
      
      toast.success('Login successful');
      
      // Redirect based on role
      if (tenantLoginType === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Tenant login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={loginMode} onValueChange={(v) => setLoginMode(v as LoginMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="tenant" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Doctor/Hospital
              </TabsTrigger>
              <TabsTrigger value="platform_admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Platform Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tenant">
              <form onSubmit={handleTenantLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantCode">Tenant Code</Label>
                  <Input
                    id="tenantCode"
                    type="text"
                    placeholder="e.g., hosp_city_hospital"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The code you received during registration
                  </p>
                </div>

                {/* Login Type Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTenantLoginType('super_admin')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all text-sm ${
                      tenantLoginType === 'super_admin'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenantLoginType('admin')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all text-sm ${
                      tenantLoginType === 'admin'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Doctor/Admin
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenantEmail">Email</Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantPassword">Password</Label>
                  <Input
                    id="tenantPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="platform_admin">
              <form onSubmit={handlePlatformAdminLogin} className="space-y-4">
                <p className="text-xs text-muted-foreground text-center mb-4">
                  For SaaS platform administrators only
                </p>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@platform.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Want to create a new medical website?
          </p>
          <Link to="/register" className="w-full">
            <Button variant="outline" className="w-full">
              Register as Doctor/Hospital
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PlatformLogin;
