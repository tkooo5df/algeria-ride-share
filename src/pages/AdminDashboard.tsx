import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  FileText,
  Database,
  Activity,
  Globe,
  Zap,
  Target,
  Award,
  Briefcase,
  RefreshCw,
  Save,
  UserCheck,
  UserX,
  CreditCard,
  Navigation,
  MessageCircle,
  Home,
  LogOut
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  pendingApprovals: number;
  monthlyGrowth: number;
  userGrowth: number;
  completionRate: number;
  averageRating: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    wilaya?: string;
  };
}

interface Booking {
  id: string;
  pickup_location: string;
  destination_location: string;
  status: string;
  created_at: string;
  total_amount: number;
  seats_booked: number;
  payment_method: string;
  passenger?: User;
  driver?: User;
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    driverApprovalRequired: true,
    enableNotifications: true,
    enableSMS: true,
    commissionRate: 10,
    minBookingPrice: 500,
    maxBookingPrice: 10000
  });

  // Enhanced demo data
  const stats: AdminStats = {
    totalUsers: 1247,
    totalDrivers: 342,
    totalBookings: 2156,
    totalRevenue: 2456780,
    activeTrips: 89,
    pendingApprovals: 15,
    monthlyGrowth: 28.9,
    userGrowth: 23.5,
    completionRate: 94.5,
    averageRating: 4.8
  };

  const users: User[] = [
    {
      id: "1",
      email: "ahmed@example.com",
      role: "passenger",
      status: "active",
      created_at: "2024-01-15",
      last_sign_in: "2024-01-20",
      profile: {
        first_name: "أحمد",
        last_name: "محمد",
        phone: "+213 555 123 456",
        wilaya: "16"
      }
    },
    {
      id: "2",
      email: "fatima@example.com",
      role: "driver",
      status: "pending",
      created_at: "2024-01-10",
      last_sign_in: "2024-01-19",
      profile: {
        first_name: "فاطمة",
        last_name: "بن علي",
        phone: "+213 555 789 012",
        wilaya: "31"
      }
    },
    {
      id: "3",
      email: "youssef@example.com",
      role: "driver",
      status: "active",
      created_at: "2024-01-05",
      last_sign_in: "2024-01-20",
      profile: {
        first_name: "يوسف",
        last_name: "كريم",
        phone: "+213 555 456 789",
        wilaya: "25"
      }
    },
    {
      id: "4",
      email: "sara@example.com",
      role: "passenger",
      status: "active",
      created_at: "2024-01-12",
      last_sign_in: "2024-01-21",
      profile: {
        first_name: "سارة",
        last_name: "بوعلام",
        phone: "+213 555 321 654",
        wilaya: "06"
      }
    },
    {
      id: "5",
      email: "karim@example.com",
      role: "driver",
      status: "suspended",
      created_at: "2024-01-08",
      last_sign_in: "2024-01-18",
      profile: {
        first_name: "كريم",
        last_name: "زيدان",
        phone: "+213 555 987 321",
        wilaya: "09"
      }
    }
  ];

  const bookings: Booking[] = [
    {
      id: "BK001",
      pickup_location: "الجزائر العاصمة",
      destination_location: "وهران",
      status: "confirmed",
      created_at: "2024-01-20",
      total_amount: 2500,
      seats_booked: 2,
      payment_method: "baridimob"
    },
    {
      id: "BK002",
      pickup_location: "قسنطينة",
      destination_location: "سطيف",
      status: "pending",
      created_at: "2024-01-19",
      total_amount: 1200,
      seats_booked: 1,
      payment_method: "cod"
    },
    {
      id: "BK003",
      pickup_location: "عنابة",
      destination_location: "الجزائر العاصمة",
      status: "completed",
      created_at: "2024-01-18",
      total_amount: 3200,
      seats_booked: 3,
      payment_method: "baridimob"
    },
    {
      id: "BK004",
      pickup_location: "تلمسان",
      destination_location: "وهران",
      status: "cancelled",
      created_at: "2024-01-17",
      total_amount: 800,
      seats_booked: 1,
      payment_method: "cod"
    }
  ];

  // Load notifications from Supabase
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Set up real-time subscription for new notifications
    const notificationSubscription = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      notificationSubscription.unsubscribe();
    };
  }, [user]);

  const getStatusBadge = (status: string, type: "user" | "booking" = "user") => {
    if (type === "user") {
      const userStatuses = {
        active: { label: "نشط", color: "bg-green-100 text-green-800" },
        pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
        suspended: { label: "موقوف", color: "bg-red-100 text-red-800" },
        banned: { label: "محظور", color: "bg-red-100 text-red-800" }
      };
      return userStatuses[status as keyof typeof userStatuses] || userStatuses.active;
    } else {
      const bookingStatuses = {
        confirmed: { label: "مؤكد", color: "bg-green-100 text-green-800" },
        pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
        completed: { label: "مكتمل", color: "bg-blue-100 text-blue-800" },
        cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" }
      };
      return bookingStatuses[status as keyof typeof bookingStatuses] || bookingStatuses.pending;
    }
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      admin: { label: "مدير", color: "bg-purple-100 text-purple-800" },
      driver: { label: "سائق", color: "bg-blue-100 text-blue-800" },
      passenger: { label: "راكب", color: "bg-gray-100 text-gray-800" }
    };
    return roles[role as keyof typeof roles] || roles.passenger;
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      console.log(`${action} user ${userId}`);
      toast({
        title: "تم بنجاح",
        description: `تم ${action === 'approve' ? 'الموافقة على' : action === 'suspend' ? 'إيقاف' : 'حذف'} المستخدم`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تنفيذ العملية",
        variant: "destructive"
      });
    }
  };

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      console.log(`${action} booking ${bookingId}`);
      toast({
        title: "تم بنجاح",
        description: `تم ${action === 'approve' ? 'الموافقة على' : action === 'cancel' ? 'إلغاء' : 'تحديث'} الحجز`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تنفيذ العملية",
        variant: "destructive"
      });
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعدادات النظام بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.pickup_location.includes(searchTerm) ||
                         booking.destination_location.includes(searchTerm) ||
                         booking.id.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Enhanced Admin Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Shield className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">لوحة تحكم المدير</h1>
                  <p className="text-white/90 text-lg">إدارة شاملة ومتقدمة لنظام DZ Taxi</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg px-6 py-3 shadow-lg">
                  🚀 النسخة التجريبية
                </Badge>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    onClick={() => {
                      notifications.forEach(n => {
                        if (!n.is_read) markAsRead(n.id);
                      });
                    }}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    الإشعارات
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white ml-2 px-2 py-1 text-xs animate-pulse">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    الرئيسية
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-white/80 text-sm">إجمالي المستخدمين</div>
                <div className="text-green-300 text-xs">+{stats.userGrowth}%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{stats.totalDrivers}</div>
                <div className="text-white/80 text-sm">السائقون النشطون</div>
                <div className="text-blue-300 text-xs">{stats.pendingApprovals} معلق</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{stats.totalBookings.toLocaleString()}</div>
                <div className="text-white/80 text-sm">إجمالي الحجوزات</div>
                <div className="text-purple-300 text-xs">{stats.activeTrips} نشط</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{(stats.totalRevenue / 1000000).toFixed(1)}M دج</div>
                <div className="text-white/80 text-sm">الإيرادات الشهرية</div>
                <div className="text-yellow-300 text-xs">+{stats.monthlyGrowth}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                الإشعارات الحديثة
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    {unreadCount} جديد
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      notification.is_read 
                        ? 'bg-white border-gray-200' 
                        : 'bg-blue-50 border-blue-300 shadow-sm ring-2 ring-blue-200'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString('ar-DZ')}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          notification.type === 'booking' ? 'border-green-300 text-green-700 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        {notification.type === 'booking' ? '📋 حجز جديد' : notification.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {notifications.length > 5 && (
                <div className="text-center mt-4">
                  <Button variant="outline" size="sm">
                    عرض جميع الإشعارات ({notifications.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-3 rounded-lg shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{stats.completionRate}%</div>
                  <div className="text-sm text-green-600">معدل الإكمال</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-3 rounded-lg shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">{stats.averageRating}</div>
                  <div className="text-sm text-yellow-600">متوسط التقييم</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-3 rounded-lg shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">{stats.activeTrips}</div>
                  <div className="text-sm text-purple-600">رحلات نشطة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-3 rounded-lg shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">{stats.pendingApprovals}</div>
                  <div className="text-sm text-orange-600">طلبات معلقة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-3 rounded-lg shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">48</div>
                  <div className="text-sm text-blue-600">ولاية مغطاة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-3 rounded-lg shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-700">96.8%</div>
                  <div className="text-sm text-indigo-600">رضا العملاء</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              المستخدمون
            </TabsTrigger>
            <TabsTrigger value="drivers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              السائقون
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              الحجوزات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-500 data-[state=active]:text-white">
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>🎯 مرحباً بك في النسخة التجريبية!</strong> هذه لوحة إدارة متكاملة تعرض جميع الوظائف والإمكانيات المتقدمة لنظام DZ Taxi.
              </AlertDescription>
            </Alert>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    النشاط الحديث
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">حجز جديد مؤكد</p>
                        <p className="text-sm text-muted-foreground">أحمد محمد - الجزائر → وهران</p>
                      </div>
                      <span className="text-xs text-muted-foreground">منذ 5 دقائق</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">سائق جديد انضم</p>
                        <p className="text-sm text-muted-foreground">فاطمة بن علي - وهران</p>
                      </div>
                      <span className="text-xs text-muted-foreground">منذ 15 دقيقة</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium">طلب اعتماد سائق</p>
                        <p className="text-sm text-muted-foreground">يوسف كريم - قسنطينة</p>
                      </div>
                      <span className="text-xs text-muted-foreground">منذ 30 دقيقة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة مستخدم جديد
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    مراجعة طلبات السائقين
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    تصدير التقارير
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    إعدادات النظام
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">قاعدة البيانات</div>
                    <div className="text-sm text-green-600">متصلة</div>
                    <Progress value={100} className="mt-2 h-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">الخادم</div>
                    <div className="text-sm text-green-600">يعمل بشكل طبيعي</div>
                    <Progress value={98} className="mt-2 h-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">البريد الإلكتروني</div>
                    <div className="text-sm text-green-600">متصل</div>
                    <Progress value={95} className="mt-2 h-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <RefreshCw className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="font-medium">النسخ الاحتياطي</div>
                    <div className="text-sm text-yellow-600">قيد التشغيل</div>
                    <Progress value={75} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Users Management */}
          <TabsContent value="users" className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50 shadow-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>إدارة المستخدمين المتقدمة:</strong> بحث متقدم، تصفية ذكية، وإدارة شاملة لجميع المستخدمين في النظام.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير ({filteredUsers.length})
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مستخدم
                </Button>
              </div>
            </div>

            {/* Enhanced Search and Filter */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث في المستخدمين (الاسم، البريد، الهاتف)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      <SelectItem value="passenger">الركاب ({users.filter(u => u.role === 'passenger').length})</SelectItem>
                      <SelectItem value="driver">السائقون ({users.filter(u => u.role === 'driver').length})</SelectItem>
                      <SelectItem value="admin">المديرون ({users.filter(u => u.role === 'admin').length})</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="active">نشط ({users.filter(u => u.status === 'active').length})</SelectItem>
                      <SelectItem value="pending">في الانتظار ({users.filter(u => u.status === 'pending').length})</SelectItem>
                      <SelectItem value="suspended">موقوف ({users.filter(u => u.status === 'suspended').length})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    عرض {filteredUsers.length} من {users.length} مستخدم
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSearchTerm("");
                    setFilterRole("all");
                    setFilterStatus("all");
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    إعادة تعيين
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Users List */}
            <div className="grid gap-4">
              {filteredUsers.map((user) => {
                const statusInfo = getStatusBadge(user.status);
                const roleInfo = getRoleBadge(user.role);
                
                return (
                  <Card key={user.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-secondary text-white">
                              {user.profile?.first_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {user.profile?.first_name} {user.profile?.last_name} 
                              </h3>
                              <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                              {user.role === 'driver' && user.status === 'active' && (
                                <Shield className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{user.email}</span>
                                </div>
                                {user.profile?.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    <span>{user.profile.phone}</span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>انضم في {user.created_at}</span>
                                </div>
                                {user.profile?.wilaya && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>ولاية {user.profile.wilaya}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                عرض
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>تفاصيل المستخدم</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src="/placeholder.svg" />
                                      <AvatarFallback className="text-xl">
                                        {selectedUser.profile?.first_name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold">
                                        {selectedUser.profile?.first_name} {selectedUser.profile?.last_name}
                                      </h3>
                                      <div className="flex gap-2 mt-1">
                                        <Badge className={getRoleBadge(selectedUser.role).color}>
                                          {getRoleBadge(selectedUser.role).label}
                                        </Badge>
                                        <Badge className={getStatusBadge(selectedUser.status).color}>
                                          {getStatusBadge(selectedUser.status).label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">معلومات الاتصال</h4>
                                      <div className="space-y-2 text-sm">
                                        <div>البريد: {selectedUser.email}</div>
                                        <div>الهاتف: {selectedUser.profile?.phone || "غير محدد"}</div>
                                        <div>الولاية: {selectedUser.profile?.wilaya || "غير محدد"}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">معلومات الحساب</h4>
                                      <div className="space-y-2 text-sm">
                                        <div>تاريخ التسجيل: {selectedUser.created_at}</div>
                                        <div>آخر دخول: {selectedUser.last_sign_in}</div>
                                        <div>الحالة: {getStatusBadge(selectedUser.status).label}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل
                          </Button>
                          
                          {user.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUserAction(user.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              موافقة
                            </Button>
                          )}
                          
                          {user.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="border-orange-200 text-orange-600 hover:bg-orange-50"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              إيقاف
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

          {/* Enhanced Drivers Management */}
          <TabsContent value="drivers" className="space-y-4">
            <Alert className="border-green-200 bg-green-50 shadow-lg">
              <Car className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>إدارة السائقين المتقدمة:</strong> مراجعة طلبات السائقين الجدد، إدارة الوثائق، ومراقبة الأداء مع تقييمات الركاب.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة السائقين</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  تصفية متقدمة
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة سائق
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {users.filter(u => u.role === 'driver').map((driver) => {
                const statusInfo = getStatusBadge(driver.status);
                
                return (
                  <Card key={driver.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-blue-200">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-bold">
                              {driver.profile?.first_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {driver.profile?.first_name} {driver.profile?.last_name}
                              </h3>
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                              {driver.status === 'active' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  4.8 ⭐
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                156 رحلة
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{driver.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{driver.profile?.phone}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>انضم في {driver.created_at}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>ولاية {driver.profile?.wilaya}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            الملف
                          </Button>
                          <Button size="sm" variant="outline">
                            <Car className="h-4 w-4 mr-2" />
                            المركبات
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            الوثائق
                          </Button>
                          {driver.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUserAction(driver.id, 'approve')}
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

          {/* Enhanced Bookings Management */}
          <TabsContent value="bookings" className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50 shadow-lg">
              <Briefcase className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>إدارة الحجوزات المتقدمة:</strong> مراقبة جميع الحجوزات في الوقت الفعلي مع إمكانية التدخل والمتابعة المباشرة.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة الحجوزات</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير ({filteredBookings.length})
                </Button>
              </div>
            </div>

            {/* Booking Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-green-600">حجوزات مؤكدة</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-700">
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                  <div className="text-sm text-yellow-600">في الانتظار</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">
                    {bookings.filter(b => b.status === 'completed').length}
                  </div>
                  <div className="text-sm text-blue-600">مكتملة</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-pink-100">
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-red-600">ملغية</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Bookings List */}
            <div className="grid gap-4">
              {filteredBookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status, "booking");
                
                return (
                  <Card key={booking.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground font-mono">#{booking.id}</span>
                            <Badge variant="outline" className="text-xs">
                              {booking.payment_method === 'cod' ? 'نقداً' : 'بريدي موب'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-lg font-medium mb-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>{booking.pickup_location}</span>
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.destination_location}</span>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{booking.created_at}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span>{booking.seats_booked} راكب</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-bold text-primary">{booking.total_amount} دج</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            تفاصيل
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            تواصل
                          </Button>
                          {booking.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              موافقة
                            </Button>
                          )}
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleBookingAction(booking.id, 'cancel')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              إلغاء
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

          {/* Enhanced Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Alert className="border-purple-200 bg-purple-50 shadow-lg">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>التحليلات المتقدمة:</strong> رؤى شاملة وتفصيلية حول أداء النظام ونمو الأعمال مع مؤشرات الأداء الرئيسية.
              </AlertDescription>
            </Alert>

            <h2 className="text-2xl font-bold">التحليلات والإحصائيات المتقدمة</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Analytics */}
              <Card className="lg:col-span-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    تحليل الإيرادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-700">2.45M دج</div>
                      <div className="text-sm text-green-600">هذا الشهر</div>
                      <div className="text-xs text-green-500">+28.9% نمو</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-700">1.89M دج</div>
                      <div className="text-sm text-blue-600">الشهر الماضي</div>
                      <div className="text-xs text-blue-500">+15.2% نمو</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-700">245K دج</div>
                      <div className="text-sm text-purple-600">عمولة الموقع</div>
                      <div className="text-xs text-purple-500">10% معدل</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    توزيع المستخدمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>الركاب</span>
                      </div>
                      <span className="font-bold">75% (935)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>السائقون</span>
                      </div>
                      <span className="font-bold">23% (287)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>المديرون</span>
                      </div>
                      <span className="font-bold">2% (25)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Wilayas Performance */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  أداء الولايات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { name: "الجزائر", bookings: 342, revenue: 856000, growth: 25.3 },
                    { name: "وهران", bookings: 289, revenue: 723000, growth: 18.7 },
                    { name: "قسنطينة", bookings: 156, revenue: 390000, growth: 22.1 },
                    { name: "سطيف", bookings: 134, revenue: 335000, growth: 15.8 },
                    { name: "عنابة", bookings: 98, revenue: 245000, growth: 12.4 }
                  ].map((wilaya, index) => (
                    <div key={wilaya.name} className="text-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                      <div className="text-lg font-bold text-primary">{wilaya.name}</div>
                      <div className="text-sm text-muted-foreground mb-1">{wilaya.bookings} حجز</div>
                      <div className="text-xs font-medium">{wilaya.revenue.toLocaleString()} دج</div>
                      <div className="text-xs text-green-600 mt-1">+{wilaya.growth}%</div>
                      <Badge variant="outline" className="mt-2">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Alert className="border-gray-200 bg-gray-50 shadow-lg">
              <Settings className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-800">
                <strong>إعدادات النظام المتقدمة:</strong> تحكم كامل في جميع جوانب النظام من الأمان إلى طرق الدفع والإشعارات.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إعدادات النظام</h2>
              <Button onClick={handleSettingsUpdate}>
                <Save className="h-4 w-4 mr-2" />
                حفظ جميع الإعدادات
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    الإعدادات العامة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم الموقع</Label>
                    <Input defaultValue="DZ Taxi" />
                  </div>
                  <div className="space-y-2">
                    <Label>وصف الموقع</Label>
                    <Textarea defaultValue="أفضل خدمة نقل في الجزائر" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الدعم</Label>
                      <Input defaultValue="+213 555 123 456" />
                    </div>
                    <div className="space-y-2">
                      <Label>بريد الدعم</Label>
                      <Input defaultValue="support@dztaxi.dz" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Controls */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    التحكم في النظام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">وضع الصيانة</div>
                      <div className="text-sm text-muted-foreground">إيقاف الموقع مؤقتاً</div>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">تفعيل التسجيل</div>
                      <div className="text-sm text-muted-foreground">السماح بمستخدمين جدد</div>
                    </div>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">موافقة السائقين</div>
                      <div className="text-sm text-muted-foreground">مراجعة طلبات السائقين</div>
                    </div>
                    <Switch
                      checked={systemSettings.driverApprovalRequired}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, driverApprovalRequired: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Settings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                    إعدادات التسعير
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحد الأدنى (دج)</Label>
                      <Input 
                        type="number" 
                        value={systemSettings.minBookingPrice}
                        onChange={(e) => setSystemSettings(prev => ({ 
                          ...prev, 
                          minBookingPrice: parseInt(e.target.value) 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الحد الأقصى (دج)</Label>
                      <Input 
                        type="number" 
                        value={systemSettings.maxBookingPrice}
                        onChange={(e) => setSystemSettings(prev => ({ 
                          ...prev, 
                          maxBookingPrice: parseInt(e.target.value) 
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>عمولة الموقع (%)</Label>
                    <Input 
                      type="number" 
                      value={systemSettings.commissionRate}
                      onChange={(e) => setSystemSettings(prev => ({ 
                        ...prev, 
                        commissionRate: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    إعدادات الإشعارات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">تفعيل الإشعارات</div>
                      <div className="text-sm text-muted-foreground">إشعارات عامة للنظام</div>
                    </div>
                    <Switch
                      checked={systemSettings.enableNotifications}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, enableNotifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">إشعارات SMS</div>
                      <div className="text-sm text-muted-foreground">رسائل نصية للمستخدمين</div>
                    </div>
                    <Switch
                      checked={systemSettings.enableSMS}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, enableSMS: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Reports */}
          <TabsContent value="reports" className="space-y-6">
            <Alert className="border-indigo-200 bg-indigo-50 shadow-lg">
              <FileText className="h-4 w-4 text-indigo-600" />
              <AlertDescription className="text-indigo-800">
                <strong>التقارير التفصيلية:</strong> تقارير شاملة ومفصلة مع إمكانية التصدير بصيغ متعددة وجدولة التقارير التلقائية.
              </AlertDescription>
            </Alert>

            <h2 className="text-2xl font-bold">التقارير والإحصائيات التفصيلية</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-center">تقرير يومي</CardTitle>
                  <CardDescription className="text-center">إحصائيات اليوم الحالي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>حجوزات جديدة</span>
                      <Badge className="bg-green-100 text-green-800">24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>رحلات مكتملة</span>
                      <Badge className="bg-blue-100 text-blue-800">18</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>إيرادات اليوم</span>
                      <Badge className="bg-yellow-100 text-yellow-800">45,600 دج</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>مستخدمون جدد</span>
                      <Badge className="bg-purple-100 text-purple-800">12</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-center">تقرير أسبوعي</CardTitle>
                  <CardDescription className="text-center">إحصائيات الأسبوع الحالي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>مستخدمون جدد</span>
                      <Badge className="bg-green-100 text-green-800">156</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>سائقون نشطون</span>
                      <Badge className="bg-blue-100 text-blue-800">89</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>متوسط التقييم</span>
                      <Badge className="bg-yellow-100 text-yellow-800">4.8 ⭐</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>رحلات مكتملة</span>
                      <Badge className="bg-purple-100 text-purple-800">187</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>معدل الإلغاء</span>
                      <Badge className="bg-red-100 text-red-800">3.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>إجمالي الإيرادات</span>
                      <Badge className="bg-green-100 text-green-800">324,500 دج</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-center">تقرير شهري</CardTitle>
                  <CardDescription className="text-center">إحصائيات الشهر الحالي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>إجمالي الحجوزات</span>
                      <Badge className="bg-green-100 text-green-800">1,234</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>معدل النجاح</span>
                      <Badge className="bg-blue-100 text-blue-800">94.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>الإيرادات الشهرية</span>
                      <Badge className="bg-yellow-100 text-yellow-800">1,456,780 دج</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>نمو المستخدمين</span>
                      <Badge className="bg-purple-100 text-purple-800">+23.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>رضا العملاء</span>
                      <Badge className="bg-green-100 text-green-800">96.8%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>متوسط وقت الاستجابة</span>
                      <Badge className="bg-blue-100 text-blue-800">3.2 دقيقة</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Reports */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>تقارير متقدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">تقارير مخصصة</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        تقرير الأداء الشامل
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        تحليل سلوك المستخدمين
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="h-4 w-4 mr-2" />
                        تقرير التغطية الجغرافية
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">تقارير مالية</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="h-4 w-4 mr-2" />
                        تقرير الإيرادات التفصيلي
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        تحليل طرق الدفع
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        توقعات النمو
                      </Button>
                    </div>
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

export default AdminDashboard;