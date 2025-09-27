import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { wilayas } from '@/data/wilayas';
import type { Profile as BrowserProfile } from './browserDatabase';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

const getWilayaNameById = (id: number) => {
  const wilaya = wilayas.find((w) => w.id === id);
  return wilaya ? wilaya.name : 'غير محدد';
};

type ProfileRow = Tables<'profiles'>;
type VehicleRow = Tables<'vehicles'>;
type TripRow = Tables<'trips'>;
type BookingRow = Tables<'bookings'>;
type NotificationRow = Tables<'notifications'>;
type SystemSettingRow = Tables<'system_settings'>;

const isNotificationsTableMissing = (error: any) => {
  if (!error) return false;
  const code = typeof error.code === 'string' ? error.code : undefined;
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  const details = typeof error.details === 'string' ? error.details.toLowerCase() : '';
  const combined = `${message} ${details}`;
  return code === '42P01' || combined.includes('relation "notifications" does not exist');
};

const logMissingNotificationsTable = (error: any) => {
  console.warn(
    'Supabase لم يجد جدول notifications. قم بتشغيل ملفات الهجرة داخل supabase/migrations (مثل 20250908220515_little_queen.sql و 20260201000000_full_supabase_support.sql) ثم أعد المحاولة.',
    error
  );
};

const mapProfile = (row: ProfileRow | null): BrowserProfile | null => {
  if (!row) return null;

  const firstName = row.first_name ?? '';
  const lastName = row.last_name ?? '';
  const fullName = row.full_name ?? `${firstName} ${lastName}`.trim();

  return {
    id: row.id,
    email: row.email ?? '',
    firstName,
    lastName,
    fullName: fullName || row.email || '',
    phone: row.phone ?? null,
    role: (row.role ?? 'passenger') as 'driver' | 'passenger' | 'admin' | 'developer',
    wilaya: row.wilaya ?? 'الجزائر',
    commune: row.commune ?? 'غير محدد',
    address: row.address ?? 'غير محدد',
    isVerified: row.is_verified ?? false,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    isDemo: false,
  };
};

const toProfileInsert = (data: any): TablesInsert<'profiles'> => ({
  id: data.id,
  email: data.email ?? null,
  first_name: data.firstName ?? null,
  last_name: data.lastName ?? null,
  full_name: data.fullName ?? null,
  phone: data.phone ?? null,
  role: data.role ?? 'passenger',
  avatar_url: data.avatarUrl ?? null,
  wilaya: data.wilaya ?? null,
  commune: data.commune ?? null,
  address: data.address ?? null,
  is_verified: data.isVerified ?? false,
  language: data.language ?? 'ar',
  created_at: data.createdAt ?? new Date().toISOString(),
  updated_at: data.updatedAt ?? new Date().toISOString(),
});

