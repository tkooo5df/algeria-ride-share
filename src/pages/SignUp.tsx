import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Car, User, Mail, Phone, MapPin, Eye, EyeOff, CheckCircle, AlertCircle, Chrome, Database, Settings, ArrowRight, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { wilayas } from "@/data/wilayas";
import { useDatabase } from "@/hooks/useDatabase";
import { BrowserDatabaseService } from "@/integrations/database/browserServices";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { toast } from "@/hooks/use-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const { getDatabaseService, isLocal } = useDatabase();
  const { signIn: localSignIn } = useLocalAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("passenger");
  const [wilaya, setWilaya] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Driver onboarding states
  const [showDriverOnboarding, setShowDriverOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [driverFormData, setDriverFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    wilaya: "",
    commune: "",
    address: "",
    
    // Vehicle Info
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    plateNumber: "",
    seats: "",
    category: "",
  });

  const vehicleCategories = [
    { value: "economy", label: "اقتصادي" },
    { value: "comfort", label: "مريح" },
    { value: "premium", label: "فاخر" }
  ];

  const validateForm = () => {
    if (!showDriverOnboarding) {
      // Regular signup validation
      if (!firstName.trim()) {
        setError("الاسم الأول مطلوب");
        return false;
      }
      if (!lastName.trim()) {
        setError("اسم العائلة مطلوب");
        return false;
      }
      if (!email.trim()) {
        setError("البريد الإلكتروني مطلوب");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("البريد الإلكتروني غير صحيح");
        return false;
      }
      if (password.length < 6) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return false;
      }
      if (password !== confirmPassword) {
        setError("كلمات المرور غير متطابقة");
        return false;
      }
      if (phone && !/^(\+213|0)[5-7][0-9]{8}$/.test(phone)) {
        setError("رقم الهاتف غير صحيح");
        return false;
      }
      if (!acceptTerms) {
        setError("يجب الموافقة على الشروط والأحكام");
        return false;
      }
    } else {
      // Driver onboarding validation
      if (currentStep === 1) {
        if (!driverFormData.firstName.trim()) {
          setError("الاسم الأول مطلوب");
          return false;
        }
        if (!driverFormData.lastName.trim()) {
          setError("اسم العائلة مطلوب");
          return false;
        }
        if (!driverFormData.email.trim()) {
          setError("البريد الإلكتروني مطلوب");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverFormData.email)) {
          setError("البريد الإلكتروني غير صحيح");
          return false;
        }
        if (driverFormData.phone && !/^(\+213|0)[5-7][0-9]{8}$/.test(driverFormData.phone)) {
          setError("رقم الهاتف غير صحيح");
          return false;
        }
      } else if (currentStep === 2) {
        if (!driverFormData.vehicleBrand.trim()) {
          setError("ماركة المركبة مطلوبة");
          return false;
        }
        if (!driverFormData.vehicleModel.trim()) {
          setError("موديل المركبة مطلوب");
          return false;
        }
        if (!driverFormData.vehicleYear.trim()) {
          setError("سنة الصنع مطلوبة");
          return false;
        }
        if (!driverFormData.vehicleColor.trim()) {
          setError("لون المركبة مطلوب");
          return false;
        }
        if (!driverFormData.plateNumber.trim()) {
          setError("رقم اللوحة مطلوب");
          return false;
        }
        if (!driverFormData.seats) {
          setError("عدد المقاعد مطلوب");
          return false;
        }
      } else if (currentStep === 3) {
        // Password validation for step 3
        if (password.length < 6) {
          setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return false;
        }
        if (password !== confirmPassword) {
          setError("كلمات المرور غير متطابقة");
          return false;
        }
        if (!acceptTerms) {
          setError("يجب الموافقة على الشروط والأحكام");
          return false;
        }
      }
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (showDriverOnboarding) {
        // Handle driver onboarding signup
        await handleDriverSignup();
        return;
      }

      if (isLocal) {
        // Use local database
        const db = getDatabaseService();
        
        // Check if email already exists
        const existingProfile = await BrowserDatabaseService.getProfileByEmail(email);
        if (existingProfile) {
          setError("البريد الإلكتروني مستخدم بالفعل");
          setLoading(false);
          return;
        }

        // Create profile in local database
        const profileData = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          firstName: firstName,
          lastName: lastName,
          fullName: `${firstName} ${lastName}`,
          phone: phone || null,
          role: role as 'driver' | 'passenger' | 'admin',
          wilaya: wilaya || 'الجزائر',
          commune: 'غير محدد',
          address: 'غير محدد',
          isVerified: true, // Auto-verify for local database
          isDemo: false, // Explicitly mark as not demo
        };

        const newProfile = await BrowserDatabaseService.createProfile(profileData);
        
        if (newProfile) {
          // Send welcome notification to new user
          try {
            const { NotificationService } = await import('@/integrations/database/notificationService');
            await NotificationService.notifyWelcomeUser(newProfile.id, role);
            
            // Notify admins about new user registration
            await NotificationService.notifyNewUserRegistration({
              userId: newProfile.id,
              userRole: role as 'driver' | 'passenger' | 'admin',
              userName: `${firstName} ${lastName}`,
              userEmail: email
            });
          } catch (notificationError) {
            console.error('Error sending welcome notifications:', notificationError);
          }
          
          setSuccess("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
          
          // Auto sign in after successful registration
          setTimeout(async () => {
            try {
              await localSignIn(email, password);
              toast({
                title: "تم تسجيل الدخول تلقائياً",
                description: "مرحباً بك في DZ Taxi!",
              });
              // If the user is a driver, redirect to driver onboarding instead of dashboard
              if (role === 'driver') {
                navigate("/driver-after-signup");
              } else {
                navigate("/dashboard");
              }
            } catch (error) {
              navigate("/auth/signin");
            }
          }, 2000);
        } else {
          setError("فشل في إنشاء الحساب");
        }
      } else {
        // Use Supabase, fallback to local if it fails (e.g., 500)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              role: role,
              wilaya: wilaya,
            },
          },
        });

        if (error) {
          // Fallback: create local profile and auto sign in
          const db = getDatabaseService();
          const existing = await BrowserDatabaseService.getProfileByEmail(email);
          if (existing) {
            setError("هذا البريد مستخدم محلياً. يرجى تسجيل الدخول.");
          } else {
            const localProfile = await BrowserDatabaseService.createProfile({
              id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              email,
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`,
              phone: phone || null,
              role: role as 'driver' | 'passenger' | 'admin',
              wilaya: wilaya || 'الجزائر',
              commune: 'غير محدد',
              address: 'غير محدد',
              isVerified: true,
              isDemo: false, // Explicitly mark as not demo
            });

            if (localProfile) {
              // Send welcome notification to new user (fallback)
              try {
                const { NotificationService } = await import('@/integrations/database/notificationService');
                await NotificationService.notifyWelcomeUser(localProfile.id, role);
                
                // Notify admins about new user registration
                await NotificationService.notifyNewUserRegistration({
                  userId: localProfile.id,
                  userRole: role as 'driver' | 'passenger' | 'admin',
                  userName: `${firstName} ${lastName}`,
                  userEmail: email
                });
              } catch (notificationError) {
                console.error('Error sending welcome notifications:', notificationError);
              }
              
              setSuccess("لا يمكن الاتصال بـ Supabase. تم إنشاء الحساب محلياً وتم تسجيل دخولك.");
              try {
                // Auto sign-in via local auth flow if available
                // We navigate directly to dashboard; SignIn already supports local
                // If the user is a driver, redirect to driver onboarding instead of dashboard
                if (role === 'driver') {
                  navigate('/driver-after-signup');
                } else {
                  navigate('/dashboard');
                }
              } catch {
                navigate('/auth/signin');
              }
            } else {
              setError("تعذر إنشاء الحساب حالياً. حاول لاحقاً.");
            }
          }
        } else {
          setSuccess("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب.");
          // Clear form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFirstName("");
          setLastName("");
          setPhone("");
          setWilaya("");
          setAcceptTerms(false);
          
          // Redirect after 3 seconds
          setTimeout(() => {
            // If the user is a driver, redirect to driver onboarding instead of signin
            if (role === 'driver') {
              navigate("/driver-after-signup");
            } else {
              navigate("/auth/signin");
            }
          }, 3000);
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSignup = async () => {
    try {
      // First create the user account
      const db = getDatabaseService();
      
      // Check if email already exists
      const existingProfile = await BrowserDatabaseService.getProfileByEmail(driverFormData.email);
      if (existingProfile) {
        setError("البريد الإلكتروني مستخدم بالفعل");
        setLoading(false);
        return;
      }

      // Create profile in local database
      const profileData = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: driverFormData.email,
        firstName: driverFormData.firstName,
        lastName: driverFormData.lastName,
        fullName: `${driverFormData.firstName} ${driverFormData.lastName}`,
        phone: driverFormData.phone || null,
        role: 'driver' as 'driver',
        wilaya: driverFormData.wilaya || 'الجزائر',
        commune: driverFormData.commune || 'غير محدد',
        address: driverFormData.address || 'غير محدد',
        isVerified: true, // Auto-verify for local database
        isDemo: false, // Explicitly mark as not demo
      };

      const newProfile = await BrowserDatabaseService.createProfile(profileData);
      
      if (newProfile) {
        // Create vehicle for the driver
        const vehicle = await BrowserDatabaseService.createVehicle({
          driverId: newProfile.id,
          make: driverFormData.vehicleBrand,
          model: driverFormData.vehicleModel,
          year: parseInt(driverFormData.vehicleYear),
          color: driverFormData.vehicleColor,
          licensePlate: driverFormData.plateNumber,
          seats: parseInt(driverFormData.seats)
        });

        // Send welcome notification to new user
        try {
          const { NotificationService } = await import('@/integrations/database/notificationService');
          await NotificationService.notifyWelcomeUser(newProfile.id, 'driver');
          
          // Notify admins about new user registration
          await NotificationService.notifyNewUserRegistration({
            userId: newProfile.id,
            userRole: 'driver',
            userName: `${driverFormData.firstName} ${driverFormData.lastName}`,
            userEmail: driverFormData.email
          });
          
          // Create a notification for the driver
          await BrowserDatabaseService.createNotification({
            userId: newProfile.id,
            title: "مرحبا بك كسائق",
            message: `مرحبا بك في منصة DZ Taxi. تم إنشاء حسابك كسائق ومركبة ${driverFormData.vehicleBrand} ${driverFormData.vehicleModel} بنجاح.`,
            type: "system"
          });
        } catch (notificationError) {
          console.error('Error sending welcome notifications:', notificationError);
        }
        
        setSuccess("تم إنشاء الحساب بنجاح! سيتم تسجيل الدخول تلقائياً.");
        
        // Auto sign in after successful registration
        setTimeout(async () => {
          try {
            await localSignIn(driverFormData.email, password);
            toast({
              title: "تم تسجيل الدخول تلقائياً",
              description: "مرحباً بك في DZ Taxi!",
            });
            navigate("/dashboard");
          } catch (error) {
            navigate("/auth/signin");
          }
        }, 2000);
      } else {
        setError("فشل في إنشاء الحساب");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        throw error;
      }
      // Note: The redirect will happen automatically
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء التسجيل بـ Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDriverInputChange = (field: string, value: string) => {
    setDriverFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === 'driver') {
      setShowDriverOnboarding(true);
      // Pre-fill driver form with basic info if available
      setDriverFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email,
        phone,
        wilaya
      }));
    }
  };

  const handleBackToSignup = () => {
    setShowDriverOnboarding(false);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                <User className="h-8 w-8 text-primary" />
                {showDriverOnboarding ? "انضم إلى شبكة سائقي DZ Taxi" : "إنشاء حساب جديد"}
              </CardTitle>
              <CardDescription>
                {showDriverOnboarding 
                  ? "أدخل معلوماتك لبدء العمل كسائق" 
                  : "أدخل معلوماتك لإنشاء حساب في DZ Taxi"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!showDriverOnboarding ? (
                <>
                  {/* Role Selection */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${role === 'passenger' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleRoleSelect('passenger')}
                    >
                      <CardContent className="p-4 text-center">
                        <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">راكب</h3>
                        <p className="text-sm text-muted-foreground">أريد حجز رحلات</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${role === 'driver' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleRoleSelect('driver')}
                    >
                      <CardContent className="p-4 text-center">
                        <Car className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">سائق</h3>
                        <p className="text-sm text-muted-foreground">أريد تقديم رحلات</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${role === 'admin' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleRoleSelect('admin')}
                    >
                      <CardContent className="p-4 text-center">
                        <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">مدير</h3>
                        <p className="text-sm text-muted-foreground">إدارة النظام</p>
                      </CardContent>
                    </Card>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">الاسم الأول *</Label>
                        <Input
                          id="first-name"
                          placeholder="أدخل اسمك الأول"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">اسم العائلة *</Label>
                        <Input
                          id="last-name"
                          placeholder="أدخل اسم العائلة"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="أدخل بريدك الإلكتروني"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+213 555 123 456"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="wilaya">الولاية</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select value={wilaya} onValueChange={setWilaya}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="اختر الولاية" />
                          </SelectTrigger>
                          <SelectContent>
                            {wilayas.map((w) => (
                              <SelectItem key={w.code} value={w.code}>
                                {w.code} - {w.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور *</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="أعد إدخال كلمة المرور"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        أوافق على{" "}
                        <Link to="/terms" className="text-primary hover:underline">
                          الشروط والأحكام
                        </Link>
                        {" "}و{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          سياسة الخصوصية
                        </Link>
                      </Label>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Buttons */}
                    <div className="space-y-3">
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">أو</span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full" 
                        onClick={handleGoogleSignUp}
                        disabled={loading || googleLoading}
                      >
                        <Chrome className="h-4 w-4 mr-2" />
                        {googleLoading ? "جاري التسجيل..." : "التسجيل باستخدام Google"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Driver Onboarding Slides */}
                  {/* Progress Steps */}
                  <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step <= currentStep 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {step < currentStep ? <Check className="h-4 w-4" /> : step}
                          </div>
                          {step < 3 && (
                            <div className={`w-12 h-0.5 mx-2 ${
                              step < currentStep ? 'bg-primary' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-6">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="driver-first-name">الاسم الأول</Label>
                            <Input
                              id="driver-first-name"
                              value={driverFormData.firstName}
                              onChange={(e) => handleDriverInputChange("firstName", e.target.value)}
                              placeholder="أدخل اسمك الأول"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver-last-name">اسم العائلة</Label>
                            <Input
                              id="driver-last-name"
                              value={driverFormData.lastName}
                              onChange={(e) => handleDriverInputChange("lastName", e.target.value)}
                              placeholder="أدخل اسم العائلة"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="driver-phone">رقم الهاتف</Label>
                          <Input
                            id="driver-phone"
                            value={driverFormData.phone}
                            onChange={(e) => handleDriverInputChange("phone", e.target.value)}
                            placeholder="+213 555 123 456"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="driver-email">البريد الإلكتروني</Label>
                          <Input
                            id="driver-email"
                            type="email"
                            value={driverFormData.email}
                            onChange={(e) => handleDriverInputChange("email", e.target.value)}
                            placeholder="example@email.com"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="driver-wilaya">الولاية</Label>
                            <Select value={driverFormData.wilaya} onValueChange={(value) => handleDriverInputChange("wilaya", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الولاية" />
                              </SelectTrigger>
                              <SelectContent>
                                {wilayas.map((wilaya) => (
                                  <SelectItem key={wilaya.code} value={wilaya.code}>
                                    {wilaya.code} - {wilaya.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver-commune">البلدية</Label>
                            <Input
                              id="driver-commune"
                              value={driverFormData.commune}
                              onChange={(e) => handleDriverInputChange("commune", e.target.value)}
                              placeholder="أدخل البلدية"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="driver-address">العنوان</Label>
                          <Input
                            id="driver-address"
                            value={driverFormData.address}
                            onChange={(e) => handleDriverInputChange("address", e.target.value)}
                            placeholder="أدخل عنوانك الكامل"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Vehicle Information */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="vehicle-brand">ماركة المركبة</Label>
                            <Input
                              id="vehicle-brand"
                              value={driverFormData.vehicleBrand}
                              onChange={(e) => handleDriverInputChange("vehicleBrand", e.target.value)}
                              placeholder="تويوتا، هيونداي، رينو..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vehicle-model">الموديل</Label>
                            <Input
                              id="vehicle-model"
                              value={driverFormData.vehicleModel}
                              onChange={(e) => handleDriverInputChange("vehicleModel", e.target.value)}
                              placeholder="كورولا، أكسنت، سيم볼..."
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="vehicle-year">سنة الصنع</Label>
                            <Input
                              id="vehicle-year"
                              value={driverFormData.vehicleYear}
                              onChange={(e) => handleDriverInputChange("vehicleYear", e.target.value)}
                              placeholder="2020"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vehicle-color">اللون</Label>
                            <Input
                              id="vehicle-color"
                              value={driverFormData.vehicleColor}
                              onChange={(e) => handleDriverInputChange("vehicleColor", e.target.value)}
                              placeholder="أبيض، أسود، رمادي..."
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="plate-number">رقم اللوحة</Label>
                          <Input
                            id="plate-number"
                            value={driverFormData.plateNumber}
                            onChange={(e) => handleDriverInputChange("plateNumber", e.target.value)}
                            placeholder="16-123-45"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="seats">عدد المقاعد</Label>
                            <Select value={driverFormData.seats} onValueChange={(value) => handleDriverInputChange("seats", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر عدد المقاعد" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="4">4 مقاعد</SelectItem>
                                <SelectItem value="5">5 مقاعد</SelectItem>
                                <SelectItem value="7">7 مقاعد</SelectItem>
                                <SelectItem value="8">8 مقاعد</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">فئة المركبة</Label>
                            <Select value={driverFormData.category} onValueChange={(value) => handleDriverInputChange("category", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleCategories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Password */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="driver-password">كلمة المرور *</Label>
                          <div className="relative">
                            <Input
                              id="driver-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="driver-confirm-password">تأكيد كلمة المرور *</Label>
                          <div className="relative">
                            <Input
                              id="driver-confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="أعد إدخال كلمة المرور"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="driver-terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          />
                          <Label htmlFor="driver-terms" className="text-sm">
                            أوافق على{" "}
                            <Link to="/terms" className="text-primary hover:underline">
                              الشروط والأحكام
                            </Link>
                            {" "}و{" "}
                            <Link to="/privacy" className="text-primary hover:underline">
                              سياسة الخصوصية
                            </Link>
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Error and Success Messages */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      {currentStep === 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToSignup}
                        >
                          العودة للتسجيل
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                        >
                          السابق
                        </Button>
                      )}
                      
                      {currentStep < 3 ? (
                        <Button type="button" onClick={nextStep}>
                          التالي
                          <ArrowRight className="h-4 w-4 mr-2" />
                        </Button>
                      ) : (
                        <Button type="submit" className="bg-gradient-primary" disabled={loading}>
                          {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                          <Check className="h-4 w-4 mr-2" />
                        </Button>
                      )}
                    </div>
                  </form>
                </>
              )}

              {/* Test Accounts Section */}
              {isLocal && !showDriverOnboarding && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">حسابات تجريبية جاهزة</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      يمكنك استخدام الحسابات التجريبية الجاهزة للاختبار
                    </p>
                    <div className="grid gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/auth/signin")}
                        className="w-full justify-start"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        تسجيل دخول بحساب تجريبي
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!showDriverOnboarding && (
                <div className="text-center text-sm">
                  لديك حساب بالفعل؟{" "}
                  <Link to="/auth/signin" className="text-primary hover:underline font-medium">
                    تسجيل الدخول
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;