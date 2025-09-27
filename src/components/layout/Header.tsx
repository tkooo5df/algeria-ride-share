import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, Globe, User, LogOut, Settings, Bell, Check, Clock, Database, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useDatabase } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NotificationService } from "@/integrations/database/notificationService";
import { toast } from "@/hooks/use-toast";
import { getDisplayName } from "@/utils/displayName";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("ar");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { session, profile } = useAuth();
  const { user: localUser, signOut: localSignOut } = useLocalAuth();
  const { isLocal } = useDatabase();
  const navigate = useNavigate();
  
  // Use local user if using local database, otherwise use Supabase
  const currentUser = isLocal ? localUser : (session ? { ...profile, id: session.user.id } : null);
  const isAuthenticated = isLocal ? !!localUser : !!session;
  
  // Check for data persistence issues
  useEffect(() => {
    // Only show this warning to authenticated users
    if (isAuthenticated && !isLocal) {
      // Show a toast notification about potential data persistence issues
      toast({
        title: "مشكلة في حفظ البيانات؟",
        description: "إذا كانت بياناتك لا تُحفظ بشكل صحيح، تحقق من إعدادات قاعدة البيانات.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/database-settings')}
            className="ml-2"
          >
            إعدادات البيانات
          </Button>
        ),
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [isAuthenticated, isLocal, navigate]);
  
  const displayName = getDisplayName([
    currentUser,
    profile,
    session?.user?.user_metadata,
  ], {
    fallback: 'عضو',
    email: session?.user?.email ?? currentUser?.email ?? null,
  });

  const handleSignOut = async () => {
    try {
      if (isLocal) {
        localSignOut();
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
          return;
        }
      }
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Load notifications for authenticated users
  const loadNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const userNotifications = await NotificationService.getUserNotifications(currentUser.id, { limit: 10 });
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Load notifications on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUser]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('[data-notification-dropdown]')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Handle notification click - redirect to relevant dashboard section
  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }

      // Close notification dropdown
      setShowNotifications(false);

      // Navigate based on notification type and user role
      if (currentUser?.role === 'driver' && notification.type === 'booking_created') {
        // Navigate to driver dashboard bookings tab
        navigate('/user-dashboard?tab=bookings');
      } else if (currentUser?.role === 'passenger' && notification.type === 'booking_confirmed') {
        // Navigate to passenger dashboard bookings tab
        navigate('/user-dashboard?tab=bookings');
      } else if (currentUser?.role === 'admin') {
        // Navigate to admin dashboard
        navigate('/user-dashboard');
      } else {
        // Default navigation to user dashboard
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-DZ');
  };

  const languages = [
    { code: "ar", name: "العربية", flag: "🇩🇿" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DZ Taxi</h1>
              <p className="text-xs text-muted-foreground">Algeria</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "الرئيسية" : currentLang === "fr" ? "Accueil" : "Home"}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "حولنا" : currentLang === "fr" ? "À propos" : "About"}
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "اتصل بنا" : currentLang === "fr" ? "Contact" : "Contact"}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Notifications - Only show for authenticated users */}
            {isAuthenticated && (
              <div className="relative" data-notification-dropdown>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative gap-2"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-md shadow-lg w-80 z-50 max-h-96">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">الإشعارات</h3>
                        {unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {unreadCount} جديد
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <ScrollArea className="max-h-64">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          لا توجد إشعارات
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {notifications.map((notification: any) => (
                            <div 
                              key={notification.id} 
                              className={cn(
                                "p-3 hover:bg-accent/50 transition-colors cursor-pointer",
                                !notification.isRead && "bg-primary/5 border-r-2 border-r-primary"
                              )}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium truncate">{notification.title}</p>
                                    {!notification.isRead ? (
                                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                    ) : (
                                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatNotificationTime(notification.createdAt)}</span>
                                    {(notification.type === 'booking_created' || notification.type === 'booking_confirmed') && (
                                      <Badge variant="outline" className="text-xs ml-2">
                                        انقر للعرض
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-border">
                        <Link 
                          to="/user-dashboard" 
                          className="text-sm text-primary hover:underline"
                          onClick={() => setShowNotifications(false)}
                        >
                          عرض جميع الإشعارات
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{languages.find(l => l.code === currentLang)?.name}</span>
              </Button>
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-md last:rounded-b-md",
                      currentLang === lang.code && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative group">
                  <Button variant="ghost" className="gap-2 px-3">
                    <User className="h-4 w-4" />
                    <span className="text-sm">
                      {displayName}
                    </span>
                  </Button>
                  <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px] z-50">
                    <div className="p-2 border-b border-border">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser?.role === 'driver' ? 'سائق' :
                         currentUser?.role === 'passenger' ? 'راكب' :
                         currentUser?.role === 'admin' ? 'مدير' : 'عضو'}
                      </p>
                    </div>
                    <Link 
                      to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'} 
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Settings className="h-4 w-4 mr-2 inline" />
                      {currentUser?.role === 'admin' ? 'لوحة الإدارة' : 'لوحة التحكم'}
                    </Link>
                    {/* Add Database Settings menu item */}
                    <Link 
                      to="/database-settings" 
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Database className="h-4 w-4 mr-2 inline" />
                      إعدادات قاعدة البيانات
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/auth/signin">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {currentLang === "ar" ? "تسجيل الدخول" : currentLang === "fr" ? "Se connecter" : "Sign In"}
                    </Button>
                  </Link>
                  <Button 
                    variant="hero" 
                    size="sm"
                    onClick={() => {
                      navigate('/auth/signup');
                    }}
                  >
                    {currentLang === "ar" ? "إنشاء حساب" : currentLang === "fr" ? "S'inscrire" : "Sign Up"}
                  </Button>
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-primary/20 text-primary hover:bg-primary hover:text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {currentLang === "ar" ? "لوحة الإدارة" : currentLang === "fr" ? "Admin" : "Admin"}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {currentLang === "ar" ? "الرئيسية" : currentLang === "fr" ? "Accueil" : "Home"}
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {currentLang === "ar" ? "حولنا" : currentLang === "fr" ? "À propos" : "About"}
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {currentLang === "ar" ? "اتصل بنا" : currentLang === "fr" ? "Contact" : "Contact"}
              </Link>
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  {currentLang === "ar" ? "لوحة الإدارة" : currentLang === "fr" ? "Admin" : "Admin"}
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser?.role === 'driver' ? 'سائق' :
                         currentUser?.role === 'passenger' ? 'راكب' :
                         currentUser?.role === 'admin' ? 'مدير' : 'عضو'}
                      </p>
                    </div>
                    
                    {/* Mobile Notifications */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start relative"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/dashboard?tab=notifications');
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      الإشعارات
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                    
                    <Link 
                      to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'} 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        {currentUser?.role === 'admin' ? 'لوحة الإدارة' : 'لوحة التحكم'}
                      </Button>
                    </Link>
                    {/* Add Database Settings menu item for mobile */}
                    <Link 
                      to="/database-settings" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        إعدادات قاعدة البيانات
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "تسجيل الدخول" : currentLang === "fr" ? "Se connecter" : "Sign In"}
                      </Button>
                    </Link>
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/auth/signup');
                      }}
                    >
                      {currentLang === "ar" ? "إنشاء حساب" : currentLang === "fr" ? "S'inscrire" : "Sign Up"}
                    </Button>
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        {currentLang === "ar" ? "لوحة الإدارة" : currentLang === "fr" ? "Admin" : "Admin"}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;