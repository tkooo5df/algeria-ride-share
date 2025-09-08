import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  DollarSign, 
  MapPin,
  Calendar,
  Clock,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  userGrowth: number;
  driverGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
  topWilayas: Array<{ name: string; bookings: number; revenue: number }>;
  monthlyStats: Array<{ month: string; users: number; bookings: number; revenue: number }>;
  performanceMetrics: {
    averageRating: number;
    completionRate: number;
    responseTime: number;
    customerSatisfaction: number;
  };
}

const AnalyticsDashboard = () => {
  const analyticsData: AnalyticsData = {
    userGrowth: 23.5,
    driverGrowth: 18.2,
    bookingGrowth: 31.7,
    revenueGrowth: 28.9,
    topWilayas: [
      { name: "الجزائر", bookings: 342, revenue: 856000 },
      { name: "وهران", bookings: 289, revenue: 723000 },
      { name: "قسنطينة", bookings: 156, revenue: 390000 },
      { name: "سطيف", bookings: 134, revenue: 335000 },
      { name: "عنابة", bookings: 98, revenue: 245000 }
    ],
    monthlyStats: [
      { month: "يناير", users: 1250, bookings: 890, revenue: 2234000 },
      { month: "فبراير", users: 1456, bookings: 1023, revenue: 2567000 },
      { month: "مارس", users: 1678, bookings: 1234, revenue: 3098000 },
      { month: "أبريل", users: 1890, bookings: 1456, revenue: 3654000 }
    ],
    performanceMetrics: {
      averageRating: 4.8,
      completionRate: 94.5,
      responseTime: 3.2,
      customerSatisfaction: 96.8
    }
  };

  const GrowthIndicator = ({ value, isPositive = true }: { value: number; isPositive?: boolean }) => (
    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{isPositive ? '+' : ''}{value}%</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">التحليلات والإحصائيات</h2>
          <p className="text-muted-foreground">مراقبة أداء النظام والنمو</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">نمو المستخدمين</div>
                <GrowthIndicator value={analyticsData.userGrowth} />
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">نمو السائقين</div>
                <GrowthIndicator value={analyticsData.driverGrowth} />
              </div>
              <Car className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">نمو الحجوزات</div>
                <GrowthIndicator value={analyticsData.bookingGrowth} />
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">نمو الإيرادات</div>
                <GrowthIndicator value={analyticsData.revenueGrowth} />
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط التقييم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">{analyticsData.performanceMetrics.averageRating}</div>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-green-600 mt-1">ممتاز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">معدل الإكمال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.performanceMetrics.completionRate}%</div>
            <p className="text-xs text-green-600 mt-1">+2.1% من الشهر الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">وقت الاستجابة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.performanceMetrics.responseTime} دقيقة</div>
            <p className="text-xs text-green-600 mt-1">-0.5 دقيقة تحسن</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">رضا العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.performanceMetrics.customerSatisfaction}%</div>
            <p className="text-xs text-green-600 mt-1">+1.2% تحسن</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Wilayas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            الولايات الأكثر نشاطاً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {analyticsData.topWilayas.map((wilaya, index) => (
              <div key={wilaya.name} className="text-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
                <div className="text-lg font-bold text-primary">{wilaya.name}</div>
                <div className="text-sm text-muted-foreground mb-1">{wilaya.bookings} حجز</div>
                <div className="text-xs font-medium">{wilaya.revenue.toLocaleString()} دج</div>
                <Badge variant="outline" className="mt-2">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            الاتجاهات الشهرية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.monthlyStats.map((stat) => (
              <div key={stat.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{stat.month}</div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{stat.users}</div>
                    <div className="text-muted-foreground">مستخدم</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{stat.bookings}</div>
                    <div className="text-muted-foreground">حجز</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{stat.revenue.toLocaleString()} دج</div>
                    <div className="text-muted-foreground">إيرادات</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;