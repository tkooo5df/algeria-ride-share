import { useEffect, useState } from 'react';
import { BrowserDatabaseService } from '@/integrations/database/browserServices';

export enum DatabaseType {
  SUPABASE = 'supabase',
  LOCAL = 'local',
}

export const useDatabase = () => {
  const [databaseType] = useState<DatabaseType>(DatabaseType.SUPABASE);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await BrowserDatabaseService.initializeDefaultData();
      } catch (error) {
        console.error('Error initializing Supabase database:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  const switchDatabase = () => {
    console.warn('Supabase is the only supported database mode in this build.');
  };

  const getDatabaseService = () => BrowserDatabaseService;

  return {
    databaseType,
    isInitialized,
    switchDatabase,
    getDatabaseService,
    isLocal: false,
    isSupabase: true,
  };
};
