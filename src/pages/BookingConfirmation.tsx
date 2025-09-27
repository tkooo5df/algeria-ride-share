import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NotificationService, NotificationType } from "@/integrations/database/notificationService";
import { useAuth } from "@/hooks/useAuth";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useDatabase } from "@/hooks/useDatabase";
import { BrowserDatabaseService } from "@/integrations/database/browserServices";
import { useToast } from "@/hooks/use-toast";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const pickup = queryParams.get("pickup");
  const destination = queryParams.get("destination");
  const driverName = queryParams.get("driverName");
  const driverCar = queryParams.get("driverCar");

  const { user: supabaseUser } = useAuth();
  const { user: localUser } = useLocalAuth();
  const { isLocal } = useDatabase();
  
  // Use local user if using local database, otherwise use Supabase user
  const user = isLocal ? localUser : supabaseUser;
  const { toast } = useToast();
  const driverId = queryParams.get("driverId"); // Assuming driverId is passed as a query param

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to book a ride.", variant: "destructive" });
      return;
    }

    if (!pickup || !destination || !driverId) {
      toast({ title: "Error", description: "Missing booking information.", variant: "destructive" });
      return;
    }

    if (!firstName || !lastName || !age || !phone) {
      toast({ title: "Error", description: "Please fill all passenger details.", variant: "destructive" });
      return;
    }

    try {
      // Create booking using the appropriate database service
      let bookingData;
      if (isLocal) {
        // Use local database service
        bookingData = await BrowserDatabaseService.createBooking({
          pickupLocation: pickup,
          destinationLocation: destination,
          passengerId: user.id,
          driverId: driverId,
          tripId: queryParams.get("tripId") || "",
          seatsBooked: 1,
          totalAmount: parseInt(queryParams.get("price") || "0"),
          paymentMethod: 'cod' as 'cod' | 'bpm',
          notes: `Passenger: ${firstName} ${lastName}, Age: ${age}, Phone: ${phone}`,
          status: 'pending',
          pickupTime: new Date().toISOString()
        });
      } else {
        // Use Supabase (if needed)
        const { data: bookingInserted, error } = await supabase.from("bookings").insert([
          {
            pickup_location: pickup,
            destination_location: destination,
            passenger_id: user.id,
            driver_id: driverId,
            passenger_first_name: firstName,
            passenger_last_name: lastName,
            passenger_age: parseInt(age),
            passenger_phone: phone,
          },
        ]).select().single();
        
        if (error) throw error;
        bookingData = bookingInserted;
      }

      // Send notifications to driver and admins
      try {
        await NotificationService.notifyBookingCreated({
          bookingId: bookingData?.id || 0,
          passengerId: user.id,
          driverId: driverId,
          tripId: queryParams.get("tripId") || "",
          pickupLocation: pickup,
          destinationLocation: destination,
          seatsBooked: 1,
          totalAmount: parseInt(queryParams.get("price") || "0"),
          paymentMethod: 'cod' as 'cod' | 'bpm',
        });
      } catch (e) {
        console.error('Error sending notifications:', e);
      }
      
      toast({ title: "Success", description: "Booking confirmed!" });
      navigate(`/booking-success?bookingId=${bookingData?.id}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({ title: "Error creating booking", description: error.message || "An error occurred", variant: "destructive" });
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
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Passenger Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter last name" required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter age" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +213 555 123 456" required />
              </div>
            </div>
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