import { BrowserDatabaseService } from './browserServices';

// Notification types
export enum NotificationType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  TRIP_CREATED = 'trip_created',
  TRIP_UPDATED = 'trip_updated',
  TRIP_CANCELLED = 'trip_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  RATING_RECEIVED = 'rating_received',
  SYSTEM_ALERT = 'system_alert',
  WELCOME = 'welcome'
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Smart notification service
export class NotificationService {
  // Create notification for specific user
  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
  }) {
    try {
      const notification = await BrowserDatabaseService.createNotification({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type as 'booking' | 'trip' | 'system' | 'payment',
        relatedId: data.relatedId,
      });

      // Log notification creation
      console.log(`📧 Notification sent to user ${data.userId}: ${data.title}`);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create booking notification system
  static async notifyBookingCreated(bookingData: {
    bookingId: number;
    passengerId: string;
    driverId: string;
    tripId: string;
    pickupLocation: string;
    destinationLocation: string;
    seatsBooked: number;
    totalAmount: number;
    paymentMethod: string;
  }) {
    try {
      // Get trip details
      const trips = await BrowserDatabaseService.getTrips();
      const trip = trips.find(t => t.id === bookingData.tripId);
      if (!trip) throw new Error('Trip not found');

      // Get passenger details
      const passenger = await BrowserDatabaseService.getProfile(bookingData.passengerId);
      if (!passenger) throw new Error('Passenger not found');

      // Get driver details
      const driver = await BrowserDatabaseService.getProfile(bookingData.driverId);
      if (!driver) throw new Error('Driver not found');

      // Get all admin users
      const adminProfiles = await this.getAdminUsers();

      const notifications = [];

      // 1. Notify the driver about new booking
      const driverNotification = await this.createNotification({
        userId: bookingData.driverId,
        title: 'حجز جديد! 🎉',
        message: `تم حجز ${bookingData.seatsBooked} مقعد في رحلتك من ${bookingData.pickupLocation} إلى ${bookingData.destinationLocation}. المبلغ: ${bookingData.totalAmount} دج`,
        type: NotificationType.BOOKING_CREATED,
        priority: NotificationPriority.HIGH,
        relatedId: bookingData.bookingId.toString(),
        relatedType: 'booking',
        actionUrl: `/driver/dashboard?tab=bookings&booking=${bookingData.bookingId}`
      });
      notifications.push(driverNotification);

      // 2. Notify the passenger about booking confirmation
      const passengerNotification = await this.createNotification({
        userId: bookingData.passengerId,
        title: 'تم تأكيد حجزك! ✅',
        message: `تم تأكيد حجزك بنجاح. السائق: ${driver.fullName} (${driver.phone}). سنتواصل معك قريباً.`,
        type: NotificationType.BOOKING_CONFIRMED,
        priority: NotificationPriority.MEDIUM,
        relatedId: bookingData.bookingId.toString(),
        relatedType: 'booking',
        actionUrl: `/passenger/dashboard?tab=bookings&booking=${bookingData.bookingId}`
      });
      notifications.push(passengerNotification);

      // 3. Notify all admins about new booking
      for (const admin of adminProfiles) {
        const adminNotification = await this.createNotification({
          userId: admin.id,
          title: 'حجز جديد في النظام 📊',
          message: `حجز جديد: ${passenger.fullName} حجز ${bookingData.seatsBooked} مقعد في رحلة ${driver.fullName} من ${bookingData.pickupLocation} إلى ${bookingData.destinationLocation}. المبلغ: ${bookingData.totalAmount} دج`,
          type: NotificationType.BOOKING_CREATED,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingData.bookingId.toString(),
          relatedType: 'booking',
          actionUrl: `/admin?tab=bookings&booking=${bookingData.bookingId}`
        });
        notifications.push(adminNotification);
      }

      // 4. Create admin log entry
      await this.logAdminAction({
        adminId: adminProfiles[0]?.id || 'system',
        action: 'booking_created',
        targetType: 'booking',
        targetId: bookingData.bookingId.toString(),
        details: {
          passengerId: bookingData.passengerId,
          driverId: bookingData.driverId,
          tripId: bookingData.tripId,
          amount: bookingData.totalAmount,
          seats: bookingData.seatsBooked
        }
      });

      return notifications;
    } catch (error) {
      console.error('Error in notifyBookingCreated:', error);
      throw error;
    }
  }

  // Notify when booking is confirmed by driver
  static async notifyBookingConfirmed(bookingId: number, driverId: string) {
    try {
      const bookings = await BrowserDatabaseService.getAllBookings();
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');

      const driver = await BrowserDatabaseService.getProfile(driverId);
      if (!driver) throw new Error('Driver not found');

      // Notify passenger
      await this.createNotification({
        userId: booking.passengerId!,
        title: 'تم قبول حجزك! 🚗',
        message: `السائق ${driver.fullName} قبل حجزك. سيتم التواصل معك قريباً لترتيب التفاصيل.`,
        type: NotificationType.BOOKING_CONFIRMED,
        priority: NotificationPriority.HIGH,
        relatedId: bookingId.toString(),
        relatedType: 'booking'
      });

      // Notify admins
      const adminProfiles = await this.getAdminUsers();
      for (const admin of adminProfiles) {
        await this.createNotification({
          userId: admin.id,
          title: 'تم تأكيد حجز',
          message: `السائق ${driver.fullName} أكد حجز #${bookingId}`,
          type: NotificationType.BOOKING_CONFIRMED,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking'
        });
      }
    } catch (error) {
      console.error('Error in notifyBookingConfirmed:', error);
      throw error;
    }
  }

  // Notify when booking is cancelled
  static async notifyBookingCancelled(bookingId: number, cancelledBy: string, reason?: string) {
    try {
      const bookings = await BrowserDatabaseService.getAllBookings();
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');

      const cancelledByUser = await BrowserDatabaseService.getProfile(cancelledBy);
      if (!cancelledByUser) throw new Error('User not found');

      // Notify both passenger and driver
      const notifications = [];

      if (booking.passengerId) {
        notifications.push(await this.createNotification({
          userId: booking.passengerId,
          title: 'تم إلغاء الحجز',
          message: `تم إلغاء حجزك ${reason ? `بسبب: ${reason}` : ''}`,
          type: NotificationType.BOOKING_CANCELLED,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking'
        }));
      }

      if (booking.driverId) {
        notifications.push(await this.createNotification({
          userId: booking.driverId,
          title: 'تم إلغاء الحجز',
          message: `تم إلغاء حجز #${bookingId} ${reason ? `بسبب: ${reason}` : ''}`,
          type: NotificationType.BOOKING_CANCELLED,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking'
        }));
      }

      // Notify admins
      const adminProfiles = await this.getAdminUsers();
      for (const admin of adminProfiles) {
        notifications.push(await this.createNotification({
          userId: admin.id,
          title: 'تم إلغاء حجز',
          message: `تم إلغاء حجز #${bookingId} من قبل ${cancelledByUser.fullName}`,
          type: NotificationType.BOOKING_CANCELLED,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking'
        }));
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyBookingCancelled:', error);
      throw error;
    }
  }

  // Notify when new trip is created
  static async notifyTripCreated(tripId: string, driverId: string) {
    try {
      const trips = await BrowserDatabaseService.getTrips();
      const trip = trips.find(t => t.id === tripId);
      if (!trip) throw new Error('Trip not found');

      const driver = await BrowserDatabaseService.getProfile(driverId);
      if (!driver) throw new Error('Driver not found');

      // Notify admins about new trip
      const adminProfiles = await this.getAdminUsers();
      for (const admin of adminProfiles) {
        await this.createNotification({
          userId: admin.id,
          title: 'رحلة جديدة منشورة 🚗',
          message: `السائق ${driver.fullName} أنشأ رحلة جديدة من ولاية ${trip.fromWilayaId} إلى ولاية ${trip.toWilayaId} بسعر ${trip.pricePerSeat} دج`,
          type: NotificationType.TRIP_CREATED,
          priority: NotificationPriority.MEDIUM,
          relatedId: tripId,
          relatedType: 'trip'
        });
      }
    } catch (error) {
      console.error('Error in notifyTripCreated:', error);
      throw error;
    }
  }

  // Get all admin users
  static async getAdminUsers() {
    try {
      // In local mode, we'll get all profiles and filter admins
      // In Supabase mode, this would be a proper query
      const allProfiles = await BrowserDatabaseService.getAllProfiles();
      
      // Filter admin users
      const adminUsers = allProfiles.filter(profile => profile.role === 'admin');
      
      // If no admin users exist, return the default admin
      if (adminUsers.length === 0) {
        return [{
          id: 'admin-1',
          fullName: 'مدير النظام',
          email: 'admin@test.com',
          role: 'admin'
        }];
      }
      
      return adminUsers;
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  }

  // Log admin action
  static async logAdminAction(data: {
    adminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    details?: any;
  }) {
    try {
      // For now, just log to console since we don't have admin logs in browser database
      console.log('Admin Action:', {
        adminId: data.adminId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        details: data.details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string) {
    try {
      return await BrowserDatabaseService.getNotifications(userId);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      return await BrowserDatabaseService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      const recentCount = notifications.filter(n => {
        const notificationDate = new Date(n.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return notificationDate > oneDayAgo;
      }).length;

      return {
        total: notifications.length,
        unread: unreadCount,
        recent: recentCount
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, recent: 0 };
    }
  }
}
