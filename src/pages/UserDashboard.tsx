import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  DollarSign,
  Bell,
  Search,
  Plus,
  Eye,
  Check,
  X,
  Trash,
  Star,
  TrendingUp,
  Users,
  Route,
  Settings,
  Shield,
  Activity,
  Edit,
  Power,
  PowerOff
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { toast } from '@/hooks/use-toast';
import { wilayas } from '@/data/wilayas';
import NotificationCenter from '@/components/NotificationCenter';
import { NotificationService } from '@/integrations/database/notificationService';

const UserDashboard = () => {
  const { user: supabaseUser } = useAuth();
  const { user: localUser } = useLocalAuth();
  const { getDatabaseService, isInitialized, isLocal } = useDatabase();
  
  // Use local user if using local database, otherwise use Supabase user
  const user = isLocal ? localUser : supabaseUser;
  const [currentLang] = useState("ar");
  const [loading, setLoading] = useState(true);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0, recent: 0 });
  
  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  // Trip creation form
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState({
    fromWilayaId: "",
    toWilayaId: "",
    vehicleId: "",
    departureDate: "",
    departureTime: "",
    pricePerSeat: "",
    totalSeats: "4",
    description: ""
  });

  // Vehicle management form
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    seats: "4"
  });

  // Helper function to get wilaya name by ID
  const getWilayaName = (wilayaId: number) => {
    const wilaya = wilayas.find(w => w.code === wilayaId.toString().padStart(2, '0'));
    return wilaya ? wilaya.name : `ولاية ${wilayaId}`;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const db = getDatabaseService();
      const profile = await db.getProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch driver's vehicles (if user is driver)
  const fetchVehicles = async () => {
    if (!user || userProfile?.role !== 'driver') return;
    
    try {
      const db = getDatabaseService();
      const data = await db.getVehicles(user.id);
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch trips
  const fetchTrips = async () => {
    try {
      const db = getDatabaseService();
      const data = await db.getTrips();
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const db = getDatabaseService();
      let data;
      
      if (userProfile?.role === 'driver') {
        // Get bookings for driver's trips
        data = await db.getBookings(undefined, user.id);
      } else {
        // Get bookings for passenger
        data = await db.getBookings(user.id);
      }
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Load notification stats
  const loadNotificationStats = async () => {
    if (!user) return;
    try {
      const stats = await NotificationService.getNotificationStats(user.id);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (user && isInitialized) {
        await Promise.all([
          fetchUserProfile(),
          loadNotificationStats()
        ]);
        setLoading(false);
      }
    };

    loadData();
  }, [user, isInitialized]);

  // Load role-specific data when profile is loaded
  useEffect(() => {
    if (userProfile) {
      Promise.all([
        fetchVehicles(),
        fetchTrips(),
        fetchBookings()
      ]);
    }
  }, [userProfile]);

  // Handle trip creation
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userProfile?.role !== 'driver') return;

    try {
      const db = getDatabaseService();
      const trip = await db.createTrip({
        driverId: user.id.toString(),
        vehicleId: tripForm.vehicleId,
        fromWilayaId: parseInt(tripForm.fromWilayaId),
        toWilayaId: parseInt(tripForm.toWilayaId),
        departureDate: tripForm.departureDate,
        departureTime: tripForm.departureTime,
        pricePerSeat: parseFloat(tripForm.pricePerSeat),
        totalSeats: parseInt(tripForm.totalSeats),
        description: tripForm.description,
      });

      // Send notification to admins
      await NotificationService.notifyTripCreated(trip.id.toString(), user.id.toString());

      toast({
        title: "تم إنشاء الرحلة بنجاح",
        description: "تم إنشاء رحلة جديدة وإرسال إشعار للإدارة",
      });

      setShowTripForm(false);
      setTripForm({
        fromWilayaId: "",
        toWilayaId: "",
        vehicleId: "",
        departureDate: "",
        departureTime: "",
        pricePerSeat: "",
        totalSeats: "4",
        description: ""
      });

      await fetchTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "خطأ في إنشاء الرحلة",
        description: "حدث خطأ أثناء إنشاء الرحلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle trip deletion
  const handleDeleteTrip = async (tripId: string) => {
    if (!user || userProfile?.role !== 'driver') return;

    try {
      const db = getDatabaseService();
      const success = await db.deleteTrip(tripId);
      
      if (success) {
        toast({
          title: "تم حذف الرحلة بنجاح",
          description: "تم حذف الرحلة وجميع الحجوزات المرتبطة بها",
        });
        
        await fetchTrips();
      } else {
        throw new Error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "خطأ في حذف الرحلة",
        description: "حدث خطأ أثناء حذف الرحلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle vehicle creation
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userProfile?.role !== 'driver') return;

    try {
      const db = getDatabaseService();
      const vehicle = await db.createVehicle({
        driverId: user.id.toString(),
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: parseInt(vehicleForm.year),
        color: vehicleForm.color,
        licensePlate: vehicleForm.licensePlate,
        seats: parseInt(vehicleForm.seats),
        isActive: true,
      });

      toast({
        title: "تم إضافة المركبة بنجاح",
        description: "تم إضافة مركبتك الجديدة بنجاح",
      });

      setShowVehicleForm(false);
      setVehicleForm({
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        seats: "4"
      });

      await fetchVehicles();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "خطأ في إضافة المركبة",
        description: "حدث خطأ أثناء إضافة المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle vehicle update
  const handleUpdateVehicle = async (vehicleId: string, data: any) => {
    try {
      const db = getDatabaseService();
      await db.updateVehicle(vehicleId, data);
      
      toast({
        title: "تم تحديث المركبة",
        description: "تم تحديث معلومات المركبة بنجاح",
      });
      
      await fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "خطأ في تحديث المركبة",
        description: "حدث خطأ أثناء تحديث المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle vehicle deletion
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!user || userProfile?.role !== 'driver') return;

    try {
      const db = getDatabaseService();
      await db.deleteVehicle(vehicleId);
      
      toast({
        title: "تم حذف المركبة",
        description: "تم حذف المركبة بنجاح",
      });
      
      await fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "خطأ في حذف المركبة",
        description: "حدث خطأ أثناء حذف المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle vehicle toggle active status
  const handleToggleVehicleStatus = async (vehicleId: string, isActive: boolean) => {
    try {
      const db = getDatabaseService();
      await db.updateVehicle(vehicleId, { isActive: !isActive });
      
      toast({
        title: isActive ? "تم إلغاء تفعيل المركبة" : "تم تفعيل المركبة",
        description: isActive ? "تم إلغاء تفعيل المركبة بنجاح" : "تم تفعيل المركبة بنجاح",
      });
      
      await fetchVehicles();
    } catch (error) {
      console.error('Error toggling vehicle status:', error);
      toast({
        title: "خطأ في تغيير حالة المركبة",
        description: "حدث خطأ أثناء تغيير حالة المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle booking confirmation (for drivers)
  const handleConfirmBooking = async (bookingId: number) => {
    try {
      const db = getDatabaseService();
      await db.updateBooking(bookingId, { status: 'confirmed' });
      
      await NotificationService.notifyBookingConfirmed(bookingId, user!.id);
      await fetchBookings();
      
      toast({
        title: "تم تأكيد الحجز",
        description: "تم تأكيد الحجز وإرسال إشعار للراكب",
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تأكيد الحجز",
        variant: "destructive"
      });
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: number) => {
    try {
      const db = getDatabaseService();
      await db.updateBooking(bookingId, { status: 'cancelled' });
      
      await NotificationService.notifyBookingCancelled(bookingId, user!.id, 'تم الإلغاء من قبل المستخدم');
      await fetchBookings();
      
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء الحجز وإرسال إشعار للأطراف المعنية",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء الحجز",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
      confirmed: { label: 'مؤكد', variant: 'default' as const },
      completed: { label: 'مكتمل', variant: 'outline' as const },
      cancelled: { label: 'ملغي', variant: 'destructive' as const }
    };
    return statuses[status as keyof typeof statuses] || statuses.pending;
  };

  const getRoleInfo = () => {
    switch (userProfile?.role) {
      case 'driver':
        return {
          title: 'لوحة السائق',
          description: 'إدارة رحلاتك وحجوزاتك',
          icon: Car,
          color: 'bg-green-500'
        };
      case 'passenger':
        return {
          title: 'لوحة الراكب',
          description: 'إدارة حجوزاتك والبحث عن رحلات',
          icon: User,
          color: 'bg-blue-500'
        };
      case 'admin':
        return {
          title: 'لوحة الإدارة',
          description: 'إدارة النظام والمستخدمين',
          icon: Shield,
          color: 'bg-purple-500'
        };
      default:
        return {
          title: 'لوحة المستخدم',
          description: 'مرحباً بك في DZ Taxi',
          icon: User,
          color: 'bg-gray-500'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل لوحة التحكم...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className={`${roleInfo.color} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-white/20 text-white">
                  {userProfile?.fullName?.charAt(0) || 'م'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{roleInfo.title}</h1>
                <p className="text-white/90">{roleInfo.description}</p>
                <p className="text-white/80 text-sm">
                  مرحباً، {userProfile?.fullName || 'مستخدم'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">
                {userProfile?.role === 'driver' ? 'رحلاتي' : 
                 userProfile?.role === 'passenger' ? 'حجوزاتي' : 
                 'إجمالي المستخدمين'}
              </div>
              <div className="text-2xl font-bold">
                {userProfile?.role === 'driver' ? trips.length :
                 userProfile?.role === 'passenger' ? bookings.length :
                 '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-sm text-muted-foreground">
                {userProfile?.role === 'driver' ? 'حجوزاتي' : 'حجوزاتي'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {bookings.filter((b: any) => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-muted-foreground">مؤكدة</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Route className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-sm text-muted-foreground">
                {userProfile?.role === 'driver' ? 'رحلاتي' : 'رحلات متاحة'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Bell className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{notificationStats.unread}</div>
              <div className="text-sm text-muted-foreground">إشعارات جديدة</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full ${userProfile?.role === 'admin' ? 'grid-cols-7' : 'grid-cols-5'}`}>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            {userProfile?.role === 'driver' && (
              <TabsTrigger value="vehicles">مركباتي</TabsTrigger>
            )}
            <TabsTrigger value="trips">
              {userProfile?.role === 'driver' ? 'رحلاتي' : 'الرحلات المتاحة'}
            </TabsTrigger>
            <TabsTrigger value="bookings">حجوزاتي</TabsTrigger>
            <TabsTrigger value="notifications">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
                {notificationStats.unread > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notificationStats.unread}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            {userProfile?.role === 'admin' && (
              <>
                <TabsTrigger value="users">المستخدمين</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {userProfile?.role === 'driver' && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات السائق</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
                        <div className="text-sm text-muted-foreground">إجمالي المركبات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {vehicles.filter((v: any) => v.isActive).length}
                        </div>
                        <div className="text-sm text-muted-foreground">مركبات نشطة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                        <div className="text-sm text-muted-foreground">الرحلات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">الحجوزات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)} دج
                        </div>
                        <div className="text-sm text-muted-foreground">الأرباح</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {userProfile?.role === 'passenger' && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات الراكب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">إجمالي الحجوزات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {bookings.filter((b: any) => b.status === 'confirmed').length}
                        </div>
                        <div className="text-sm text-muted-foreground">حجوزات مؤكدة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                        <div className="text-sm text-muted-foreground">رحلات متاحة</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {userProfile?.role === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات الإدارة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-sm text-muted-foreground">المستخدمين</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{trips.length}</div>
                        <div className="text-sm text-muted-foreground">الرحلات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">الحجوزات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)} دج
                        </div>
                        <div className="text-sm text-muted-foreground">إجمالي الأرباح</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Vehicles Tab (Driver only) */}
          {userProfile?.role === 'driver' && (
            <TabsContent value="vehicles" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">مركباتي</h2>
                <Button onClick={() => setShowVehicleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مركبة
                </Button>
              </div>

              {showVehicleForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>إضافة مركبة جديدة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateVehicle} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الماركة</label>
                          <input
                            type="text"
                            value={vehicleForm.make}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="مثال: Renault"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الموديل</label>
                          <input
                            type="text"
                            value={vehicleForm.model}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="مثال: Symbol"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">سنة الصنع</label>
                          <input
                            type="number"
                            value={vehicleForm.year}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="2020"
                            min="1990"
                            max="2024"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">اللون</label>
                          <input
                            type="text"
                            value={vehicleForm.color}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="أبيض"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">رقم اللوحة</label>
                          <input
                            type="text"
                            value={vehicleForm.licensePlate}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="123-456-16"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">عدد المقاعد</label>
                          <input
                            type="number"
                            value={vehicleForm.seats}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, seats: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            min="2"
                            max="8"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          إضافة المركبة
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowVehicleForm(false)}>
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {vehicles.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">لا توجد مركبات</h3>
                      <p className="text-muted-foreground mb-4">
                        لم تقم بإضافة أي مركبة بعد. أضف مركبتك الأولى للبدء.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        إضافة مركبة
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  vehicles.map((vehicle: any) => (
                    <Card key={vehicle.id} className="hover:shadow-elegant transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h3>
                              <p className="text-muted-foreground">
                                {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{vehicle.seats} مقاعد</span>
                                <Badge variant={vehicle.isActive ? "default" : "secondary"} className="text-xs">
                                  {vehicle.isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleVehicleStatus(vehicle.id, vehicle.isActive)}
                            >
                              {vehicle.isActive ? (
                                <PowerOff className="h-4 w-4 mr-2" />
                              ) : (
                                <Power className="h-4 w-4 mr-2" />
                              )}
                              {vehicle.isActive ? "إلغاء التفعيل" : "تفعيل"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // TODO: Add edit functionality
                                toast({
                                  title: "قريباً",
                                  description: "ميزة التعديل ستكون متاحة قريباً",
                                });
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              تعديل
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذه المركبة؟ سيتم حذف جميع الرحلات المرتبطة بها.')) {
                                  handleDeleteVehicle(vehicle.id);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {userProfile?.role === 'driver' ? 'رحلاتي' : 'الرحلات المتاحة'}
              </h2>
              {userProfile?.role === 'driver' && (
                <Button onClick={() => setShowTripForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء رحلة
                </Button>
              )}
            </div>

            {showTripForm && userProfile?.role === 'driver' && (
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء رحلة جديدة</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTrip} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">من</label>
                        <select
                          value={tripForm.fromWilayaId}
                          onChange={(e) => setTripForm(prev => ({ ...prev, fromWilayaId: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">اختر الولاية</option>
                          {wilayas.map((wilaya, index) => (
                            <option key={index} value={index + 1}>{wilaya.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">إلى</label>
                        <select
                          value={tripForm.toWilayaId}
                          onChange={(e) => setTripForm(prev => ({ ...prev, toWilayaId: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">اختر الولاية</option>
                          {wilayas.map((wilaya, index) => (
                            <option key={index} value={index + 1}>{wilaya.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المركبة</label>
                      {vehicles.filter((v: any) => v.isActive).length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            لا توجد مركبات نشطة. يرجى إضافة مركبة أولاً أو تفعيل إحدى المركبات الموجودة.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={tripForm.vehicleId}
                          onChange={(e) => setTripForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">اختر المركبة</option>
                          {vehicles.filter((v: any) => v.isActive).map((vehicle: any) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">التاريخ</label>
                        <input
                          type="date"
                          value={tripForm.departureDate}
                          onChange={(e) => setTripForm(prev => ({ ...prev, departureDate: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الوقت</label>
                        <input
                          type="time"
                          value={tripForm.departureTime}
                          onChange={(e) => setTripForm(prev => ({ ...prev, departureTime: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">سعر المقعد (دج)</label>
                        <input
                          type="number"
                          value={tripForm.pricePerSeat}
                          onChange={(e) => setTripForm(prev => ({ ...prev, pricePerSeat: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">عدد المقاعد</label>
                        <input
                          type="number"
                          value={tripForm.totalSeats}
                          onChange={(e) => setTripForm(prev => ({ ...prev, totalSeats: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الوصف (اختياري)</label>
                      <textarea
                        value={tripForm.description}
                        onChange={(e) => setTripForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        إنشاء الرحلة
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowTripForm(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {trips.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد رحلات</h3>
                    <p className="text-muted-foreground">
                      {userProfile?.role === 'driver' 
                        ? 'لم تقم بإنشاء أي رحلة بعد. أنشئ رحلتك الأولى للبدء.'
                        : 'لا توجد رحلات متاحة حالياً. تحقق لاحقاً.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                trips.map((trip: any) => (
                  <Card key={trip.id} className="hover:shadow-elegant transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-lg font-medium mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{trip.fromWilayaName || getWilayaName(trip.fromWilayaId)}</span>
                            <span className="text-muted-foreground">←</span>
                            <span>{trip.toWilayaName || getWilayaName(trip.toWilayaId)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>السائق: {trip.driver?.fullName}</span>
                            <Phone className="h-4 w-4 ml-2" />
                            <span>{trip.driver?.phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{trip.pricePerSeat} دج</div>
                          <div className="text-sm text-muted-foreground">
                            {trip.availableSeats}/{trip.totalSeats} مقاعد متاحة
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.departureDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.vehicle?.make} {trip.vehicle?.model}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>تقييم: 4.8</span>
                        </div>
                      </div>

                      {trip.description && (
                        <p className="text-sm text-muted-foreground mb-4">{trip.description}</p>
                      )}

                      <div className="flex gap-2">
                        {userProfile?.role === 'passenger' && (
                          <Button className="flex-1">
                            <Plus className="h-4 w-4 mr-2" />
                            حجز مقعد
                          </Button>
                        )}
                        {userProfile?.role === 'driver' && trip.driverId === user?.id && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه الرحلة؟ سيتم حذف جميع الحجوزات المرتبطة بها.')) {
                                handleDeleteTrip(trip.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            حذف
                          </Button>
                        )}
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          تفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">حجوزاتي</h2>
            </div>

            <div className="grid gap-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات</h3>
                    <p className="text-muted-foreground mb-4">
                      لم تقم بحجز أي رحلة بعد. ابدأ بالبحث عن رحلة مناسبة لك.
                    </p>
                    <Button>
                      <Search className="h-4 w-4 mr-2" />
                      البحث عن رحلة
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking: any) => (
                  <Card key={booking.id} className="hover:shadow-elegant transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadge(booking.status).variant}>
                              {getStatusBadge(booking.status).label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">#{booking.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-lg font-medium mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{booking.pickupLocation}</span>
                            <span className="text-muted-foreground">←</span>
                            <span>{booking.destinationLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              {userProfile?.role === 'driver' 
                                ? `الراكب: ${booking.passenger?.fullName}` 
                                : `السائق: ${booking.driver?.fullName}`}
                            </span>
                            <Phone className="h-4 w-4 ml-2" />
                            <span>
                              {userProfile?.role === 'driver' 
                                ? booking.passenger?.phone 
                                : booking.driver?.phone}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{booking.totalAmount} دج</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.seatsBooked} مقعد
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {booking.paymentMethod === 'cod' ? 'نقداً' : 'بريدي موب'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.trip?.departureDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.trip?.vehicle?.make} {booking.trip?.vehicle?.model}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.trip?.availableSeats}/{booking.trip?.totalSeats} مقاعد</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm"><strong>ملاحظات:</strong> {booking.notes}</p>
                        </div>
                      )}

                      {booking.specialRequests && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm"><strong>طلبات خاصة:</strong> {booking.specialRequests}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {userProfile?.role === 'driver' && booking.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleConfirmBooking(booking.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              قبول
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              رفض
                            </Button>
                          </>
                        )}
                        {userProfile?.role === 'passenger' && booking.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            إلغاء الحجز
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          تفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <NotificationCenter />
          </TabsContent>

          {/* Users Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة المستخدمين</CardTitle>
                  <CardDescription>مراقبة وإدارة جميع المستخدمين في النظام</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">قريباً: إدارة المستخدمين</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات النظام</CardTitle>
                  <CardDescription>تكوين إعدادات النظام العامة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">قريباً: إعدادات النظام</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
