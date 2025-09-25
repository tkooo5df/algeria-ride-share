import { BrowserDatabaseService } from './browserServices';
import { NotificationService, NotificationType, NotificationCategory, NotificationPriority } from './notificationService';

// Booking status definitions
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

// Booking events for tracking
export enum BookingEvent {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PASSENGER_ARRIVED = 'passenger_arrived',
  DRIVER_ARRIVED = 'driver_arrived',
  PAYMENT_RECEIVED = 'payment_received'
}

// Booking history entry interface
interface BookingHistoryEntry {
  id: string;
  bookingId: string;
  event: BookingEvent;
  status: BookingStatus;
  timestamp: string;
  notes?: string;
  actor: 'passenger' | 'driver' | 'system';
  actorId: string;
}

export class BookingTrackingService {
  
  // Track booking status change
  static async trackStatusChange(
    bookingId: string,
    newStatus: BookingStatus,
    actor: 'passenger' | 'driver' | 'system',
    actorId: string,
    notes?: string
  ) {
    try {
      // Update booking status
      await BrowserDatabaseService.updateBooking(bookingId, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Add to booking history
      await this.addBookingHistoryEntry(bookingId, {
        event: this.getEventFromStatus(newStatus),
        status: newStatus,
        actor,
        actorId,
        notes
      });

      // Send notifications based on status change
      await this.sendStatusChangeNotifications(bookingId, newStatus, actor, actorId);

      // Update trip availability if needed
      if (newStatus === BookingStatus.CONFIRMED || newStatus === BookingStatus.CANCELLED) {
        const booking = await this.getBookingById(bookingId);
        if (booking) {
          await BrowserDatabaseService.updateTripAvailability(booking.tripId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error tracking status change:', error);
      throw error;
    }
  }

  // Get booking with full tracking history
  static async getBookingWithHistory(bookingId: string) {
    try {
      const booking = await this.getBookingById(bookingId);
      if (!booking) return null;

      const history = await this.getBookingHistory(bookingId);
      
      return {
        ...booking,
        history,
        currentStatus: booking.status,
        canCancel: this.canCancelBooking(booking.status),
        canConfirm: this.canConfirmBooking(booking.status),
        canComplete: this.canCompleteBooking(booking.status)
      };
    } catch (error) {
      console.error('Error getting booking with history:', error);
      throw error;
    }
  }

  // Add booking history entry
  private static async addBookingHistoryEntry(
    bookingId: string,
    entry: {
      event: BookingEvent;
      status: BookingStatus;
      actor: 'passenger' | 'driver' | 'system';
      actorId: string;
      notes?: string;
    }
  ) {
    const historyEntry: BookingHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      event: entry.event,
      status: entry.status,
      timestamp: new Date().toISOString(),
      notes: entry.notes,
      actor: entry.actor,
      actorId: entry.actorId
    };

    // Store in localStorage (in real app, this would be in database)
    const data = JSON.parse(localStorage.getItem('dz_taxi_database') || '{}');
    if (!data.bookingHistory) data.bookingHistory = [];
    data.bookingHistory.push(historyEntry);
    localStorage.setItem('dz_taxi_database', JSON.stringify(data));

    return historyEntry;
  }

  // Get booking history
  static async getBookingHistory(bookingId: string): Promise<BookingHistoryEntry[]> {
    const data = JSON.parse(localStorage.getItem('dz_taxi_database') || '{}');
    const history = data.bookingHistory || [];
    
    return history
      .filter((entry: BookingHistoryEntry) => entry.bookingId === bookingId)
      .sort((a: BookingHistoryEntry, b: BookingHistoryEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  // Get booking by ID
  private static async getBookingById(bookingId: string) {
    const data = JSON.parse(localStorage.getItem('dz_taxi_database') || '{}');
    const bookings = data.bookings || [];
    return bookings.find((booking: any) => booking.id === bookingId);
  }

  // Send notifications based on status change
  private static async sendStatusChangeNotifications(
    bookingId: string,
    newStatus: BookingStatus,
    actor: 'passenger' | 'driver' | 'system',
    actorId: string
  ) {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return;

    switch (newStatus) {
      case BookingStatus.CONFIRMED:
        if (actor === 'driver') {
          await NotificationService.notifyBookingConfirmed(bookingId, actorId);
        }
        break;
      
      case BookingStatus.CANCELLED:
        await NotificationService.notifyBookingCancelled(bookingId, actorId, 'تم إلغاء الحجز');
        break;
      
      case BookingStatus.COMPLETED:
        // Notify both parties about completion
        await NotificationService.sendSmartNotification({
          userId: booking.passengerId,
          title: 'تم إكمال الرحلة',
          message: 'تم إكمال رحلتك بنجاح. يمكنك الآن تقييم السائق.',
          type: NotificationType.BOOKING_COMPLETED,
          category: NotificationCategory.BOOKING,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId,
          relatedType: 'booking'
        });
        
        // Simulate payment completion for cash on delivery
        if (booking.paymentMethod === 'cod') {
          try {
            await NotificationService.notifyPaymentReceived({
              bookingId: bookingId,
              amount: booking.totalAmount,
              paymentMethod: 'نقداً',
              payerId: booking.passengerId,
              recipientId: booking.driverId
            });
          } catch (paymentError) {
            console.error('Error sending payment notification:', paymentError);
          }
        }
        break;
      
      case BookingStatus.REJECTED:
        await NotificationService.sendSmartNotification({
          userId: booking.passengerId,
          title: 'تم رفض الحجز',
          message: 'نأسف، تم رفض طلب الحجز من قبل السائق.',
          type: NotificationType.BOOKING_REJECTED,
          category: NotificationCategory.BOOKING,
          priority: NotificationPriority.HIGH,
          relatedId: bookingId,
          relatedType: 'booking'
        });
        break;
    }
  }

  // Helper method to get event from status
  private static getEventFromStatus(status: BookingStatus): BookingEvent {
    const statusToEvent = {
      [BookingStatus.PENDING]: BookingEvent.CREATED,
      [BookingStatus.CONFIRMED]: BookingEvent.CONFIRMED,
      [BookingStatus.REJECTED]: BookingEvent.REJECTED,
      [BookingStatus.IN_PROGRESS]: BookingEvent.STARTED,
      [BookingStatus.COMPLETED]: BookingEvent.COMPLETED,
      [BookingStatus.CANCELLED]: BookingEvent.CANCELLED
    };
    
    return statusToEvent[status] || BookingEvent.CREATED;
  }

  // Check if booking can be cancelled
  static canCancelBooking(status: string): boolean {
    return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(status as BookingStatus);
  }

  // Check if booking can be confirmed
  static canConfirmBooking(status: string): boolean {
    return status === BookingStatus.PENDING;
  }

  // Check if booking can be completed
  static canCompleteBooking(status: string): boolean {
    return [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS].includes(status as BookingStatus);
  }

  // Get status display info
  static getStatusInfo(status: string) {
    const statusInfo = {
      [BookingStatus.PENDING]: {
        label: 'في الانتظار',
        color: 'bg-yellow-100 text-yellow-800',
        variant: 'secondary' as const,
        icon: '⏳',
        description: 'في انتظار موافقة السائق'
      },
      [BookingStatus.CONFIRMED]: {
        label: 'مؤكد',
        color: 'bg-green-100 text-green-800',
        variant: 'default' as const,
        icon: '✅',
        description: 'تم تأكيد الحجز من قبل السائق'
      },
      [BookingStatus.IN_PROGRESS]: {
        label: 'قيد التنفيذ',
        color: 'bg-blue-100 text-blue-800',
        variant: 'default' as const,
        icon: '🚗',
        description: 'الرحلة جارية حالياً'
      },
      [BookingStatus.COMPLETED]: {
        label: 'مكتمل',
        color: 'bg-gray-100 text-gray-800',
        variant: 'outline' as const,
        icon: '🏁',
        description: 'تم إكمال الرحلة بنجاح'
      },
      [BookingStatus.CANCELLED]: {
        label: 'ملغي',
        color: 'bg-red-100 text-red-800',
        variant: 'destructive' as const,
        icon: '❌',
        description: 'تم إلغاء الحجز'
      },
      [BookingStatus.REJECTED]: {
        label: 'مرفوض',
        color: 'bg-red-100 text-red-800',
        variant: 'destructive' as const,
        icon: '🚫',
        description: 'تم رفض الحجز من قبل السائق'
      }
    };

    return statusInfo[status as BookingStatus] || statusInfo[BookingStatus.PENDING];
  }

  // Get all possible status transitions for a booking
  static getAvailableActions(currentStatus: string, userRole: 'driver' | 'passenger' | 'admin' | 'developer') {
    const actions: Array<{
      action: string;
      label: string;
      newStatus: BookingStatus;
      icon: string;
      variant: 'default' | 'destructive' | 'outline';
    }> = [];

    if (userRole === 'driver') {
      if (currentStatus === BookingStatus.PENDING) {
        actions.push(
          {
            action: 'confirm',
            label: 'قبول الحجز',
            newStatus: BookingStatus.CONFIRMED,
            icon: '✅',
            variant: 'default'
          },
          {
            action: 'reject',
            label: 'رفض الحجز',
            newStatus: BookingStatus.REJECTED,
            icon: '🚫',
            variant: 'destructive'
          }
        );
      }
      
      if (currentStatus === BookingStatus.CONFIRMED) {
        actions.push(
          {
            action: 'start',
            label: 'بدء الرحلة',
            newStatus: BookingStatus.IN_PROGRESS,
            icon: '🚗',
            variant: 'default'
          },
          {
            action: 'cancel',
            label: 'إلغاء الحجز',
            newStatus: BookingStatus.CANCELLED,
            icon: '❌',
            variant: 'destructive'
          }
        );
      }
      
      if (currentStatus === BookingStatus.IN_PROGRESS) {
        actions.push({
          action: 'complete',
          label: 'إكمال الرحلة',
          newStatus: BookingStatus.COMPLETED,
          icon: '🏁',
          variant: 'default'
        });
      }
    }

    if (userRole === 'passenger') {
      if ([BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(currentStatus as BookingStatus)) {
        actions.push({
          action: 'cancel',
          label: 'إلغاء الحجز',
          newStatus: BookingStatus.CANCELLED,
          icon: '❌',
          variant: 'destructive'
        });
      }
    }

    return actions;
  }
}