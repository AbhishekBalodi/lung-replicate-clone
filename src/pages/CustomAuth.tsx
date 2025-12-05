import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, User } from 'lucide-react';

const CustomAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'patient'>('patient');
  const { loginAsAdmin, loginAsPatient } = useCustomAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        title: loginType === 'admin' ? "Password Required" : "Phone Number Required",
        description: loginType === 'admin' ? "Please enter your password" : "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    let result;

    if (loginType === 'admin') {
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
    toast({
      title: "Login Successful",
      description: loginType === 'admin' ? "Welcome Admin!" : "Welcome back!"
    });

    // Redirect based on login type
    if (loginType === 'admin') {
      navigate('/dashboard');
    } else {
      // patient login → redirect to patient dashboard with their email
      navigate(`/patient-dashboard/${encodeURIComponent(loggedInUser.email)}`);
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

          {/* Login Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setLoginType('patient')}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
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
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                loginType === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>
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
              <Label htmlFor="password">
                {loginType === 'admin' ? 'Password' : 'Phone Number'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={loginType === 'admin' ? 'Enter your password' : 'Enter your phone number'}
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

              {loginType === 'patient' && (
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
