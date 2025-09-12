import { BrowserDatabaseService } from './browserServices';

// Test accounts for demonstration
export const createTestAccounts = async () => {
  try {
    console.log('🔧 Creating test accounts...');

    // Create test driver account
    const driverAccount = await BrowserDatabaseService.createProfile({
      id: 'test-driver-1',
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

    // Create test passenger account
    const passengerAccount = await BrowserDatabaseService.createProfile({
      id: 'test-passenger-1',
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

    // Create test vehicle for driver
    const testVehicle = await BrowserDatabaseService.createVehicle({
      driverId: driverAccount.id,
      make: 'Renault',
      model: 'Symbol',
      year: 2020,
      color: 'أبيض',
      licensePlate: 'TEST-123-16',
      seats: 4,
    });

    console.log('✅ Test accounts created successfully!');
    console.log('👨‍💼 Driver Account:', driverAccount.email);
    console.log('👤 Passenger Account:', passengerAccount.email);
    console.log('🚗 Test Vehicle:', testVehicle.licensePlate);

    return {
      driver: driverAccount,
      passenger: passengerAccount,
      vehicle: testVehicle
    };
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  }
};

// Login credentials for testing
export const testCredentials = {
  driver: {
    email: 'driver@test.com',
    password: 'driver123',
    role: 'driver'
  },
  passenger: {
    email: 'passenger@test.com',
    password: 'passenger123',
    role: 'passenger'
  }
};
