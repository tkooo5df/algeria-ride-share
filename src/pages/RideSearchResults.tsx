import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useSearchParams, Link } from "react-router-dom";

const RideSearchResults = () => {
  const [searchParams] = useSearchParams();
  const pickup = searchParams.get("pickup");
  const destination = searchParams.get("destination");

  // Placeholder data
  const availableRides = [
    { id: 1, driver: "Ahmed", car: "Toyota Yaris", price: "1500 DA", time: "5 mins away" },
    { id: 2, driver: "Fatima", car: "Hyundai i20", price: "1600 DA", time: "8 mins away" },
    { id: 3, driver: "Karim", car: "Renault Clio", price: "1450 DA", time: "10 mins away" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          الرحلات المتاحة من {pickup} الى {destination}
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableRides.map((ride) => (
            <Card key={ride.id}>
              <CardHeader>
                <CardTitle>{ride.driver}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>السيارة:</strong> {ride.car}</p>
                <p><strong>السعر:</strong> {ride.price}</p>
                <p><strong>الوقت المقدر للوصول:</strong> {ride.time}</p>
                <Button asChild className="w-full mt-4">
                  <Link to={`/booking-confirmation?pickup=${pickup}&destination=${destination}&driverName=${ride.driver}&driverCar=${ride.car}&driverId=${ride.id}`}>احجز الآن</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RideSearchResults;