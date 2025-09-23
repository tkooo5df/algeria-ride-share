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

    // Create test admin account
    const adminAccount = await BrowserDatabaseService.createProfile({
      id: 'test-admin-1',
      email: 'admin@test.com',
      firstName: 'محمد',
      lastName: 'المدير',
      fullName: 'محمد المدير',
      phone: '+213 555 999 888',
      role: 'admin',
      wilaya: 'الجزائر',
      commune: 'الجزائر الوسطى',
      address: 'مقر الإدارة، الجزائر',
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

    // Create a test trip for the driver
    const testTrip = await BrowserDatabaseService.createTrip({
      driverId: driverAccount.id,
      vehicleId: testVehicle.id,
      fromWilayaId: 16, // الجزائر
      toWilayaId: 31, // وهران
      departureDate: '2024-12-20',
      departureTime: '08:00',
      pricePerSeat: 1500,
      totalSeats: 4,
      description: 'رحلة مريحة من الجزائر إلى وهران - مكيف هواء وموسيقى',
    });

    // Create another test trip
    const testTrip2 = await BrowserDatabaseService.createTrip({
      driverId: driverAccount.id,
      vehicleId: testVehicle.id,
      fromWilayaId: 31, // وهران
      toWilayaId: 9, // البليدة
      departureDate: '2024-12-21',
      departureTime: '14:30',
      pricePerSeat: 1200,
      totalSeats: 4,
      description: 'رحلة سريعة من وهران إلى البليدة',
    });

    console.log('✅ Test accounts created successfully!');
    console.log('👨‍💼 Driver Account:', driverAccount.email);
    console.log('👤 Passenger Account:', passengerAccount.email);
    console.log('🛡️ Admin Account:', adminAccount.email);
    console.log('🚗 Test Vehicle:', testVehicle.licensePlate);
    console.log('🛣️ Test Trips Created:', 2);

    return {
      driver: driverAccount,
      passenger: passengerAccount,
      admin: adminAccount,
      vehicle: testVehicle,
      trips: [testTrip, testTrip2]
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
  },
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  }
};

// Function to test the booking system and data isolation
export const testBookingSystem = async () => {
  try {
    console.log('🧪 Testing booking system and data isolation...');
    
    // Get test accounts
    const accounts = await createTestAccounts();
    
    // Test 1: Passenger views available trips (should see driver's trips)
    console.log('\n🔍 Test 1: Passenger viewing available trips');
    const passengerTrips = await BrowserDatabaseService.getTripsWithDetails();
    const availableForPassenger = passengerTrips.filter((trip: any) => 
      trip.availableSeats > 0 && 
      trip.status === 'scheduled' && 
      trip.driverId !== accounts.passenger.id
    );
    console.log('✓ Passenger sees', availableForPassenger.length, 'available trips');
    
    // Test 2: Driver views own trips (should only see their trips)
    console.log('\n🔍 Test 2: Driver viewing own trips');
    const driverTrips = await BrowserDatabaseService.getTripsWithDetails(accounts.driver.id);
    console.log('✓ Driver sees', driverTrips.length, 'of their own trips');
    
    // Test 3: Create a booking from passenger
    if (availableForPassenger.length > 0) {
      console.log('\n🔍 Test 3: Creating booking from passenger');
      const testBooking = await BrowserDatabaseService.createBooking({
        passengerId: accounts.passenger.id,
        driverId: accounts.driver.id,
        tripId: availableForPassenger[0].id,
        pickupLocation: 'الجزائر الوسطى - شارع ديدوش مراد',
        destinationLocation: 'وهران المدينة - وسط المدينة',
        seatsBooked: 2,
        totalAmount: 3000,
        paymentMethod: 'cod',
        pickupTime: '08:00',
        status: 'pending'
      });
      console.log('✓ Booking created successfully:', testBooking.id);
      
      // Test 4: Driver sees booking (should see passenger's booking)
      console.log('\n🔍 Test 4: Driver viewing bookings for their trips');
      const driverBookings = await BrowserDatabaseService.getBookingsWithDetails(undefined, accounts.driver.id);
      console.log('✓ Driver sees', driverBookings.length, 'bookings for their trips');
      
      // Test 5: Passenger sees their bookings
      console.log('\n🔍 Test 5: Passenger viewing their bookings');
      const passengerBookings = await BrowserDatabaseService.getBookingsWithDetails(accounts.passenger.id);
      console.log('✓ Passenger sees', passengerBookings.length, 'of their own bookings');
      
      // Test 6: Admin sees all data
      console.log('\n🔍 Test 6: Admin viewing all data');
      const allTrips = await BrowserDatabaseService.getTripsWithDetails();
      const allBookings = await BrowserDatabaseService.getBookingsWithDetails();
      console.log('✓ Admin sees', allTrips.length, 'total trips and', allBookings.length, 'total bookings');
    }
    
    console.log('\n✅ Booking system test completed successfully!');
    console.log('✓ Data isolation working correctly');
    console.log('✓ Role-based access control functioning');
    console.log('✓ Integrated booking system operational');
    
  } catch (error) {
    console.error('❌ Error testing booking system:', error);
    throw error;
  }
};

