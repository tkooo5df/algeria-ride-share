import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { BrowserDatabaseService } from "@/integrations/database/browserServices";
import { MapPin, Calendar, Clock, DollarSign, Users, Car, User, Filter, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { wilayas } from "@/data/wilayas";

const RideSearchResults = () => {
  const [searchParams] = useSearchParams();
  const pickup = searchParams.get("pickup");
  const destination = searchParams.get("destination");
  const searchDate = searchParams.get("date");
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLocal } = useDatabase();
  const { user } = useLocalAuth();

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [timeRange, setTimeRange] = useState<[string, string]>(["00:00", "23:59"]);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");

  // Helper function to get wilaya ID by name
  const getWilayaIdByName = (wilayaName: string) => {
    const wilaya = wilayas.find(w => w.name === wilayaName);
    return wilaya ? parseInt(wilaya.code) : null;
  };

  // Helper function to check if trip matches search criteria
  const matchesSearchCriteria = (trip: any, fromWilayaId: number | null, toWilayaId: number | null) => {
    if (!fromWilayaId || !toWilayaId) return true; // Show all if no search criteria
    
    return trip.fromWilayaId === fromWilayaId && trip.toWilayaId === toWilayaId;
  };

  // Apply filters to trips
  const applyFilters = () => {
    let result = [...trips];
    
    // Price filter
    result = result.filter(trip => 
      trip.pricePerSeat >= priceRange[0] && trip.pricePerSeat <= priceRange[1]
    );
    
    // Time filter
    result = result.filter(trip => {
      const tripTime = trip.departureTime;
      return tripTime >= timeRange[0] && tripTime <= timeRange[1];
    });
    
    // Vehicle type filter (if implemented)
    if (selectedVehicleType) {
      // This would require vehicle type data in the trip
      // result = result.filter(trip => trip.vehicle?.type === selectedVehicleType);
    }
    
    setFilteredTrips(result);
  };

  // Reset filters
  const resetFilters = () => {
    setPriceRange([0, 10000]);
    setTimeRange(["00:00", "23:59"]);
    setSelectedVehicleType("");
  };

  // Load trips from database
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true);
        const allTrips = await BrowserDatabaseService.getTrips();
        
        // Filter trips based on search criteria if provided
        // Exclude demo trips
        let filteredTrips = allTrips.filter((t: any) => !t.isDemo);
        if (pickup && destination) {
          const fromWilayaId = getWilayaIdByName(pickup);
          const toWilayaId = getWilayaIdByName(destination);
          
          // Filter trips that match the search criteria
          filteredTrips = allTrips.filter(trip => 
            matchesSearchCriteria(trip, fromWilayaId, toWilayaId)
          );
        }
        
        // Filter out past trips and only show future trips
        const today = new Date().toISOString().split('T')[0];
        filteredTrips = filteredTrips.filter(trip => 
          trip.departureDate >= today && trip.status === 'scheduled'
        );
        
        // Filter by search date if provided: include ONLY trips on the exact date
        if (searchDate) {
          filteredTrips = filteredTrips.filter(trip => 
            trip.departureDate === searchDate
          );
        }
        
        // Sort trips by departure date and time
        filteredTrips.sort((a, b) => {
          const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
          const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        // Get driver and vehicle info for each trip
        const tripsWithDetails = await Promise.all(
          filteredTrips.map(async (trip) => {
            const driver = await BrowserDatabaseService.getProfile(trip.driverId);
            const vehicle = await BrowserDatabaseService.getVehiclesByDriver(trip.driverId);
            return {
              ...trip,
              driver,
              vehicle: vehicle[0] || null,
              fromWilayaName: BrowserDatabaseService.getWilayaName(trip.fromWilayaId),
              toWilayaName: BrowserDatabaseService.getWilayaName(trip.toWilayaId),
            };
          })
        );
        
        setTrips(tripsWithDetails);
        setFilteredTrips(tripsWithDetails);
      } catch (error) {
        console.error('Error loading trips:', error);
        toast({
          title: "خطأ في تحميل الرحلات",
          description: "حدث خطأ أثناء تحميل الرحلات المتاحة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [pickup, destination]);

  // Apply filters when filter values change
  useEffect(() => {
    if (trips.length > 0) {
      applyFilters();
    }
  }, [trips, priceRange, timeRange, selectedVehicleType]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">أفضل العروض المتاحة</h1>
          {pickup && destination && (
            <p className="text-muted-foreground">
              من {pickup} إلى {destination}
              {searchDate && ` - ${searchDate}`}
              <span className="font-semibold"> - {filteredTrips.length} رحلة متاحة</span>
            </p>
          )}
          {!pickup && !destination && (
            <p className="text-muted-foreground">
              جميع الرحلات المتاحة
              {searchDate && ` - ${searchDate}`}
              <span className="font-semibold"> - {filteredTrips.length} رحلة</span>
            </p>
          )}
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية النتائج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>السعر (دج)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="من" 
                    value={priceRange[0]} 
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="h-9"
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="إلى" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                    className="h-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>الوقت</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="time" 
                    value={timeRange[0]} 
                    onChange={(e) => setTimeRange([e.target.value, timeRange[1]])}
                    className="h-9"
                  />
                  <span>-</span>
                  <Input 
                    type="time" 
                    value={timeRange[1]} 
                    onChange={(e) => setTimeRange([timeRange[0], e.target.value])}
                    className="h-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>نوع المركبة</Label>
                <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">الكل</SelectItem>
                    <SelectItem value="car">سيارة</SelectItem>
                    <SelectItem value="van"> VAN</SelectItem>
                    <SelectItem value="bus">حافلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="h-9">
                  <X className="h-4 w-4 ml-2" />
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-8">
            <p>جاري تحميل الرحلات...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {pickup && destination ? 'لا توجد رحلات متطابقة' : 'لا توجد رحلات متاحة'}
              </h3>
              <p className="text-yellow-700 mb-4">
                {pickup && destination 
                  ? `لم نجد رحلات من ${pickup} إلى ${destination} في التواريخ القادمة`
                  : 'لا توجد رحلات مجدولة حالياً'
                }
              </p>
              <div className="space-y-2">
                <p className="text-sm text-yellow-600">
                  💡 نصائح للبحث:
                </p>
                <ul className="text-sm text-yellow-600 text-right">
                  <li>• جرب البحث عن رحلات من وإلى ولايات مختلفة</li>
                  <li>• تحقق من التواريخ المتاحة</li>
                  <li>• تأكد من أن السائقين قد نشروا رحلاتهم</li>
                </ul>
              </div>
            </div>
            <div className="space-x-4">
              <Button asChild>
                <Link to="/">البحث مرة أخرى</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">لوحة التحكم</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      {trip.driver?.fullName || 'سائق غير معروف'}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {trip.status === 'scheduled' ? 'مجدولة' : trip.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Route */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {trip.fromWilayaName} → {trip.toWilayaName}
                    </span>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{trip.departureDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{trip.departureTime}</span>
                  </div>

                  {/* Vehicle Info */}
                  {trip.vehicle && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.year})
                      </span>
                    </div>
                  )}

                  {/* Price and Seats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600 text-lg">
                        {trip.pricePerSeat} دج
                      </span>
                      <span className="text-sm text-muted-foreground">للمقعد</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {trip.availableSeats}/{trip.totalSeats} مقاعد متاحة
                      </span>
                    </div>
                  </div>
                  
                  {/* Total Price (equals price per seat unless كمية مقاعد محددة) */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">السعر الإجمالي:</span>
                      <span className="font-bold text-lg text-primary">
                        {trip.pricePerSeat * 1} دج
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {trip.description && (
                    <p className="text-sm text-muted-foreground">{trip.description}</p>
                  )}

                  {/* Book Button */}
                  {trip.availableSeats === 0 ? (
                    <Button 
                      className="w-full mt-4" 
                      variant="secondary" 
                      disabled
                    >
                      <Users className="h-4 w-4 mr-2" />
                      مكتمل - لا توجد مقاعد متاحة
                    </Button>
                  ) : trip.status !== 'scheduled' ? (
                    <Button 
                      className="w-full mt-4" 
                      variant="secondary" 
                      disabled
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      غير متاح حالياً
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      className="w-full mt-4 bg-primary hover:bg-primary/90"
                    >
                      <Link 
                        to={`/booking-confirmation?tripId=${trip.id}&pickup=${pickup}&destination=${destination}&driverName=${trip.driver?.fullName}&driverCar=${trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'غير محدد'}&driverId=${trip.driverId}&price=${trip.pricePerSeat}`}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        احجز الآن - {trip.pricePerSeat} دج
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Trip Button for Drivers */}
        {user && user.role === 'driver' && (
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/dashboard">أنشئ رحلة جديدة</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RideSearchResults;