import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  CreditCard,
  Smartphone,
  User,
  Phone,
  MessageSquare,
  Send
} from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { NotificationService } from '@/integrations/database/notificationService';
import { toast } from '@/hooks/use-toast';

interface Trip {
  id: string;
  fromWilayaId: number;
  toWilayaId: number;
  departureDate: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  totalSeats: number;
  description?: string;
  driver: {
    id: string;
    fullName: string;
    phone: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
}

interface BookingFormWithNotificationsProps {
  trip: Trip;
  onBookingSuccess?: (bookingId: string | number) => void;
  onCancel?: () => void;
}

const BookingFormWithNotifications = ({ 
  trip, 
  onBookingSuccess, 
  onCancel 
}: BookingFormWithNotificationsProps) => {
  const { user } = useAuth();
  const { getDatabaseService } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    seatsBooked: 1,
    pickupLocation: '',
    destinationLocation: '',
    paymentMethod: 'cod',
    notes: '',
    specialRequests: '',
    pickupTime: trip.departureTime,
  });

  // Convert UI payment method values to database values
  const convertPaymentMethod = (uiValue: string): 'cod' | 'bpm' => {
    if (uiValue === 'baridimob') {
      return 'bpm';
    }
    return uiValue as 'cod' | 'bpm';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const db = getDatabaseService();
      
      // Calculate total amount
      const totalAmount = formData.seatsBooked * trip.pricePerSeat;

      // Create booking
      const booking = await db.createBooking({
        pickupLocation: formData.pickupLocation,
        destinationLocation: formData.destinationLocation,
        passengerId: user.id,
        driverId: trip.driver.id,
        tripId: trip.id,
        seatsBooked: formData.seatsBooked,
        totalAmount: totalAmount,
        paymentMethod: convertPaymentMethod(formData.paymentMethod),
        notes: formData.notes,
        pickupTime: formData.pickupTime,
        specialRequests: formData.specialRequests,
        status: 'pending'
      });

      // Send notifications to all parties
      await NotificationService.notifyBookingCreated({
        bookingId: booking.id,
        passengerId: user.id,
        driverId: trip.driver.id,
        tripId: trip.id,
        pickupLocation: formData.pickupLocation,
        destinationLocation: formData.destinationLocation,
        seatsBooked: formData.seatsBooked,
        totalAmount: totalAmount,
        paymentMethod: convertPaymentMethod(formData.paymentMethod),
      });

      // Update trip available seats
      await db.updateTrip(trip.id, {
        availableSeats: trip.availableSeats - formData.seatsBooked
      });

      toast({
        title: "تم إنشاء الحجز بنجاح! 🎉",
        description: "تم إرسال إشعارات للسائق والإدارة. سيتم التواصل معك قريباً.",
      });

      if (onBookingSuccess) {
        onBookingSuccess(booking.id);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "خطأ في الحجز",
        description: "حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalAmount = formData.seatsBooked * trip.pricePerSeat;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          حجز مقعد في الرحلة
        </CardTitle>
        <CardDescription>
          املأ البيانات التالية لحجز مقعدك في هذه الرحلة
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Trip Information */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3">معلومات الرحلة</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>ولاية {trip.fromWilayaId} → ولاية {trip.toWilayaId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{trip.departureDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{trip.departureTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{trip.availableSeats}/{trip.totalSeats} مقاعد متاحة</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>السائق: {trip.driver.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{trip.driver.phone}</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-primary/10 rounded">
            <div className="flex items-center justify-between">
              <span className="font-medium">المركبة:</span>
              <span>{trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.year}) - {trip.vehicle.color}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seatsBooked">عدد المقاعد</Label>
              <Select 
                value={formData.seatsBooked.toString()} 
                onValueChange={(value) => handleInputChange('seatsBooked', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(trip.availableSeats, 4) }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} مقعد
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupTime">وقت الاستلام</Label>
              <Input
                id="pickupTime"
                type="time"
                value={formData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupLocation">مكان الاستلام</Label>
            <Input
              id="pickupLocation"
              placeholder="أدخل مكان الاستلام بالتفصيل"
              value={formData.pickupLocation}
              onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationLocation">مكان الوصول</Label>
            <Input
              id="destinationLocation"
              placeholder="أدخل مكان الوصول بالتفصيل"
              value={formData.destinationLocation}
              onChange={(e) => handleInputChange('destinationLocation', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>نقداً عند الوصول</span>
                  </div>
                </SelectItem>
                <SelectItem value="baridimob">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>بريدي موب</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات إضافية..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">طلبات خاصة (اختياري)</Label>
            <Textarea
              id="specialRequests"
              placeholder="مثل: مقعد في الأمام، لا تدخين، إلخ..."
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows={2}
            />
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">المبلغ الإجمالي:</span>
              <span className="text-2xl font-bold text-primary">
                {totalAmount.toLocaleString()} دج
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formData.seatsBooked} مقعد × {trip.pricePerSeat} دج
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الحجز...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>تأكيد الحجز</span>
                </div>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                إلغاء
              </Button>
            )}
          </div>
        </form>

        {/* Notification Info */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">سيتم إرسال إشعارات تلقائياً إلى:</p>
              <ul className="mt-1 space-y-1">
                <li>• السائق: {trip.driver.fullName}</li>
                <li>• الإدارة: لمتابعة الحجز</li>
                <li>• أنت: تأكيد الحجز</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFormWithNotifications;