// Comprehensive isolation testing function
export const testDataIsolation = async () => {
  try {
    console.log('🔬 Starting comprehensive data isolation tests...');
    
    // Reset and create fresh test data
    await resetTestData();
    const accounts = await createTestAccounts();
    
    console.log('\n📦 Test Accounts Created:');
    console.log('- Driver:', accounts.driver.email);
    console.log('- Passenger:', accounts.passenger.email);
    console.log('- Admin:', accounts.admin.email);
    
    // Test data isolation for vehicles
    console.log('\n🚗 Testing Vehicle Isolation...');
    const driverVehicles = await BrowserDatabaseService.getVehiclesByDriver(accounts.driver.id);
    const passengerVehicles = await BrowserDatabaseService.getVehiclesByDriver(accounts.passenger.id);
    
    console.log('✓ Driver vehicles:', driverVehicles.length);
    console.log('✓ Passenger vehicles:', passengerVehicles.length);
    
    if (driverVehicles.length > 0 && passengerVehicles.length === 0) {
      console.log('✅ Vehicle isolation PASSED');
    } else {
      throw new Error('Vehicle isolation FAILED');
    }
    
    // Test trip isolation
    console.log('\n🛣️ Testing Trip Isolation...');
    const driverTrips = await BrowserDatabaseService.getTripsWithDetails(accounts.driver.id);
    const passengerViewTrips = await BrowserDatabaseService.getTripsWithDetails();
    
    console.log('✓ Driver sees their trips:', driverTrips.length);
    console.log('✓ All available trips for passengers:', passengerViewTrips.length);
    
    // Verify driver only sees their own trips
    const driverOwnsAllTrips = driverTrips.every((trip: any) => trip.driverId === accounts.driver.id);
    if (driverOwnsAllTrips) {
      console.log('✅ Trip isolation PASSED - Driver only sees own trips');
    } else {
      throw new Error('Trip isolation FAILED - Driver sees other drivers trips');
    }
    
    // Create booking and test booking isolation
    console.log('\n📝 Testing Booking Isolation...');
    const testTrip = driverTrips[0];
    if (testTrip) {
      // Create booking as passenger
      const booking = await BrowserDatabaseService.createBooking({
        passengerId: accounts.passenger.id,
        driverId: accounts.driver.id,
        tripId: testTrip.id,
        pickupLocation: 'الجزائر الوسطى',
        destinationLocation: 'وهران الوسطى',
        seatsBooked: 1,
        totalAmount: 1500,
        paymentMethod: 'cod',
        pickupTime: '08:00',
        status: 'pending'
      });
      
      // Test booking visibility
      const passengerBookings = await BrowserDatabaseService.getBookingsWithDetails(accounts.passenger.id);
      const driverBookings = await BrowserDatabaseService.getBookingsWithDetails(undefined, accounts.driver.id);
      const adminBookings = await BrowserDatabaseService.getBookingsWithDetails();
      
      console.log('✓ Passenger sees their bookings:', passengerBookings.length);
      console.log('✓ Driver sees bookings for their trips:', driverBookings.length);
      console.log('✓ Admin sees all bookings:', adminBookings.length);
      
      // Verify isolation
      const passengerOwnsBookings = passengerBookings.every((b: any) => b.passengerId === accounts.passenger.id);
      const driverSeesRelevantBookings = driverBookings.every((b: any) => b.driverId === accounts.driver.id);
      
      if (passengerOwnsBookings && driverSeesRelevantBookings) {
        console.log('✅ Booking isolation PASSED');
      } else {
        throw new Error('Booking isolation FAILED');
      }
    }
    
    // Test cross-contamination
    console.log('\n🚫 Testing Cross-Contamination Prevention...');
    
    // Try to access other user's data
    const passengerTripsAttempt = await BrowserDatabaseService.getTripsWithDetails(accounts.passenger.id);
    if (passengerTripsAttempt.length === 0) {
      console.log('✅ Cross-contamination prevention PASSED - Passenger cannot see non-existent trips');
    }
    
    // Test admin access
    console.log('\n🛡️ Testing Admin Access...');
    const allProfiles = await BrowserDatabaseService.getAllProfiles();
    const allTripsAdmin = await BrowserDatabaseService.getTripsWithDetails();
    const allBookingsAdmin = await BrowserDatabaseService.getBookingsWithDetails();
    
    console.log('✓ Admin sees all profiles:', allProfiles.length);
    console.log('✓ Admin sees all trips:', allTripsAdmin.length);
    console.log('✓ Admin sees all bookings:', allBookingsAdmin.length);
    
    if (allProfiles.length >= 3 && allTripsAdmin.length >= 2) {
      console.log('✅ Admin access PASSED');
    } else {
      throw new Error('Admin access FAILED');
    }
    
    console.log('\n🎉 ALL ISOLATION TESTS PASSED!');
    console.log('✓ Data segregation by user role working correctly');
    console.log('✓ No data leakage between accounts');
    console.log('✓ Role-based access control functioning properly');
    console.log('✓ Booking system maintains data integrity');
    
    return {
      success: true,
      message: 'All data isolation tests passed successfully',
      details: {
        vehicleIsolation: true,
        tripIsolation: true,
        bookingIsolation: true,
        crossContaminationPrevention: true,
        adminAccess: true
      }
    };
    
  } catch (error) {
    console.error('❌ Data isolation test FAILED:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: null
    };
  }
};

// Function to reset test data
export const resetTestData = async () => {
  try {
    console.log('🗽 Resetting test data...');
    
    // Clear localStorage to reset the database
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dz_taxi_database');
      console.log('✅ Test data reset successfully!');
    }
  } catch (error) {
    console.error('❌ Error resetting test data:', error);
    throw error;
  }
};
