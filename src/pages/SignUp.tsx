import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Car, User, Mail, Phone, MapPin, Eye, EyeOff, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Chrome, Settings, ArrowRight, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { wilayas } from "@/data/wilayas";

const SignUp = () => {
  const navigate = useNavigate();
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
  const [schemaStatus, setSchemaStatus] = useState<
    "checking" | "ok" | "notifications-missing" | "error"
  >("checking");
  const [checkingSchema, setCheckingSchema] = useState(false);
  const migrationRequiredMessage =
    "لا يمكن إنشاء الحساب قبل تشغيل هجرات Supabase التي تنشئ جدول notifications. نفّذ أوامر supabase db push أو اتبع التعليمات في SIGNUP_FIX_GUIDE.md ثم أعد المحاولة.";
  
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

  const interpretedErrorMessage = useMemo(() => {
    if (!error) return null;
    return error;
  }, [error]);

  const isDatabaseSchemaError = (supabaseError: any) => {
    if (!supabaseError) return false;

    const code = typeof supabaseError.code === "string" ? supabaseError.code : undefined;
    const message = typeof supabaseError.message === "string" ? supabaseError.message.toLowerCase() : "";
    const details = typeof supabaseError.details === "string" ? supabaseError.details.toLowerCase() : "";
    const hint = typeof supabaseError.hint === "string" ? supabaseError.hint.toLowerCase() : "";
    const combined = `${message} ${details} ${hint}`;

    return (
      code === "42P01" || 
      code === "unexpected_failure" ||
      combined.includes("relation \"notifications\" does not exist") ||
      combined.includes("database error saving new user") ||
      message.includes("database error saving new user")
    );
  };

  const checkSupabaseSchema = useCallback(async () => {
    setSchemaStatus("checking");
    setCheckingSchema(true);

    try {
      const { error: notificationsError } = await supabase
        .from("notifications")
        .select("id")
        .limit(1);

      if (notificationsError) {
        if (isDatabaseSchemaError(notificationsError)) {
          console.warn(
            "Supabase notifications table is missing. Prompting user to run migrations.",
            notificationsError
          );
          setSchemaStatus("notifications-missing");
          return;
        }

        console.error("Unexpected Supabase schema error while checking notifications table:", notificationsError);
        setSchemaStatus("error");
        return;
      }

      // Also check if profiles table has the required columns
      const { error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, language")
        .limit(1);

      if (profilesError) {
        console.error("Profiles table validation failed:", profilesError);
        setSchemaStatus("error");
        return;
      }

      setSchemaStatus("ok");
    } catch (schemaError) {
      console.error("Unexpected error while validating Supabase schema:", schemaError);
      setSchemaStatus("error");
    } finally {
      setCheckingSchema(false);
    }
  }, []);

  useEffect(() => {
    void checkSupabaseSchema();
  }, [checkSupabaseSchema]);

  const mapSupabaseSignUpError = (supabaseError: any) => {
    if (!supabaseError) {
      return "حدث خطأ غير متوقع أثناء محاولة إنشاء الحساب. حاول مرة أخرى.";
    }

    const status = typeof supabaseError.status === "number" ? supabaseError.status : undefined;
    const message = typeof supabaseError.message === "string" ? supabaseError.message : "";
    const details = typeof supabaseError.details === "string" ? supabaseError.details : "";
    const code = typeof supabaseError.code === "string" ? supabaseError.code : "";
    const combinedMessage = `${message} ${details}`.toLowerCase();

    if (status === 400 && combinedMessage.includes("already registered")) {
      return "هذا البريد الإلكتروني مسجل بالفعل. جرّب تسجيل الدخول أو استخدم بريداً مختلفاً.";
    }

    if (
      status === 500 ||
      code === "unexpected_failure" ||
      combinedMessage.includes("database error") ||
      combinedMessage.includes("database error saving new user") ||
      combinedMessage.includes("42p01") ||
      combinedMessage.includes("relation \"notifications\" does not exist")
    ) {
      // Force schema check when we detect database errors
      setTimeout(() => {
        void checkSupabaseSchema();
      }, 100);
      
      return "تعذر إنشاء الحساب بسبب خطأ في قاعدة البيانات. مخطط Supabase غير مكتمل - جدول notifications غير موجود. يجب تطبيق ملفات الهجرات أولاً باستخدام 'supabase db push' أو نسخ محتوى ملف 20260206000000_supabase_full_reset.sql إلى SQL Editor في Supabase.";
    }

    if (combinedMessage.includes("network error")) {
      return "تعذر الاتصال بخدمة Supabase. تأكد من اتصالك بالإنترنت ثم أعد المحاولة.";
    }

    if (message) {
      return message;
    }

    return "حدث خطأ غير معروف أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى لاحقاً.";
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

    if (schemaStatus === "notifications-missing" || schemaStatus === "error") {
      setError(migrationRequiredMessage);
      setLoading(false);
      return;
    }

    // Additional check before attempting signup
    if (schemaStatus === "checking") {
      setError("جاري التحقق من قاعدة البيانات. الرجاء الانتظار...");
      setLoading(false);
      return;
    }

    try {
      if (showDriverOnboarding) {
        await handleDriverSignup();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            role,
            wilaya,
          },
        },
      });

      if (error) {
        throw error;
      }

      const createdUser = data.user;

      if (createdUser) {
        try {
          const { NotificationService } = await import('@/integrations/database/notificationService');
          await NotificationService.notifyWelcomeUser(createdUser.id, role as 'driver' | 'passenger' | 'admin' | 'developer');
          await NotificationService.notifyNewUserRegistration({
            userId: createdUser.id,
            userRole: role as 'driver' | 'passenger' | 'admin' | 'developer',
            userName: `${firstName} ${lastName}`,
            userEmail: email,
          });
        } catch (notificationError) {
          console.error('Error sending welcome notifications:', notificationError);
        }
      }

      setSuccess("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب.");

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setWilaya("");
      setAcceptTerms(false);

      setTimeout(() => {
        navigate('/auth/signin');
      }, 3000);
    } catch (error: any) {
      console.error("Supabase sign up failed", error);
      const mappedError = mapSupabaseSignUpError(error);
      setError(mappedError);
      
      // If it's a database schema error, force a schema recheck
      if (isDatabaseSchemaError(error)) {
        setTimeout(() => {
          void checkSupabaseSchema();
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSignup = async () => {
    if (schemaStatus === "notifications-missing" || schemaStatus === "error") {
      setError(migrationRequiredMessage);
      return;
    }

    if (schemaStatus === "checking") {
      setError("جاري التحقق من قاعدة البيانات. الرجاء الانتظار...");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: driverFormData.email,
        password,
        options: {
          data: {
            first_name: driverFormData.firstName,
            last_name: driverFormData.lastName,
            phone: driverFormData.phone,
            role: 'driver',
            wilaya: driverFormData.wilaya,
            commune: driverFormData.commune,
            address: driverFormData.address,
            vehicle_brand: driverFormData.vehicleBrand,
            vehicle_model: driverFormData.vehicleModel,
            vehicle_year: driverFormData.vehicleYear,
            vehicle_color: driverFormData.vehicleColor,
            vehicle_plate: driverFormData.plateNumber,
            vehicle_seats: driverFormData.seats,
            vehicle_category: driverFormData.category,
          },
        },
      });

      if (error) {
        throw error;
      }

      const createdUser = data.user;

      if (createdUser) {
        try {
          const { NotificationService } = await import('@/integrations/database/notificationService');
          await NotificationService.notifyWelcomeUser(createdUser.id, 'driver');
          await NotificationService.notifyNewUserRegistration({
            userId: createdUser.id,
            userRole: 'driver',
            userName: `${driverFormData.firstName} ${driverFormData.lastName}`,
            userEmail: driverFormData.email,
          });
        } catch (notificationError) {
          console.error('Error sending driver notifications:', notificationError);
        }
      }

      setSuccess("تم إنشاء حساب السائق بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب.");

      setTimeout(() => {
        navigate('/auth/signin');
      }, 3000);
    } catch (error: any) {
      console.error("Supabase driver sign up failed", error);
      const mappedError = mapSupabaseSignUpError(error);
      setError(mappedError);
      
      // If it's a database schema error, force a schema recheck
      if (isDatabaseSchemaError(error)) {
        setTimeout(() => {
          void checkSupabaseSchema();
        }, 500);
      }
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
        {schemaStatus === "notifications-missing" && (
          <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase يحتاج إلى تهيئة قبل إنشاء الحسابات</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                أبلغ Supabase أن جدول <span className="font-medium">notifications</span> غير موجود. يجب تشغيل ملفات الهجرة داخل مجلد
                <code className="mx-1 rounded bg-muted px-1 py-0.5">supabase/migrations</code> قبل محاولة التسجيل.
              </p>
              <div>
                <p className="font-medium">الخطوات السريعة (Supabase CLI):</p>
                <ol className="list-decimal space-y-1 pr-5 text-right">
                  <li>
                    <code className="rounded bg-muted px-1 py-0.5">supabase login</code>
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1 py-0.5">supabase link --project-ref YOUR_PROJECT_REF</code>
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1 py-0.5">supabase db push</code>
                  </li>
                </ol>
              </div>
              <p>
                يمكن تنفيذ نفس الأوامر من لوحة Supabase عبر لصق محتوى الملفات
                <span className="mx-1 font-medium">20250908220515_little_queen.sql</span>
                و
                <span className="mx-1 font-medium">20260201000000_full_supabase_support.sql</span>.
                راجع دليل <span className="font-medium">SIGNUP_FIX_GUIDE.md</span> لمزيد من التفاصيل.
              </p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void checkSupabaseSchema()}
                  disabled={checkingSchema}
                >
                  <Settings className="ml-2 h-4 w-4" />
                  {checkingSchema ? "جاري التحقق..." : "إعادة التحقق"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {schemaStatus === "error" && (
          <Alert className="mb-6 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تعذر التحقق من مخطط Supabase</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                لم يتمكن التطبيق من التأكد من جاهزية قاعدة البيانات. تأكد من أن مشروع Supabase متاح ثم أعد المحاولة باستخدام الزر
                أدناه أو راجع دليل <span className="font-medium">SIGNUP_FIX_GUIDE.md</span> لتطبيق الهجرات يدويًا.
              </p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void checkSupabaseSchema()}
                  disabled={checkingSchema}
                >
                  <Settings className="ml-2 h-4 w-4" />
                  {checkingSchema ? "جاري التحقق..." : "إعادة التحقق"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
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
                    {interpretedErrorMessage && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{interpretedErrorMessage}</AlertDescription>
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