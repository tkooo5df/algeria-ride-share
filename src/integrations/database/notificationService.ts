import { BrowserDatabaseService } from './browserServices';
import { getDisplayName } from '@/utils/displayName';

// Comprehensive notification types
export enum NotificationType {
  // Booking-related notifications
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_PENDING = 'booking_pending',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_MODIFIED = 'booking_modified',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_COMPLETED = 'booking_completed',
  
  // Trip-related notifications
  TRIP_CREATED = 'trip_created',
  TRIP_UPDATED = 'trip_updated',
  TRIP_CANCELLED = 'trip_cancelled',
  TRIP_FULL = 'trip_full',
  TRIP_STARTING = 'trip_starting',
  TRIP_COMPLETED = 'trip_completed',
  TRIP_DELAYED = 'trip_delayed',
  
  // Payment notifications
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',
  
  // Rating and review notifications
  RATING_RECEIVED = 'rating_received',
  RATING_REQUEST = 'rating_request',
  REVIEW_RECEIVED = 'review_received',
  
  // User account notifications
  ACCOUNT_VERIFIED = 'account_verified',
  ACCOUNT_SUSPENDED = 'account_suspended',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  USER_REGISTRATION = 'user_registration',
  
  // Driver-specific notifications
  DRIVER_APPROVED = 'driver_approved',
  DRIVER_REJECTED = 'driver_rejected',
  DOCUMENT_REQUIRED = 'document_required',
  VEHICLE_APPROVED = 'vehicle_approved',
  LICENSE_EXPIRING = 'license_expiring',
  
  // System notifications
  SYSTEM_ALERT = 'system_alert',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  WELCOME = 'welcome',
  SECURITY_ALERT = 'security_alert',
  UPDATE_AVAILABLE = 'update_available',
  
  // Communication notifications
  MESSAGE_RECEIVED = 'message_received',
  CALL_MISSED = 'call_missed',
  EMERGENCY_ALERT = 'emergency_alert'
}

// Enhanced notification priority levels
export enum NotificationPriority {
  LOW = 'low',        // General updates, non-time-sensitive
  MEDIUM = 'medium',  // Important but not urgent
  HIGH = 'high',      // Time-sensitive, requires attention
  URGENT = 'urgent',  // Critical, requires immediate action
  CRITICAL = 'critical' // Emergency situations
}

// Notification delivery status
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

// Notification categories for better organization
export enum NotificationCategory {
  BOOKING = 'booking',
  TRIP = 'trip', 
  PAYMENT = 'payment',
  ACCOUNT = 'account',
  USER = 'user',
  SYSTEM = 'system',
  COMMUNICATION = 'communication',
  SAFETY = 'safety'
}

// Enhanced notification data interface
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
  imageUrl?: string;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Enhanced notification service with smart routing
export class NotificationService {
  private static resolveProfileName(profile: any, fallback: string = 'عضو') {
    return getDisplayName(profile, { fallback });
  }

  private static isNotificationsTableMissing(error: any) {
    if (!error) return false;
    const code = typeof error.code === 'string' ? error.code : undefined;
    const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
    const details = typeof error.details === 'string' ? error.details.toLowerCase() : '';
    const combined = `${message} ${details}`;
    return code === '42P01' || combined.includes('relation "notifications" does not exist');
  }

  private static handleMissingNotificationsTable(error: any) {
    if (!this.isNotificationsTableMissing(error)) {
      throw error;
    }

    console.warn(
      'Supabase لم يجد جدول notifications. شغّل ملفات الهجرة داخل supabase/migrations (خاصة 20250908220515_little_queen.sql و 20260201000000_full_supabase_support.sql) ثم أعد المحاولة.',
      error
    );
    return null;
  }

