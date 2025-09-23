import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, HardDrive, CheckCircle, AlertCircle, Info } from 'lucide-react';
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
        {/* Important Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800">ملاحظة مهمة</h4>
              <p className="text-sm text-blue-700">
                إذا لم تكن بياناتك تُحفظ بشكل صحيح، تأكد من أنك تستخدم قاعدة البيانات المحلية (SQLite) التي مناسبة للتطوير والاختبار.
              </p>
            </div>
          </div>
        </div>

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
                <li>• نسخ احتياطائية تلقائية</li>
                <li>• قابلة للتوسع</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Persistence Note */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800">حل مشكلة حفظ البيانات</h4>
              <p className="text-sm text-yellow-700">
                إذا كانت بياناتك (الحسابات، المركبات، الرحلات) لا تُحفظ بشكل صحيح، تأكد من استخدامك لـ "قاعدة البيانات المحلية". 
                هذه المشكلة قد تحدث إذا كنت تستخدم قاعدة بيانات Supabase دون إعدادها بشكل صحيح.
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                <li>الحسابات لا تُحفظ: تأكد من استخدام قاعدة البيانات المحلية</li>
                <li>المركبات لا تُعرض: تحقق من نوع قاعدة البيانات المستخدمة</li>
                <li>الرحلات لا تُنشئ: تأكد من تفعيل قاعدة البيانات المحلية</li>
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                انقر على "تفعيل" لقاعدة البيانات المحلية لحل هذه المشكلة.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">دليل استكشاف الأخطاء وإصلاحها</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div>
              <p className="font-medium">الخطوة 1: تحقق من نوع قاعدة البيانات</p>
              <p>تأكد من أن "قاعدة البيانات المحلية" مفعلة. إذا لم تكن مفعلة، انقر على زر "تفعيل".</p>
            </div>
            <div>
              <p className="font-medium">الخطوة 2: أعد تحميل الصفحة</p>
              <p>بعد تفعيل قاعدة البيانات المحلية، قم بتحديث الصفحة لتطبيق التغييرات.</p>
            </div>
            <div>
              <p className="font-medium">الخطوة 3: اختبر الحفظ</p>
              <p>حاول إنشاء حساب جديد أو إضافة مركبة أو رحلة للتحقق من أن البيانات تُحفظ الآن بشكل صحيح.</p>
            </div>
            <div>
              <p className="font-medium">الخطوة 4: إذا استمرت المشكلة</p>
              <p>إذا استمرت المشكلة بعد تفعيل قاعدة البيانات المحلية، ف попроб إعادة تعيين البيانات من خلال "إدارة قاعدة البيانات" في لوحة الإدارة.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSwitch;