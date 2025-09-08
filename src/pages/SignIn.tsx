import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Mail, Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("كلمة المرور مطلوبة");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Translate common error messages to Arabic
        if (error.message.includes("Invalid login credentials")) {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (error.message.includes("Email not confirmed")) {
          setError("يرجى تأكيد بريدك الإلكتروني أولاً");
        } else {
          setError(error.message);
        }
      } else {
        setSuccess("تم تسجيل الدخول بنجاح!");
        
        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        // Redirect based on role
        if (profile?.role === 'driver') {
          navigate("/driver/dashboard");
        } else {
          navigate("/passenger/dashboard");
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'passenger' | 'driver') => {
    setLoading(true);
    setError(null);
    
    // Demo credentials
    const demoCredentials = {
      passenger: { email: "passenger@demo.com", password: "demo123" },
      driver: { email: "driver@demo.com", password: "demo123" }
    };
    
    try {
      const { error } = await supabase.auth.signInWithPassword(demoCredentials[role]);
      
      if (error) {
        setError("حساب التجربة غير متاح حالياً");
      } else {
        setSuccess("تم تسجيل الدخول بحساب التجربة!");
        navigate("/");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                <LogIn className="h-8 w-8 text-primary" />
                تسجيل الدخول
              </CardTitle>
              <CardDescription>
                أدخل بياناتك للدخول إلى حسابك
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      نسيت كلمة المرور؟
                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    تذكرني
                  </Label>
                </div>
                    </Link>
                {/* Error and Success Messages */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                  </div>
                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                  <div className="relative">
                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
                    <Input
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">أو</span>
                </div>
              </div>
                      id="password"
              {/* Alternative Sign In Methods */}
              <div className="space-y-3">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  تسجيل الدخول باستخدام Google
                </Button>
                
                {/* Demo Accounts */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleDemoLogin('passenger')}
                    disabled={loading}
                  >
                    تجربة - راكب
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleDemoLogin('driver')}
                    disabled={loading}
                  >
                    تجربة - سائق
                  </Button>
                </div>
              </div>
                      type={showPassword ? "text" : "password"}
              {/* Sign Up Link */}
              <div className="text-center text-sm">
                ليس لديك حساب؟{" "}
                <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </div>
            </CardContent>
          </Card>
                      placeholder="أدخل كلمة المرور"
      </main>
      
      <Footer />
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
};
                </div>
export default SignIn;