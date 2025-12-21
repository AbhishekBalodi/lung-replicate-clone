import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, User, Crown } from 'lucide-react';

type LoginType = 'patient' | 'admin' | 'super_admin';

const CustomAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('patient');
  const { loginAsAdmin, loginAsSuperAdmin, loginAsPatient, isHospitalTenant, fetchTenantInfo, tenantInfo } = useCustomAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Refresh tenant info on mount
  useEffect(() => {
    fetchTenantInfo();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: loginType === 'patient' ? "Phone Number Required" : "Password Required",
        description: loginType === 'patient' ? "Please enter your phone number" : "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    let result;

    if (loginType === 'super_admin') {
      result = await loginAsSuperAdmin(email, password);
    } else if (loginType === 'admin') {
      result = await loginAsAdmin(email, password);
    } else {
      result = await loginAsPatient(email, password);
    }

    const { user: loggedInUser, error } = result;

    setLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Success
    const welcomeMessages = {
      super_admin: "Welcome Super Admin!",
      admin: "Welcome Doctor!",
      patient: "Welcome back!"
    };

    toast({
      title: "Login Successful",
      description: welcomeMessages[loginType]
    });

    // Redirect based on login type
    if (loginType === 'super_admin') {
      navigate('/super-admin');
    } else if (loginType === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/patient-dashboard');
    }
  };

  const getPasswordLabel = () => {
    if (loginType === 'patient') return 'Phone Number';
    return 'Password';
  };

  const getPasswordPlaceholder = () => {
    if (loginType === 'patient') return 'Enter your phone number';
    return 'Enter your password';
  };

  const getTabDescription = () => {
    switch (loginType) {
      case 'super_admin':
        return 'Login with the credentials used during hospital registration';
      case 'admin':
        return 'Login with your doctor credentials provided by the hospital';
      case 'patient':
        return 'Use the phone number you provided when booking your appointment';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Select login type and enter your credentials
          </CardDescription>

          {/* Login Type Toggle - Show 3 tabs for hospital, 2 for individual doctor */}
          <div className={`grid ${isHospitalTenant ? 'grid-cols-3' : 'grid-cols-2'} gap-2 p-1 bg-muted rounded-lg`}>
            <button
              type="button"
              onClick={() => setLoginType('patient')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all text-sm ${
                loginType === 'patient'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              Patient
            </button>

            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all text-sm ${
                loginType === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="h-4 w-4" />
              {isHospitalTenant ? 'Doctor' : 'Admin'}
            </button>

            {isHospitalTenant && (
              <button
                type="button"
                onClick={() => setLoginType('super_admin')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all text-sm ${
                  loginType === 'super_admin'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Crown className="h-4 w-4" />
                Super Admin
              </button>
            )}
          </div>

          {/* Tab-specific description */}
          {isHospitalTenant && (
            <p className="text-xs text-muted-foreground text-center">
              {getTabDescription()}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{getPasswordLabel()}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={getPasswordPlaceholder()}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {loginType === 'patient' && !isHospitalTenant && (
                <p className="text-xs text-muted-foreground">
                  Use the phone number you provided when booking your appointment
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomAuth;
