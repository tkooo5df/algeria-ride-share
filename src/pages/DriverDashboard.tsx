import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Car,
  DollarSign,
  Plus,
  Edit,
  Eye,
  Check,
  X,
  FileText,
  Upload,
  TrendingUp,
  Users,
  Route,
  Fuel,
  Settings,
  Star,
  AlertCircle
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const DriverDashboard = () => {
  const [currentLang] = useState("ar");

  // Mock data
  const vehicles = [
    {
      id: "V001",
      brand: "Toyota",
      model: "Corolla",
      year: "2020",
      color: "أبيض",
      plate: "16-123-45",
      seats: 4,
      category: "اقتصادي",
      status: "active",
      image: "/placeholder.svg"
    },
    {
      id: "V002", 
      brand: "Hyundai",
      model: "Accent", 
      year: "2019",
      color: "أزرق",
      plate: "31-789-12",
      seats: 4,
      category: "اقتصادي", 
      status: "inactive",
      image: "/placeholder.svg"
    }
  ];

  const trips = [
    {
      id: "T001",
      from: "الجزائر العاصمة",
      to: "وهران",
      date: "2024-01-15", 
      time: "08:00",
      price: "2500 DA",
      totalSeats: 4,
      bookedSeats: 2,
      status: "active",
      vehicle: "Toyota Corolla"
    },
    {
      id: "T002",
      from: "قسنطينة", 
      to: "سطيف",
      date: "2024-01-20",
      time: "14:30",
      price: "1200 DA", 
      totalSeats: 4,
      bookedSeats: 4,
      status: "full",
      vehicle: "Toyota Corolla"
    }
  ];

  const bookings = [
    {
      id: "BK001",
      passenger: "أحمد محمد",
      phone: "+213 555 123 456",
      tripId: "T001",
      seats: 2,
      status: "confirmed",
      payment: "نقدي",
      amount: "2500 DA"
    },
    {
      id: "BK002",
      passenger: "فاطمة بن علي", 
      phone: "+213 555 789 012",
      tripId: "T001",
      seats: 1,
      status: "pending",
      payment: "بريدي موب",
      amount: "1200 DA"
    }
  ];

  const getStatusBadge = (status: string, type: "trip" | "booking" | "vehicle" = "booking") => {
    if (type === "trip") {
      const tripStatuses = {
        active: { label: currentLang === "ar" ? "نشط" : "Active", variant: "default" as const },
        full: { label: currentLang === "ar" ? "ممتلئ" : "Full", variant: "secondary" as const },
        completed: { label: currentLang === "ar" ? "مكتمل" : "Completed", variant: "outline" as const }
      };
      return tripStatuses[status as keyof typeof tripStatuses] || tripStatuses.active;
    } else if (type === "vehicle") {
      const vehicleStatuses = {
        active: { label: currentLang === "ar" ? "نشط" : "Active", variant: "default" as const },
        inactive: { label: currentLang === "ar" ? "غير نشط" : "Inactive", variant: "secondary" as const },
        maintenance: { label: currentLang === "ar" ? "صيانة" : "Maintenance", variant: "destructive" as const }
      };
      return vehicleStatuses[status as keyof typeof vehicleStatuses] || vehicleStatuses.active;
    } else {
      const bookingStatuses = {
        confirmed: { label: currentLang === "ar" ? "مؤكد" : "Confirmed", variant: "default" as const },
        pending: { label: currentLang === "ar" ? "في الانتظار" : "Pending", variant: "secondary" as const },
        cancelled: { label: currentLang === "ar" ? "ملغي" : "Cancelled", variant: "destructive" as const }
      };
      return bookingStatuses[status as keyof typeof bookingStatuses] || bookingStatuses.pending;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-white/20 text-white">يم</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {currentLang === "ar" ? "مرحباً، يوسف محمد" : "Welcome, Youssef Mohamed"}
                </h1>
                <p className="text-white/90">
                  {currentLang === "ar" ? "سائق معتمد منذ 2022" : "Verified driver since 2022"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">
                {currentLang === "ar" ? "التقييم" : "Rating"}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">24,500 DA</div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "هذا الشهر" : "This month"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "إجمالي الركاب" : "Total passengers"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Route className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "الرحلات المكتملة" : "Completed trips"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "التقييم" : "Rating"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="trips" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trips">
              {currentLang === "ar" ? "الرحلات" : "Trips"}
            </TabsTrigger>
            <TabsTrigger value="vehicles">
              {currentLang === "ar" ? "المركبات" : "Vehicles"}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              {currentLang === "ar" ? "الحجوزات" : "Bookings"}
            </TabsTrigger>
            <TabsTrigger value="earnings">
              {currentLang === "ar" ? "الأرباح" : "Earnings"}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {currentLang === "ar" ? "الوثائق" : "Documents"}
            </TabsTrigger>
          </TabsList>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {currentLang === "ar" ? "رحلاتي" : "My Trips"}
              </h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {currentLang === "ar" ? "إضافة رحلة" : "Add Trip"}
              </Button>
            </div>

            <div className="grid gap-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-elegant transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadge(trip.status, "trip").variant}>{getStatusBadge(trip.status, "trip").label}</Badge>
                          <span className="text-sm text-muted-foreground">#{trip.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-medium mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{trip.from}</span>
                          <span className="text-muted-foreground">←</span>
                          <span>{trip.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{trip.price}</div>
                        <div className="text-sm text-muted-foreground">
                          {trip.bookedSeats}/{trip.totalSeats} {currentLang === "ar" ? "مقاعد" : "seats"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.vehicle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.bookedSeats} {currentLang === "ar" ? "راكب" : "passengers"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "عرض الحجوزات" : "View Bookings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {currentLang === "ar" ? "مركباتي" : "My Vehicles"}
              </h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {currentLang === "ar" ? "إضافة مركبة" : "Add Vehicle"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-elegant transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadge(vehicle.status, "vehicle").variant}>{getStatusBadge(vehicle.status, "vehicle").label}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          {vehicle.year} • {vehicle.color} • {vehicle.plate}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{vehicle.seats} {currentLang === "ar" ? "مقاعد" : "seats"}</span>
                          <span>{vehicle.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "إعدادات" : "Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-xl font-semibold">
              {currentLang === "ar" ? "الحجوزات الحالية" : "Current Bookings"}
            </h2>

            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-elegant transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadge(booking.status).variant}>{getStatusBadge(booking.status).label}</Badge>
                          <span className="text-sm text-muted-foreground">#{booking.id}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{booking.passenger}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{booking.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{booking.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.seats} {currentLang === "ar" ? "مقاعد" : "seats"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {booking.payment}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button size="sm" className="flex-1">
                            <Check className="h-4 w-4 mr-2" />
                            {currentLang === "ar" ? "قبول" : "Accept"}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <X className="h-4 w-4 mr-2" />
                            {currentLang === "ar" ? "رفض" : "Decline"}
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && booking.payment === "نقدي" && (
                        <Button size="sm" className="w-full">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {currentLang === "ar" ? "تأكيد الدفع" : "Mark as Paid"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {currentLang === "ar" ? "هذا الأسبوع" : "This Week"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,750 DA</div>
                  <p className="text-xs text-green-600 mt-1">+12% {currentLang === "ar" ? "من الأسبوع الماضي" : "from last week"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {currentLang === "ar" ? "هذا الشهر" : "This Month"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24,500 DA</div>
                  <p className="text-xs text-green-600 mt-1">+8% {currentLang === "ar" ? "من الشهر الماضي" : "from last month"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {currentLang === "ar" ? "الإجمالي" : "Total Earnings"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">186,250 DA</div>
                  <p className="text-xs text-muted-foreground mt-1">{currentLang === "ar" ? "منذ يناير 2024" : "Since January 2024"}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{currentLang === "ar" ? "الرحلات القادمة" : "Upcoming Trips"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trips.slice(0, 3).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{trip.from} → {trip.to}</p>
                        <p className="text-sm text-muted-foreground">{trip.date} - {trip.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trip.price}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.bookedSeats}/{trip.totalSeats} {currentLang === "ar" ? "مقاعد" : "seats"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentLang === "ar" ? "حالة الوثائق" : "Document Status"}</CardTitle>
                <CardDescription>
                  {currentLang === "ar" ? "تأكد من أن جميع وثائقك محدثة ومعتمدة" : "Ensure all your documents are up to date and verified"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{currentLang === "ar" ? "رخصة القيادة" : "Driver's License"}</p>
                        <p className="text-sm text-muted-foreground">{currentLang === "ar" ? "صالحة حتى: 2025-12-31" : "Valid until: 2025-12-31"}</p>
                      </div>
                    </div>
                    <Badge variant="default">{currentLang === "ar" ? "معتمد" : "Verified"}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{currentLang === "ar" ? "بطاقة الهوية" : "National ID"}</p>
                        <p className="text-sm text-muted-foreground">{currentLang === "ar" ? "صالحة حتى: 2030-05-15" : "Valid until: 2030-05-15"}</p>
                      </div>
                    </div>
                    <Badge variant="default">{currentLang === "ar" ? "معتمد" : "Verified"}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-orange-500" />
                      <div>
                        <p className="font-medium">{currentLang === "ar" ? "تسجيل المركبة" : "Vehicle Registration"}</p>
                        <p className="text-sm text-muted-foreground">{currentLang === "ar" ? "يتطلب التحديث" : "Requires update"}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{currentLang === "ar" ? "قيد المراجعة" : "Under Review"}</Badge>
                  </div>
                </div>

                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  {currentLang === "ar" ? "تحديث الوثائق" : "Upload Documents"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{currentLang === "ar" ? "تنبيهات مهمة" : "Important Alerts"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">
                      {currentLang === "ar" ? "انتباه: وثيقة تحتاج للتحديث" : "Attention: Document requires update"}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      {currentLang === "ar" ? "يرجى تحديث تسجيل المركبة قبل انتهاء صلاحيته" : "Please update your vehicle registration before it expires"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default DriverDashboard;