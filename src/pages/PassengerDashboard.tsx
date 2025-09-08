import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  X,
  BookOpen
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingWizard from "@/components/booking/BookingWizard";
import ReservationCard from "@/components/booking/ReservationCard";

const PassengerDashboard = () => {
  const [currentLang] = useState("ar");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Mock data
  const recentReservations = [
    {
      id: "BK001",
      from: "الجزائر العاصمة",
      to: "وهران", 
      date: "2024-01-15",
      time: "08:00",
      status: "confirmed",
      price: "2500 DA",
      passengers: 2,
      driver: {
        name: "أحمد محمد",
        rating: 4.9,
        phone: "+213 555 123 456",
        avatar: "/placeholder.svg",
        vehicle: "Toyota Corolla 2020 - أبيض"
      },
      paymentMethod: "بريدي موب"
    },
    {
      id: "BK002", 
      from: "قسنطينة",
      to: "سطيف",
      date: "2024-01-20",
      time: "14:30", 
      status: "pending",
      price: "1200 DA",
      passengers: 1,
      driver: {
        name: "فاطمة بن علي",
        rating: 4.8,
        phone: "+213 555 789 012",
        avatar: "/placeholder.svg",
        vehicle: "Hyundai Accent 2019 - أزرق"
      },
      paymentMethod: "نقداً"
    },
    {
      id: "BK003",
      from: "عنابة", 
      to: "الجزائر العاصمة",
      date: "2024-01-10",
      time: "06:00",
      status: "completed",
      price: "3200 DA", 
      passengers: 3,
      driver: {
        name: "يوسف كريم",
        rating: 4.7,
        phone: "+213 555 456 789",
        avatar: "/placeholder.svg",
        vehicle: "Renault Symbol 2021 - رمادي"
      },
      paymentMethod: "بريدي موب"
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
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
            <Card className="hover:shadow-elegant transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">
                  {currentLang === "ar" ? "حجز رحلة جديدة" : "New Booking"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentLang === "ar" ? "احجز رحلتك بسهولة" : "Book your trip easily"}
                </p>
              </CardContent>
            </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">حجز رحلة جديدة</DialogTitle>
              </DialogHeader>
              <BookingWizard />
            </DialogContent>
          </Dialog>

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
              {currentLang === "ar" ? "الحجوزات الحالية" : "Current Bookings"}
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
                {currentLang === "ar" ? "الحجوزات النشطة" : "Active Reservations"}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {currentLang === "ar" ? "تصفية" : "Filter"}
                </Button>
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      {currentLang === "ar" ? "حجز جديد" : "New Booking"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl">حجز رحلة جديدة</DialogTitle>
                    </DialogHeader>
                    <BookingWizard />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-4">
              {recentReservations.filter(r => r.status !== "completed").map((reservation) => (
                <ReservationCard 
                  key={reservation.id} 
                  reservation={{
                    ...reservation,
                    price: parseInt(reservation.price.replace(' DA', ''))
                  }}
                  onContact={(res) => console.log("Contact driver:", res)}
                  onTrack={(res) => console.log("Track trip:", res)}
                  onCancel={(res) => console.log("Cancel booking:", res)}
                />
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-xl font-semibold">
              {currentLang === "ar" ? "سجل الرحلات" : "Trip History"}
            </h2>
            
            <div className="grid gap-4">
              {recentReservations.filter(r => r.status === "completed").map((reservation) => (
                <ReservationCard 
                  key={reservation.id} 
                  reservation={{
                    ...reservation,
                    price: parseInt(reservation.price.replace(' DA', ''))
                  }}
                />
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
                    {recentReservations.slice(0, 3).map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">#{reservation.id}</p>
                          <p className="text-sm text-muted-foreground">{reservation.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{reservation.price}</p>
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