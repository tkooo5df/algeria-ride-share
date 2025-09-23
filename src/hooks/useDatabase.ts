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
    // Default to LOCAL if no preference is set
    return (saved as DatabaseType) || DatabaseType.LOCAL;
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database with type:', databaseType);
        if (databaseType === DatabaseType.LOCAL) {
          // Initialize browser database with default data
          console.log('Initializing local database...');
          await BrowserDatabaseService.initializeDefaultData();
          console.log('Local database initialized');
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
    console.log('Switching database to:', type);
    setDatabaseType(type);
    localStorage.setItem('database_type', type);
    setIsInitialized(false);
  };

  // Get current database service
  const getDatabaseService = () => {
    if (databaseType === DatabaseType.LOCAL) {
      return BrowserDatabaseService;
    } else {
      // Return Supabase service wrapper (simplified for now)
      return {
        // Profile operations
        createProfile: async (data: any) => {
          // For now, fallback to local database if Supabase is not properly configured
          return await BrowserDatabaseService.createProfile(data);
        },
        getProfile: async (id: string) => {
          return await BrowserDatabaseService.getProfile(id);
        },
        updateProfile: async (id: string, data: any) => {
          return await BrowserDatabaseService.updateProfile(id, data);
        },

        // Trip operations
        createTrip: async (data: any) => {
          return await BrowserDatabaseService.createTrip(data);
        },
        getTrips: async (driverId?: string) => {
          return await BrowserDatabaseService.getTrips(driverId);
        },
        getTripById: async (id: string) => {
          return await BrowserDatabaseService.getTripById(id);
        },
        updateTrip: async (id: string, data: any) => {
          return await BrowserDatabaseService.updateTrip(id, data);
        },
        deleteTrip: async (id: string) => {
          return await BrowserDatabaseService.deleteTrip(id);
        },

        // Vehicle operations
        createVehicle: async (data: any) => {
          return await BrowserDatabaseService.createVehicle(data);
        },
        getVehicles: async (driverId?: string) => {
          return await BrowserDatabaseService.getVehicles(driverId);
        },
        getVehicleById: async (id: string) => {
          return await BrowserDatabaseService.getVehicleById(id);
        },
        updateVehicle: async (id: string, data: any) => {
          return await BrowserDatabaseService.updateVehicle(id, data);
        },
        deleteVehicle: async (id: string) => {
          return await BrowserDatabaseService.deleteVehicle(id);
        },

        // Booking operations
        createBooking: async (data: any) => {
          return await BrowserDatabaseService.createBooking(data);
        },
        getBookings: async (passengerId?: string, driverId?: string) => {
          return await BrowserDatabaseService.getBookings(passengerId, driverId);
        },
        getBookingById: async (id: string) => {
          return await BrowserDatabaseService.getBookingById(id);
        },
        updateBooking: async (id: string, data: any) => {
          return await BrowserDatabaseService.updateBooking(id, data);
        },

        // Notification operations
        createNotification: async (data: any) => {
          return await BrowserDatabaseService.createNotification(data);
        },
        getNotifications: async (userId: string) => {
          return await BrowserDatabaseService.getNotifications(userId);
        },
        markNotificationAsRead: async (id: string) => {
          return await BrowserDatabaseService.markNotificationAsRead(id);
        },

        // System settings operations
        getSystemSettings: async () => {
          // Not directly available in BrowserDatabaseService, return empty array
          return [];
        },
        getSystemSetting: async (key: string) => {
          return await BrowserDatabaseService.getSystemSetting(key);
        },
        updateSystemSetting: async (key: string, value: string, description?: string) => {
          return await BrowserDatabaseService.updateSystemSetting(key, value, description);
        },

        // Admin logs operations
        createAdminLog: async (data: any) => {
          // Not implemented in local database
          return null;
        },
        getAdminLogs: async (adminId?: string) => {
          // Not implemented in local database
          return [];
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