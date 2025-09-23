// Utility functions for debugging

export const debugLocalStorage = () => {
  const storageKey = 'dz_taxi_database';
  try {
    const rawData = localStorage.getItem(storageKey);
    if (rawData) {
      const data = JSON.parse(rawData);
      console.log('=== LOCALSTORAGE DEBUG INFO ===');
      console.log('Raw data:', data);
      console.log('Profiles count:', data.profiles?.length || 0);
      console.log('Profiles:', data.profiles);
      console.log('System settings:', data.systemSettings);
      
      // Count real vs demo accounts
      const realAccounts = data.profiles?.filter((p: any) => !p.isDemo) || [];
      const demoAccounts = data.profiles?.filter((p: any) => p.isDemo) || [];
      
      console.log('Real accounts:', realAccounts.length);
      console.log('Demo accounts:', demoAccounts.length);
      
      return data;
    } else {
      console.log('No data found in localStorage');
      return null;
    }
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = () => {
  const storageKey = 'dz_taxi_database';
  localStorage.removeItem(storageKey);
  console.log('LocalStorage cleared');
};

export const resetToDefaultData = async () => {
  const { browserDatabase } = await import('@/integrations/database/browserDatabase');
  await browserDatabase.resetToDefaultData();
  console.log('Database reset to default');
};