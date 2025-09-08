import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  CreditCard, 
  Mail,
  Database,
  Zap,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  supportPhone: string;
  supportEmail: string;
  defaultLanguage: string;
  enableNotifications: boolean;
  enableSMS: boolean;
  enableEmail: boolean;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  driverApprovalRequired: boolean;
  minBookingPrice: number;
  maxBookingPrice: number;
  commissionRate: number;
  cancellationFee: number;
  paymentMethods: {
    cash: boolean;
    baridimob: boolean;
    creditCard: boolean;
  };
}

const SystemSettings = () => {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: "DZ Taxi",
    siteDescription: "أفضل خدمة نقل في الجزائر",
    supportPhone: "+213 555 123 456",
    supportEmail: "support@dztaxi.dz",
    defaultLanguage: "ar",
    enableNotifications: true,
    enableSMS: true,
    enableEmail: true,
    maintenanceMode: false,
    registrationEnabled: true,
    driverApprovalRequired: true,
    minBookingPrice: 500,
    maxBookingPrice: 10000,
    commissionRate: 10,
    cancellationFee: 200,
    paymentMethods: {
      cash: true,
      baridimob: true,
      creditCard: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePaymentMethodChange = (method: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: enabled
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Here you would typically save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setLastSaved(new Date());
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
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setConfig({
      siteName: "DZ Taxi",
      siteDescription: "أفضل خدمة نقل في الجزائر",
      supportPhone: "+213 555 123 456",
      supportEmail: "support@dztaxi.dz",
      defaultLanguage: "ar",
      enableNotifications: true,
      enableSMS: true,
      enableEmail: true,
      maintenanceMode: false,
      registrationEnabled: true,
      driverApprovalRequired: true,
      minBookingPrice: 500,
      maxBookingPrice: 10000,
      commissionRate: 10,
      cancellationFee: 200,
      paymentMethods: {
        cash: true,
        baridimob: true,
        creditCard: false
      }
    });
    
    toast({
      title: "تم إعادة التعيين",
      description: "تم إعادة تعيين الإعدادات للقيم الافتراضية",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إعدادات النظام</h2>
          <p className="text-muted-foreground">تكوين وإدارة إعدادات الموقع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            آخر حفظ: {lastSaved.toLocaleString('ar-DZ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              الإعدادات العامة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">اسم الموقع</Label>
              <Input
                id="siteName"
                value={config.siteName}
                onChange={(e) => handleConfigChange("siteName", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">وصف الموقع</Label>
              <Textarea
                id="siteDescription"
                value={config.siteDescription}
                onChange={(e) => handleConfigChange("siteDescription", e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportPhone">رقم الدعم</Label>
              <Input
                id="supportPhone"
                value={config.supportPhone}
                onChange={(e) => handleConfigChange("supportPhone", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportEmail">بريد الدعم</Label>
              <Input
                id="supportEmail"
                type="email"
                value={config.supportEmail}
                onChange={(e) => handleConfigChange("supportEmail", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
              <Select value={config.defaultLanguage} onValueChange={(value) => handleConfigChange("defaultLanguage", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-secondary" />
              إعدادات الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableNotifications">تفعيل الإشعارات</Label>
                <p className="text-sm text-muted-foreground">إشعارات عامة للنظام</p>
              </div>
              <Switch
                id="enableNotifications"
                checked={config.enableNotifications}
                onCheckedChange={(checked) => handleConfigChange("enableNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableSMS">إشعارات SMS</Label>
                <p className="text-sm text-muted-foreground">رسائل نصية للمستخدمين</p>
              </div>
              <Switch
                id="enableSMS"
                checked={config.enableSMS}
                onCheckedChange={(checked) => handleConfigChange("enableSMS", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmail">إشعارات البريد</Label>
                <p className="text-sm text-muted-foreground">رسائل بريد إلكتروني</p>
              </div>
              <Switch
                id="enableEmail"
                checked={config.enableEmail}
                onCheckedChange={(checked) => handleConfigChange("enableEmail", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              إعدادات الأمان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">وضع الصيانة</Label>
                <p className="text-sm text-muted-foreground">إيقاف الموقع مؤقتاً</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => handleConfigChange("maintenanceMode", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registrationEnabled">تفعيل التسجيل</Label>
                <p className="text-sm text-muted-foreground">السماح بتسجيل مستخدمين جدد</p>
              </div>
              <Switch
                id="registrationEnabled"
                checked={config.registrationEnabled}
                onCheckedChange={(checked) => handleConfigChange("registrationEnabled", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="driverApprovalRequired">موافقة السائقين</Label>
                <p className="text-sm text-muted-foreground">مراجعة طلبات السائقين</p>
              </div>
              <Switch
                id="driverApprovalRequired"
                checked={config.driverApprovalRequired}
                onCheckedChange={(checked) => handleConfigChange("driverApprovalRequired", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              إعدادات التسعير
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">الحد الأدنى للسعر (دج)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={config.minBookingPrice}
                  onChange={(e) => handleConfigChange("minBookingPrice", parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">الحد الأقصى للسعر (دج)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={config.maxBookingPrice}
                  onChange={(e) => handleConfigChange("maxBookingPrice", parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission">عمولة الموقع (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={config.commissionRate}
                  onChange={(e) => handleConfigChange("commissionRate", parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationFee">رسوم الإلغاء (دج)</Label>
                <Input
                  id="cancellationFee"
                  type="number"
                  value={config.cancellationFee}
                  onChange={(e) => handleConfigChange("cancellationFee", parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            طرق الدفع المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium">الدفع نقداً</div>
                  <div className="text-sm text-muted-foreground">دفع مباشر للسائق</div>
                </div>
              </div>
              <Switch
                checked={config.paymentMethods.cash}
                onCheckedChange={(checked) => handlePaymentMethodChange("cash", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium">بريدي موب</div>
                  <div className="text-sm text-muted-foreground">دفع إلكتروني</div>
                </div>
              </div>
              <Switch
                checked={config.paymentMethods.baridimob}
                onCheckedChange={(checked) => handlePaymentMethodChange("baridimob", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-medium">بطاقة ائتمان</div>
                  <div className="text-sm text-muted-foreground">قريباً</div>
                </div>
              </div>
              <Switch
                checked={config.paymentMethods.creditCard}
                onCheckedChange={(checked) => handlePaymentMethodChange("creditCard", checked)}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">قاعدة البيانات</div>
              <div className="text-sm text-green-600">متصلة</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">الخادم</div>
              <div className="text-sm text-green-600">يعمل بشكل طبيعي</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">البريد الإلكتروني</div>
              <div className="text-sm text-green-600">متصل</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-medium">النسخ الاحتياطي</div>
              <div className="text-sm text-yellow-600">قيد التشغيل</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup and Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>النسخ الاحتياطي والصيانة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">النسخ الاحتياطي</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  تحميل نسخة احتياطية
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  استعادة من نسخة احتياطية
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">صيانة النظام</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث النظام
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  تنظيف قاعدة البيانات
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;