import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Star, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const BookingForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const pickup = searchParams.get("pickup") || "";
  const destination = searchParams.get("destination") || "";
  const driverName = searchParams.get("driverName") || "";
  const driverCar = searchParams.get("driverCar") || "";
  const driverId = searchParams.get("driverId") || "";
  const price = searchParams.get("price") || "2500";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const passengers = searchParams.get("passengers") || "1";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    specialRequests: "",
    paymentMethod: "cash"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("الاسم الأول مطلوب");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("اسم العائلة مطلوب");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("رقم الهاتف مطلوب");
      return false;
    }
    if (!/^(\+213|0)[5-7][0-9]{8}$/.test(formData.phone)) {
      setError("رقم الهاتف غير صحيح (مثال: +213 555 123 456)");
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("البريد الإلكتروني غير صحيح");
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("bookings").insert([
        {
          pickup_location: pickup,
          destination_location: destination,
          passenger_id: user.id,
          driver_id: driverId,
          total_amount: parseFloat(price),
          status: "pending"
        },
      ]);

      if (error) {
        setError("حدث خطأ أثناء إنشاء الحجز: " + error.message);
      } else {
        toast({
          title: "تم تأكيد الحجز بنجاح!",
          description: "سيتم التواصل معك قريباً لتأكيد التفاصيل",
        });
        
        // Redirect to dashboard after successful booking
        setTimeout(() => {
          navigate("/passenger/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      setError("حدث خطأ غير متوقع: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-primary rounded-xl p-6 text-white mb-6">
              <h1 className="text-3xl font-bold mb-2">تأكيد الحجز</h1>
              <p className="text-white/90">أكمل معلوماتك لتأكيد حجز رحلتك</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trip Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  ملخص الرحلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Route */}
                <div className="flex items-center gap-2 text-lg font-medium">
                  <span>{pickup}</span>
                  <div className="flex-1 border-t border-dashed border-muted-foreground/30 mx-2" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 border-t border-dashed border-muted-foreground/30 mx-2" />
                  <span>{destination}</span>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{date || "اليوم"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{time || "08:00"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{passengers} راكب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.paymentMethod === "cash" ? "نقداً" : "بريدي موب"}</span>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">معلومات السائق</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{driverName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{driverName}</h5>
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                        <span className="text-muted-foreground">(156 تقييم)</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{driverCar}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">إجمالي التكلفة:</span>
                    <span className="text-2xl font-bold text-primary">{price} دج</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  معلومات الراكب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">الاسم الأول *</Label>
                    <Input
                      id="firstName"
                      placeholder="أدخل اسمك الأول"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">اسم العائلة *</Label>
                    <Input
                      id="lastName"
                      placeholder="أدخل اسم العائلة"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+213 555 123 456"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>طريقة الدفع</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        formData.paymentMethod === "cash" 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleInputChange("paymentMethod", "cash")}
                    >
                      <CardContent className="p-4 text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-secondary" />
                        <h4 className="font-medium">نقداً</h4>
                        <p className="text-xs text-muted-foreground">ادفع للسائق</p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${
                        formData.paymentMethod === "baridimob" 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleInputChange("paymentMethod", "baridimob")}
                    >
                      <CardContent className="p-4 text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium">بريدي موب</h4>
                        <p className="text-xs text-muted-foreground">دفع إلكتروني</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <Label htmlFor="requests">طلبات خاصة (اختياري)</Label>
                  <Textarea
                    id="requests"
                    placeholder="أي طلبات أو ملاحظات خاصة..."
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Confirm Button */}
                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="w-full h-12 text-lg bg-gradient-primary hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري التأكيد...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      تأكيد الحجز
                    </div>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-muted-foreground text-center">
                  بالضغط على "تأكيد الحجز" فإنك توافق على{" "}
                  <span className="text-primary underline cursor-pointer">الشروط والأحكام</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;