import { prisma } from './client';
import { wilayas } from '@/data/wilayas';

// Database service class for local SQLite operations
export class DatabaseService {
  // Profile operations
  static async createProfile(data: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    wilaya?: string;
    commune?: string;
    address?: string;
    isVerified?: boolean;
  }) {
    return await prisma.profile.create({
      data: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role || 'passenger',
        wilaya: data.wilaya,
        commune: data.commune,
        address: data.address,
        isVerified: data.isVerified !== undefined ? data.isVerified : data.role === 'admin',
      },
    });
  }

  static async getProfile(id: string) {
    return await prisma.profile.findUnique({
      where: { id },
    });
  }

  static async updateProfile(id: string, data: any) {
    return await prisma.profile.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  // Trip operations
  static async createTrip(data: {
    driverId: string;
    vehicleId?: string;
    fromWilayaId: number;
    toWilayaId: number;
    departureDate: string;
    departureTime: string;
    pricePerSeat: number;
    totalSeats: number;
    description?: string;
  }) {
    return await prisma.trip.create({
      data: {
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        fromWilayaId: data.fromWilayaId,
        toWilayaId: data.toWilayaId,
        departureDate: data.departureDate,
        departureTime: data.departureTime,
        pricePerSeat: data.pricePerSeat,
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats,
        description: data.description,
      },
    });
  }

  static async getTrips(driverId?: string) {
    return await prisma.trip.findMany({
      where: driverId ? { driverId } : {},
      include: {
        driver: true,
        vehicle: true,
        bookings: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTripById(id: string) {
    return await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
        bookings: true,
      },
    });
  }

  static async updateTrip(id: string, data: any) {
    return await prisma.trip.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  // Vehicle operations
  static async createVehicle(data: {
    driverId: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    seats: number;
  }) {
    return await prisma.vehicle.create({
      data: {
        driverId: data.driverId,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        licensePlate: data.licensePlate,
        seats: data.seats,
      },
    });
  }

  static async getVehicles(driverId?: string) {
    return await prisma.vehicle.findMany({
      where: driverId ? { driverId } : {},
      include: {
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getVehicleById(id: string) {
    return await prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: true,
      },
    });
  }

  static async updateVehicle(id: string, data: any) {
    return await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  // Booking operations
  static async createBooking(data: {
    pickupLocation: string;
    destinationLocation: string;
    passengerId?: string;
    driverId?: string;
    tripId?: string;
    seatsBooked?: number;
    totalAmount?: number;
    paymentMethod?: string;
    notes?: string;
    pickupTime?: string;
    specialRequests?: string;
  }) {
    return await prisma.booking.create({
      data: {
        pickupLocation: data.pickupLocation,
        destinationLocation: data.destinationLocation,
        passengerId: data.passengerId,
        driverId: data.driverId,
        tripId: data.tripId,
        seatsBooked: data.seatsBooked || 1,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod || 'cod',
        notes: data.notes,
        pickupTime: data.pickupTime,
        specialRequests: data.specialRequests,
      },
    });
  }

  static async getBookings(passengerId?: string, driverId?: string) {
    return await prisma.booking.findMany({
      where: {
        OR: [
          passengerId ? { passengerId } : {},
          driverId ? { driverId } : {},
        ].filter(Boolean),
      },
      include: {
        passenger: true,
        driver: true,
        trip: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBookingById(id: number) {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        passenger: true,
        driver: true,
        trip: true,
      },
    });
  }

  static async updateBooking(id: number, data: any) {
    return await prisma.booking.update({
      where: { id },
      data,
    });
  }

  // Notification operations
  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    relatedId?: string;
    priority?: string;
    actionUrl?: string;
  }) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        relatedId: data.relatedId,
      },
    });
  }

  static async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markNotificationAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // System settings operations
  static async getSystemSettings() {
    return await prisma.systemSetting.findMany();
  }

  static async getSystemSetting(key: string) {
    return await prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  static async updateSystemSetting(key: string, value: string, updatedBy?: string) {
    return await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        updatedBy,
        updatedAt: new Date(),
      },
      create: {
        key,
        value,
        updatedBy,
      },
    });
  }

  // Admin logs operations
  static async createAdminLog(data: {
    adminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    details?: any;
  }) {
    return await prisma.adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  }

  static async getAdminLogs(adminId?: string) {
    return await prisma.adminLog.findMany({
      where: adminId ? { adminId } : {},
      include: {
        admin: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Wilayas operations
  static async getWilayas() {
    return wilayas;
  }

  static async getWilayaById(id: number) {
    return wilayas.find(w => w.code === id.toString());
  }

  // Initialize default data
  static async initializeDefaultData() {
    // Create default system settings
    const defaultSettings = [
      { key: 'site_name', value: '"DZ Taxi"', description: 'اسم الموقع' },
      { key: 'site_description', value: '"أفضل خدمة نقل في الجزائر"', description: 'وصف الموقع' },
      { key: 'support_phone', value: '"+213 555 123 456"', description: 'رقم الدعم' },
      { key: 'support_email', value: '"support@dztaxi.dz"', description: 'بريد الدعم' },
      { key: 'default_language', value: '"ar"', description: 'اللغة الافتراضية' },
      { key: 'enable_notifications', value: 'true', description: 'تفعيل الإشعارات' },
      { key: 'enable_sms', value: 'true', description: 'تفعيل رسائل SMS' },
      { key: 'enable_email', value: 'true', description: 'تفعيل رسائل البريد' },
      { key: 'maintenance_mode', value: 'false', description: 'وضع الصيانة' },
      { key: 'registration_enabled', value: 'true', description: 'تفعيل التسجيل' },
      { key: 'driver_approval_required', value: 'true', description: 'مراجعة طلبات السائقين' },
      { key: 'min_booking_price', value: '500', description: 'الحد الأدنى للسعر' },
      { key: 'max_booking_price', value: '10000', description: 'الحد الأقصى للسعر' },
      { key: 'commission_rate', value: '10', description: 'عمولة الموقع' },
      { key: 'cancellation_fee', value: '200', description: 'رسوم الإلغاء' },
    ];

    for (const setting of defaultSettings) {
      await this.updateSystemSetting(setting.key, setting.value);
    }

    console.log('Default data initialized successfully');
  }
}
