// Browser-based database using localStorage
// This replaces Prisma for browser compatibility

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  role: 'driver' | 'passenger' | 'admin' | 'developer';
  wilaya: string;
  commune: string;
  address: string;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean; // Add this line to mark demo accounts
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
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // Return default structure if no data exists
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
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
      // Return default structure if parsing fails
      return {
        profiles: [],
        vehicles: [],
        trips: [],
        bookings: [],
        notifications: [],
        systemSettings: []
      };
    }
  }

  private saveData(data: any) {
    try {
      // Ensure all required arrays exist
      const validatedData = {
        profiles: Array.isArray(data.profiles) ? data.profiles : [],
        vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
        trips: Array.isArray(data.trips) ? data.trips : [],
        bookings: Array.isArray(data.bookings) ? data.bookings : [],
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
        systemSettings: Array.isArray(data.systemSettings) ? data.systemSettings : []
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(validatedData));
      console.log('Data saved successfully to localStorage');
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
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
    console.log('Profile created:', profile);
    return profile;
  }

  async getProfile(id: string): Promise<Profile | null> {
    const data = this.getData();
    const profile = data.profiles.find((p: Profile) => p.id === id) || null;
    console.log('Getting profile by ID:', id, profile);
    return profile;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const data = this.getData();
    const profile = data.profiles.find((p: Profile) => p.email === email) || null;
    console.log('Getting profile by email:', email, profile);
    return profile;
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
    console.log('Profile updated:', data.profiles[index]);
    return data.profiles[index];
  }

  async deleteProfile(id: string): Promise<boolean> {
    const data = this.getData();
    const index = data.profiles.findIndex((p: Profile) => p.id === id);
    
    if (index === -1) return false;
    
    data.profiles.splice(index, 1);
    this.saveData(data);
    console.log('Profile deleted:', id);
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
    console.log('Vehicle created:', vehicle);
    return vehicle;
  }

  async getVehicles(): Promise<Vehicle[]> {
    const data = this.getData();
    console.log('Getting all vehicles:', data.vehicles);
    return data.vehicles;
  }

  async getVehiclesByDriver(driverId: string): Promise<Vehicle[]> {
    const data = this.getData();
    const vehicles = data.vehicles.filter((v: Vehicle) => v.driverId === driverId);
    console.log('Getting vehicles by driver:', driverId, vehicles);
    return vehicles;
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
    console.log('Vehicle updated:', data.vehicles[index]);
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
    console.log('Vehicle deleted:', id);
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
    console.log('Trip created:', trip);
    return trip;
  }

  async getTrips(): Promise<Trip[]> {
    const data = this.getData();
    console.log('Getting all trips:', data.trips);
    return data.trips;
  }

  async getTripsByDriver(driverId: string): Promise<Trip[]> {
    const data = this.getData();
    const trips = data.trips.filter((t: Trip) => t.driverId === driverId);
    console.log('Getting trips by driver:', driverId, trips);
    return trips;
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
    console.log('Trip updated:', data.trips[index]);
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
    console.log('Trip deleted:', id);
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
    console.log('Booking created:', booking);
    return booking;
  }

  async getBookingsByPassenger(passengerId: string): Promise<Booking[]> {
    const data = this.getData();
    const bookings = data.bookings.filter((b: Booking) => b.passengerId === passengerId);
    console.log('Getting bookings by passenger:', passengerId, bookings);
    return bookings;
  }

  async getBookingsByDriver(driverId: string): Promise<Booking[]> {
    const data = this.getData();
    const bookings = data.bookings.filter((b: Booking) => b.driverId === driverId);
    console.log('Getting bookings by driver:', driverId, bookings);
    return bookings;
  }

  async getAllBookings(): Promise<Booking[]> {
    const data = this.getData();
    console.log('Getting all bookings:', data.bookings);
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
    console.log('Booking updated:', data.bookings[index]);
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
    console.log('Notification created:', notification);
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const data = this.getData();
    const notifications = data.notifications
      .filter((n: Notification) => n.userId === userId)
      .sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    console.log('Getting notifications by user:', userId, notifications);
    return notifications;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const data = this.getData();
    const index = data.notifications.findIndex((n: Notification) => n.id === id);
    
    if (index === -1) return false;
    
    data.notifications[index].isRead = true;
    data.notifications[index].updatedAt = this.getCurrentTimestamp();
    this.saveData(data);
    console.log('Notification marked as read:', id);
    return true;
  }

  // System settings operations
  async updateSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    const data = this.getData();
    const existingIndex = data.systemSettings.findIndex((s: SystemSetting) => s.key === key);
    
    let setting: SystemSetting;
    if (existingIndex !== -1) {
      setting = {
        ...data.systemSettings[existingIndex],
        value,
        description,
        updatedAt: this.getCurrentTimestamp()
      };
      data.systemSettings[existingIndex] = setting;
    } else {
      setting = {
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
    console.log('System setting updated:', setting);
    return setting;
  }

  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    const data = this.getData();
    const setting = data.systemSettings.find((s: SystemSetting) => s.key === key) || null;
    console.log('Getting system setting:', key, setting);
    return setting;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    const data = this.getData();
    console.log('Initializing default data with existing data:', data);
    
    // Initialize system settings if not exists
    if (data.systemSettings.length === 0) {
      await this.updateSystemSetting('app_name', 'DZ Taxi', 'اسم التطبيق');
      await this.updateSystemSetting('app_version', '1.0.0', 'إصدار التطبيق');
      await this.updateSystemSetting('maintenance_mode', 'false', 'وضع الصيانة');
      // By default, do NOT seed demo data unless explicitly enabled from settings
      await this.updateSystemSetting('seed_demo_data', 'false', 'تفعيل إنشاء datos تجريبية تلقائياً');
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
        isDemo: true, // Mark as demo account
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
        isDemo: true, // Mark as demo account
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
        isDemo: true, // Mark as demo account
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
    
    // Log data to verify it's being saved
    console.log('Database initialized with data:', this.getData());
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    console.log('All data cleared from localStorage');
  }

  // Reset to default data (reinitialize with fresh data)
  async resetToDefaultData(): Promise<void> {
    await this.clearAllData();
    await this.initializeDefaultData();
  }
}

export const browserDatabase = new BrowserDatabase();