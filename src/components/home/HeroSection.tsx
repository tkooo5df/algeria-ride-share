import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Search, ArrowUpDown, Users, Sparkles, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-taxi.jpg";
import { wilayas, popularWilayas } from "@/data/wilayas";

const HeroSection = () => {
  const [searchForm, setSearchForm] = useState({
    fromWilaya: "",
    fromCommune: "",
    toWilaya: "",
    toCommune: "",
    date: "",
    time: "",
    passengers: "1",
    specialRequests: ""
  });

  // Always keep date updated to today (default like booking platforms)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSearchForm(prev => ({ ...prev, date: today }));
  }, []);

  const swapLocations = () => {
    setSearchForm(prev => ({
      ...prev,
      fromWilaya: prev.toWilaya,
      fromCommune: prev.toCommune,
      toWilaya: prev.fromWilaya,
      toCommune: prev.fromCommune
    }));
  };

  const handleSearch = () => {
    if (searchForm.fromWilaya && searchForm.toWilaya) {
      // Get wilaya names from codes
      const fromWilayaName = wilayas.find(w => w.code === searchForm.fromWilaya)?.name || searchForm.fromWilaya;
      const toWilayaName = wilayas.find(w => w.code === searchForm.toWilaya)?.name || searchForm.toWilaya;
      
      const dateToUse = searchForm.date && searchForm.date.length === 10
        ? searchForm.date
        : new Date().toISOString().split('T')[0];
        
      const searchParams = new URLSearchParams({
        pickup: fromWilayaName,
        destination: toWilayaName,
        date: dateToUse,
        passengers: searchForm.passengers
      } as any);
      window.location.href = `/ride-search?${searchParams.toString()}`;
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="DZ Taxi - Algeria Taxi Service"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-white space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
                <span className="text-secondary font-medium">DZ Taxi Premium</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  أسهل طريقة
                </span>
                <span className="block bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent">
                  للسفر في الجزائر
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                احجز رحلتك بسهولة واسفر بأمان عبر جميع الولايات الجزائرية
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <span>جميع الولايات متاحة</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="h-5 w-5 text-secondary" />
                  <span>رحلات يومية</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Search className="h-5 w-5 text-secondary" />
                  <span>حجز فوري</span>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <Card className="p-8 bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-2xl">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      ابحث عن رحلتك
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    اختر وجهتك وموعد السفر للحصول على أفضل العروض
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Location Selection */}
                  <div className="relative">
                    <div className="grid grid-cols-1 gap-4">
                      {/* From Section */}
                      <div className="relative">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">من - نقطة الانطلاق</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Select value={searchForm.fromWilaya} onValueChange={(value) => 
                            setSearchForm(prev => ({ ...prev, fromWilaya: value }))
                          }>
                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-primary/50 focus:border-primary transition-colors rounded-xl">
                              <SelectValue placeholder="اختر الولاية" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <div className="p-2">
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">الولايات الشائعة</div>
                                {wilayas.filter(w => popularWilayas.includes(w.code)).map((wilaya) => (
                                  <SelectItem key={`popular-${wilaya.code}`} value={wilaya.code} className="rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                      <span>{wilaya.code} - {wilaya.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                                <div className="border-t my-2"></div>
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">جميع الولايات</div>
                                {wilayas.map((wilaya) => (
                                  <SelectItem key={wilaya.code} value={wilaya.code} className="rounded-lg">
                                    {wilaya.code} - {wilaya.name}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                          <Select value={searchForm.fromCommune} onValueChange={(value) => 
                            setSearchForm(prev => ({ ...prev, fromCommune: value }))
                          }>
                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-primary/50 focus:border-primary transition-colors rounded-xl">
                              <SelectValue placeholder="اختر البلدية" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">وسط المدينة</SelectItem>
                              <SelectItem value="east">شرق المدينة</SelectItem>
                              <SelectItem value="west">غرب المدينة</SelectItem>
                              <SelectItem value="north">شمال المدينة</SelectItem>
                              <SelectItem value="south">جنوب المدينة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Swap Button */}
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={swapLocations}
                          className="rounded-full border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* To Section */}
                      <div className="relative">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">إلى - الوجهة</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Select value={searchForm.toWilaya} onValueChange={(value) => 
                            setSearchForm(prev => ({ ...prev, toWilaya: value }))
                          }>
                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-primary/50 focus:border-primary transition-colors rounded-xl">
                              <SelectValue placeholder="اختر الولاية" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <div className="p-2">
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">الولايات الشائعة</div>
                                {wilayas.filter(w => popularWilayas.includes(w.code)).map((wilaya) => (
                                  <SelectItem key={`popular-to-${wilaya.code}`} value={wilaya.code} className="rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                      <span>{wilaya.code} - {wilaya.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                                <div className="border-t my-2"></div>
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">جميع الولايات</div>
                                {wilayas.map((wilaya) => (
                                  <SelectItem key={`to-${wilaya.code}`} value={wilaya.code} className="rounded-lg">
                                    {wilaya.code} - {wilaya.name}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                          <Select value={searchForm.toCommune} onValueChange={(value) => 
                            setSearchForm(prev => ({ ...prev, toCommune: value }))
                          }>
                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-primary/50 focus:border-primary transition-colors rounded-xl">
                              <SelectValue placeholder="اختر البلدية" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">وسط المدينة</SelectItem>
                              <SelectItem value="east">شرق المدينة</SelectItem>
                              <SelectItem value="west">غرب المدينة</SelectItem>
                              <SelectItem value="north">شمال المدينة</SelectItem>
                              <SelectItem value="south">جنوب المدينة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date and Passengers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">التاريخ</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={searchForm.date}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                          className="h-12 border-2 border-gray-200 hover:border-primary/50 focus:border-primary transition-colors rounded-xl pl-12"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer" onClick={() => (document.querySelector('input[type="date"]') as HTMLInputElement)?.focus()} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">عدد الركاب</Label>
                      <div className="relative">
                        <Select value={searchForm.passengers} onValueChange={(value) => 
                          setSearchForm(prev => ({ ...prev, passengers: value }))
                        }>
                          <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-primary/50 focus:border-primary transition-colors rounded-xl pl-12">
                            <SelectValue placeholder="اختر العدد" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 راكب</SelectItem>
                            <SelectItem value="2">2 راكب</SelectItem>
                            <SelectItem value="3">3 راكب</SelectItem>
                            <SelectItem value="4">4 راكب</SelectItem>
                            <SelectItem value="5">5 راكب</SelectItem>
                            <SelectItem value="6">6 راكب</SelectItem>
                            <SelectItem value="7">7 راكب</SelectItem>
                            <SelectItem value="8">8 راكب</SelectItem>
                          </SelectContent>
                        </Select>
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full text-lg h-14 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    onClick={handleSearch}
                  >
                    <Search className="h-6 w-6 mr-3" />
                    ابحث عن أفضل العروض
                    <Sparkles className="h-5 w-5 ml-3 animate-pulse" />
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">48</div>
                    <div className="text-xs text-muted-foreground">ولاية</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">500+</div>
                    <div className="text-xs text-muted-foreground">سائق</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">24/7</div>
                    <div className="text-xs text-muted-foreground">خدمة</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;