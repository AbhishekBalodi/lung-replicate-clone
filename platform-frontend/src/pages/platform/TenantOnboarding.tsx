import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Building2, User, Globe, ArrowRight, ArrowLeft, Check, Loader2, Layout, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const SUBDOMAIN_SUFFIX = '.lungcare.in';

// Validation schema
const onboardingSchema = z.object({
  // Step 1: Tenant Type
  type: z.enum(['hospital', 'doctor']),
  
  // Step 2: Business Info
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20).optional(),
  address: z.string().max(500).optional(),
  
  // Step 3: Admin Account
  adminName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  adminPasswordConfirm: z.string(),
  adminPhone: z.string().max(20).optional(),

  // Optional doctor/hospital metadata
  doctorSpecialty: z.string().max(255).optional(),
  doctorDegrees: z.string().optional(),
  doctorAwards: z.string().optional(),
  doctorYearsExperience: z.string().optional(),
  doctorAge: z.string().optional(),
  doctorGender: z.string().optional(),
  doctorBio: z.string().optional(),
  
  // Step 4: Deployment Mode (subdomain is auto-generated)
  deploymentMode: z.enum(['full_website', 'dashboard_only']),
}).refine((data) => data.adminPassword === data.adminPasswordConfirm, {
  message: "Passwords don't match",
  path: ["adminPasswordConfirm"],
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

/** Generate a subdomain slug from business name */
function generateSubdomainSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

const TenantOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [tenantDetails, setTenantDetails] = useState<any>(null);

  useEffect(() => {
    if (!registrationResult?.tenant?.id) return;
    const fetchDetails = async () => {
      try {
        const res = await apiFetch(`/api/tenants/${registrationResult.tenant.id}`);
        if (!res.ok) return;
        const json = await res.json();
        setTenantDetails(json.tenant || null);
      } catch (e) {
        // ignore
      }
    };
    fetchDetails();
  }, [registrationResult]);

  const [doctorPhotoFile, setDoctorPhotoFile] = useState<File | null>(null);
  const [doctorPhotoPreview, setDoctorPhotoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doctor' | 'logo' | 'hero') => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be <= 5 MB'); return; }

    fileToDataUrl(f).then((dataUrl) => {
      if (type === 'doctor') { setDoctorPhotoFile(f); setDoctorPhotoPreview(dataUrl); }
      if (type === 'logo') { setLogoFile(f); setLogoPreview(dataUrl); }
      if (type === 'hero') { setHeroFile(f); setHeroPreview(dataUrl); }
    }).catch(() => toast.error('Failed to read file'));
  };

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      type: 'doctor',
      name: '',
      email: '',
      phone: '',
      address: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      adminPasswordConfirm: '',
      adminPhone: '',
      doctorSpecialty: '',
      doctorDegrees: '',
      doctorAwards: '',
      doctorYearsExperience: '',
      doctorAge: '',
      doctorGender: '',
      doctorBio: '',
      deploymentMode: 'full_website',
    },
  });

  const { register, handleSubmit, watch, formState: { errors }, setValue } = form;
  const tenantType = watch('type');
  const deploymentMode = watch('deploymentMode');
  const businessName = watch('name');

  // Auto-generated subdomain preview
  const subdomainSlug = generateSubdomainSlug(businessName || '');
  const subdomainPreview = subdomainSlug ? `${subdomainSlug}${SUBDOMAIN_SUFFIX}` : '';

  const steps = [
    { number: 1, title: 'Type', description: 'Choose your account type' },
    { number: 2, title: 'Business', description: 'Your business details' },
    { number: 3, title: 'Admin', description: 'Create admin account' },
    { number: 4, title: 'Deployment', description: 'Choose deployment mode' },
  ];

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        adminPhone: data.adminPhone,
        deploymentMode: data.deploymentMode,
        // No customDomain - backend auto-generates subdomain
      };

      if (data.doctorSpecialty) payload.doctorSpecialty = data.doctorSpecialty;
      if (data.doctorDegrees) payload.doctorDegrees = data.doctorDegrees;
      if (data.doctorAwards) payload.doctorAwards = data.doctorAwards;
      if (data.doctorYearsExperience) payload.doctorYearsExperience = data.doctorYearsExperience;
      if (data.doctorAge) payload.doctorAge = data.doctorAge;
      if (data.doctorGender) payload.doctorGender = data.doctorGender;
      if (data.doctorBio) payload.doctorBio = data.doctorBio;

      if (doctorPhotoPreview) payload.doctorPhotoBase64 = doctorPhotoPreview;
      if (logoPreview) payload.logoBase64 = logoPreview;
      if (heroPreview) payload.heroBase64 = heroPreview;

      const response = await apiFetch('/api/tenants/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setRegistrationResult(result);
      toast.success('Registration successful!');
      
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>Your account has been created</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Your Tenant Details:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Tenant Code:</span>
                <span className="font-mono">{registrationResult.tenant.tenantCode}</span>
                <span className="text-muted-foreground">Name:</span>
                <span>{registrationResult.tenant.name}</span>
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{registrationResult.tenant.type}</span>
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 capitalize">{registrationResult.tenant.status}</span>
              </div>
            </div>

            {/* Show subdomain info */}
            {registrationResult.subdomain && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Your Website Subdomain
                </h4>
                <div className="bg-white dark:bg-background rounded p-3 font-mono text-sm break-all">
                  <a href={`https://${registrationResult.subdomain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {registrationResult.subdomain}
                  </a>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your website is live at this subdomain. You can add a custom domain later from your dashboard settings.
                </p>
              </div>
            )}

            {/* Show uploaded assets */}
            {tenantDetails && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Uploaded Assets</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {tenantDetails.logo_url && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">Logo</p>
                      <img src={tenantDetails.logo_url} alt="logo" className="mx-auto h-24 object-contain" />
                    </div>
                  )}
                  {tenantDetails.hero_image_url && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-2">Hero Image</p>
                      <img src={tenantDetails.hero_image_url} alt="hero" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                  {tenantDetails.doctor_photo_url && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">Doctor Photo</p>
                      <img src={tenantDetails.doctor_photo_url} alt="doctor" className="mx-auto h-24 w-24 rounded-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dashboard Only info */}
            {registrationResult.tenant.deploymentMode === 'dashboard_only' && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Connect Your Existing Website
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Add a login button on your website that links to:
                </p>
                <div className="bg-white dark:bg-background rounded p-3 font-mono text-sm break-all">
                  <code>{window.location.origin}/login</code>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                {registrationResult.nextSteps?.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/platform/login')}
              >
                Go to Platform Login
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setRegistrationResult(null);
                  setCurrentStep(1);
                  form.reset();
                }}
              >
                Register Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Medical Website</CardTitle>
          <CardDescription>
            Get your own branded website with patient management in minutes
          </CardDescription>
          
          {/* Progress Steps */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep === step.number 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep > step.number 
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 rounded ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Tenant Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">What type of account do you need?</h3>
                <RadioGroup
                  value={tenantType}
                  onValueChange={(value) => setValue('type', value as 'hospital' | 'doctor')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Label 
                    htmlFor="type-doctor" 
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all hover:border-primary ${
                      tenantType === 'doctor' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <RadioGroupItem value="doctor" id="type-doctor" className="sr-only" />
                    <div className="flex flex-col items-center text-center space-y-3">
                      <User className="w-12 h-12 text-primary" />
                      <div>
                        <p className="font-semibold">Individual Doctor</p>
                        <p className="text-sm text-muted-foreground">
                          Single practitioner with their own website and patient management
                        </p>
                      </div>
                    </div>
                  </Label>

                  <Label 
                    htmlFor="type-hospital" 
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all hover:border-primary ${
                      tenantType === 'hospital' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <RadioGroupItem value="hospital" id="type-hospital" className="sr-only" />
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Building2 className="w-12 h-12 text-primary" />
                      <div>
                        <p className="font-semibold">Hospital / Clinic</p>
                        <p className="text-sm text-muted-foreground">
                          Multiple doctors under one organization with centralized management
                        </p>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {tenantType === 'hospital' ? 'Hospital / Clinic Details' : 'Practice Details'}
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {tenantType === 'hospital' ? 'Hospital/Clinic Name' : 'Practice/Doctor Name'} *
                  </Label>
                  <Input 
                    id="name" 
                    placeholder={tenantType === 'hospital' ? 'City Medical Center' : 'Dr. John Smith'} 
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  
                  {/* Auto subdomain preview */}
                  {subdomainPreview && (
                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Your auto-assigned subdomain:</p>
                      <p className="font-mono text-sm text-primary font-medium">{subdomainPreview}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="contact@example.com" 
                    {...register('email')}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+91 9876543210" 
                      {...register('phone')}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    placeholder="123 Medical Street, City, State, PIN" 
                    {...register('address')}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>

                {/* Doctor-specific metadata */}
                {tenantType === 'doctor' ? (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Doctor Profile (optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctorSpecialty">Specialty</Label>
                        <Input id="doctorSpecialty" placeholder="Pulmonology" {...register('doctorSpecialty')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctorYearsExperience">Years of Experience</Label>
                        <Input id="doctorYearsExperience" placeholder="10" {...register('doctorYearsExperience')} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctorDegrees">Degrees (comma separated)</Label>
                      <Input id="doctorDegrees" placeholder="MBBS, MD, FCCP" {...register('doctorDegrees')} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctorAge">Age</Label>
                        <Input id="doctorAge" placeholder="55" {...register('doctorAge')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctorGender">Gender</Label>
                        <select id="doctorGender" className="input" {...register('doctorGender')}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctorBio">Short Bio</Label>
                      <Textarea id="doctorBio" placeholder="Short bio for public site" {...register('doctorBio')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Doctor Photo</Label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'doctor')} />
                      {doctorPhotoPreview && (
                        <img src={doctorPhotoPreview} alt="preview" className="w-24 h-24 rounded-full object-cover mt-2" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Hospital Assets (optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Upload Logo</Label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                        {logoPreview && (
                          <img src={logoPreview} alt="logo" className="w-32 h-32 object-contain mt-2" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Upload Hero Image</Label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'hero')} />
                        {heroPreview && (
                          <img src={heroPreview} alt="hero" className="w-full h-36 object-cover mt-2 rounded" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Admin Account */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {tenantType === 'hospital' ? 'Super Admin Account' : 'Admin Account'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  This account will have full access to manage the dashboard
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name *</Label>
                  <Input id="adminName" placeholder="John Doe" {...register('adminName')} />
                  {errors.adminName && <p className="text-sm text-destructive">{errors.adminName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input id="adminEmail" type="email" placeholder="admin@example.com" {...register('adminEmail')} />
                  {errors.adminEmail && <p className="text-sm text-destructive">{errors.adminEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone Number</Label>
                  <Input id="adminPhone" placeholder="+91 9876543210" {...register('adminPhone')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password *</Label>
                    <Input id="adminPassword" type="password" placeholder="Min 8 characters" {...register('adminPassword')} />
                    {errors.adminPassword && <p className="text-sm text-destructive">{errors.adminPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPasswordConfirm">Confirm Password *</Label>
                    <Input id="adminPasswordConfirm" type="password" placeholder="Confirm password" {...register('adminPasswordConfirm')} />
                    {errors.adminPasswordConfirm && <p className="text-sm text-destructive">{errors.adminPasswordConfirm.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Deployment Mode */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Choose Deployment Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Select how you want to use our platform
                </p>
                
                <RadioGroup
                  value={deploymentMode}
                  onValueChange={(value) => setValue('deploymentMode', value as 'full_website' | 'dashboard_only')}
                  className="grid grid-cols-1 gap-4"
                >
                  <Label 
                    htmlFor="mode-full" 
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all hover:border-primary ${
                      deploymentMode === 'full_website' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <RadioGroupItem value="full_website" id="mode-full" className="sr-only" />
                    <div className="flex items-start gap-4">
                      <Globe className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">Full Website + Dashboard</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We deploy a complete medical website on an auto-assigned subdomain along with the admin dashboard.
                        </p>
                        {subdomainPreview && (
                          <p className="text-xs text-primary mt-2 font-mono">
                            Your site: {subdomainPreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </Label>

                  <Label 
                    htmlFor="mode-dashboard" 
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all hover:border-primary ${
                      deploymentMode === 'dashboard_only' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <RadioGroupItem value="dashboard_only" id="mode-dashboard" className="sr-only" />
                    <div className="flex items-start gap-4">
                      <Layout className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">Dashboard Only</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Already have a website? Just use our dashboards! Link a login button from your existing website to our platform.
                        </p>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                {deploymentMode === 'full_website' && subdomainPreview && (
                  <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Your auto-assigned subdomain:</p>
                    <p className="font-mono text-primary text-lg">{subdomainPreview}</p>
                    <p className="text-xs text-muted-foreground">
                      You can add a custom domain (e.g., www.yourclinic.com) later from your dashboard settings.
                    </p>
                  </div>
                )}

                {deploymentMode === 'dashboard_only' && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm">
                    <p className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      How to connect your existing website:
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      Add a "Login" button on your website linking to: <code className="bg-white dark:bg-background px-2 py-1 rounded">{window.location.origin}/login</code>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantOnboarding;
