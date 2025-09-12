import { useState, useEffect } from 'react';
import { BrowserDatabaseService } from '@/integrations/database/browserServices';
import { supabase } from '@/integrations/supabase/client';

// Database type enum
export enum DatabaseType {
  LOCAL = 'local',
  SUPABASE = 'supabase'
}

// Hook to manage database switching
export const useDatabase = () => {
  const [databaseType, setDatabaseType] = useState<DatabaseType>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('database_type');
    return (saved as DatabaseType) || DatabaseType.LOCAL;
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        if (databaseType === DatabaseType.LOCAL) {
          // Initialize browser database with default data
          await BrowserDatabaseService.initializeDefaultData();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
        setIsInitialized(true);
      }
    };

    initializeDatabase();
  }, [databaseType]);

  // Switch database type
  const switchDatabase = (type: DatabaseType) => {
    setDatabaseType(type);
    localStorage.setItem('database_type', type);
    setIsInitialized(false);
  };

  // Get current database service
  const getDatabaseService = () => {
    if (databaseType === DatabaseType.LOCAL) {
      return BrowserDatabaseService;
    } else {
      // Return Supabase service wrapper
      return {
        // Profile operations
        createProfile: async (data: any) => {
          const { data: result, error } = await supabase
            .from('profiles')
            .insert([data])
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        getProfile: async (id: string) => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        updateProfile: async (id: string, data: any) => {
          const { data: result, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return result;
        },

        // Trip operations
        createTrip: async (data: any) => {
          const { data: result, error } = await supabase
            .from('trips')
            .insert([data])
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        getTrips: async (driverId?: string) => {
          let query = supabase
            .from('trips')
            .select(`
              *,
              driver:profiles!trips_driver_id_fkey(*),
              vehicle:vehicles(*),
              bookings(*)
            `)
            .order('created_at', { ascending: false });

          if (driverId) {
            query = query.eq('driver_id', driverId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return data;
        },
        getTripById: async (id: string) => {
          const { data, error } = await supabase
            .from('trips')
            .select(`
              *,
              driver:profiles!trips_driver_id_fkey(*),
              vehicle:vehicles(*),
              bookings(*)
            `)
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        updateTrip: async (id: string, data: any) => {
          const { data: result, error } = await supabase
            .from('trips')
            .update(data)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        deleteTrip: async (id: string) => {
          // First delete related bookings
          const { error: bookingsError } = await supabase
            .from('bookings')
            .delete()
            .eq('trip_id', id);
          if (bookingsError) throw bookingsError;

          // Then delete the trip
          const { error: tripError } = await supabase
            .from('trips')
            .delete()
            .eq('id', id);
          if (tripError) throw tripError;

          return true;
        },

        // Vehicle operations
        createVehicle: async (data: any) => {
          const { data: result, error } = await supabase
            .from('vehicles')
            .insert([data])
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        getVehicles: async (driverId?: string) => {
          let query = supabase
            .from('vehicles')
            .select(`
              *,
              driver:profiles!vehicles_driver_id_fkey(*)
            `)
            .order('created_at', { ascending: false });

          if (driverId) {
            query = query.eq('driver_id', driverId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return data;
        },
        getVehicleById: async (id: string) => {
          const { data, error } = await supabase
            .from('vehicles')
            .select(`
              *,
              driver:profiles!vehicles_driver_id_fkey(*)
            `)
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        updateVehicle: async (id: string, data: any) => {
          const { data: result, error } = await supabase
            .from('vehicles')
            .update(data)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        deleteVehicle: async (id: string) => {
          // First delete related trips
          const { error: tripsError } = await supabase
            .from('trips')
            .delete()
            .eq('vehicle_id', id);
          if (tripsError) throw tripsError;

          // Then delete the vehicle
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);
          if (vehicleError) throw vehicleError;

          return true;
        },

        // Booking operations
        createBooking: async (data: any) => {
          const { data: result, error } = await supabase
            .from('bookings')
            .insert([data])
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        getBookings: async (passengerId?: string, driverId?: string) => {
          let query = supabase
            .from('bookings')
            .select(`
              *,
              passenger:profiles!bookings_passenger_id_fkey(*),
              driver:profiles!bookings_driver_id_fkey(*),
              trip:trips(*)
            `)
            .order('created_at', { ascending: false });

          if (passengerId) {
            query = query.eq('passenger_id', passengerId);
          }
          if (driverId) {
            query = query.eq('driver_id', driverId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return data;
        },
        getBookingById: async (id: number) => {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              passenger:profiles!bookings_passenger_id_fkey(*),
              driver:profiles!bookings_driver_id_fkey(*),
              trip:trips(*)
            `)
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        updateBooking: async (id: number, data: any) => {
          const { data: result, error } = await supabase
            .from('bookings')
            .update(data)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return result;
        },

        // Notification operations
        createNotification: async (data: any) => {
          const { data: result, error } = await supabase
            .from('notifications')
            .insert([data])
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        getNotifications: async (userId: string) => {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data;
        },
        markNotificationAsRead: async (id: string) => {
          const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data;
        },

        // System settings operations
        getSystemSettings: async () => {
          const { data, error } = await supabase
            .from('system_settings')
            .select('*');
          if (error) throw error;
          return data;
        },
        getSystemSetting: async (key: string) => {
          const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', key)
            .single();
          if (error) throw error;
          return data;
        },
        updateSystemSetting: async (key: string, value: string, updatedBy?: string) => {
          const { data, error } = await supabase
            .from('system_settings')
            .upsert({
              key,
              value,
              updated_by: updatedBy,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();
          if (error) throw error;
          return data;
        },

        // Admin logs operations
        createAdminLog: async (data: any) => {
          const { data: result, error } = await supabase
            .from('admin_logs')
            .insert([data])
            .select()
            .single();
          if (error) throw error;
          return result;
        },
        getAdminLogs: async (adminId?: string) => {
          let query = supabase
            .from('admin_logs')
            .select(`
              *,
              admin:profiles!admin_logs_admin_id_fkey(*)
            `)
            .order('created_at', { ascending: false });

          if (adminId) {
            query = query.eq('admin_id', adminId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return data;
        },

        // Wilayas operations
        getWilayas: async () => {
          // Return wilayas from browser database
          return BrowserDatabaseService.getWilayas();
        },
        getWilayaById: async (id: number) => {
          return BrowserDatabaseService.getWilayaById(id);
        },
      };
    }
  };

  return {
    databaseType,
    isInitialized,
    switchDatabase,
    getDatabaseService,
    isLocal: databaseType === DatabaseType.LOCAL,
    isSupabase: databaseType === DatabaseType.SUPABASE,
  };
};
