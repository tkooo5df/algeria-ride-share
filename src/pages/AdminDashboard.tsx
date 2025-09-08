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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Briefcase
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  pendingApprovals: number;
  monthlyGrowth: number;
  userGrowth: number;
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
  passenger?: User;
  driver?: User;
  price?: number;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeTrips: 0,
    pendingApprovals: 0,
    monthlyGrowth: 0,
    userGrowth: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Check if user is admin
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية للوصول إلى لوحة الإدارة",
        variant: "destructive"
      });
      window.location.href = '/';
    }
  }, [profile]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch users (mock data for now)
        const mockUsers: User[] = [
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
          }
        ];

        const mockBookings: Booking[] = [
          {
            id: "BK001",
            pickup_location: "الجزائر العاصمة",
            destination_location: "وهران",
            status: "confirmed",
            created_at: "2024-01-20",
            price: 2500
          },
          {
            id: "BK002",
            pickup_location: "قسنطينة",
            destination_location: "سطيف",
            status: "pending",
            created_at: "2024-01-19",
            price: 1200
          }
        ];

        setUsers(mockUsers);
        setBookings(mockBookings);
        
        // Calculate stats
        setStats({
          totalUsers: mockUsers.length,
          totalDrivers: mockUsers.filter(u => u.role === 'driver').length,
          totalBookings: mockBookings.length,
          totalRevenue: mockBookings.reduce((sum, b) => sum + (b.price || 0), 0),
          activeTrips: mockBookings.filter(b => b.status === 'confirmed').length,
          pendingApprovals: mockUsers.filter(u => u.status === 'pending').length,
          monthlyGrowth: 15.2,
          userGrowth: 23.5
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    if (profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [profile]);

  const getStatusBadge = (status: string, type: "user" | "booking" = "user") => {
    if (type === "user") {
      const userStatuses = {
        active: { label: "نشط", variant: "default" as const, color: "bg-green-100 text-green-800" },
        pending: { label: "في الانتظار", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
        suspended: { label: "موقوف", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
        banned: { label: "محظور", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
      };
      return userStatuses[status as keyof typeof userStatuses] || userStatuses.active;
    } else {
      const bookingStatuses = {
        confirmed: { label: "مؤكد", variant: "default" as const, color: "bg-green-100 text-green-800" },
        pending: { label: "في الانتظار", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
        completed: { label: "مكتمل", variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
        cancelled: { label: "ملغي", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
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
      // Here you would typically make API calls to update user status
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
                <p className="text-white/90">إدارة شاملة لنظام DZ Taxi</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">آخر تحديث</div>
              <div className="text-lg font-semibold">{new Date().toLocaleDateString('ar-DZ')}</div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">إجمالي المستخدمين</div>
                  <div className="text-xs text-green-600">+{stats.userGrowth}% هذا الشهر</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalDrivers}</div>
                  <div className="text-sm text-muted-foreground">السائقون النشطون</div>
                  <div className="text-xs text-blue-600">+12 هذا الأسبوع</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الحجوزات</div>
                  <div className="text-xs text-purple-600">{stats.activeTrips} نشط</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} دج</div>
                  <div className="text-sm text-muted-foreground">الإيرادات الشهرية</div>
                  <div className="text-xs text-green-600">+{stats.monthlyGrowth}% نمو</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{stats.pendingApprovals}</div>
              <div className="text-sm text-muted-foreground">طلبات معلقة</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold">98.5%</div>
              <div className="text-sm text-muted-foreground">معدل الخدمة</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">متوسط التقييم</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-bold">48</div>
              <div className="text-sm text-muted-foreground">ولاية مغطاة</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="drivers">السائقون</TabsTrigger>
            <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مستخدم
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="تصفية حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="passenger">الركاب</SelectItem>
                  <SelectItem value="driver">السائقون</SelectItem>
                  <SelectItem value="admin">المديرون</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="grid gap-4">
              {filteredUsers.map((user) => {
                const statusInfo = getStatusBadge(user.status);
                const roleInfo = getRoleBadge(user.role);
                
                return (
                  <Card key={user.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {user.profile?.first_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {user.profile?.first_name} {user.profile?.last_name} 
                              </h3>
                              <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              {user.profile?.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{user.profile.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>انضم في {user.created_at}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            عرض
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل
                          </Button>
                          {user.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUserAction(user.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              موافقة
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            إيقاف
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Drivers Management */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة السائقين</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                إضافة سائق
              </Button>
            </div>

            <div className="grid gap-4">
              {users.filter(u => u.role === 'driver').map((driver) => (
                <Card key={driver.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{driver.profile?.first_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {driver.profile?.first_name} {driver.profile?.last_name}
                            </h3>
                            <Badge className={getStatusBadge(driver.status).color}>
                              {getStatusBadge(driver.status).label}
                            </Badge>
                            {driver.status === 'active' && (
                              <Badge className="bg-green-100 text-green-800">
                                <Star className="h-3 w-3 mr-1" />
                                4.8
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{driver.email}</span>
                            <span>{driver.profile?.phone}</span>
                            <span>156 رحلة</span>
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
                        {driver.status === 'pending' && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            اعتماد
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Management */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة الحجوزات</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  تصفية
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {bookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status, "booking");
                
                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground">#{booking.id}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-lg font-medium mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{booking.pickup_location}</span>
                            <span className="text-muted-foreground">←</span>
                            <span>{booking.destination_location}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{booking.created_at}</span>
                            </div>
                            {booking.price && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{booking.price} دج</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            عرض
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل
                          </Button>
                          {booking.status === 'pending' && (
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              موافقة
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

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">التحليلات والإحصائيات</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    نمو المستخدمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>هذا الشهر</span>
                      <span className="font-bold text-green-600">+23.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>الشهر الماضي</span>
                      <span className="font-bold">+18.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>المتوسط السنوي</span>
                      <span className="font-bold">+15.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-secondary" />
                    توزيع المستخدمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>الركاب</span>
                      <span className="font-bold">75%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>السائقون</span>
                      <span className="font-bold">23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>المديرون</span>
                      <span className="font-bold">2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>الولايات الأكثر نشاطاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">الجزائر</div>
                    <div className="text-sm text-muted-foreground">342 حجز</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/5 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">وهران</div>
                    <div className="text-sm text-muted-foreground">289 حجز</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">قسنطينة</div>
                    <div className="text-sm text-muted-foreground">156 حجز</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">إعدادات النظام</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات العامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم الموقع</Label>
                    <Input defaultValue="DZ Taxi" />
                  </div>
                  <div className="space-y-2">
                    <Label>وصف الموقع</Label>
                    <Textarea defaultValue="أفضل خدمة نقل في الجزائر" />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الدعم</Label>
                    <Input defaultValue="+213 555 123 456" />
                  </div>
                  <Button className="w-full">حفظ الإعدادات</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الحجز</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>الحد الأدنى للسعر</Label>
                    <Input type="number" defaultValue="500" />
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأقصى للسعر</Label>
                    <Input type="number" defaultValue="10000" />
                  </div>
                  <div className="space-y-2">
                    <Label>عمولة الموقع (%)</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <Button className="w-full">حفظ الإعدادات</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">التقارير والإحصائيات</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تقرير يومي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>حجوزات جديدة</span>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رحلات مكتملة</span>
                      <span className="font-bold">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إيرادات اليوم</span>
                      <span className="font-bold">45,600 دج</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تقرير أسبوعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>مستخدمون جدد</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>سائقون جدد</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي الإيرادات</span>
                      <span className="font-bold">324,500 دج</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تقرير شهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>إجمالي الحجوزات</span>
                      <span className="font-bold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل النجاح</span>
                      <span className="font-bold">94.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الإيرادات الشهرية</span>
                      <span className="font-bold">1,456,780 دج</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل التقرير
                  </Button>
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

export default AdminDashboard;