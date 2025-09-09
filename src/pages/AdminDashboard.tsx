import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Car, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Bell, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  AlertCircle,
  Settings,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Shield,
  Activity
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface RealTimeStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  pendingDrivers: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  pickup_location: string;
  destination_location: string;
  total_amount: number;
  status: string;
  seats_booked: number;
  payment_method: string;
  created_at: string;
  passenger?: {
    full_name?: string;
    phone?: string;
    email: string;
  };
  driver?: {
    full_name?: string;
    phone?: string;
  };
}

interface Trip {
  id: string;
  from_wilaya_id: number;
  to_wilaya_id: number;
  departure_date: string;
  departure_time: string;
  price_per_seat: number;
  available_seats: number;
  total_seats: number;
  is_active: boolean;
  created_at: string;
  driver?: {
    full_name?: string;
    phone?: string;
  };
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
  };
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<RealTimeStats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingDrivers: 0
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch real-time statistics
  const fetchStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get drivers count
      const { count: totalDrivers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver');

      // Get pending drivers count
      const { count: pendingDrivers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'driver')
        .eq('is_verified', false);

      // Get total bookings count
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Get active bookings count
      const { count: activeBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed']);

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalDrivers: totalDrivers || 0,
        totalBookings: totalBookings || 0,
        activeBookings: activeBookings || 0,
        totalRevenue,
        pendingDrivers: pendingDrivers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch bookings with passenger and driver info
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch passenger and driver details separately
      const bookingsWithDetails = await Promise.all(
        (data || []).map(async (booking) => {
          let passenger = null;
          let driver = null;
          
          if (booking.passenger_id) {
            const { data: passengerData } = await supabase
              .from('profiles')
              .select('full_name, phone, email')
              .eq('id', booking.passenger_id)
              .single();
            passenger = passengerData;
          }
          
          if (booking.driver_id) {
            const { data: driverData } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', booking.driver_id)
              .single();
            driver = driverData;
          }
          
          return { ...booking, passenger, driver };
        })
      );
      
      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch trips with driver and vehicle info
  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch driver and vehicle details separately
      const tripsWithDetails = await Promise.all(
        (data || []).map(async (trip) => {
          let driver = null;
          let vehicle = null;
          
          if (trip.driver_id) {
            const { data: driverData } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', trip.driver_id)
              .single();
            driver = driverData;
          }
          
          if (trip.vehicle_id) {
            const { data: vehicleData } = await supabase
              .from('vehicles')
              .select('make, model, license_plate')
              .eq('id', trip.vehicle_id)
              .single();
            vehicle = vehicleData;
          }
          
          return { ...trip, driver, vehicle };
        })
      );
      
      setTrips(tripsWithDetails);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الحجز إلى ${status}`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحجز",
        variant: "destructive"
      });
    }
  };

  // Approve/reject driver
  const updateDriverStatus = async (driverId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: approved })
        .eq('id', driverId);

      if (error) throw error;

      await fetchUsers();
      await fetchStats();
      
      toast({
        title: approved ? "تم الاعتماد" : "تم الرفض",
        description: `تم ${approved ? 'اعتماد' : 'رفض'} السائق بنجاح`,
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة السائق",
        variant: "destructive"
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchNotifications(),
        fetchUsers(),
        fetchBookings(),
        fetchTrips()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications
    const notificationsSubscription = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    // Subscribe to new bookings
    const bookingsSubscription = supabase
      .channel('admin_bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to new users/drivers
    const usersSubscription = supabase
      .channel('admin_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUsers();
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to new trips
    const tripsSubscription = supabase
      .channel('admin_trips')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips'
        },
        () => {
          fetchTrips();
        }
      )
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
      tripsSubscription.unsubscribe();
    };
  }, [user]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    return filterStatus === "all" || booking.status === filterStatus;
  });

  const getStatusBadge = (status: string, type: "booking" | "user" = "booking") => {
    if (type === "booking") {
      const bookingStatuses = {
        pending: { label: "في الانتظار", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
        confirmed: { label: "مؤكد", variant: "default" as const, color: "bg-green-100 text-green-800" },
        completed: { label: "مكتمل", variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
        cancelled: { label: "ملغي", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
      };
      return bookingStatuses[status as keyof typeof bookingStatuses] || bookingStatuses.pending;
    } else {
      const userStatuses = {
        active: { label: "نشط", variant: "default" as const, color: "bg-green-100 text-green-800" },
        pending: { label: "في الانتظار", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
        suspended: { label: "موقوف", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
      };
      return userStatuses[status as keyof typeof userStatuses] || userStatuses.active;
    }
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      admin: { label: "مدير", color: "bg-purple-100 text-purple-800" },
      driver: { label: "سائق", color: "bg-blue-100 text-blue-800" },
      rider: { label: "راكب", color: "bg-gray-100 text-gray-800" }
    };
    return roles[role as keyof typeof roles] || roles.rider;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل لوحة الإدارة...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Demo Badge */}
        <div className="bg-gradient-primary rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  LIVE DATA
                </Badge>
              </div>
              <p className="text-white/90">مراقبة وإدارة النظام في الوقت الفعلي</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="secondary" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
              <div className="text-sm text-blue-700">إجمالي المستخدمين</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{stats.totalDrivers}</div>
              <div className="text-sm text-green-700">السائقون</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{stats.totalBookings}</div>
              <div className="text-sm text-purple-700">إجمالي الحجوزات</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{stats.activeBookings}</div>
              <div className="text-sm text-orange-700">الحجوزات النشطة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-yellow-700">الإيرادات (دج)</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">{stats.pendingDrivers}</div>
              <div className="text-sm text-red-700">سائقون في الانتظار</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                الإشعارات الأخيرة
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount} جديد
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      notification.is_read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('ar-DZ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="drivers">السائقون</TabsTrigger>
            <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
            <TabsTrigger value="trips">الرحلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>أحدث الحجوزات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.passenger?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.pickup_location} → {booking.destination_location}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusBadge(booking.status).color}>
                            {getStatusBadge(booking.status).label}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{booking.total_amount} دج</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Trips */}
              <Card>
                <CardHeader>
                  <CardTitle>أحدث الرحلات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trips.slice(0, 5).map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{trip.driver?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ولاية {trip.from_wilaya_id} → ولاية {trip.to_wilaya_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={trip.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {trip.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{trip.price_per_seat} دج/مقعد</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث في المستخدمين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      <SelectItem value="rider">الركاب</SelectItem>
                      <SelectItem value="driver">السائقون</SelectItem>
                      <SelectItem value="admin">المديرون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="grid gap-4">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleBadge(user.role);
                
                return (
                  <Card key={user.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {(user.full_name || user.email)?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{user.full_name || user.email}</h3>
                              <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                              {user.is_verified && (
                                <Shield className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>انضم في {new Date(user.created_at).toLocaleDateString('ar-DZ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            عرض
                          </Button>
                          
                          {user.role === 'driver' && !user.is_verified && (
                            <Button 
                              size="sm" 
                              onClick={() => updateDriverStatus(user.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              اعتماد
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">إدارة السائقين</h2>
              <Badge className="bg-red-100 text-red-800">
                {stats.pendingDrivers} في انتظار الاعتماد
              </Badge>
            </div>

            <div className="grid gap-4">
              {users.filter(u => u.role === 'driver').map((driver) => (
                <Card key={driver.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{(driver.full_name || driver.email)?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{driver.full_name || driver.email}</h3>
                            {driver.is_verified ? (
                              <Badge className="bg-green-100 text-green-800">معتمد</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{driver.email}</div>
                            {driver.phone && <div>{driver.phone}</div>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!driver.is_verified && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateDriverStatus(driver.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              اعتماد
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateDriverStatus(driver.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              رفض
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          عرض
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">إدارة الحجوزات</h2>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredBookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status);
                
                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground">#{booking.id.slice(0, 8)}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{booking.passenger?.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{booking.passenger?.email || 'غير محدد'}</span>
                          </div>
                          {booking.passenger?.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{booking.passenger.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{booking.total_amount} دج</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.seats_booked} مقاعد • {booking.payment_method === 'cod' ? 'نقداً' : 'بريدي موب'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-4">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.pickup_location}</span>
                        <span>←</span>
                        <span>{booking.destination_location}</span>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              تأكيد
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              إلغاء
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
                );
              })}
            </div>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">إدارة الرحلات</h2>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
            </div>

            <div className="grid gap-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={trip.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {trip.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{trip.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="font-semibold">{trip.driver?.full_name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {trip.vehicle && (
                            <div>{trip.vehicle.make} {trip.vehicle.model} - {trip.vehicle.license_plate}</div>
                          )}
                          {trip.driver?.phone && <div>{trip.driver.phone}</div>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{trip.price_per_seat} دج</div>
                        <div className="text-sm text-muted-foreground">
                          {trip.available_seats}/{trip.total_seats} مقاعد متاحة
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {trip.departure_date} - {trip.departure_time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm mt-4">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>ولاية {trip.from_wilaya_id} → ولاية {trip.to_wilaya_id}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                هذا قسم الإعدادات - يمكنك تخصيص إعدادات النظام هنا
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">إعدادات النظام ستكون متاحة قريباً...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;