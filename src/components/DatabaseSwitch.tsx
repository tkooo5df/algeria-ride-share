import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import { useDatabase, DatabaseType } from '@/hooks/useDatabase';
import { toast } from '@/hooks/use-toast';

const DatabaseSwitch = () => {
  const { databaseType, isInitialized, switchDatabase, isLocal, isSupabase } = useDatabase();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (type: DatabaseType) => {
    if (type === databaseType) return;

    setIsSwitching(true);
    try {
      switchDatabase(type);
      toast({
        title: "تم التبديل بنجاح",
        description: `تم التبديل إلى ${type === DatabaseType.LOCAL ? 'قاعدة البيانات المحلية' : 'Supabase'}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في التبديل",
        description: "حدث خطأ أثناء التبديل بين قواعد البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          إعدادات قاعدة البيانات
        </CardTitle>
        <CardDescription>
          اختر قاعدة البيانات التي تريد استخدامها لتطبيق DZ Taxi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Local Database Option */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">قاعدة البيانات المحلية (SQLite)</h3>
              <p className="text-sm text-muted-foreground">
                قاعدة بيانات محلية سريعة ومناسبة للتطوير والاختبار
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isLocal ? "default" : "secondary"}>
                  {isLocal ? "مفعلة" : "غير مفعلة"}
                </Badge>
                {isLocal && isInitialized && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    جاهزة
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleSwitch(DatabaseType.LOCAL)}
            disabled={isLocal || isSwitching}
            variant={isLocal ? "default" : "outline"}
          >
            {isLocal ? "مفعلة" : "تفعيل"}
          </Button>
        </div>

        {/* Supabase Database Option */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Server className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Supabase (PostgreSQL)</h3>
              <p className="text-sm text-muted-foreground">
                قاعدة بيانات سحابية متقدمة مع ميزات إضافية
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isSupabase ? "default" : "secondary"}>
                  {isSupabase ? "مفعلة" : "غير مفعلة"}
                </Badge>
                {isSupabase && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    جاهزة
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleSwitch(DatabaseType.SUPABASE)}
            disabled={isSupabase || isSwitching}
            variant={isSupabase ? "default" : "outline"}
          >
            {isSupabase ? "مفعلة" : "تفعيل"}
          </Button>
        </div>

        {/* Status Information */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {isInitialized ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <span>
              {isInitialized 
                ? `قاعدة البيانات ${isLocal ? 'المحلية' : 'Supabase'} جاهزة للاستخدام`
                : 'جاري تهيئة قاعدة البيانات...'
              }
            </span>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">مقارنة الميزات:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-600 mb-2">قاعدة البيانات المحلية</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• سريعة ومباشرة</li>
                <li>• لا تحتاج اتصال بالإنترنت</li>
                <li>• مناسبة للتطوير والاختبار</li>
                <li>• مجانية تماماً</li>
                <li>• بيانات محلية آمنة</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-green-600 mb-2">Supabase</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• قاعدة بيانات سحابية متقدمة</li>
                <li>• ميزات المصادقة المدمجة</li>
                <li>• دعم الوقت الفعلي</li>
                <li>• نسخ احتياطية تلقائية</li>
                <li>• قابلة للتوسع</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSwitch;
