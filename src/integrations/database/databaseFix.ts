// Utility functions to fix database issues

/**
 * Check if localStorage is working properly
 */
export const checkLocalStorage = () => {
  try {
    const testKey = 'dz_taxi_test';
    const testValue = 'test_value';
    
    // Try to set an item
    localStorage.setItem(testKey, testValue);
    
    // Try to get the item
    const retrievedValue = localStorage.getItem(testKey);
    
    // Clean up
    localStorage.removeItem(testKey);
    
    return retrievedValue === testValue;
  } catch (error) {
    console.error('LocalStorage is not working:', error);
    return false;
  }
};

/**
 * Fix database by ensuring proper initialization
 */
export const fixDatabase = async () => {
  try {
    console.log('Checking localStorage...');
    const localStorageWorking = checkLocalStorage();
    console.log('LocalStorage working:', localStorageWorking);
    
    if (!localStorageWorking) {
      console.error('LocalStorage is not working properly!');
      return false;
    }
    
    console.log('Checking current database data...');
    const storageKey = 'dz_taxi_database';
    const rawData = localStorage.getItem(storageKey);
    
    if (!rawData) {
      console.log('No existing data found, initializing...');
      // Initialize with empty data structure
      const initialData = {
        profiles: [],
        vehicles: [],
        trips: [],
        bookings: [],
        notifications: [],
        systemSettings: []
      };
      
      localStorage.setItem(storageKey, JSON.stringify(initialData));
      console.log('Database initialized with empty structure');
    } else {
      console.log('Existing data found, checking structure...');
      try {
        const data = JSON.parse(rawData);
        console.log('Current data structure:', Object.keys(data));
        
        // Ensure all required arrays exist
        const requiredKeys = ['profiles', 'vehicles', 'trips', 'bookings', 'notifications', 'systemSettings'];
        let fixed = false;
        
        for (const key of requiredKeys) {
          if (!data.hasOwnProperty(key)) {
            data[key] = [];
            fixed = true;
          }
        }
        
        if (fixed) {
          localStorage.setItem(storageKey, JSON.stringify(data));
          console.log('Database structure fixed');
        } else {
          console.log('Database structure is correct');
        }
      } catch (parseError) {
        console.error('Error parsing existing data, reinitializing...', parseError);
        // Initialize with empty data structure
        const initialData = {
          profiles: [],
          vehicles: [],
          trips: [],
          bookings: [],
          notifications: [],
          systemSettings: []
        };
        
        localStorage.setItem(storageKey, JSON.stringify(initialData));
        console.log('Database reinitialized with empty structure');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error fixing database:', error);
    return false;
  }
};

/**
 * Clear all database data
 */
export const clearDatabase = () => {
  try {
    const storageKey = 'dz_taxi_database';
    localStorage.removeItem(storageKey);
    console.log('Database cleared');
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    return false;
  }
};

/**
 * Get all database data for debugging
 */
export const getDatabaseData = () => {
  try {
    const storageKey = 'dz_taxi_database';
    const rawData = localStorage.getItem(storageKey);
    
    if (!rawData) {
      return null;
    }
    
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error getting database data:', error);
    return null;
  }
};