import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CreditCard,
  Bell,
  Search,
  Plus,
  Car,
  Star,
  DollarSign,
  Filter,
  Eye,
  X
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PassengerDashboard = () => {
  const [currentLang] = useState("ar");

  // Mock data
  const recentBookings = [
    {
      id: "BK001",
      from: "الجزائر العاصمة",
      to: "وهران", 
      date: "2024-01-15",
      time: "08:00",
      status: "confirmed",
      price: "2500 DA",
      driver: "أحمد محمد",
      vehicle: "Toyota Corolla - أبيض",
      seats: 2
    },
    {
      id: "BK002", 
      from: "قسنطينة",
      to: "سطيف",
      date: "2024-01-20",
      time: "14:30", 
      status: "pending",
      price: "1200 DA",
      driver: "فاطمة بن علي",
      vehicle: "Hyundai Accent - أزرق",
      seats: 1
    },
    {
      id: "BK003",
      from: "عنابة", 
      to: "الجزائر العاصمة",
      date: "2024-01-10",
      time: "06:00",
      status: "completed",
      price: "3200 DA", 
      driver: "يوسف كريم",
      vehicle: "Renault Symbol - رمادي",
      seats: 3
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      confirmed: { label: currentLang === "ar" ? "مؤكد" : "Confirmed", variant: "default" as const },
      pending: { label: currentLang === "ar" ? "في الانتظار" : "Pending", variant: "secondary" as const },
      completed: { label: currentLang === "ar" ? "مكتمل" : "Completed", variant: "outline" as const },
      cancelled: { label: currentLang === "ar" ? "ملغي" : "Cancelled", variant: "destructive" as const }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-white/20 text-white">أح</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {currentLang === "ar" ? "مرحباً، أحمد" : "Welcome, Ahmed"}
              </h1>
              <p className="text-white/90">
                {currentLang === "ar" ? "إدارة رحلاتك وحجوزاتك" : "Manage your trips and bookings"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/">
            <Card className="hover:shadow-elegant transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">
                  {currentLang === "ar" ? "بحث عن رحلة" : "Search Trip"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentLang === "ar" ? "ابحث عن رحلات جديدة" : "Find new trips"}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-elegant transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">
                {currentLang === "ar" ? "الإشعارات" : "Notifications"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "3 إشعارات جديدة" : "3 new notifications"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-1">
                {currentLang === "ar" ? "الملف الشخصي" : "Profile"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "إدارة معلوماتك" : "Manage your info"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">
              {currentLang === "ar" ? "الحجوزات" : "Bookings"}
            </TabsTrigger>
            <TabsTrigger value="history">
              {currentLang === "ar" ? "السجل" : "History"}
            </TabsTrigger>
            <TabsTrigger value="profile">
              {currentLang === "ar" ? "الملف الشخصي" : "Profile"}
            </TabsTrigger>
            <TabsTrigger value="payments">
              {currentLang === "ar" ? "المدفوعات" : "Payments"}
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {currentLang === "ar" ? "حجوزاتي الحالية" : "My Current Bookings"}
              </h2>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {currentLang === "ar" ? "تصفية" : "Filter"}
              </Button>
            </div>

            <div className="grid gap-4">
              {recentBookings.filter(b => b.status !== "completed").map((booking) => (
                <Card key={booking.id} className="hover:shadow-elegant transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge {...getStatusBadge(booking.status)} />
                          <span className="text-sm text-muted-foreground">#{booking.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-medium mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{booking.from}</span>
                          <span className="text-muted-foreground">←</span>
                          <span>{booking.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{booking.price}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.seats} {currentLang === "ar" ? "مقاعد" : "seats"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.driver}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.vehicle}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "عرض التفاصيل" : "View Details"}
                      </Button>
                      {booking.status === "pending" && (
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          {currentLang === "ar" ? "إلغاء" : "Cancel"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-xl font-semibold">
              {currentLang === "ar" ? "سجل الرحلات" : "Trip History"}
            </h2>
            
            <div className="grid gap-4">
              {recentBookings.filter(b => b.status === "completed").map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge {...getStatusBadge(booking.status)} />
                          <span className="text-sm text-muted-foreground">#{booking.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-medium">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{booking.from}</span>
                          <span className="text-muted-foreground">←</span>
                          <span>{booking.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{booking.price}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{booking.driver}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentLang === "ar" ? "المعلومات الشخصية" : "Personal Information"}</CardTitle>
                <CardDescription>
                  {currentLang === "ar" ? "قم بتحديث معلوماتك الشخصية" : "Update your personal information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{currentLang === "ar" ? "الاسم الأول" : "First Name"}</Label>
                    <Input id="firstName" defaultValue="أحمد" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{currentLang === "ar" ? "اسم العائلة" : "Last Name"}</Label>
                    <Input id="lastName" defaultValue="محمد" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{currentLang === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                  <Input id="email" type="email" defaultValue="ahmed@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{currentLang === "ar" ? "رقم الهاتف" : "Phone Number"}</Label>
                  <Input id="phone" defaultValue="+213 555 123 456" />
                </div>

                <Button className="w-full">
                  {currentLang === "ar" ? "حفظ التغييرات" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{currentLang === "ar" ? "طرق الدفع" : "Payment Methods"}</CardTitle>
                  <CardDescription>
                    {currentLang === "ar" ? "إدارة طرق الدفع المحفوظة" : "Manage your saved payment methods"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">BaridiMob</p>
                        <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
                      </div>
                    </div>
                    <Badge variant="outline">{currentLang === "ar" ? "افتراضي" : "Default"}</Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {currentLang === "ar" ? "إضافة طريقة دفع" : "Add Payment Method"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{currentLang === "ar" ? "سجل المدفوعات" : "Payment History"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">#{booking.id}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{booking.price}</p>
                          <p className="text-xs text-green-600">
                            {currentLang === "ar" ? "مدفوع" : "Paid"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default PassengerDashboard;