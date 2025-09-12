import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  HardDrive, 
  Server, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Info,
  RefreshCw,
  Trash2,
  RotateCcw
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DatabaseSwitch from '@/components/DatabaseSwitch';
import { useDatabase } from '@/hooks/useDatabase';
import { BrowserDatabaseService } from '@/integrations/database/browserServices';
import { toast } from '@/hooks/use-toast';

const DatabaseSettings = () => {
  const { databaseType, isInitialized, isLocal, isSupabase } = useDatabase();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleResetData = async () => {
    if (!isLocal) {
      toast({
        title: "غير متاح",
        description: "إعادة تعيين البيانات متاحة فقط في الوضع المحلي",
        variant: "destructive"
      });
      return;
    }

    if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم حذف جميع الرحلات والحجوزات والمركبات وإعادة إنشاء البيانات التجريبية.')) {
      try {
        await BrowserDatabaseService.resetToDefaultData();
        toast({
          title: "تم إعادة تعيين البيانات",
          description: "تم حذف جميع البيانات وإعادة إنشاء البيانات التجريبية بنجاح",
        });
        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        console.error('Error resetting data:', error);
        toast({
          title: "خطأ في إعادة تعيين البيانات",
          description: "حدث خطأ أثناء إعادة تعيين البيانات",
          variant: "destructive"
        });
      }
    }
  };

  const handleClearData = async () => {
    if (!isLocal) {
      toast({
        title: "غير متاح",
        description: "حذف البيانات متاح فقط في الوضع المحلي",
        variant: "destructive"
      });
      return;
    }

    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ سيتم حذف جميع الرحلات والحجوزات والمركبات نهائياً.')) {
      try {
        await BrowserDatabaseService.clearAllData();
        toast({
          title: "تم حذف البيانات",
          description: "تم حذف جميع البيانات بنجاح",
        });
        // Refresh the page
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        toast({
          title: "خطأ في حذف البيانات",
          description: "حدث خطأ أثناء حذف البيانات",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleDemoSeeding = async (enable: boolean) => {
    if (!isLocal) {
      toast({
        title: "غير متاح",
        description: "هذا الخيار متاح فقط في الوضع المحلي",
        variant: "destructive"
      });
      return;
    }
    try {
      await BrowserDatabaseService.setSeedDemoData(enable);
      toast({
        title: enable ? "تم تفعيل البيانات التجريبية" : "تم تعطيل البيانات التجريبية",
        description: enable ? "سيتم إنشاء بيانات تجريبية عند إعادة التهيئة" : "لن يتم إنشاء بيانات تجريبية تلقائياً",
      });
    } catch (error) {
      console.error('Error toggling demo seeding:', error);
      toast({
        title: "خطأ",
        description: "تعذر تغيير حالة البيانات التجريبية",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">إعدادات قاعدة البيانات</h1>
          <p className="text-muted-foreground">
            إدارة وإعداد قاعدة البيانات لتطبيق DZ Taxi
          </p>
        </div>

        {/* Database Switch Component */}
        <DatabaseSwitch />

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              الحالة الحالية
            </CardTitle>
            <CardDescription>
              معلومات حول قاعدة البيانات المختارة وحالتها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isLocal ? (
                    <HardDrive className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Server className="h-6 w-6 text-green-600" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {isLocal ? 'قاعدة البيانات المحلية' : 'Supabase'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isLocal ? 'SQLite محلي' : 'PostgreSQL سحابي'}
                    </p>
                  </div>
                </div>
                <Badge variant={isInitialized ? "default" : "secondary"}>
                  {isInitialized ? "مفعلة" : "جاري التهيئة"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isInitialized ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  )}
                  <div>
                    <h3 className="font-semibold">حالة الاتصال</h3>
                    <p className="text-sm text-muted-foreground">
                      {isInitialized ? 'متصل' : 'جاري الاتصال'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Information */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">معلومات</TabsTrigger>
            <TabsTrigger value="features">الميزات</TabsTrigger>
            <TabsTrigger value="help">المساعدة</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  معلومات قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLocal ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">النوع:</span>
                      <span className="font-medium">SQLite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الموقع:</span>
                      <span className="font-medium">prisma/dev.db</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الحالة:</span>
                      <Badge variant="default">محلي</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">النسخ الاحتياطية:</span>
                      <span className="font-medium">يدوي</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">النوع:</span>
                      <span className="font-medium">PostgreSQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الموقع:</span>
                      <span className="font-medium">Supabase Cloud</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الحالة:</span>
                      <Badge variant="default">سحابي</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">النسخ الاحتياطية:</span>
                      <span className="font-medium">تلقائي</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Management */}
            {isLocal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    إدارة البيانات
                  </CardTitle>
                  <CardDescription>
                    إدارة البيانات المحلية وإعادة تعيينها
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">تنبيه مهم</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          البيانات الوهمية تحتوي على رحلات بتواريخ قديمة. يمكنك إعادة تعيين البيانات للحصول على رحلات بتواريخ مستقبلية.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">البيانات التجريبية:</span>
                    <Button size="sm" variant="secondary" onClick={() => handleToggleDemoSeeding(true)}>
                      تفعيل
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleDemoSeeding(false)}>
                      تعطيل
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleResetData}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      إعادة تعيين البيانات
                    </Button>
                    <Button 
                      onClick={handleClearData}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف جميع البيانات
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><strong>إعادة تعيين البيانات:</strong> يحذف جميع البيانات الحالية ويعيد إنشاء البيانات التجريبية بتواريخ مستقبلية.</p>
                    <p><strong>حذف جميع البيانات:</strong> يحذف جميع البيانات نهائياً دون إعادة إنشاء.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">قاعدة البيانات المحلية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">سريعة ومباشرة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">لا تحتاج اتصال بالإنترنت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">مناسبة للتطوير والاختبار</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">مجانية تماماً</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">بيانات محلية آمنة</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">قاعدة بيانات سحابية متقدمة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">ميزات المصادقة المدمجة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">دعم الوقت الفعلي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">نسخ احتياطية تلقائية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">قابلة للتوسع</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>أسئلة شائعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">كيف أختار قاعدة البيانات المناسبة؟</h4>
                  <p className="text-sm text-muted-foreground">
                    استخدم قاعدة البيانات المحلية للتطوير والاختبار، واستخدم Supabase للإنتاج والاستخدام الفعلي.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">هل يمكنني التبديل بين قواعد البيانات؟</h4>
                  <p className="text-sm text-muted-foreground">
                    نعم، يمكنك التبديل في أي وقت، لكن البيانات لن تنتقل تلقائياً بينهما.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">هل البيانات آمنة؟</h4>
                  <p className="text-sm text-muted-foreground">
                    نعم، قاعدة البيانات المحلية محفوظة محلياً، و Supabase يستخدم تشفير متقدم.
                  </p>
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

export default DatabaseSettings;