  // Create notification with enhanced features
  static async createNotification(data: NotificationData) {
    try {
      const notification = await BrowserDatabaseService.createNotification({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: this.mapNotificationTypeToDatabase(data.type),
      });

      // Enhanced logging with category and priority
      console.log(`📧 [${data.category?.toUpperCase()}] [${data.priority?.toUpperCase()}] Notification sent to user ${data.userId}: ${data.title}`);

      // Track notification metrics
      this.trackNotificationMetrics(data);

      return notification;
    } catch (error) {
      if (this.isNotificationsTableMissing(error)) {
        return this.handleMissingNotificationsTable(error);
      }

      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Smart notification routing based on user role and preferences
  static async sendSmartNotification(data: NotificationData) {
    try {
      const user = await BrowserDatabaseService.getProfile(data.userId);
      if (!user) throw new Error('User not found');

      // Apply role-based notification rules
      const shouldSend = await this.shouldSendNotification(user, data);
      if (!shouldSend) {
        console.log(`🚫 Notification blocked by user preferences: ${data.title}`);
        return null;
      }

      // Enhanced notification with role-specific customization
      const customizedData = await this.customizeNotificationForRole(user, data);
      
      return await this.createNotification(customizedData);
    } catch (error) {
      if (this.isNotificationsTableMissing(error)) {
        return this.handleMissingNotificationsTable(error);
      }

      console.error('Error in smart notification routing:', error);
      throw error;
    }
  }

  // Check if notification should be sent based on user preferences
  static async shouldSendNotification(user: any, data: NotificationData): Promise<boolean> {
    // Check user notification preferences (would be stored in database)
    // For now, return true for all notifications
    // TODO: Implement user notification preferences
    return true;
  }

  // Customize notification content based on user role
  static async customizeNotificationForRole(user: any, data: NotificationData): Promise<NotificationData> {
    const customized = { ...data };
    
    // Role-specific customization
    switch (user.role) {
      case 'driver':
        if (data.type === NotificationType.BOOKING_CREATED) {
          customized.priority = NotificationPriority.HIGH;
          customized.actionUrl = `/driver/dashboard?tab=bookings&booking=${data.relatedId}`;
        }
        break;
      case 'passenger':
        if (data.type === NotificationType.BOOKING_CONFIRMED) {
          customized.priority = NotificationPriority.MEDIUM;
          customized.actionUrl = `/passenger/dashboard?tab=bookings&booking=${data.relatedId}`;
        }
        break;
      case 'admin':
        customized.actionUrl = `/admin?tab=${data.category}&id=${data.relatedId}`;
        break;
    }
    
    return customized;
  }

  // Map notification types to database compatible types
  static mapNotificationTypeToDatabase(type: NotificationType): 'booking' | 'trip' | 'system' | 'payment' {
    const typeMap: Record<NotificationType, 'booking' | 'trip' | 'system' | 'payment'> = {
      [NotificationType.BOOKING_CREATED]: 'booking',
      [NotificationType.BOOKING_CONFIRMED]: 'booking',
      [NotificationType.BOOKING_CANCELLED]: 'booking',
      [NotificationType.BOOKING_PENDING]: 'booking',
      [NotificationType.BOOKING_REJECTED]: 'booking',
      [NotificationType.BOOKING_MODIFIED]: 'booking',
      [NotificationType.BOOKING_REMINDER]: 'booking',
      [NotificationType.BOOKING_COMPLETED]: 'booking',
      [NotificationType.TRIP_CREATED]: 'trip',
      [NotificationType.TRIP_UPDATED]: 'trip',
      [NotificationType.TRIP_CANCELLED]: 'trip',
      [NotificationType.TRIP_FULL]: 'trip',
      [NotificationType.TRIP_STARTING]: 'trip',
      [NotificationType.TRIP_COMPLETED]: 'trip',
      [NotificationType.TRIP_DELAYED]: 'trip',
      [NotificationType.PAYMENT_RECEIVED]: 'payment',
      [NotificationType.PAYMENT_PENDING]: 'payment',
      [NotificationType.PAYMENT_FAILED]: 'payment',
      [NotificationType.PAYMENT_REFUNDED]: 'payment',
      [NotificationType.RATING_RECEIVED]: 'system',
      [NotificationType.RATING_REQUEST]: 'system',
      [NotificationType.REVIEW_RECEIVED]: 'system',
      [NotificationType.ACCOUNT_VERIFIED]: 'system',
      [NotificationType.ACCOUNT_SUSPENDED]: 'system',
      [NotificationType.PROFILE_UPDATED]: 'system',
      [NotificationType.PASSWORD_CHANGED]: 'system',
      [NotificationType.USER_REGISTRATION]: 'system',
      [NotificationType.DRIVER_APPROVED]: 'system',
      [NotificationType.DRIVER_REJECTED]: 'system',
      [NotificationType.DOCUMENT_REQUIRED]: 'system',
      [NotificationType.VEHICLE_APPROVED]: 'system',
      [NotificationType.LICENSE_EXPIRING]: 'system',
      [NotificationType.SYSTEM_ALERT]: 'system',
      [NotificationType.SYSTEM_MAINTENANCE]: 'system',
      [NotificationType.WELCOME]: 'system',
      [NotificationType.SECURITY_ALERT]: 'system',
      [NotificationType.UPDATE_AVAILABLE]: 'system',
      [NotificationType.MESSAGE_RECEIVED]: 'system',
      [NotificationType.CALL_MISSED]: 'system',
      [NotificationType.EMERGENCY_ALERT]: 'system'
    };
    
    return typeMap[type] || 'system';
  }

  // Track notification metrics for analytics
  static trackNotificationMetrics(data: NotificationData) {
    try {
      // Log metrics for analytics
      console.log('📊 Notification Metrics:', {
        type: data.type,
        category: data.category,
        priority: data.priority,
        timestamp: new Date().toISOString(),
        userId: data.userId
      });
    } catch (error) {
      console.error('Error tracking notification metrics:', error);
    }
  }

  // === CORE NOTIFICATION METHODS ===
  
  // Get user notifications with filtering
  static async getUserNotifications(userId: string, filters?: {
    type?: NotificationType;
    category?: NotificationCategory;
    isRead?: boolean;
    limit?: number;
  }) {
    try {
      let notifications = await BrowserDatabaseService.getNotifications(userId);
      
      // Apply filters
      if (filters) {
        if (filters.type) {
          const dbType = this.mapNotificationTypeToDatabase(filters.type);
          notifications = notifications.filter(n => n.type === dbType);
        }
        if (filters.isRead !== undefined) {
          notifications = notifications.filter(n => n.isRead === filters.isRead);
        }
        if (filters.limit) {
          notifications = notifications.slice(0, filters.limit);
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const result = await BrowserDatabaseService.markNotificationAsRead(notificationId);
      console.log(`✓ Notification ${notificationId} marked as read`);
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get notification statistics with enhanced metrics
  static async getNotificationStats(userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId);
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const unreadCount = notifications.filter(n => !n.isRead).length;
      const recentCount = notifications.filter(n => {
        const notificationDate = new Date(n.createdAt);
        return notificationDate > oneDayAgo;
      }).length;
      
      const weeklyCount = notifications.filter(n => {
        const notificationDate = new Date(n.createdAt);
        return notificationDate > oneWeekAgo;
      }).length;
      
      return {
        total: notifications.length,
        unread: unreadCount,
        recent: recentCount,
        weekly: weeklyCount
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { 
        total: 0, 
        unread: 0, 
        recent: 0, 
        weekly: 0
      };
    }
  }

  // Bulk notification sender for admin broadcasts
  static async sendBulkNotification(data: {
    userIds: string[];
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }) {
    try {
      const notifications = [];
      
      for (const userId of data.userIds) {
        const notification = await this.sendSmartNotification({
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          priority: data.priority || NotificationPriority.MEDIUM,
          metadata: data.metadata
        });
        notifications.push(notification);
      }
      
      console.log(`📨 Bulk notification sent to ${data.userIds.length} users`);
      return notifications;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw error;
    }
  }

  // === BOOKING NOTIFICATIONS ===
  
  // Enhanced booking creation notification
  static async notifyBookingCreated(bookingData: {
    bookingId: number | string;
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
      const [trip, passenger, driver, adminProfiles] = await Promise.all([
        this.getTripById(bookingData.tripId),
        BrowserDatabaseService.getProfile(bookingData.passengerId),
        BrowserDatabaseService.getProfile(bookingData.driverId),
        this.getAdminUsers()
      ]);

      if (!trip || !passenger || !driver) {
        throw new Error('Required data not found');
      }

      const notifications = [];
      const passengerName = this.resolveProfileName(passenger);
      const driverName = this.resolveProfileName(driver);

      // 1. Notify driver - High priority
      const driverNotification = await this.sendSmartNotification({
        userId: bookingData.driverId,
        title: '🎉 حجز جديد!',
        message: `تم حجز ${bookingData.seatsBooked} مقعد في رحلتك من ${bookingData.pickupLocation} إلى ${bookingData.destinationLocation}. الراكب: ${passengerName} - المبلغ: ${bookingData.totalAmount} دج`,
        type: NotificationType.BOOKING_CREATED,
        category: NotificationCategory.BOOKING,
        priority: NotificationPriority.HIGH,
        relatedId: bookingData.bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          passengerId: bookingData.passengerId,
          passengerName,
          passengerPhone: passenger.phone,
          seatsBooked: bookingData.seatsBooked,
          totalAmount: bookingData.totalAmount,
          audience: 'driver'
        }
      });
      notifications.push(driverNotification);

      // 2. Notify passenger - Confirmation
      const passengerNotification = await this.sendSmartNotification({
        userId: bookingData.passengerId,
        title: '✅ تم تأكيد حجزك!',
        message: `تم تأكيد حجزك بنجاح. السائق: ${driverName} (${driver.phone}). سيتم التواصل معك قريباً لترتيب التفاصيل.`,
        type: NotificationType.BOOKING_CONFIRMED,
        category: NotificationCategory.BOOKING,
        priority: NotificationPriority.MEDIUM,
        relatedId: bookingData.bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          driverId: bookingData.driverId,
          driverName,
          driverPhone: driver.phone,
          departureTime: trip.departureTime,
          pickupLocation: bookingData.pickupLocation,
          audience: 'passenger'
        }
      });
      notifications.push(passengerNotification);

      // 3. Notify admins - System monitoring (only if admins exist)
      if (adminProfiles.length > 0) {
        for (const admin of adminProfiles) {
          const isDeveloper = admin.role === 'developer';
          const title = isDeveloper ? '🔧 نشاط جديد بين الركاب والسائقين' : '📊 حجز جديد في النظام';
          const message = isDeveloper
            ? `تنبيه مطور: ${passengerName} حجز ${bookingData.seatsBooked} مقعد مع ${driverName} من ${bookingData.pickupLocation} إلى ${bookingData.destinationLocation}. القيمة: ${bookingData.totalAmount} دج.`
            : `حجز جديد: ${passengerName} حجز ${bookingData.seatsBooked} مقعد في رحلة ${driverName} من ${bookingData.pickupLocation} إلى ${bookingData.destinationLocation}. المبلغ: ${bookingData.totalAmount} دج`;
          const adminNotification = await this.sendSmartNotification({
            userId: admin.id,
            title,
            message,
            type: NotificationType.BOOKING_CREATED,
            category: NotificationCategory.SYSTEM,
            priority: NotificationPriority.MEDIUM,
            relatedId: bookingData.bookingId.toString(),
            relatedType: 'booking',
            metadata: {
              bookingId: bookingData.bookingId,
              revenue: bookingData.totalAmount,
              paymentMethod: bookingData.paymentMethod,
              audience: isDeveloper ? 'developer' : 'admin'
            }
          });
          notifications.push(adminNotification);
        }
      }

      // 4. Log admin action (only if admins exist)
      if (adminProfiles.length > 0) {
        const managementActor = adminProfiles.find(profile => profile.role === 'admin') ?? adminProfiles[0];
        await this.logAdminAction({
          adminId: managementActor.id,
          action: 'booking_created',
          targetType: 'booking',
          targetId: bookingData.bookingId.toString(),
          details: {
            passengerId: bookingData.passengerId,
            driverId: bookingData.driverId,
            tripId: bookingData.tripId,
            amount: bookingData.totalAmount,
            seats: bookingData.seatsBooked,
            passengerName,
            driverName,
            timestamp: new Date().toISOString()
          }
        });
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyBookingCreated:', error);
      throw error;
    }
  }

  // Booking confirmation by driver
  static async notifyBookingConfirmed(bookingId: number | string, driverId: string) {
    try {
      const [booking, driver] = await Promise.all([
        this.getBookingById(bookingId),
        BrowserDatabaseService.getProfile(driverId)
      ]);

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }
      
      if (!driver) {
        throw new Error(`Driver not found: ${driverId}`);
      }

      const notifications = [];
      const driverName = this.resolveProfileName(driver);
      const [passenger, adminProfiles] = await Promise.all([
        booking.passengerId ? BrowserDatabaseService.getProfile(booking.passengerId) : Promise.resolve(null),
        this.getAdminUsers()
      ]);
      const passengerName = this.resolveProfileName(passenger);

      // Notify passenger
      const passengerNotification = await this.sendSmartNotification({
        userId: booking.passengerId!,
        title: '🚗 تم قبول حجزك!',
        message: `السائق ${driverName} قبل حجزك. يمكنك التواصل معه على ${driver.phone} لترتيب تفاصيل الرحلة.`,
        type: NotificationType.BOOKING_CONFIRMED,
        category: NotificationCategory.BOOKING,
        priority: NotificationPriority.HIGH,
        relatedId: bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          driverName,
          driverPhone: driver.phone,
          status: 'confirmed'
        }
      });
      notifications.push(passengerNotification);

      // Notify driver confirmation success
      const driverNotification = await this.sendSmartNotification({
        userId: driverId,
        title: '✅ تم تأكيد الحجز',
        message: `تم تأكيد حجز #${bookingId}. تأكد من التواصل مع الراكب لتنسيق تفاصيل الرحلة.`,
        type: NotificationType.BOOKING_CONFIRMED,
        category: NotificationCategory.BOOKING,
        priority: NotificationPriority.MEDIUM,
        relatedId: bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          bookingStatus: 'confirmed',
          passengerId: booking.passengerId,
          passengerName,
          passengerPhone: passenger?.phone,
          departureTime: booking.pickupTime
        }
      });
      notifications.push(driverNotification);

      // Notify admins and developers
      for (const admin of adminProfiles) {
        const isDeveloper = admin.role === 'developer';
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: isDeveloper ? '🔧 تأكيد حجز - متابعة تقنية' : '✅ تم تأكيد حجز',
          message: isDeveloper
            ? `تحديث مطور: ${driverName} أكد الحجز #${bookingId} للراكب ${passengerName}.`
            : `السائق ${driverName} أكد حجز #${bookingId}`,
          type: NotificationType.BOOKING_CONFIRMED,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking',
          metadata: {
            audience: isDeveloper ? 'developer' : 'admin',
            passengerName,
            driverName,
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyBookingConfirmed:', error);
      throw error;
    }
  }

  // Booking cancellation notification
  static async notifyBookingCancelled(bookingId: number | string, cancelledBy: string, reason?: string) {
    try {
      const [booking, cancelledByUser] = await Promise.all([
        this.getBookingById(bookingId),
        BrowserDatabaseService.getProfile(cancelledBy)
      ]);

      if (!booking || !cancelledByUser) {
        throw new Error('Booking or user not found');
      }

      const notifications = [];
      const reasonText = reason ? ` السبب: ${reason}` : '';
      const cancelledByName = this.resolveProfileName(cancelledByUser);
      const [passengerProfile, driverProfile, adminProfiles] = await Promise.all([
        booking.passengerId ? BrowserDatabaseService.getProfile(booking.passengerId) : Promise.resolve(null),
        booking.driverId ? BrowserDatabaseService.getProfile(booking.driverId) : Promise.resolve(null),
        this.getAdminUsers()
      ]);
      const passengerName = this.resolveProfileName(passengerProfile);
      const driverName = this.resolveProfileName(driverProfile);

      // Notify passenger (if not the one who cancelled)
      if (booking.passengerId && booking.passengerId !== cancelledBy) {
        const passengerNotification = await this.sendSmartNotification({
          userId: booking.passengerId,
          title: '❌ تم إلغاء الحجز',
          message: `تم إلغاء حجزك #${bookingId}.${reasonText} سيتم رد المبلغ خلال 3-5 أيام عمل.`,
          type: NotificationType.BOOKING_CANCELLED,
          category: NotificationCategory.BOOKING,
          priority: NotificationPriority.HIGH,
          relatedId: bookingId.toString(),
          relatedType: 'booking',
          metadata: {
            cancelledBy: cancelledByName,
            reason: reason,
            refundStatus: 'pending',
            driverName,
            audience: 'passenger'
          }
        });
        notifications.push(passengerNotification);
      }

      // Notify driver (if not the one who cancelled)
      if (booking.driverId && booking.driverId !== cancelledBy) {
        const driverNotification = await this.sendSmartNotification({
          userId: booking.driverId,
          title: '❌ تم إلغاء حجز',
          message: `تم إلغاء حجز #${bookingId}.${reasonText} المقاعد متاحة الآن للحجز مرة أخرى.`,
          type: NotificationType.BOOKING_CANCELLED,
          category: NotificationCategory.BOOKING,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking',
          metadata: {
            cancelledBy: cancelledByName,
            reason: reason,
            passengerName,
            audience: 'driver'
          }
        });
        notifications.push(driverNotification);
      }

      // Notify admins
      for (const admin of adminProfiles) {
        const isDeveloper = admin.role === 'developer';
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: isDeveloper ? '🔧 إلغاء حجز - متابعة تقنية' : '❌ تم إلغاء حجز',
          message: isDeveloper
            ? `تنبيه مطور: ${cancelledByName} ألغى الحجز #${bookingId} بين ${passengerName} و${driverName}.${reasonText}`
            : `تم إلغاء حجز #${bookingId} من قبل ${cancelledByName}.${reasonText}`,
          type: NotificationType.BOOKING_CANCELLED,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          relatedId: bookingId.toString(),
          relatedType: 'booking',
          metadata: {
            cancelledBy: cancelledBy,
            reason: reason,
            refundRequired: true,
            passengerName,
            driverName,
            audience: isDeveloper ? 'developer' : 'admin'
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyBookingCancelled:', error);
      throw error;
    }
  }

  // Booking reminder notification
  static async notifyBookingReminder(bookingId: number | string, reminderType: 'departure' | 'pickup' = 'departure') {
    try {
      const booking = await this.getBookingById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const [passenger, driver, trip] = await Promise.all([
        BrowserDatabaseService.getProfile(booking.passengerId!),
        BrowserDatabaseService.getProfile(booking.driverId!),
        this.getTripById(booking.tripId!)
      ]);

      if (!passenger || !driver || !trip) {
        throw new Error('Required data not found');
      }

      const notifications = [];
      const passengerName = this.resolveProfileName(passenger);
      const driverName = this.resolveProfileName(driver);
      const reminderMessage = reminderType === 'departure'
        ? `تذكير: رحلتك ستبدأ خلال ساعة واحدة من ${trip.fromWilayaId} إلى ${trip.toWilayaId}`
        : `تذكير: موعد الانطلاق اقترب. تواصل مع السائق ${driverName} على ${driver.phone}`;

      // Notify passenger
      const passengerNotification = await this.sendSmartNotification({
        userId: booking.passengerId!,
        title: '⏰ تذكير برحلتك',
        message: reminderMessage,
        type: NotificationType.BOOKING_REMINDER,
        category: NotificationCategory.BOOKING,
        priority: NotificationPriority.HIGH,
        relatedId: bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          reminderType,
          driverName,
          driverPhone: driver.phone,
          departureTime: trip.departureTime,
          audience: 'passenger'
        }
      });
      notifications.push(passengerNotification);

      // Notify driver
      const driverNotification = await this.sendSmartNotification({
        userId: booking.driverId!,
        title: reminderType === 'pickup' ? '🚗 تذكير بالاستلام' : '⏰ تذكير بالرحلة',
        message: reminderType === 'pickup'
          ? `تذكير: رحلتك ستبدأ قريباً. راكب: ${passengerName} (${passenger.phone})`
          : `تذكير: رحلتك مجدولة لمغادرة ${trip.fromWilayaId} في ${booking.pickupTime}`,
        type: NotificationType.BOOKING_REMINDER,
        category: NotificationCategory.BOOKING,
        priority: reminderType === 'pickup' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
        relatedId: bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          reminderType,
          passengerName,
          passengerPhone: passenger.phone,
          departureTime: trip.departureTime,
          audience: 'driver'
        }
      });
      notifications.push(driverNotification);

      return notifications;
    } catch (error) {
      console.error('Error in notifyBookingReminder:', error);
      throw error;
    }
  }

  // === TRIP NOTIFICATIONS ===
  
  // New trip creation notification
  static async notifyTripCreated(tripId: string, driverId: string) {
    try {
      const [trip, driver] = await Promise.all([
        this.getTripById(tripId),
        BrowserDatabaseService.getProfile(driverId)
      ]);

      if (!trip || !driver) {
        throw new Error('Trip or driver not found');
      }

      const notifications = [];
      const driverName = this.resolveProfileName(driver);

      // Notify driver about successful trip creation
      const driverNotification = await this.sendSmartNotification({
        userId: driverId,
        title: '✅ تم نشر رحلتك!',
        message: `تم نشر رحلتك بنجاح من ولاية ${trip.fromWilayaId} إلى ولاية ${trip.toWilayaId} بسعر ${trip.pricePerSeat} دج. ستتلقى إشعارات عند وجود حجوزات.`,
        type: NotificationType.TRIP_CREATED,
        category: NotificationCategory.TRIP,
        priority: NotificationPriority.MEDIUM,
        relatedId: tripId,
        relatedType: 'trip',
        metadata: {
          fromWilayaId: trip.fromWilayaId,
          toWilayaId: trip.toWilayaId,
          pricePerSeat: trip.pricePerSeat,
          availableSeats: trip.availableSeats
        }
      });
      notifications.push(driverNotification);

      // Notify admins about new trip
      const adminProfiles = await this.getAdminUsers();
      for (const admin of adminProfiles) {
        const isDeveloper = admin.role === 'developer';
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: isDeveloper ? '🔧 رحلة جديدة منشورة (مطور)' : '🚗 رحلة جديدة منشورة',
          message: isDeveloper
            ? `تنبيه مطور: ${driverName} أنشأ رحلة جديدة من ${trip.fromWilayaId} إلى ${trip.toWilayaId} بسعر ${trip.pricePerSeat} دج للمقعد.`
            : `السائق ${driverName} أنشأ رحلة جديدة من ولاية ${trip.fromWilayaId} إلى ولاية ${trip.toWilayaId} بسعر ${trip.pricePerSeat} دج للمقعد.`,
          type: NotificationType.TRIP_CREATED,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          relatedId: tripId,
          relatedType: 'trip',
          metadata: {
            driverId: driverId,
            driverName,
            revenue: trip.pricePerSeat * trip.availableSeats,
            audience: isDeveloper ? 'developer' : 'admin'
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyTripCreated:', error);
      throw error;
    }
  }

  // Trip cancellation notification
  static async notifyTripCancelled(tripId: string, driverId: string, reason?: string) {
    try {
      const [trip, driver] = await Promise.all([
        this.getTripById(tripId),
        BrowserDatabaseService.getProfile(driverId)
      ]);

      if (!trip || !driver) {
        throw new Error('Trip or driver not found');
      }

      // Get all bookings for this trip
      const allBookings = await BrowserDatabaseService.getAllBookings();
      const tripBookings = allBookings.filter(b => b.tripId === tripId);

      const notifications = [];
      const reasonText = reason ? ` السبب: ${reason}` : '';
      const driverName = this.resolveProfileName(driver);

      // Notify all passengers with bookings
      for (const booking of tripBookings) {
        if (booking.passengerId) {
          const passengerNotification = await this.sendSmartNotification({
            userId: booking.passengerId,
            title: '❌ تم إلغاء الرحلة',
            message: `نعتذر لإبلاغك بأن الرحلة من ولاية ${trip.fromWilayaId} إلى ولاية ${trip.toWilayaId} تم إلغاؤها.${reasonText} سيتم رد المبلغ بالكامل.`,
            type: NotificationType.TRIP_CANCELLED,
            category: NotificationCategory.TRIP,
            priority: NotificationPriority.HIGH,
            relatedId: tripId,
            relatedType: 'trip',
            metadata: {
              bookingId: booking.id,
              refundAmount: booking.totalAmount,
              reason: reason,
              driverName,
              audience: 'passenger'
            }
          });
          notifications.push(passengerNotification);
        }
      }

      // Notify admins
      const adminProfiles = await this.getAdminUsers();
      for (const admin of adminProfiles) {
        const isDeveloper = admin.role === 'developer';
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: isDeveloper ? '🔧 رحلة ملغاة - مراجعة تقنية' : '❌ رحلة ملغاة',
          message: isDeveloper
            ? `تنبيه مطور: ${driverName} ألغى رحلة ${tripId} وكان بها ${tripBookings.length} حجوزات.${reasonText}`
            : `السائق ${driverName} ألغى رحلة ${tripId} مع ${tripBookings.length} حجز.${reasonText}`,
          type: NotificationType.TRIP_CANCELLED,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.HIGH,
          relatedId: tripId,
          relatedType: 'trip',
          metadata: {
            affectedBookings: tripBookings.length,
            refundsRequired: tripBookings.length,
            reason: reason,
            driverName,
            audience: isDeveloper ? 'developer' : 'admin'
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyTripCancelled:', error);
      throw error;
    }
  }

  // Trip starting notification
  static async notifyTripStarting(tripId: string) {
    try {
      const trip = await this.getTripById(tripId);
      if (!trip) throw new Error('Trip not found');

      const [driver, allBookings] = await Promise.all([
        BrowserDatabaseService.getProfile(trip.driverId),
        BrowserDatabaseService.getAllBookings()
      ]);

      const tripBookings = allBookings.filter(b => b.tripId === tripId);
      const notifications = [];
      const driverName = this.resolveProfileName(driver);

      // Notify driver
      const driverNotification = await this.sendSmartNotification({
        userId: trip.driverId,
        title: '🚗 وقت بدء الرحلة!',
        message: `حان وقت بدء رحلتك من ولاية ${trip.fromWilayaId} إلى ولاية ${trip.toWilayaId}. عدد الركاب: ${tripBookings.length}`,
        type: NotificationType.TRIP_STARTING,
        category: NotificationCategory.TRIP,
        priority: NotificationPriority.HIGH,
        relatedId: tripId,
        relatedType: 'trip',
        metadata: {
          passengerCount: tripBookings.length,
          departureTime: trip.departureTime
        }
      });
      notifications.push(driverNotification);

      // Notify all passengers
      for (const booking of tripBookings) {
        if (booking.passengerId) {
          const passengerNotification = await this.sendSmartNotification({
            userId: booking.passengerId,
            title: '🚗 بدأت رحلتك!',
            message: `بدأت رحلتك مع السائق ${driverName}. رقم الهاتف: ${driver?.phone}`,
            type: NotificationType.TRIP_STARTING,
            category: NotificationCategory.TRIP,
            priority: NotificationPriority.HIGH,
            relatedId: tripId,
            relatedType: 'trip',
            metadata: {
              driverName,
              driverPhone: driver?.phone,
              departureTime: trip.departureTime,
              audience: 'passenger'
            }
          });
          notifications.push(passengerNotification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyTripStarting:', error);
      throw error;
    }
  }

  // === PAYMENT NOTIFICATIONS ===
  
  // Payment received notification
  static async notifyPaymentReceived(paymentData: {
    bookingId: number | string;
    amount: number;
    paymentMethod: string;
    payerId: string;
    recipientId: string;
  }) {
    try {
      const notifications = [];

      // Notify payer (passenger)
      const payerNotification = await this.sendSmartNotification({
        userId: paymentData.payerId,
        title: '✅ تم استلام الدفعة',
        message: `تم استلام دفعتك بمبلغ ${paymentData.amount} دج بنجاح عبر ${paymentData.paymentMethod}. رقم الحجز: #${paymentData.bookingId}`,
        type: NotificationType.PAYMENT_RECEIVED,
        category: NotificationCategory.PAYMENT,
        priority: NotificationPriority.MEDIUM,
        relatedId: paymentData.bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          transactionId: `TXN_${Date.now()}`
        }
      });
      notifications.push(payerNotification);

      // Notify recipient (driver)
      const recipientNotification = await this.sendSmartNotification({
        userId: paymentData.recipientId,
        title: '💰 تم استلام دفعة',
        message: `تم استلام دفعة بمبلغ ${paymentData.amount} دج من راكب في حجز #${paymentData.bookingId}. سيتم تحويل المبلغ إلى حسابك.`,
        type: NotificationType.PAYMENT_RECEIVED,
        category: NotificationCategory.PAYMENT,
        priority: NotificationPriority.MEDIUM,
        relatedId: paymentData.bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          amount: paymentData.amount,
          commission: paymentData.amount * 0.1, // 10% platform fee
          netAmount: paymentData.amount * 0.9
        }
      });
      notifications.push(recipientNotification);

      // Notify admins
      const adminProfiles = await this.getAdminUsers();
      for (const admin of adminProfiles) {
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: '💰 دفعة جديدة',
          message: `تم استلام دفعة ${paymentData.amount} دج للحجز #${paymentData.bookingId} عبر ${paymentData.paymentMethod}`,
          type: NotificationType.PAYMENT_RECEIVED,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          relatedId: paymentData.bookingId.toString(),
          relatedType: 'booking',
          metadata: {
            totalAmount: paymentData.amount,
            platformFee: paymentData.amount * 0.1,
            paymentMethod: paymentData.paymentMethod
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyPaymentReceived:', error);
      throw error;
    }
  }

  // Payment failed notification
  static async notifyPaymentFailed(paymentData: {
    bookingId: number | string;
    amount: number;
    paymentMethod: string;
    payerId: string;
    reason: string;
  }) {
    try {
      // Notify payer about failed payment
      const notification = await this.sendSmartNotification({
        userId: paymentData.payerId,
        title: '❌ فشل في الدفع',
        message: `فشلت عملية دفع ${paymentData.amount} دج للحجز #${paymentData.bookingId}. السبب: ${paymentData.reason}. يرجى المحاولة مرة أخرى.`,
        type: NotificationType.PAYMENT_FAILED,
        category: NotificationCategory.PAYMENT,
        priority: NotificationPriority.HIGH,
        relatedId: paymentData.bookingId.toString(),
        relatedType: 'booking',
        metadata: {
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          failureReason: paymentData.reason
        }
      });

      return [notification];
    } catch (error) {
      console.error('Error in notifyPaymentFailed:', error);
      throw error;
    }
  }

  // === SYSTEM & USER NOTIFICATIONS ===
  
  // Welcome notification for new users
  static async notifyWelcomeUser(userId: string, userRole: string) {
    try {
      const user = await BrowserDatabaseService.getProfile(userId);
      if (!user) throw new Error('User not found');

      const userName = this.resolveProfileName(user);
      const roleMessages = {
        passenger: 'مرحباً بك في منصة مشاركة الركوب! يمكنك الآن البحث عن رحلات وحجز مقاعد بسهولة.',
        driver: 'مرحباً بك كسائق في DZ Taxi! يمكنك الآن إنشاء الرحلات ومشاركة مقاعدك مع الراكبين.',
        admin: 'مرحباً بك في لوحة إدارة DZ Taxi. يمكنك إدارة النظام بالكامل.',
        developer: 'مرحباً بك في لوحة المطور. يمكنك مراقبة التكاملات ومتابعة النظام بدقة.'
      };

      const notification = await this.sendSmartNotification({
        userId,
        title: `مرحباً بك يا ${userName}! 🎉`,
        message: roleMessages[userRole as keyof typeof roleMessages] || roleMessages.passenger,
        type: NotificationType.ACCOUNT_VERIFIED,
        category: NotificationCategory.USER,
        priority: NotificationPriority.MEDIUM,
        metadata: {
          userRole,
          welcomeType: 'new_user',
          registrationDate: new Date().toISOString(),
          displayName: userName
        }
      });

      return notification;
    } catch (error) {
      console.error('Error in notifyWelcomeUser:', error);
      throw error;
    }
  }

  // New user registration notification for admins
  static async notifyNewUserRegistration(data: {
    userId: string;
    userRole: 'driver' | 'passenger' | 'admin' | 'developer';
    userName: string;
    userEmail: string;
  }) {
    try {
      const notifications = [];

      // Get all admin users
      const adminProfiles = await this.getAdminUsers();

      const roleEmojis = {
        driver: '🚗',
        passenger: '👤',
        admin: '🛡️',
        developer: '🛠️'
      };

      for (const admin of adminProfiles) {
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: `${roleEmojis[data.userRole]} مستخدم جديد`,
          message: `انضم ${data.userName} (ك${data.userRole === 'driver' ? 'سائق' : data.userRole === 'passenger' ? 'راكب' : data.userRole === 'developer' ? 'مطور' : 'مدير'}) إلى المنصة. البريد: ${data.userEmail}`,
          type: NotificationType.USER_REGISTRATION,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          relatedId: data.userId,
          relatedType: 'user',
          metadata: {
            userRole: data.userRole,
            userName: data.userName,
            userEmail: data.userEmail,
            registrationDate: new Date().toISOString(),
            audience: admin.role === 'developer' ? 'developer' : 'admin'
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyNewUserRegistration:', error);
      throw error;
    }
  }

  // Account verification notification
  static async notifyAccountVerified(userId: string) {
    try {
      return await this.sendSmartNotification({
        userId: userId,
        title: '✅ تم تأكيد حسابك',
        message: 'تهانينا! تم تأكيد حسابك بنجاح. يمكنك الآن الوصول إلى جميع ميزات المنصة.',
        type: NotificationType.ACCOUNT_VERIFIED,
        category: NotificationCategory.ACCOUNT,
        priority: NotificationPriority.MEDIUM,
        relatedId: userId,
        relatedType: 'user'
      });
    } catch (error) {
      console.error('Error in notifyAccountVerified:', error);
      throw error;
    }
  }

  // Driver approval notification
  static async notifyDriverApproved(driverId: string) {
    try {
      return await this.sendSmartNotification({
        userId: driverId,
        title: '🎉 تم قبول طلبك للقيادة!',
        message: 'تهانينا! تم قبول طلبك لتصبح سائقاً في منصتنا. يمكنك الآن إنشاء رحلات واستقبال حجوزات.',
        type: NotificationType.DRIVER_APPROVED,
        category: NotificationCategory.ACCOUNT,
        priority: NotificationPriority.HIGH,
        relatedId: driverId,
        relatedType: 'user'
      });
    } catch (error) {
      console.error('Error in notifyDriverApproved:', error);
      throw error;
    }
  }

  // System maintenance notification
  static async notifySystemMaintenance(maintenanceData: {
    startTime: string;
    endTime: string;
    description: string;
  }) {
    try {
      const allProfiles = await BrowserDatabaseService.getAllProfiles();
      const notifications = [];

      for (const profile of allProfiles) {
        const notification = await this.sendSmartNotification({
          userId: profile.id,
          title: '🔧 صيانة مجدولة للنظام',
          message: `سيتم إجراء صيانة للنظام من ${maintenanceData.startTime} إلى ${maintenanceData.endTime}. ${maintenanceData.description}`,
          type: NotificationType.SYSTEM_MAINTENANCE,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.HIGH,
          relatedId: 'maintenance',
          relatedType: 'system',
          metadata: {
            startTime: maintenanceData.startTime,
            endTime: maintenanceData.endTime,
            description: maintenanceData.description
          }
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifySystemMaintenance:', error);
      throw error;
    }
  }

  // Security alert notification
  static async notifySecurityAlert(userId: string, alertData: {
    type: string;
    description: string;
    ipAddress?: string;
    location?: string;
  }) {
    try {
      return await this.sendSmartNotification({
        userId: userId,
        title: '⚠️ تنبيه أمني',
        message: `تم رصد نشاط مشبوه في حسابك: ${alertData.description}. إذا لم تكن أنت، يرجى تغيير كلمة المرور فوراً.`,
        type: NotificationType.SECURITY_ALERT,
        category: NotificationCategory.SAFETY,
        priority: NotificationPriority.CRITICAL,
        relatedId: userId,
        relatedType: 'user',
        metadata: {
          alertType: alertData.type,
          ipAddress: alertData.ipAddress,
          location: alertData.location,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in notifySecurityAlert:', error);
      throw error;
    }
  }

  // === VEHICLE NOTIFICATIONS ===
  
  // Vehicle added notification
  static async notifyVehicleAdded(data: {
    driverId: string;
    vehicleId: string;
    vehicleName: string;
    licensePlate: string;
  }) {
    try {
      const notification = await this.sendSmartNotification({
        userId: data.driverId,
        title: '🚗 تم إضافة مركبتك بنجاح!',
        message: `تم إضافة مركبة ${data.vehicleName} (لوحة: ${data.licensePlate}) بنجاح. يمكنك الآن استخدامها في رحلاتك.`,
        type: NotificationType.VEHICLE_APPROVED,
        category: NotificationCategory.ACCOUNT,
        priority: NotificationPriority.MEDIUM,
        relatedId: data.vehicleId,
        relatedType: 'vehicle',
        metadata: {
          vehicleName: data.vehicleName,
          licensePlate: data.licensePlate
        }
      });

      return notification;
    } catch (error) {
      console.error('Error in notifyVehicleAdded:', error);
      throw error;
    }
  }

  // Admin notification for new vehicle
  static async notifyAdminNewVehicle(data: {
    driverId: string;
    driverName: string;
    vehicleId: string;
    vehicleDetails: string;
  }) {
    try {
      const notifications = [];
      const adminProfiles = await this.getAdminUsers();

      for (const admin of adminProfiles) {
        const adminNotification = await this.sendSmartNotification({
          userId: admin.id,
          title: '🚗 مركبة جديدة',
          message: `أضاف السائق ${data.driverName} مركبة جديدة: ${data.vehicleDetails}. يمكنك مراجعتها في لوحة الإدارة.`,
          type: NotificationType.DOCUMENT_REQUIRED,
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          relatedId: data.vehicleId,
          relatedType: 'vehicle',
          metadata: {
            driverId: data.driverId,
            driverName: data.driverName,
            vehicleDetails: data.vehicleDetails
          }
        });
        notifications.push(adminNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error in notifyAdminNewVehicle:', error);
      throw error;
    }
  }

  // Vehicle status update notification
  static async notifyVehicleStatusUpdate(data: {
    driverId: string;
    vehicleId: string;
    vehicleName: string;
    newStatus: 'active' | 'inactive' | 'pending_approval';
    reason?: string;
  }) {
    try {
      const statusMessages = {
        active: '✅ تم تفعيل مركبتك',
        inactive: '🚫 تم إلغاء تفعيل مركبتك',
        pending_approval: '⏳ مركبتك قيد المراجعة'
      };

      const statusDetails = {
        active: 'يمكنك الآن استخدام هذه المركبة في رحلاتك.',
        inactive: 'لن تتمكن من استخدام هذه المركبة في رحلات جديدة.',
        pending_approval: 'نحن نراجع بيانات مركبتك. سنخبرك بالنتيجة قريباً.'
      };

      const notification = await this.sendSmartNotification({
        userId: data.driverId,
        title: statusMessages[data.newStatus],
        message: `مركبة ${data.vehicleName}: ${statusDetails[data.newStatus]}${data.reason ? ` السبب: ${data.reason}` : ''}`,
        type: data.newStatus === 'active' ? NotificationType.VEHICLE_APPROVED : NotificationType.DOCUMENT_REQUIRED,
        category: NotificationCategory.ACCOUNT,
        priority: data.newStatus === 'inactive' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
        relatedId: data.vehicleId,
        relatedType: 'vehicle',
        metadata: {
          vehicleName: data.vehicleName,
          newStatus: data.newStatus,
          reason: data.reason
        }
      });

      return notification;
    } catch (error) {
      console.error('Error in notifyVehicleStatusUpdate:', error);
      throw error;
    }
  }

  // === HELPER METHODS ===
  
  // Get trip by ID
  static async getTripById(tripId: string) {
    try {
      const trips = await BrowserDatabaseService.getTrips();
      return trips.find(t => t.id === tripId) || null;
    } catch (error) {
      console.error('Error getting trip by ID:', error);
      return null;
    }
  }

  // Get booking by ID
  static async getBookingById(bookingId: number | string) {
    try {
      const bookings = await BrowserDatabaseService.getAllBookings();
      if (!bookings || !Array.isArray(bookings)) {
        console.error('No bookings found or invalid bookings data');
        return null;
      }
      
      // Convert bookingId to string for comparison since browser database uses string IDs
      const searchId = bookingId.toString();
      const foundBooking = bookings.find(b => b.id === searchId);
      
      return foundBooking || null;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      return null;
    }
  }

  // Get all admin users
  static async getAdminUsers() {
    try {
      const allProfiles = await BrowserDatabaseService.getAllProfiles();

      // Filter admin users
      const adminUsers = allProfiles.filter(profile => profile.role === 'admin' || profile.role === 'developer');

      // Remove potential duplicates by ID
      const uniqueById = new Map<string, typeof adminUsers[number]>();
      for (const profile of adminUsers) {
        if (!uniqueById.has(profile.id)) {
          uniqueById.set(profile.id, profile);
        }
      }

      // Return actual admin users only, don't create fake ones
      return Array.from(uniqueById.values());
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
      // Enhanced admin logging with more details
      const logEntry = {
        adminId: data.adminId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        details: data.details,
        timestamp: new Date().toISOString(),
        severity: this.getActionSeverity(data.action)
      };
      
      console.log('📝 Admin Action Log:', logEntry);
      
      // TODO: Store in actual admin logs table when available
      return logEntry;
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Get action severity for logging
  static getActionSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'booking_created': 'low',
      'booking_confirmed': 'low',
      'booking_cancelled': 'medium',
      'trip_created': 'low',
      'trip_cancelled': 'high',
      'payment_received': 'medium',
      'payment_failed': 'high',
      'user_suspended': 'critical',
      'security_alert': 'critical'
    };
    
    return severityMap[action] || 'low';
  }

}
