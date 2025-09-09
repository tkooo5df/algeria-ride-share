import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { wilayas } from "@/data/wilayas";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [currentLang] = useState("ar");
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    from_wilaya_id: "",
    to_wilaya_id: "",
    departure_date: "",
    departure_time: "",
    price_per_seat: "",
    total_seats: "4",
    description: ""
  });

  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch driver's vehicles
  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', user.id);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch driver's trips
  const fetchTrips = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          from_wilaya:wilayas!trips_from_wilaya_id_fkey(name_ar),
          to_wilaya:wilayas!trips_to_wilaya_id_fkey(name_ar),
          vehicle:vehicles(make, model)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  // Fetch bookings for driver's trips
  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          passenger:profiles!bookings_passenger_id_fkey(full_name, phone, email),
          trip:trips!bookings_trip_id_fkey(*)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Create new trip
  const handleCreateTrip = async () => {
    if (!user) return;

    try {
      // Get user's vehicle (assuming they have one)
      const { data: userVehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('driver_id', user.id)
        .eq('is_active', true)
        .limit(1);

      const vehicleId = userVehicles?.[0]?.id;

      const { data, error } = await supabase
        .from('trips')
        .insert([{
          driver_id: user.id,
          vehicle_id: vehicleId,
          from_wilaya_id: parseInt(newTrip.from_wilaya_id),
          to_wilaya_id: parseInt(newTrip.to_wilaya_id),
          departure_date: newTrip.departure_date,
          departure_time: newTrip.departure_time,
          price_per_seat: parseFloat(newTrip.price_per_seat),
          total_seats: parseInt(newTrip.total_seats),
          available_seats: parseInt(newTrip.total_seats),
          description: newTrip.description,
          is_active: true
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Create notification for admins about new trip
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminProfiles && data) {
        const notifications = adminProfiles.map(admin => ({
          user_id: admin.id,
          type: 'trip' as const,
          title: 'رحلة جديدة',
          message: `رحلة جديدة من ولاية ${newTrip.from_wilaya_id} إلى ولاية ${newTrip.to_wilaya_id} بسعر ${newTrip.price_per_seat} دج`,
          related_id: data.id,
          is_read: false
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }

      // Reset form and refresh data
      setNewTrip({
        from_wilaya_id: "",
        to_wilaya_id: "",
        departure_date: "",
        departure_time: "",
        price_per_seat: "",
        total_seats: "4",
        description: ""
      });
      setShowAddTrip(false);
      await fetchTrips();

      toast({
        title: "تم إنشاء الرحلة",
        description: "تم إنشاء رحلة جديدة بنجاح",
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الرحلة",
        variant: "destructive"
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await Promise.all([
          fetchVehicles(),
          fetchTrips(),
          fetchBookings()
        ]);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل لوحة السائق...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                <AvatarFallback className="bg-white/20 text-white">س</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {currentLang === "ar" ? "مرحباً، سائق" : "Welcome, Driver"}
                </h1>
                <p className="text-white/90">
                  {currentLang === "ar" ? "إدارة رحلاتك وحجوزاتك" : "Manage your trips and bookings"}
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
              <div className="text-2xl font-bold">
                {bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()} دج
              </div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "إجمالي الأرباح" : "Total earnings"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "إجمالي الحجوزات" : "Total bookings"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Route className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-sm text-muted-foreground">
                {currentLang === "ar" ? "الرحلات المنشورة" : "Published trips"}
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
              <Button onClick={() => setShowAddTrip(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {currentLang === "ar" ? "إضافة رحلة" : "Add Trip"}
              </Button>
            </div>

            {/* Add Trip Form */}
            {showAddTrip && (
              <Card>
                <CardHeader>
                  <CardTitle>إضافة رحلة جديدة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>من (الولاية)</Label>
                      <Select value={newTrip.from_wilaya_id} onValueChange={(value) => 
                        setNewTrip(prev => ({ ...prev, from_wilaya_id: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الولاية" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.code} value={wilaya.code}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>إلى (الولاية)</Label>
                      <Select value={newTrip.to_wilaya_id} onValueChange={(value) => 
                        setNewTrip(prev => ({ ...prev, to_wilaya_id: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الولاية" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.code} value={wilaya.code}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>تاريخ المغادرة</Label>
                      <Input
                        type="date"
                        value={newTrip.departure_date}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, departure_date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>وقت المغادرة</Label>
                      <Input
                        type="time"
                        value={newTrip.departure_time}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, departure_time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>سعر المقعد (دج)</Label>
                      <Input
                        type="number"
                        value={newTrip.price_per_seat}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, price_per_seat: e.target.value }))}
                        placeholder="1500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>عدد المقاعد</Label>
                      <Select value={newTrip.total_seats} onValueChange={(value) => 
                        setNewTrip(prev => ({ ...prev, total_seats: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 مقعد</SelectItem>
                          <SelectItem value="2">2 مقعد</SelectItem>
                          <SelectItem value="3">3 مقعد</SelectItem>
                          <SelectItem value="4">4 مقعد</SelectItem>
                          <SelectItem value="5">5 مقعد</SelectItem>
                          <SelectItem value="6">6 مقعد</SelectItem>
                          <SelectItem value="7">7 مقعد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>وصف الرحلة (اختياري)</Label>
                    <Textarea
                      value={newTrip.description}
                      onChange={(e) => setNewTrip(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="معلومات إضافية عن الرحلة..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateTrip}>
                      <Plus className="h-4 w-4 mr-2" />
                      إنشاء الرحلة
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddTrip(false)}>
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-elegant transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadge(trip.is_active ? 'active' : 'inactive', "trip").variant}>
                            {trip.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{trip.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-medium mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>ولاية {trip.from_wilaya_id}</span>
                          <span className="text-muted-foreground">←</span>
                          <span>ولاية {trip.to_wilaya_id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{trip.price_per_seat} دج</div>
                        <div className="text-sm text-muted-foreground">
                          {trip.available_seats}/{trip.total_seats} {currentLang === "ar" ? "مقاعد" : "seats"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.departure_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.departure_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.vehicle?.make} {trip.vehicle?.model}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.total_seats - trip.available_seats} {currentLang === "ar" ? "راكب" : "passengers"}</span>
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
                          <Badge variant={getStatusBadge(vehicle.is_active ? 'active' : 'inactive', "vehicle").variant}>
                            {vehicle.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          {vehicle.year} • {vehicle.color} • {vehicle.license_plate}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{vehicle.seats} {currentLang === "ar" ? "مقاعد" : "seats"}</span>
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
                          <Badge variant={getStatusBadge(booking.status).variant}>
                            {getStatusBadge(booking.status).label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{booking.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{booking.passenger?.full_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{booking.passenger?.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{booking.total_amount} دج</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.seats_booked} {currentLang === "ar" ? "مقاعد" : "seats"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {booking.payment_method === 'cod' ? 'نقداً' : 'بريدي موب'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-4">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.pickup_location} → {booking.destination_location}</span>
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
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        تفاصيل
                      </Button>
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
                        <p className="font-medium">ولاية {trip.from_wilaya_id} → ولاية {trip.to_wilaya_id}</p>
                        <p className="text-sm text-muted-foreground">{trip.departure_date} - {trip.departure_time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trip.price_per_seat} دج</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.available_seats}/{trip.total_seats} {currentLang === "ar" ? "مقاعد" : "seats"}
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