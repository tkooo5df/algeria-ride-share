import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { BrowserDatabaseService } from "@/integrations/database/browserServices";
import { MapPin, Calendar, Clock, DollarSign, Users, Car, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { wilayas } from "@/data/wilayas";

const RideSearchResults = () => {
  const [searchParams] = useSearchParams();
  const pickup = searchParams.get("pickup");
  const destination = searchParams.get("destination");
  const searchDate = searchParams.get("date");
  const searchTime = searchParams.get("time");
  const passengersParam = searchParams.get("passengers");
  const passengers = passengersParam ? parseInt(passengersParam, 10) : undefined;
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLocal } = useDatabase();
  const { user } = useLocalAuth();

  // Helper: get wilaya ID from name or code string (e.g., "09")
  const getWilayaId = (value: string) => {
    if (!value) return null;
    // If value looks like a 2-digit code, match by code
    const codeLike = /^\d{2}$/.test(value) ? value : null;
    const wilaya = codeLike
      ? wilayas.find(w => w.code === value)
      : wilayas.find(w => w.name === value);
    return wilaya ? parseInt(wilaya.code, 10) : null;
  };

  // Helper function to check if trip matches search criteria
  const matchesSearchCriteria = (trip: any, fromWilayaId: number | null, toWilayaId: number | null) => {
    if (!fromWilayaId || !toWilayaId) return true; // Show all if no search criteria
    
    return trip.fromWilayaId === fromWilayaId && trip.toWilayaId === toWilayaId;
  };

  // Load trips from database
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true);
        const allTrips = await BrowserDatabaseService.getTrips();
        
        // Filter trips based on search criteria if provided
        let filteredTrips = allTrips;
        // Exclude demo/seeded trips explicitly
        filteredTrips = filteredTrips.filter((t: any) => !t.isDemo);
        if (pickup && destination) {
          const fromWilayaId = getWilayaId(pickup);
          const toWilayaId = getWilayaId(destination);
          // Filter trips that match the search criteria (continue chaining on filteredTrips)
          filteredTrips = filteredTrips.filter(trip =>
            matchesSearchCriteria(trip, fromWilayaId, toWilayaId)
          );
        }
        
        // Filter out past trips and only show future trips
        const today = new Date().toISOString().split('T')[0];
        filteredTrips = filteredTrips.filter(trip => 
          trip.departureDate >= today && trip.status === 'scheduled'
        );
        
        // Filter by search date if provided
        if (searchDate) {
          filteredTrips = filteredTrips.filter(trip => trip.departureDate === searchDate);
        }

        // Filter by passengers if provided
        if (typeof passengers === 'number' && !isNaN(passengers)) {
          filteredTrips = filteredTrips.filter(trip => (trip.availableSeats ?? 0) >= passengers);
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
  }, [pickup, destination, searchDate, searchTime, passengersParam]);

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
              <span className="font-semibold"> - {trips.length} رحلة متاحة</span>
            </p>
          )}
          {!pickup && !destination && (
            <p className="text-muted-foreground">
              جميع الرحلات المتاحة
              {searchDate && ` - ${searchDate}`}
              <span className="font-semibold"> - {trips.length} رحلة</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>جاري تحميل الرحلات...</p>
          </div>
        ) : trips.length === 0 ? (
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
            {trips.map((trip) => (
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
                  
                  {/* Total Price */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">السعر الإجمالي:</span>
                      <span className="font-bold text-lg text-primary">
                        {trip.pricePerSeat * trip.totalSeats} دج
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