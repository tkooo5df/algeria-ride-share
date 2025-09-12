import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { NotificationService, NotificationType } from '@/integrations/database/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0, recent: 0 });

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const [notificationsData, statsData] = await Promise.all([
        NotificationService.getUserNotifications(user.id),
        NotificationService.getNotificationStats(user.id)
      ]);

      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الإشعارات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
      
      toast({
        title: "تم التحديث",
        description: "تم تمييز الإشعار كمقروء",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الإشعار",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => NotificationService.markAsRead(n.id)));
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      
      toast({
        title: "تم التحديث",
        description: "تم تمييز جميع الإشعارات كمقروءة",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الإشعارات",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'booking_confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'booking_cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      case 'trip_created':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'welcome':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationPriority = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'booking_confirmed':
        return 'high';
      case 'booking_cancelled':
        return 'medium';
      case 'trip_created':
        return 'low';
      default:
        return 'low';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'الآن';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return 'أمس';
    return date.toLocaleDateString('ar-DZ');
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const recentNotifications = notifications.filter(n => {
    const notificationDate = new Date(n.createdAt);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notificationDate > oneDayAgo;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="mr-2">جاري تحميل الإشعارات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              مركز الإشعارات
            </CardTitle>
            <CardDescription>
              إدارة وإشعارات النظام
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                تمييز الكل كمقروء
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">إجمالي</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
            <div className="text-sm text-muted-foreground">غير مقروء</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
            <div className="text-sm text-muted-foreground">حديث</div>
          </div>
        </div>

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              الكل ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              غير مقروء ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="recent">
              حديث ({recentNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-foreground'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${!notification.isRead ? 'text-blue-700' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.createdAt)}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    getNotificationPriority(notification.type) === 'high' 
                                      ? 'border-red-200 text-red-700' 
                                      : 'border-gray-200 text-gray-700'
                                  }`}
                                >
                                  {notification.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="space-y-2">
            <ScrollArea className="h-96">
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>جميع الإشعارات مقروءة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border rounded-lg bg-blue-50 border-blue-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm mt-1 text-blue-700">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="space-y-2">
            <ScrollArea className="h-96">
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد إشعارات حديثة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-foreground'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${!notification.isRead ? 'text-blue-700' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
