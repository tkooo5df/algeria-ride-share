import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, Globe, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("ar");
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      navigate("/");
    }
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
            <Link to="/database-settings" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "إعدادات قاعدة البيانات" : currentLang === "fr" ? "Paramètres DB" : "DB Settings"}
            </Link>
            <Link to="/demo-data" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "البيانات التجريبية" : currentLang === "fr" ? "Données Demo" : "Demo Data"}
            </Link>
            <Link to="/notification-demo" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "عرض الإشعارات" : currentLang === "fr" ? "Demo Notifications" : "Notification Demo"}
            </Link>
            <Link to="/booking-flow-demo" className="text-foreground hover:text-primary transition-colors">
              {currentLang === "ar" ? "تدفق الحجز" : currentLang === "fr" ? "Flux Réservation" : "Booking Flow"}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
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
              {session ? (
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px]">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      Sign Out
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
                  {profile?.role === 'admin' && (
                    <>
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                      <Link to="/driver-demo" className="text-foreground hover:text-primary transition-colors">
                        {currentLang === "ar" ? "تجربة السائق" : currentLang === "fr" ? "Demo Conducteur" : "Driver Demo"}
                      </Link>
                    </>
                  )}
                  <Button 
                    variant="hero" 
                    size="sm"
                    onClick={() => {
                      window.location.href = '/auth/signup';
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
              {profile?.role === 'admin' && (
                <>
                  <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
                    {currentLang === "ar" ? "لوحة الإدارة" : currentLang === "fr" ? "Admin" : "Admin"}
                  </Link>
                  <Link 
                    to="/driver-demo" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {currentLang === "ar" ? "تجربة السائق" : currentLang === "fr" ? "Demo Conducteur" : "Driver Demo"}
                  </Link>
                </>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {session ? (
                  <>
                    <Link to={profile?.role === 'driver' ? "/driver/dashboard" : "/passenger/dashboard"} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
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
                      Sign Out
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
                        window.location.href = '/auth/signup';
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