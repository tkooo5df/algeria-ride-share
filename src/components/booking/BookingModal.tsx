import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { BrowserDatabaseService } from '@/integrations/database/browserServices';
import { NotificationService } from '@/integrations/database/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useDatabase } from '@/hooks/useDatabase';
import { Clock, MapPin, Users, DollarSign, Car, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal = ({ trip, isOpen, onClose, onSuccess }: BookingModalProps) => {
  const { user: supabaseUser } = useAuth();
  const { user: localUser } = useLocalAuth();
  const { isLocal } = useDatabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Use local user if using local database, otherwise use Supabase user
  const user = isLocal ? localUser : supabaseUser;
  const [bookingForm, setBookingForm] = useState({
    pickupLocation: '',
    destinationLocation: '',
    seatsBooked: '1',
    paymentMethod: 'cod',
    notes: '',
    pickupTime: trip.departureTime,
    specialRequests: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const seatsCount = parseInt(bookingForm.seatsBooked);
      const totalAmount = seatsCount * trip.pricePerSeat;

      // Check if enough seats are available
      if (seatsCount > trip.availableSeats) {
        throw new Error(`المقاعد المتاحة فقط ${trip.availableSeats}`);
      }

      // Create the booking
      const booking = await BrowserDatabaseService.createBooking({
        passengerId: user.id,
        driverId: trip.driverId,
        tripId: trip.id,
        pickupLocation: bookingForm.pickupLocation,
        destinationLocation: bookingForm.destinationLocation,
        seatsBooked: seatsCount,
        totalAmount,
        paymentMethod: bookingForm.paymentMethod as 'cod' | 'bpm',
        notes: bookingForm.notes,
        pickupTime: bookingForm.pickupTime,
        specialRequests: bookingForm.specialRequests,
        status: 'pending'
      });

      // Send notifications to all parties
      await NotificationService.notifyBookingCreated({
        bookingId: Number(booking.id),
        passengerId: user.id,
        driverId: trip.driverId,
        tripId: trip.id,
        pickupLocation: bookingForm.pickupLocation,
        destinationLocation: bookingForm.destinationLocation,
        seatsBooked: seatsCount,
        totalAmount,
        paymentMethod: bookingForm.paymentMethod
      });

      toast({
        title: "تم إرسال طلب الحجز بنجاح",
        description: "سيتم إشعارك عند موافقة السائق على الحجز",
      });

      onSuccess();
      onClose();
      
      // Navigate to success page
      navigate(`/booking-success?bookingId=${booking.id}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "خطأ في إرسال الحجز",
        description: error.message || "حدث خطأ أثناء إرسال طلب الحجز",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">حجز مقعد في الرحلة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Details */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-lg font-medium mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{trip.fromWilayaName}</span>
              <span className="text-muted-foreground">←</span>
              <span>{trip.toWilayaName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{trip.departureDate} في {trip.departureTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{trip.pricePerSeat} دج للمقعد</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{trip.availableSeats} مقعد متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>{trip.vehicle?.make} {trip.vehicle?.model}</span>
              </div>
            </div>
            {trip.driver && (
              <div className="mt-3 pt-3 border-t border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>السائق: {trip.driver.fullName}</span>
                  <Phone className="h-4 w-4 text-muted-foreground ml-2" />
                  <span>{trip.driver.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">نقطة الانطلاق *</Label>
                <Input
                  id="pickup"
                  value={bookingForm.pickupLocation}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  placeholder="أدخل موقع الانطلاق"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">نقطة الوصول *</Label>
                <Input
                  id="destination"
                  value={bookingForm.destinationLocation}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, destinationLocation: e.target.value }))}
                  placeholder="أدخل موقع الوصول"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">عدد المقاعد *</Label>
                <Select 
                  value={bookingForm.seatsBooked} 
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, seatsBooked: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عدد المقاعد" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(trip.availableSeats, 4) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} {i === 0 ? 'مقعد' : 'مقاعد'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment">طريقة الدفع *</Label>
                <Select 
                  value={bookingForm.paymentMethod} 
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">نقداً عند الوصول</SelectItem>
                    <SelectItem value="bpm">بريدي موب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup-time">وقت الانطلاق المفضل</Label>
              <Input
                id="pickup-time"
                type="time"
                value={bookingForm.pickupTime}
                onChange={(e) => setBookingForm(prev => ({ ...prev, pickupTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-requests">طلبات خاصة</Label>
              <Textarea
                id="special-requests"
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="أي طلبات خاصة للرحلة (اختياري)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أي ملاحظات أخرى (اختياري)"
                rows={2}
              />
            </div>

            {/* Total Cost */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">إجمالي التكلفة:</span>
                <span className="text-lg font-bold text-green-600">
                  {parseInt(bookingForm.seatsBooked) * trip.pricePerSeat} دج
                </span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                {bookingForm.seatsBooked} مقعد × {trip.pricePerSeat} دج
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "جاري الإرسال..." : "تأكيد الحجز"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingModal;