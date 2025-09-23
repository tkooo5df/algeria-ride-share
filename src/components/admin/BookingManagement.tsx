import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Check,
  X,
  User,
  MapPin,
  Clock,
  DollarSign,
  CreditCard,
  Package
} from "lucide-react";
import { BrowserDatabaseService } from "@/integrations/database/browserServices";
import { BookingTrackingService, BookingStatus } from "@/integrations/database/bookingTrackingService";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  passengerId: string;
  driverId: string;
  tripId: string;
  pickupLocation: string;
  destinationLocation: string;
  seatsBooked: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bpm';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  pickupTime: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  passenger?: {
    fullName: string;
    phone: string;
  };
  driver?: {
    fullName: string;
    phone: string;
  };
  trip?: {
    fromWilayaName?: string;
    toWilayaName?: string;
    departureDate: string;
    departureTime: string;
    vehicle?: {
      make: string;
      model: string;
    };
  };
}

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Load bookings from database
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BrowserDatabaseService.getBookingsWithDetails();
      setBookings(data || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "خطأ في تحميل الحجوزات",
        description: "حدث خطأ أثناء تحميل قائمة الحجوزات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800", variant: "outline" },
      confirmed: { label: "مؤكدة", color: "bg-green-100 text-green-800", variant: "default" },
      cancelled: { label: "ملغاة", color: "bg-red-100 text-red-800", variant: "destructive" },
      completed: { label: "مكتملة", color: "bg-blue-100 text-blue-800", variant: "default" },
      rejected: { label: "مرفوضة", color: "bg-red-100 text-red-800", variant: "destructive" }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap = {
      cod: "نقداً",
      bpm: "بريدي موب"
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.passenger?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.driver?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await BookingTrackingService.trackStatusChange(
        bookingId,
        BookingStatus.CONFIRMED,
        'system',
        'admin'
      );
      
      toast({
        title: "تم تأكيد الحجز",
        description: "تم تأكيد الحجز بنجاح"
      });
      
      // Reload bookings
      loadBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "خطأ في تأكيد الحجز",
        description: "حدث خطأ أثناء تأكيد الحجز",
        variant: "destructive"
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await BookingTrackingService.trackStatusChange(
        bookingId,
        BookingStatus.CANCELLED,
        'system',
        'admin'
      );
      
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء الحجز بنجاح"
      });
      
      // Reload bookings
      loadBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "خطأ في إلغاء الحجز",
        description: "حدث خطأ أثناء إلغاء الحجز",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الحجوزات</h2>
          <p className="text-muted-foreground">إدارة جميع حجوزات النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            تصدير البيانات
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الحجوزات (الراكب، السائق، الموقع)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكدة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل الحجوزات...</p>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد حجوزات</h3>
              <p className="text-muted-foreground">لا توجد حجوزات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => {
            const statusInfo = getStatusBadge(booking.status);
            
            return (
              <Card key={booking.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="text-lg font-semibold truncate">
                          {booking.passenger?.fullName || "غير محدد"} ← {booking.driver?.fullName || "غير محدد"}
                        </div>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{booking.pickupLocation} → {booking.destinationLocation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{booking.trip?.departureDate || "غير محدد"}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{booking.seatsBooked} مقاعد</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{booking.pickupTime}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold text-primary truncate">{booking.totalAmount} دج</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{getPaymentMethodLabel(booking.paymentMethod)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {(booking.notes || booking.specialRequests) && (
                        <div className="mt-2 flex flex-col gap-1">
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground truncate">
                              <strong>ملاحظات:</strong> {booking.notes}
                            </p>
                          )}
                          {booking.specialRequests && (
                            <p className="text-sm text-muted-foreground truncate">
                              <strong>طلبات خاصة:</strong> {booking.specialRequests}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">عرض</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>تفاصيل الحجز</DialogTitle>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">معلومات الراكب</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>الاسم: {selectedBooking.passenger?.fullName || "غير محدد"}</div>
                                    <div>الهاتف: {selectedBooking.passenger?.phone || "غير محدد"}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">معلومات السائق</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>الاسم: {selectedBooking.driver?.fullName || "غير محدد"}</div>
                                    <div>الهاتف: {selectedBooking.driver?.phone || "غير محدد"}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">معلومات الرحلة</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>من: {selectedBooking.trip?.fromWilayaName || "غير محدد"}</div>
                                    <div>إلى: {selectedBooking.trip?.toWilayaName || "غير محدد"}</div>
                                    <div>التاريخ: {selectedBooking.trip?.departureDate || "غير محدد"}</div>
                                    <div>الوقت: {selectedBooking.trip?.departureTime || "غير محدد"}</div>
                                    <div>المركبة: {selectedBooking.trip?.vehicle?.make} {selectedBooking.trip?.vehicle?.model || ""}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">معلومات الحجز</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>الموقع: {selectedBooking.pickupLocation} → {selectedBooking.destinationLocation}</div>
                                    <div>وقت الاستلام: {selectedBooking.pickupTime}</div>
                                    <div>المقاعد: {selectedBooking.seatsBooked}</div>
                                    <div>المبلغ الإجمالي: {selectedBooking.totalAmount} دج</div>
                                    <div>طريقة الدفع: {getPaymentMethodLabel(selectedBooking.paymentMethod)}</div>
                                    <div>الحالة: {getStatusBadge(selectedBooking.status).label}</div>
                                  </div>
                                </div>
                              </div>
                              
                              {(selectedBooking.notes || selectedBooking.specialRequests) && (
                                <div>
                                  <h4 className="font-semibold mb-2">التفاصيل الإضافية</h4>
                                  <div className="space-y-2 text-sm">
                                    {selectedBooking.notes && (
                                      <div>
                                        <strong>ملاحظات:</strong> {selectedBooking.notes}
                                      </div>
                                    )}
                                    {selectedBooking.specialRequests && (
                                      <div>
                                        <strong>طلبات خاصة:</strong> {selectedBooking.specialRequests}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {booking.status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">تأكيد</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">رفض</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingManagement;