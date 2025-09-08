import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const pickup = queryParams.get("pickup");
  const destination = queryParams.get("destination");
  const driverName = queryParams.get("driverName");
  const driverCar = queryParams.get("driverCar");

  const { user } = useAuth();
  const { toast } = useToast();
  const driverId = queryParams.get("driverId"); // Assuming driverId is passed as a query param

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to book a ride.", variant: "destructive" });
      return;
    }

    if (!pickup || !destination || !driverId) {
      toast({ title: "Error", description: "Missing booking information.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("bookings").insert([
      {
        pickup_location: pickup,
        destination_location: destination,
        passenger_id: user.id,
        driver_id: driverId,
      },
    ]);

    if (error) {
      toast({ title: "Error creating booking", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Booking confirmed!" });
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Confirm Your Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Ride Details</h3>
            <p>
              <strong>From:</strong> {pickup}
            </p>
            <p>
              <strong>To:</strong> {destination}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Driver Information</h3>
            <p>
              <strong>Driver:</strong> {driverName}
            </p>
            <p>
              <strong>Car:</strong> {driverCar}
            </p>
          </div>
          <Button
            onClick={handleConfirmBooking}
            className="w-full"
            size="lg"
          >
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;