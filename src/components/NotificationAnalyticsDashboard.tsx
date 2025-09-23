import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Calendar,
  MessageSquare,
  Zap
} from 'lucide-react';
import { NotificationService, NotificationType, NotificationCategory, NotificationPriority } from '@/integrations/database/notificationService';
import { NotificationScheduler } from '@/integrations/database/notificationScheduler';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalNotifications: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  hourlyStats: Array<{ hour: number; count: number }>;
  dailyStats: Array<{ date: string; count: number }>;
  topPerformingTypes: Array<{ type: string; count: number; engagement: number }>;
  userEngagement: {
    activeUsers: number;
    totalUsers: number;
    averageNotificationsPerUser: number;
  };
  queueMetrics: {
    pending: number;
    sent: number;
    failed: number;
    retrying: number;
    averageProcessingTime: number;
  };
}

const NotificationAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadAnalytics = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      setLoading(true);
      
      // Simulate analytics data - in real app this would come from backend
      const mockAnalytics: AnalyticsData = {
        totalNotifications: 1247,
        deliveryRate: 98.5,
        openRate: 76.3,
        clickRate: 23.8,
        categoryBreakdown: {
          booking: 45,
          trip: 25,
          payment: 15,
          system: 10,
          account: 5
        },
        priorityBreakdown: {
          critical: 5,
          urgent: 15,
          high: 30,
          medium: 40,
          low: 10
        },
        hourlyStats: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 50) + 10
        })),
        dailyStats: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ar-DZ'),
          count: Math.floor(Math.random() * 200) + 50
        })),
        topPerformingTypes: [
          { type: 'booking_created', count: 156, engagement: 89.2 },
          { type: 'trip_starting', count: 143, engagement: 95.1 },
          { type: 'payment_received', count: 98, engagement: 78.3 },
          { type: 'booking_confirmed', count: 87, engagement: 92.4 },
          { type: 'trip_cancelled', count: 23, engagement: 100 }
        ],
        userEngagement: {
          activeUsers: 342,
          totalUsers: 456,
          averageNotificationsPerUser: 2.7
        },
        queueMetrics: {
          pending: 12,
          sent: 1187,
          failed: 8,
          retrying: 3,
          averageProcessingTime: 1.2
        }
      };

      // Get real queue stats
      const queueStats = NotificationScheduler.getQueueStats();
      mockAnalytics.queueMetrics = {
        ...mockAnalytics.queueMetrics,
        ...queueStats
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل التحليلات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange, selectedCategory]);

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      analytics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم التصدير",
      description: "تم تصدير التحليلات بنجاح"
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <p className="text-muted-foreground">هذه الصفحة متاحة للمديرين فقط</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mr-2">جاري تحميل التحليلات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">لا توجد بيانات تحليلية متاحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 تحليلات الإشعارات</h1>
          <p className="text-muted-foreground">مراقبة وتحليل أداء نظام الإشعارات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{analytics.totalNotifications.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">إجمالي الإشعارات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{analytics.deliveryRate}%</p>
                <p className="text-xs text-muted-foreground">معدل التسليم</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+2.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{analytics.openRate}%</p>
                <p className="text-xs text-muted-foreground">معدل الفتح</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+5.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{analytics.clickRate}%</p>
                <p className="text-xs text-muted-foreground">معدل النقر</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">-1.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="queue">الطابور</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Stats Chart */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات يومية</CardTitle>
                <CardDescription>الإشعارات المرسلة خلال الأيام السبعة الماضية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{stat.date}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(stat.count / Math.max(...analytics.dailyStats.map(s => s.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-left">{stat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>التوزيع بالساعات</CardTitle>
                <CardDescription>نشاط الإشعارات على مدار اليوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-1">
                  {analytics.hourlyStats.map((stat) => (
                    <div key={stat.hour} className="text-center">
                      <div 
                        className="bg-primary/20 rounded mb-1" 
                        style={{ 
                          height: `${Math.max(20, (stat.count / Math.max(...analytics.hourlyStats.map(s => s.count))) * 40)}px` 
                        }}
                      />
                      <span className="text-xs">{stat.hour}:00</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الفئات</CardTitle>
                <CardDescription>الإشعارات حسب الفئة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.categoryBreakdown).map(([category, percentage]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">
                          {category === 'booking' ? 'الحجوزات' :
                           category === 'trip' ? 'الرحلات' :
                           category === 'payment' ? 'المدفوعات' :
                           category === 'system' ? 'النظام' :
                           category === 'account' ? 'الحساب' : category}
                        </span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الأولويات</CardTitle>
                <CardDescription>الإشعارات حسب مستوى الأولوية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.priorityBreakdown).map(([priority, percentage]) => (
                    <div key={priority}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={priority === 'critical' || priority === 'urgent' ? 'destructive' : 
                                    priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {priority === 'critical' ? 'حرجة' :
                             priority === 'urgent' ? 'عاجلة' :
                             priority === 'high' ? 'عالية' :
                             priority === 'medium' ? 'متوسطة' :
                             priority === 'low' ? 'منخفضة' : priority}
                          </Badge>
                        </div>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أفضل أنواع الإشعارات أداءً</CardTitle>
              <CardDescription>مرتبة حسب معدل التفاعل</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {analytics.topPerformingTypes.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-sm text-muted-foreground">{item.count} إشعار</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-green-600">{item.engagement}%</p>
                        <p className="text-xs text-muted-foreground">معدل التفاعل</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Queue Status */}
            <Card>
              <CardHeader>
                <CardTitle>حالة الطابور</CardTitle>
                <CardDescription>الإشعارات في الطابور</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>في الانتظار</span>
                    <Badge variant="outline">{analytics.queueMetrics.pending}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>مرسل</span>
                    <Badge variant="default">{analytics.queueMetrics.sent}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>فاشل</span>
                    <Badge variant="destructive">{analytics.queueMetrics.failed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>إعادة المحاولة</span>
                    <Badge variant="secondary">{analytics.queueMetrics.retrying}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>مقاييس الأداء</CardTitle>
                <CardDescription>إحصائيات معالجة الطابور</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>معدل النجاح</span>
                      <span>{((analytics.queueMetrics.sent / (analytics.queueMetrics.sent + analytics.queueMetrics.failed)) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(analytics.queueMetrics.sent / (analytics.queueMetrics.sent + analytics.queueMetrics.failed)) * 100} />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">متوسط وقت المعالجة</p>
                    <p className="text-2xl font-bold">{analytics.queueMetrics.averageProcessingTime} ثانية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مشاركة المستخدمين</CardTitle>
              <CardDescription>إحصائيات المستخدمين والتفاعل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{analytics.userEngagement.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">مستخدمون نشطون</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">{analytics.userEngagement.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{analytics.userEngagement.averageNotificationsPerUser}</p>
                  <p className="text-sm text-muted-foreground">متوسط الإشعارات/مستخدم</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationAnalyticsDashboard;