import { browserDatabase } from './browserDatabase';
import { wilayas } from '@/data/wilayas';

// Browser-based database service
export class BrowserDatabaseService {
  // Profile operations
  static async createProfile(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone?: string;
    role: 'driver' | 'passenger' | 'admin';
    wilaya?: string;
    commune?: string;
    address?: string;
    isVerified?: boolean;
  }) {
    return await browserDatabase.createProfile({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName,
      phone: data.phone || null,
      role: data.role,
      wilaya: data.wilaya || 'الجزائر',
      commune: data.commune || 'غير محدد',
      address: data.address || 'غير محدد',
      isVerified: data.isVerified || false,
    });
  }

  static async getProfile(id: string) {
    return await browserDatabase.getProfile(id);
  }

  static async getProfileByEmail(email: string) {
    return await browserDatabase.getProfileByEmail(email);
  }

  static async updateProfile(id: string, data: any) {
    return await browserDatabase.updateProfile(id, data);
  }

  static async deleteProfile(id: string) {
    return await browserDatabase.deleteProfile(id);
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
    return await browserDatabase.createVehicle({
      driverId: data.driverId,
      make: data.make,
      model: data.model,
      year: data.year,
      color: data.color,
      licensePlate: data.licensePlate,
      seats: data.seats,
      isActive: true,
    });
  }

  static async getVehicles(driverId?: string) {
    if (driverId) {
      return await browserDatabase.getVehiclesByDriver(driverId);
    }
    return await browserDatabase.getVehicles();
  }

  static async getVehiclesByDriver(driverId: string) {
    return await browserDatabase.getVehiclesByDriver(driverId);
  }

  static async getVehicleById(id: string) {
    const data = await browserDatabase.getData();
    return data.vehicles.find((v: any) => v.id === id) || null;
  }

  static async updateVehicle(id: string, data: any) {
    return await browserDatabase.updateVehicle(id, data);
  }

  static async deleteVehicle(id: string) {
    return await browserDatabase.deleteVehicle(id);
  }

  // Trip operations
  static async createTrip(data: {
    driverId: string;
    vehicleId: string;
    fromWilayaId: number;
    toWilayaId: number;
    departureDate: string;
    departureTime: string;
    pricePerSeat: number;
    totalSeats: number;
    description?: string;
  }) {
    return await browserDatabase.createTrip({
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      fromWilayaId: data.fromWilayaId,
      toWilayaId: data.toWilayaId,
      fromWilayaName: this.getWilayaName(data.fromWilayaId),
      toWilayaName: this.getWilayaName(data.toWilayaId),
      departureDate: data.departureDate,
      departureTime: data.departureTime,
      pricePerSeat: data.pricePerSeat,
      totalSeats: data.totalSeats,
      availableSeats: data.totalSeats,
      description: data.description,
      status: 'scheduled',
    });
  }

  static async getTrips() {
    return await browserDatabase.getTrips();
  }

  static async getTripsByDriver(driverId: string) {
    return await browserDatabase.getTripsByDriver(driverId);
  }

  static async updateTrip(id: string, data: any) {
    return await browserDatabase.updateTrip(id, data);
  }

  static async deleteTrip(id: string) {
    return await browserDatabase.deleteTrip(id);
  }

  // Booking operations
  static async createBooking(data: {
    passengerId: string;
    driverId: string;
    tripId: string;
    pickupLocation: string;
    destinationLocation: string;
    seatsBooked: number;
    totalAmount: number;
    paymentMethod: 'cod' | 'bpm';
    notes?: string;
    pickupTime: string;
    specialRequests?: string;
    status?: string;
  }) {
    return await browserDatabase.createBooking({
      passengerId: data.passengerId,
      driverId: data.driverId,
      tripId: data.tripId,
      pickupLocation: data.pickupLocation,
      destinationLocation: data.destinationLocation,
      seatsBooked: data.seatsBooked,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      pickupTime: data.pickupTime,
      specialRequests: data.specialRequests,
      status: (data.status as any) || 'pending',
    });
  }

  static async getBookings(passengerId?: string, driverId?: string) {
    if (passengerId && driverId) {
      // Get bookings for both passenger and driver
      const passengerBookings = await browserDatabase.getBookingsByPassenger(passengerId);
      const driverBookings = await browserDatabase.getBookingsByDriver(driverId);
      return [...passengerBookings, ...driverBookings];
    } else if (passengerId) {
      return await browserDatabase.getBookingsByPassenger(passengerId);
    } else if (driverId) {
      return await browserDatabase.getBookingsByDriver(driverId);
    } else {
      return await browserDatabase.getAllBookings();
    }
  }

  static async getBookingsByPassenger(passengerId: string) {
    return await browserDatabase.getBookingsByPassenger(passengerId);
  }

  static async getBookingsByDriver(driverId: string) {
    return await browserDatabase.getBookingsByDriver(driverId);
  }

  static async updateBooking(id: number, data: any) {
    return await browserDatabase.updateBooking(id.toString(), data);
  }

  // Notification operations
  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: 'booking' | 'trip' | 'system' | 'payment';
  }) {
    return await browserDatabase.createNotification({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
    });
  }

  static async getNotifications(userId: string) {
    return await browserDatabase.getNotifications(userId);
  }

  static async markNotificationAsRead(id: string) {
    return await browserDatabase.markNotificationAsRead(id);
  }

  // System settings operations
  static async updateSystemSetting(key: string, value: string, description?: string) {
    return await browserDatabase.updateSystemSetting(key, value, description);
  }

  static async getSystemSetting(key: string) {
    return await browserDatabase.getSystemSetting(key);
  }

  // Initialize default data
  static async initializeDefaultData() {
    return await browserDatabase.initializeDefaultData();
  }

  static async setSeedDemoData(enabled: boolean) {
    return await browserDatabase.updateSystemSetting('seed_demo_data', enabled ? 'true' : 'false', 'تفعيل إنشاء بيانات تجريبية تلقائياً');
  }

  // Statistics for admin dashboard
  static async getStats() {
    const trips = await browserDatabase.getTrips();
    const profiles = await browserDatabase.getData();
    const bookings = await browserDatabase.getData();
    
    return {
      totalTrips: trips.length,
      totalDrivers: profiles.profiles.filter((p: any) => p.role === 'driver').length,
      totalPassengers: profiles.profiles.filter((p: any) => p.role === 'passenger').length,
      totalBookings: bookings.bookings.length,
      activeTrips: trips.filter((t: any) => t.status === 'scheduled').length,
      completedTrips: trips.filter((t: any) => t.status === 'completed').length,
    };
  }

  // Get wilaya name by ID
  static getWilayaName(wilayaId: number): string {
    const wilaya = wilayas.find(w => w.code === wilayaId.toString().padStart(2, '0'));
    return wilaya ? wilaya.name : `ولاية ${wilayaId}`;
  }

  // Get all profiles
  static async getAllProfiles() {
    const data = await browserDatabase.getData();
    return data.profiles;
  }

  // Get all vehicles
  static async getAllVehicles() {
    const data = await browserDatabase.getData();
    return data.vehicles;
  }

  // Get all bookings
  static async getAllBookings() {
    const data = await browserDatabase.getData();
    return data.bookings;
  }

  // Clear all data (for testing)
  static async clearAllData() {
    return await browserDatabase.clearAllData();
  }

  // Get wilayas (Algerian provinces)
  static async getWilayas() {
    const data = await browserDatabase.getData();
    return data.wilayas;
  }

  // Get wilaya by ID
  static async getWilayaById(id: number) {
    const data = await browserDatabase.getData();
    return data.wilayas.find((wilaya: any) => wilaya.id === id);
  }

  // Utility methods
  static async clearAllData() {
    return await browserDatabase.clearAllData();
  }

  static async resetToDefaultData() {
    return await browserDatabase.resetToDefaultData();
  }
}
