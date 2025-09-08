import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك مرة أخرى!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "يرجى التحقق من بياناتك والمحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Note: The redirect will happen automatically, so we don't need to navigate manually
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول بـ Google",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول بـ Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
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
                <Lock className="h-8 w-8 text-primary" />
                تسجيل الدخول
              </CardTitle>
              <CardDescription>
                أدخل بياناتك للوصول إلى حسابك
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Google Sign In Button */}
              <Button 
                type="button"
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                <Chrome className="h-4 w-4 mr-2" />
                {isGoogleLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
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

                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>

              <div className="text-center text-sm">
                ليس لديك حساب؟{" "}
                <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignIn;
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;