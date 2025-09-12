// Browser-based database using localStorage
// This replaces Prisma for browser compatibility

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  role: 'driver' | 'passenger' | 'admin';
  wilaya: string;
  commune: string;
  address: string;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seats: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  fromWilayaId: number;
  toWilayaId: number;
  fromWilayaName?: string;
  toWilayaName?: string;
  isDemo?: boolean;
  departureDate: string;
  departureTime: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  description?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
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
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'trip' | 'system' | 'payment';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class BrowserDatabase {
  private storageKey = 'dz_taxi_database';

  public getData() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return {
        profiles: [],
        vehicles: [],
        trips: [],
        bookings: [],
        notifications: [],
        systemSettings: []
      };
    }
    return JSON.parse(data);
  }

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp() {
    return new Date().toISOString();
  }

  // Profile operations
  async createProfile(profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const data = this.getData();
    const profile: Profile = {
      ...profileData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    
    data.profiles.push(profile);
    this.saveData(data);
    return profile;
  }

  async getProfile(id: string): Promise<Profile | null> {
    const data = this.getData();
    return data.profiles.find((p: Profile) => p.id === id) || null;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const data = this.getData();
    return data.profiles.find((p: Profile) => p.email === email) || null;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const data = this.getData();
    const index = data.profiles.findIndex((p: Profile) => p.id === id);
    
    if (index === -1) return null;
    
    data.profiles[index] = {
      ...data.profiles[index],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    
    this.saveData(data);
    return data.profiles[index];
  }

  async deleteProfile(id: string): Promise<boolean> {
    const data = this.getData();
    const index = data.profiles.findIndex((p: Profile) => p.id === id);
    
    if (index === -1) return false;
    
    data.profiles.splice(index, 1);
    this.saveData(data);
    return true;
  }

  // Vehicle operations
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const data = this.getData();
    const vehicle: Vehicle = {
      ...vehicleData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    
    data.vehicles.push(vehicle);
    this.saveData(data);
    return vehicle;
  }

  async getVehicles(): Promise<Vehicle[]> {
    const data = this.getData();
    return data.vehicles;
  }

  async getVehiclesByDriver(driverId: string): Promise<Vehicle[]> {
    const data = this.getData();
    return data.vehicles.filter((v: Vehicle) => v.driverId === driverId);
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const data = this.getData();
    const index = data.vehicles.findIndex((v: Vehicle) => v.id === id);
    
    if (index === -1) return null;
    
    data.vehicles[index] = {
      ...data.vehicles[index],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    
    this.saveData(data);
    return data.vehicles[index];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const data = this.getData();
    const index = data.vehicles.findIndex((v: Vehicle) => v.id === id);
    
    if (index === -1) return false;
    
    // Remove the vehicle
    data.vehicles.splice(index, 1);
    
    // Also remove any trips for this vehicle
    data.trips = data.trips.filter((t: Trip) => t.vehicleId !== id);
    
    this.saveData(data);
    return true;
  }

  // Trip operations
  async createTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const data = this.getData();
    const trip: Trip = {
      ...tripData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    
    data.trips.push(trip);
    this.saveData(data);
    return trip;
  }

  async getTrips(): Promise<Trip[]> {
    const data = this.getData();
    return data.trips;
  }

  async getTripsByDriver(driverId: string): Promise<Trip[]> {
    const data = this.getData();
    return data.trips.filter((t: Trip) => t.driverId === driverId);
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
    const data = this.getData();
    const index = data.trips.findIndex((t: Trip) => t.id === id);
    
    if (index === -1) return null;
    
    data.trips[index] = {
      ...data.trips[index],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    
    this.saveData(data);
    return data.trips[index];
  }

  async deleteTrip(id: string): Promise<boolean> {
    const data = this.getData();
    const index = data.trips.findIndex((t: Trip) => t.id === id);
    
    if (index === -1) return false;
    
    // Remove the trip
    data.trips.splice(index, 1);
    
    // Also remove any bookings for this trip
    data.bookings = data.bookings.filter((b: Booking) => b.tripId !== id);
    
    this.saveData(data);
    return true;
  }

  // Booking operations
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const data = this.getData();
    const booking: Booking = {
      ...bookingData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    
    data.bookings.push(booking);
    this.saveData(data);
    return booking;
  }

  async getBookingsByPassenger(passengerId: string): Promise<Booking[]> {
    const data = this.getData();
    return data.bookings.filter((b: Booking) => b.passengerId === passengerId);
  }

  async getBookingsByDriver(driverId: string): Promise<Booking[]> {
    const data = this.getData();
    return data.bookings.filter((b: Booking) => b.driverId === driverId);
  }

  async getAllBookings(): Promise<Booking[]> {
    const data = this.getData();
    return data.bookings;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const data = this.getData();
    const index = data.bookings.findIndex((b: Booking) => b.id === id);
    
    if (index === -1) return null;
    
    data.bookings[index] = {
      ...data.bookings[index],
      ...updates,
      updatedAt: this.getCurrentTimestamp()
    };
    
    this.saveData(data);
    return data.bookings[index];
  }

  // Notification operations
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const data = this.getData();
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    };
    
    data.notifications.push(notification);
    this.saveData(data);
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const data = this.getData();
    return data.notifications
      .filter((n: Notification) => n.userId === userId)
      .sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const data = this.getData();
    const index = data.notifications.findIndex((n: Notification) => n.id === id);
    
    if (index === -1) return false;
    
    data.notifications[index].isRead = true;
    data.notifications[index].updatedAt = this.getCurrentTimestamp();
    this.saveData(data);
    return true;
  }

  // System settings operations
  async updateSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    const data = this.getData();
    const existingIndex = data.systemSettings.findIndex((s: SystemSetting) => s.key === key);
    
    if (existingIndex !== -1) {
      data.systemSettings[existingIndex] = {
        ...data.systemSettings[existingIndex],
        value,
        description,
        updatedAt: this.getCurrentTimestamp()
      };
    } else {
      const setting: SystemSetting = {
        id: this.generateId(),
        key,
        value,
        description,
        createdAt: this.getCurrentTimestamp(),
        updatedAt: this.getCurrentTimestamp()
      };
      data.systemSettings.push(setting);
    }
    
    this.saveData(data);
    return data.systemSettings[existingIndex !== -1 ? existingIndex : data.systemSettings.length - 1];
  }

  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    const data = this.getData();
    return data.systemSettings.find((s: SystemSetting) => s.key === key) || null;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    const data = this.getData();
    
    // Initialize system settings if not exists
    if (data.systemSettings.length === 0) {
      await this.updateSystemSetting('app_name', 'DZ Taxi', 'اسم التطبيق');
      await this.updateSystemSetting('app_version', '1.0.0', 'إصدار التطبيق');
      await this.updateSystemSetting('maintenance_mode', 'false', 'وضع الصيانة');
      // By default, do NOT seed demo data unless explicitly enabled from settings
      await this.updateSystemSetting('seed_demo_data', 'false', 'تفعيل إنشاء بيانات تجريبية تلقائياً');
    }
    
    // Respect demo seeding flag
    const seedSetting = await this.getSystemSetting('seed_demo_data');
    const shouldSeedDemo = seedSetting?.value === 'true';

    // Create test accounts if not exist AND demo seeding is enabled
    if (shouldSeedDemo && data.profiles.length === 0) {
      const driverProfile = await this.createProfile({
        email: 'driver@test.com',
        firstName: 'أحمد',
        lastName: 'السائق',
        fullName: 'أحمد السائق',
        phone: '+213 555 123 456',
        role: 'driver',
        wilaya: 'الجزائر',
        commune: 'الجزائر الوسطى',
        address: 'شارع ديدوش مراد، الجزائر',
        isVerified: true,
      });

      const passengerProfile = await this.createProfile({
        email: 'passenger@test.com',
        firstName: 'فاطمة',
        lastName: 'الراكبة',
        fullName: 'فاطمة الراكبة',
        phone: '+213 555 789 012',
        role: 'passenger',
        wilaya: 'الجزائر',
        commune: 'الجزائر الوسطى',
        address: 'حي القبة، الجزائر',
        isVerified: true,
      });

      const adminProfile = await this.createProfile({
        email: 'admin@test.com',
        firstName: 'مدير',
        lastName: 'النظام',
        fullName: 'مدير النظام',
        phone: '+213 555 000 000',
        role: 'admin',
        wilaya: 'الجزائر',
        commune: 'الجزائر الوسطى',
        address: 'مقر الإدارة، الجزائر',
        isVerified: true,
      });

      // Create test vehicle for driver
      const testVehicle = await this.createVehicle({
        driverId: driverProfile.id,
        make: 'Renault',
        model: 'Symbol',
        year: 2020,
        color: 'أبيض',
        licensePlate: 'TEST-123-16',
        seats: 4,
        isActive: true,
      });

      // Create sample trips with future dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await this.createTrip({
        driverId: driverProfile.id,
        vehicleId: testVehicle.id,
        fromWilayaId: 16, // الجزائر
        toWilayaId: 31, // وهران
        fromWilayaName: 'الجزائر',
        toWilayaName: 'وهران',
        isDemo: true,
        departureDate: tomorrow.toISOString().split('T')[0],
        departureTime: '08:00',
        pricePerSeat: 1500,
        totalSeats: 4,
        availableSeats: 4,
        description: 'رحلة مريحة من الجزائر إلى وهران - مكيف هواء',
        status: 'scheduled',
      });

      await this.createTrip({
        driverId: driverProfile.id,
        vehicleId: testVehicle.id,
        fromWilayaId: 31, // وهران
        toWilayaId: 16, // الجزائر
        fromWilayaName: 'وهران',
        toWilayaName: 'الجزائر',
        isDemo: true,
        departureDate: dayAfterTomorrow.toISOString().split('T')[0],
        departureTime: '14:00',
        pricePerSeat: 1600,
        totalSeats: 4,
        availableSeats: 3,
        description: 'رحلة عودة من وهران إلى الجزائر',
        status: 'scheduled',
      });

      await this.createTrip({
        driverId: driverProfile.id,
        vehicleId: testVehicle.id,
        fromWilayaId: 16, // الجزائر
        toWilayaId: 35, // تيزي وزو
        fromWilayaName: 'الجزائر',
        toWilayaName: 'تيزي وزو',
        isDemo: true,
        departureDate: nextWeek.toISOString().split('T')[0],
        departureTime: '10:00',
        pricePerSeat: 800,
        totalSeats: 4,
        availableSeats: 2,
        description: 'رحلة قصيرة إلى تيزي وزو',
        status: 'scheduled',
      });
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  // Reset to default data (reinitialize with fresh data)
  async resetToDefaultData(): Promise<void> {
    await this.clearAllData();
    await this.initializeDefaultData();
  }
}

export const browserDatabase = new BrowserDatabase();
