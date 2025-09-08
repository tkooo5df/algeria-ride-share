import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import heroImage from "@/assets/hero-taxi.jpg";

const HeroSection = () => {
  const [searchForm, setSearchForm] = useState({
    fromWilaya: "",
    fromCommune: "",
    toWilaya: "",
    toCommune: "",
    date: "",
    time: "",
  });

  // Sample wilayas (will be from database later)
  const wilayas = [
    { code: "01", name: "أدرار", nameEn: "Adrar", nameFr: "Adrar" },
    { code: "16", name: "الجزائر", nameEn: "Algiers", nameFr: "Alger" },
    { code: "31", name: "وهران", nameEn: "Oran", nameFr: "Oran" },
    { code: "25", name: "قسنطينة", nameEn: "Constantine", nameFr: "Constantine" },
  ];

  const handleSearch = () => {
    console.log("Search form:", searchForm);
    // Will navigate to search results
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block">أسهل طريقة</span>
                <span className="block text-secondary">للسفر في الجزائر</span>
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
            <Card className="p-6 bg-white/95 backdrop-blur shadow-2xl border-0">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    ابحث عن رحلتك
                  </h2>
                  <p className="text-muted-foreground">
                    اختر وجهتك وموعد السفر
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* From Section */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fromWilaya" className="text-right">من - الولاية</Label>
                      <Select value={searchForm.fromWilaya} onValueChange={(value) => 
                        setSearchForm(prev => ({ ...prev, fromWilaya: value }))
                      }>
                        <SelectTrigger id="fromWilaya" dir="rtl">
                          <SelectValue placeholder="اختر الولاية" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.code} value={wilaya.code}>
                              {wilaya.code} - {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromCommune" className="text-right">البلدية</Label>
                      <Select value={searchForm.fromCommune} onValueChange={(value) => 
                        setSearchForm(prev => ({ ...prev, fromCommune: value }))
                      }>
                        <SelectTrigger id="fromCommune" dir="rtl">
                          <SelectValue placeholder="اختر البلدية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">وسط المدينة</SelectItem>
                          <SelectItem value="east">شرق المدينة</SelectItem>
                          <SelectItem value="west">غرب المدينة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* To Section */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="toWilaya" className="text-right">إلى - الولاية</Label>
                      <Select value={searchForm.toWilaya} onValueChange={(value) => 
                        setSearchForm(prev => ({ ...prev, toWilaya: value }))
                      }>
                        <SelectTrigger id="toWilaya" dir="rtl">
                          <SelectValue placeholder="اختر الولاية" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.code} value={wilaya.code}>
                              {wilaya.code} - {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toCommune" className="text-right">البلدية</Label>
                      <Select value={searchForm.toCommune} onValueChange={(value) => 
                        setSearchForm(prev => ({ ...prev, toCommune: value }))
                      }>
                        <SelectTrigger id="toCommune" dir="rtl">
                          <SelectValue placeholder="اختر البلدية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">وسط المدينة</SelectItem>
                          <SelectItem value="east">شرق المدينة</SelectItem>
                          <SelectItem value="west">غرب المدينة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-right">التاريخ</Label>
                      <div className="relative">
                        <Input
                          id="date"
                          type="date"
                          value={searchForm.date}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                          className="text-right"
                          dir="rtl"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-right">الوقت</Label>
                      <div className="relative">
                        <Input
                          id="time"
                          type="time"
                          value={searchForm.time}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, time: e.target.value }))}
                          className="text-right"
                          dir="rtl"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full text-lg mt-6"
                    onClick={handleSearch}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    ابحث الآن
                  </Button>
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