const mapVehicle = (row: VehicleRow | null) => {
  if (!row) return null;
  return {
    id: row.id,
    driverId: row.driver_id ?? '',
    make: row.make,
    model: row.model,
    year: row.year ?? new Date().getFullYear(),
    color: row.color ?? 'غير محدد',
    licensePlate: row.license_plate ?? 'غير محدد',
    seats: row.seats ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
};

const toVehicleInsert = (data: any): TablesInsert<'vehicles'> => ({
  driver_id: data.driverId ?? null,
  make: data.make,
  model: data.model,
  year: data.year ?? null,
  color: data.color ?? null,
  license_plate: data.licensePlate ?? null,
  seats: data.seats ?? null,
  is_active: data.isActive ?? true,
  created_at: data.createdAt ?? new Date().toISOString(),
  updated_at: data.updatedAt ?? new Date().toISOString(),
});

const mapTrip = (row: TripRow | null) => {
  if (!row) return null;
  const fromName = row.from_wilaya_name ?? getWilayaNameById(row.from_wilaya_id);
  const toName = row.to_wilaya_name ?? getWilayaNameById(row.to_wilaya_id);
  return {
    id: row.id,
    driverId: row.driver_id ?? '',
    vehicleId: row.vehicle_id ?? '',
    fromWilayaId: row.from_wilaya_id,
    toWilayaId: row.to_wilaya_id,
    fromWilayaName: fromName,
    toWilayaName: toName,
    departureDate: row.departure_date,
    departureTime: row.departure_time,
    pricePerSeat: typeof row.price_per_seat === 'number'
      ? row.price_per_seat
      : Number(row.price_per_seat ?? 0),
    totalSeats: row.total_seats,
    availableSeats: row.available_seats,
    description: row.description ?? undefined,
    status: (row.status ?? 'scheduled') as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    isDemo: row.is_demo ?? false,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
};

const toTripInsert = (data: any): TablesInsert<'trips'> => ({
  driver_id: data.driverId ?? null,
  vehicle_id: data.vehicleId ?? null,
  from_wilaya_id: data.fromWilayaId,
  to_wilaya_id: data.toWilayaId,
  from_wilaya_name: data.fromWilayaName ?? getWilayaNameById(data.fromWilayaId),
  to_wilaya_name: data.toWilayaName ?? getWilayaNameById(data.toWilayaId),
  departure_date: data.departureDate,
  departure_time: data.departureTime,
  price_per_seat: data.pricePerSeat,
  total_seats: data.totalSeats,
  available_seats: data.availableSeats ?? data.totalSeats,
  description: data.description ?? null,
  status: data.status ?? 'scheduled',
  is_demo: data.isDemo ?? false,
  created_at: data.createdAt ?? new Date().toISOString(),
  updated_at: data.updatedAt ?? new Date().toISOString(),
});

const mapBooking = (row: BookingRow | null) => {
  if (!row) return null;
  const totalAmount = typeof row.total_amount === 'number'
    ? row.total_amount
    : Number(row.total_amount ?? 0);
  return {
    id: row.id.toString(),
    passengerId: row.passenger_id ?? '',
    driverId: row.driver_id ?? '',
    tripId: row.trip_id ?? '',
    pickupLocation: row.pickup_location,
    destinationLocation: row.destination_location,
    seatsBooked: row.seats_booked ?? 1,
    totalAmount,
    paymentMethod: (row.payment_method ?? 'cod') as 'cod' | 'bpm',
    notes: row.notes ?? undefined,
    pickupTime: row.pickup_time ?? '',
    specialRequests: row.special_requests ?? undefined,
    status: (row.status ?? 'pending') as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
};

const toBookingInsert = (data: any): TablesInsert<'bookings'> => ({
  pickup_location: data.pickupLocation,
  destination_location: data.destinationLocation,
  passenger_id: data.passengerId ?? null,
  driver_id: data.driverId ?? null,
  trip_id: data.tripId ?? null,
  seats_booked: data.seatsBooked ?? 1,
  total_amount: data.totalAmount ?? null,
  payment_method: data.paymentMethod ?? 'cod',
  notes: data.notes ?? null,
  pickup_time: data.pickupTime ?? null,
  special_requests: data.specialRequests ?? null,
  status: data.status ?? 'pending',
  created_at: data.createdAt ?? new Date().toISOString(),
  updated_at: data.updatedAt ?? new Date().toISOString(),
});

const mapNotification = (row: NotificationRow | null) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: (row.type ?? 'system') as 'booking' | 'trip' | 'system' | 'payment',
    isRead: row.is_read ?? false,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
};

const mapSystemSetting = (row: SystemSettingRow | null) => {
  if (!row) return null;
  const value = typeof row.value === 'string' ? row.value : JSON.stringify(row.value ?? '');
  return {
    id: row.id,
    key: row.key,
    value,
    description: row.description ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
};

const parseSettingValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

class SupabaseDatabaseService {
  // Profile operations
  static async createProfile(data: any) {
    if (!data.id) {
      throw new Error('Supabase profiles require an id from auth.users');
    }

    const payload = toProfileInsert(data);
    const { data: result, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile in Supabase:', error);
      throw error;
    }

    return mapProfile(result);
  }

  static async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return mapProfile(data);
  }

  static async getProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile by email:', error);
      throw error;
    }

    return mapProfile(data);
  }

  static async updateProfile(id: string, data: TablesUpdate<'profiles'>) {
    const { data: result, error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return mapProfile(result);
  }

  static async deleteProfile(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }

    return true;
  }

  // Vehicle operations
  static async createVehicle(data: any) {
    console.log('DEBUG: Creating vehicle with data:', data);
    const payload = toVehicleInsert(data);
    console.log('DEBUG: Vehicle payload for Supabase:', payload);
    
    const { data: result, error } = await supabase
      .from('vehicles')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }

    console.log('DEBUG: Vehicle created successfully:', result);
    return mapVehicle(result);
  }

  static async getVehicles(driverId?: string) {
    let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }

    return (data ?? []).map(mapVehicle).filter(Boolean);
  }

  static async getVehiclesByDriver(driverId: string) {
    return this.getVehicles(driverId);
  }

  static async getVehicleById(id: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }

    return mapVehicle(data);
  }

  static async updateVehicle(id: string, data: TablesUpdate<'vehicles'>) {
    const { data: result, error } = await supabase
      .from('vehicles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }

    return mapVehicle(result);
  }

  static async deleteVehicle(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }

    return true;
  }

  // Trip operations
  static async createTrip(data: any) {
    const payload = toTripInsert(data);
    const { data: result, error } = await supabase
      .from('trips')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating trip:', error);
      throw error;
    }

    return mapTrip(result);
  }

  static async getTrips(driverId?: string) {
    let query = supabase
      .from('trips')
      .select('*')
      .order('departure_date', { ascending: true });

    if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }

    return (data ?? []).map(mapTrip).filter(Boolean);
  }

  static async getTripsByDriver(driverId: string) {
    return this.getTrips(driverId);
  }

  static async getAvailableTrips() {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .gt('available_seats', 0)
      .eq('status', 'scheduled')
      .order('departure_date', { ascending: true });

    if (error) {
      console.error('Error fetching available trips:', error);
      throw error;
    }

    return (data ?? []).map(mapTrip).filter(Boolean);
  }

  static async getTripsWithDetails(driverId?: string) {
    const trips = await this.getTrips(driverId);

    if (trips.length === 0) return [];

    const driverIds = Array.from(new Set(trips.map((trip) => trip.driverId).filter(Boolean)));
    const vehicleIds = Array.from(new Set(trips.map((trip) => trip.vehicleId).filter(Boolean)));

    const [drivers, vehicles] = await Promise.all([
      driverIds.length
        ? supabase
            .from('profiles')
            .select('*')
            .in('id', driverIds)
        : Promise.resolve({ data: [] as ProfileRow[], error: null }),
      vehicleIds.length
        ? supabase
            .from('vehicles')
            .select('*')
            .in('id', vehicleIds)
        : Promise.resolve({ data: [] as VehicleRow[], error: null }),
    ]);

    if (drivers.error) {
      console.error('Error fetching trip drivers:', drivers.error);
      throw drivers.error;
    }

    if (vehicles.error) {
      console.error('Error fetching trip vehicles:', vehicles.error);
      throw vehicles.error;
    }

    const driverMap = new Map((drivers.data ?? []).map((row) => [row.id, mapProfile(row)]));
    const vehicleMap = new Map((vehicles.data ?? []).map((row) => [row.id, mapVehicle(row)]));

    return trips.map((trip) => ({
      ...trip,
      driver: trip.driverId ? driverMap.get(trip.driverId) ?? null : null,
      vehicle: trip.vehicleId ? vehicleMap.get(trip.vehicleId) ?? null : null,
    }));
  }

  static async updateTrip(id: string, data: TablesUpdate<'trips'>) {
    const { data: result, error } = await supabase
      .from('trips')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trip:', error);
      throw error;
    }

    return mapTrip(result);
  }

  static async deleteTrip(id: string) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }

    return true;
  }

  static async getTripById(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching trip by id:', error);
      throw error;
    }

    return mapTrip(data);
  }

  // Booking operations
  static async createBooking(data: any) {
    const payload = toBookingInsert(data);
    const { data: result, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    if (data.tripId) {
      await this.updateTripAvailability(data.tripId);
    }

    return mapBooking(result);
  }

  static async getBookings(passengerId?: string, driverId?: string) {
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (passengerId) {
      query = query.eq('passenger_id', passengerId);
    }

    if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    return (data ?? []).map(mapBooking).filter(Boolean);
  }

  static async getBookingsWithDetails(passengerId?: string, driverId?: string) {
    const bookings = await this.getBookings(passengerId, driverId);

    if (bookings.length === 0) return [];

    const passengerIds = Array.from(new Set(bookings.map((booking) => booking.passengerId).filter(Boolean)));
    const driverIds = Array.from(new Set(bookings.map((booking) => booking.driverId).filter(Boolean)));
    const tripIds = Array.from(new Set(bookings.map((booking) => booking.tripId).filter(Boolean)));

    const [passengers, drivers, trips] = await Promise.all([
      passengerIds.length
        ? supabase.from('profiles').select('*').in('id', passengerIds)
        : Promise.resolve({ data: [] as ProfileRow[], error: null }),
      driverIds.length
        ? supabase.from('profiles').select('*').in('id', driverIds)
        : Promise.resolve({ data: [] as ProfileRow[], error: null }),
      tripIds.length
        ? supabase.from('trips').select('*').in('id', tripIds)
        : Promise.resolve({ data: [] as TripRow[], error: null }),
    ]);

    if (passengers.error) {
      console.error('Error fetching passenger profiles:', passengers.error);
      throw passengers.error;
    }

    if (drivers.error) {
      console.error('Error fetching driver profiles:', drivers.error);
      throw drivers.error;
    }

    if (trips.error) {
      console.error('Error fetching trips for bookings:', trips.error);
      throw trips.error;
    }

    const passengerMap = new Map((passengers.data ?? []).map((row) => [row.id, mapProfile(row)]));
    const driverMap = new Map((drivers.data ?? []).map((row) => [row.id, mapProfile(row)]));
    const tripMap = new Map((trips.data ?? []).map((row) => [row.id, mapTrip(row)]));

    return bookings.map((booking) => ({
      ...booking,
      passenger: booking.passengerId ? passengerMap.get(booking.passengerId) ?? null : null,
      driver: booking.driverId ? driverMap.get(booking.driverId) ?? null : null,
      trip: booking.tripId ? tripMap.get(booking.tripId) ?? null : null,
    }));
  }

  static async getBookingsByPassenger(passengerId: string) {
    return this.getBookings(passengerId, undefined);
  }

  static async getBookingsByDriver(driverId: string) {
    return this.getBookings(undefined, driverId);
  }

  static async getBookingById(id: string | number) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }

    return mapBooking(data);
  }

  static async updateBooking(id: string | number, data: TablesUpdate<'bookings'>) {
    const { data: result, error } = await supabase
      .from('bookings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      throw error;
    }

    if (result?.trip_id) {
      await this.updateTripAvailability(result.trip_id);
    }

    return mapBooking(result);
  }

  static async updateTripAvailability(tripId: string) {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('seats_booked')
      .eq('trip_id', tripId)
      .not('status', 'eq', 'cancelled');

    if (error) {
      console.error('Error loading bookings for availability update:', error);
      throw error;
    }

    const seatsBooked = (bookings ?? []).reduce((sum, row) => sum + (row.seats_booked ?? 0), 0);

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('total_seats')
      .eq('id', tripId)
      .maybeSingle();

    if (tripError || !trip) {
      if (tripError) {
        console.error('Error fetching trip for availability update:', tripError);
        throw tripError;
      }
      return;
    }

    const availableSeats = Math.max(trip.total_seats - seatsBooked, 0);

    const { error: updateError } = await supabase
      .from('trips')
      .update({ available_seats: availableSeats, updated_at: new Date().toISOString() })
      .eq('id', tripId);

    if (updateError) {
      console.error('Error updating trip availability:', updateError);
      throw updateError;
    }
  }

  // Notification operations
  static async createNotification(data: any) {
    const payload: TablesInsert<'notifications'> = {
      id: data.id ?? generateId(),
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type ?? 'system',
      is_read: data.isRead ?? false,
      created_at: data.createdAt ?? new Date().toISOString(),
      updated_at: data.updatedAt ?? new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isNotificationsTableMissing(error)) {
        logMissingNotificationsTable(error);
        return null;
      }

      console.error('Error creating notification:', error);
      throw error;
    }

    return mapNotification(result);
  }

  static async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapNotification).filter(Boolean);
    } catch (error: any) {
      if (isNotificationsTableMissing(error)) {
        logMissingNotificationsTable(error);
        return [];
      }

      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(id: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return mapNotification(data);
    } catch (error: any) {
      if (isNotificationsTableMissing(error)) {
        logMissingNotificationsTable(error);
        return null;
      }

      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // System settings operations
  static async updateSystemSetting(key: string, value: string, description?: string) {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(
        {
          id: generateId(),
          key,
          value: parseSettingValue(value),
          description: description ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }

    return mapSystemSetting(data);
  }

  static async getSystemSetting(key: string) {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching system setting:', error);
      throw error;
    }

    return mapSystemSetting(data);
  }

  static async getSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }

    return (data ?? []).map(mapSystemSetting).filter(Boolean);
  }

  // Initialization helpers (no-op in Supabase context)
  static async initializeDefaultData() {
    return;
  }

  static async setSeedDemoData(enabled: boolean) {
    await this.updateSystemSetting('seed_demo_data', JSON.stringify(enabled));
  }

  static async getStats() {
    const [profiles, trips, bookings] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('trips').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
    ]);

    return {
      profiles: profiles.count ?? 0,
      trips: trips.count ?? 0,
      bookings: bookings.count ?? 0,
    };
  }

  static async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all profiles:', error);
      throw error;
    }

    return (data ?? []).map(mapProfile).filter(Boolean);
  }

  static async getAllVehicles() {
    return this.getVehicles();
  }

  static async getAllBookings() {
    return this.getBookings();
  }

  static async getWilayas() {
    return wilayas;
  }

  static async getWilayaById(id: number) {
    return wilayas.find((w) => w.id === id) ?? null;
  }

  static async clearAllData() {
    await supabase.from('notifications').delete().neq('id', '');
    await supabase.from('bookings').delete().neq('id', '');
    await supabase.from('trips').delete().neq('id', '');
    await supabase.from('vehicles').delete().neq('id', '');
  }

  static async resetToDefaultData() {
    await this.clearAllData();
    await supabase.from('system_settings').delete().neq('key', '');
  }
}

export { SupabaseDatabaseService as BrowserDatabaseService };
