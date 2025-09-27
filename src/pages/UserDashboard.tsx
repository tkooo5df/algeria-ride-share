import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  DollarSign,
  Bell,
  Search,
  Plus,
  Eye,
  Check,
  X,
  Trash,
  Star,
  TrendingUp,
  Users,
  Route,
  Settings,
  Shield,
  Activity,
  Edit,
  Power,
  PowerOff,
  Play,
  AlertTriangle,
  Pause,
  Trash2,
  Database
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UserManagement from '@/components/admin/UserManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import BookingModal from '@/components/booking/BookingModal';
import { BrowserDatabaseService } from '@/integrations/database/browserServices';
import { BookingTrackingService, BookingStatus } from '@/integrations/database/bookingTrackingService';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { toast } from '@/hooks/use-toast';
import { wilayas } from '@/data/wilayas';
import NotificationCenter from '@/components/NotificationCenter';
import { NotificationService, NotificationType, NotificationCategory, NotificationPriority } from '@/integrations/database/notificationService';
import DatabaseSwitch from '@/components/DatabaseSwitch';
import { getDisplayName } from '@/utils/displayName';

// Import the new components
import TripManagement from '@/components/admin/TripManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import DatabaseManagement from '@/components/admin/DatabaseManagement';
const UserDashboard = () => {
  const { user: supabaseUser } = useAuth();
  const { user: localUser } = useLocalAuth();
  const { getDatabaseService, isInitialized, isLocal } = useDatabase();
  
  // Use local user if using local database, otherwise use Supabase user
  const user = isLocal ? localUser : supabaseUser;
  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]); // Add this line for users data
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalDrivers: 0, totalPassengers: 0 });

  const [currentLang] = useState("ar");
  const [loading, setLoading] = useState(true);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0, recent: 0 });

  const displayName = getDisplayName([
    userProfile,
    user,
  ], {
    fallback: 'عضو',
    email: user?.email ?? null,
  });
  
  // Trip creation form
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState({
    fromWilayaId: "",
    toWilayaId: "",
    vehicleId: "",
    departureDate: "",
    departureTime: "",
    pricePerSeat: "",
    totalSeats: "4",
    description: ""
  });

  // Vehicle management form
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    id: "",
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    seats: "4"
  });

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Helper function to get wilaya name by ID
  const getWilayaName = (wilayaId: number) => {
    const wilaya = wilayas.find(w => w.code === wilayaId.toString().padStart(2, '0'));
    return wilaya ? wilaya.name : `ولاية ${wilayaId}`;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const db = getDatabaseService();
      const profile = await db.getProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch driver's vehicles (if user is driver)
  const fetchVehicles = async () => {
    if (!user || userProfile?.role !== 'driver') {
      console.log('DEBUG: User not authorized to fetch vehicles');
      return;
    }
    
    try {
      console.log('DEBUG: Fetching vehicles for driver:', user.id);
      const data = await BrowserDatabaseService.getVehiclesByDriver(user.id);
      console.log('DEBUG: Fetched vehicles:', data);
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Fetch trips based on user role
  const fetchTrips = async () => {
    try {
      if (userProfile?.role === 'driver') {
        // Drivers see only their own trips
        const data = await BrowserDatabaseService.getTripsWithDetails(user?.id);
        setTrips(data || []);
      } else if (userProfile?.role === 'passenger') {
        // Passengers see all available trips
        const data = await BrowserDatabaseService.getTripsWithDetails();
        // Filter to show only available trips for passengers
        const availableTrips = data.filter((trip: any) => 
          trip.availableSeats > 0 && 
          trip.status === 'scheduled' && 
          trip.driverId !== user?.id // Don't show their own trips if they're also a driver
        );
        setTrips(availableTrips || []);
      } else {
        // Admins see all trips
        const data = await BrowserDatabaseService.getTripsWithDetails();
        setTrips(data || []);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  // Fetch bookings with full details
  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      let data;
      
      if (userProfile?.role === 'driver') {
        // Get bookings for driver's trips with full details
        data = await BrowserDatabaseService.getBookingsWithDetails(undefined, user.id);
      } else if (userProfile?.role === 'passenger') {
        // Get bookings for passenger with full details
        data = await BrowserDatabaseService.getBookingsWithDetails(user.id);
      } else {
        // Admins see all bookings
        data = await BrowserDatabaseService.getBookingsWithDetails();
      }
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch user's notifications and stats
  const fetchNotificationStats = async () => {
    if (!user) return;
    
    try {
      const [stats, notifications] = await Promise.all([
        NotificationService.getNotificationStats(user.id),
        NotificationService.getUserNotifications(user.id)
      ]);
      
      console.log('DEBUG: Notification stats:', stats);
      console.log('DEBUG: User notifications:', notifications);
      
      setNotificationStats({
        total: stats?.total || notifications?.length || 0,
        unread: stats?.unread || notifications?.filter((n: any) => !n.isRead)?.length || 0,
        recent: stats?.recent || notifications?.filter((n: any) => {
          const notificationDate = new Date(n.createdAt);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return notificationDate > oneDayAgo;
        })?.length || 0
      });
      
      // Refresh the NotificationCenter if notifications changed
      if (notifications?.length > 0) {
        console.log('DEBUG: Found notifications, refreshing UI');
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      // Set default values if there's an error
      setNotificationStats({ total: 0, unread: 0, recent: 0 });
    }
  };

  // Load admin stats
  const loadAdminStats = async () => {
    if (!user || userProfile?.role !== 'admin') return;
    try {
      const db = getDatabaseService();
      const allProfiles = await BrowserDatabaseService.getAllProfiles();
      setAdminStats({
        totalUsers: allProfiles.length,
        totalDrivers: allProfiles.filter((p: any) => p.role === 'driver').length,
        totalPassengers: allProfiles.filter((p: any) => p.role === 'passenger').length,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  // Load all users for admin (add this new function)
  const loadAllUsers = async () => {
    if (!user || userProfile?.role !== 'admin') return;
    try {
      const allProfiles = await BrowserDatabaseService.getAllProfiles();
      console.log('DEBUG: All profiles loaded:', allProfiles); // Add debug logging
      
      // Transform profiles into the format expected by UserManagement component
      const usersData = allProfiles.map((profile: any) => ({
        id: profile.id,
        email: profile.email || 'غير محدد',
        role: profile.role || 'passenger',
        status: profile.isVerified ? 'active' : 'pending',
        created_at: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-DZ') : 'غير محدد',
        last_sign_in: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('ar-DZ') : 'غير محدد',
        isDemo: profile.isDemo || false, // Add this line
        profile: {
          first_name: profile.fullName?.split(' ')[0] || 'غير محدد',
          last_name: profile.fullName?.split(' ')[1] || '',
          phone: profile.phone || 'غير محدد',
          wilaya: profile.wilaya || 'غير محدد'
        }
      }));
      
      console.log('DEBUG: Transformed users data:', usersData); // Add debug logging
      console.log('DEBUG: Real accounts count:', usersData.filter((u: any) => !u.isDemo).length);
      console.log('DEBUG: Demo accounts count:', usersData.filter((u: any) => u.isDemo).length);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (user && isInitialized) {
        await Promise.all([
          fetchUserProfile(),
          loadAdminStats()
        ]);
        setLoading(false);
      }
    };

    loadData();
  }, [user, isInitialized]);

  // Load role-specific data when profile is loaded
  useEffect(() => {
    if (userProfile) {
      Promise.all([
        fetchVehicles(),
        fetchTrips(),
        fetchBookings(),
        fetchNotificationStats(),
        loadAdminStats(),
        loadAllUsers()
      ]);
    }
  }, [userProfile, user]);

  // Handle trip creation
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userProfile?.role !== 'driver') return;

    // Check if driver is verified before allowing trip creation
    if (!userProfile?.isVerified) {
      toast({
        title: "الحساب غير مفعل",
        description: "يجب أن يوافق المدير على حسابك قبل إنشاء رحلات",
        variant: "destructive"
      });
      return;
    }

    try {
      const trip = await BrowserDatabaseService.createTrip({
        driverId: user.id.toString(),
        vehicleId: tripForm.vehicleId,
        fromWilayaId: parseInt(tripForm.fromWilayaId),
        toWilayaId: parseInt(tripForm.toWilayaId),
        departureDate: tripForm.departureDate,
        departureTime: tripForm.departureTime,
        pricePerSeat: parseFloat(tripForm.pricePerSeat),
        totalSeats: parseInt(tripForm.totalSeats),
        description: tripForm.description,
      });

      // Send notification to admins (only if userProfile is loaded)
      if (userProfile) {
        try {
          await NotificationService.notifyTripCreated(trip.id.toString(), user.id.toString());
        } catch (notificationError) {
          console.error('Error sending trip creation notification:', notificationError);
          // Don't fail the trip creation if notification fails
        }
      }

      toast({
        title: "تم إنشاء الرحلة بنجاح",
        description: "تم إنشاء رحلة جديدة وإرسال إشعار للإدارة",
      });

      setShowTripForm(false);
      setTripForm({
        fromWilayaId: "",
        toWilayaId: "",
        vehicleId: "",
        departureDate: "",
        departureTime: "",
        pricePerSeat: "",
        totalSeats: "4",
        description: ""
      });

      await fetchTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "خطأ في إنشاء الرحلة",
        description: "حدث خطأ أثناء إنشاء الرحلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle trip deletion
  const handleDeleteTrip = async (tripId: string) => {
    if (!user || userProfile?.role !== 'driver') return;

    try {
      const success = await BrowserDatabaseService.deleteTrip(tripId);
      
      if (success) {
        toast({
          title: "تم حذف الرحلة بنجاح",
          description: "تم حذف الرحلة وجميع الحجزات المرتبطة بها",
        });
        
        await fetchTrips();
      } else {
        throw new Error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "خطأ في حذف الرحلة",
        description: "حدث خطأ أثناء حذف الرحلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle trip activation/deactivation
  const handleToggleTripStatus = async (tripId: string, currentStatus: string) => {
    if (!user || userProfile?.role !== 'driver') return;

    try {
      // Determine new status
      const newStatus = currentStatus === 'scheduled' ? 'cancelled' : 'scheduled';
      
      // If activating a trip, update the date to today or tomorrow
      let updates: any = { status: newStatus };
      
      if (newStatus === 'scheduled') {
        // When reactivating, we might want to update the date
        const trip = trips.find((t: any) => t.id === tripId);
        if (trip) {
          const today = new Date();
          const tripDate = new Date(trip.departureDate);
          
          // If the trip date is in the past, update it to today or tomorrow
          if (tripDate < today) {
            // Set to tomorrow
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            updates.departureDate = tomorrow.toISOString().split('T')[0];
          }
        }
      }
      
      await BrowserDatabaseService.updateTrip(tripId, updates);
      
      // Send notification about trip status change (only if userProfile is loaded)
      if (userProfile) {
        try {
          const { NotificationService } = await import('@/integrations/database/notificationService');
          const trip = trips.find((t: any) => t.id === tripId);
          
          if (trip && user) {
            if (newStatus === 'cancelled') {
              // Use existing notification method for cancellation
              await NotificationService.notifyTripCancelled(tripId, user.id.toString(), 'تم إلغاء الرحلة بناءً على طلب السائق');
            } else {
              // Create custom notification for activation
              await NotificationService.sendSmartNotification({
                userId: user.id.toString(),
                title: '✅ تم تفعيل الرحلة',
                message: 'تم تفعيل الرحلة بنجاح. سيتم عرضها في نتائج البحث.',
                type: NotificationType.TRIP_UPDATED,
                category: NotificationCategory.TRIP,
                priority: NotificationPriority.MEDIUM,
                relatedId: tripId,
                relatedType: 'trip'
              });
            }
          }
        } catch (notificationError) {
          console.error('Error sending trip status notification:', notificationError);
          // Don't fail the trip status update if notification fails
        }
      }
      
      toast({
        title: newStatus === 'scheduled' ? "تم تفعيل الرحلة" : "تم إلغاء الرحلة",
        description: newStatus === 'scheduled' 
          ? "تم تفعيل الرحلة بنجاح. سيتم عرضها في نتائج البحث." 
          : "تم إلغاء الرحلة بنجاح.",
      });
      
      await fetchTrips();
    } catch (error) {
      console.error('Error toggling trip status:', error);
      toast({
        title: "خطأ في تغيير حالة الرحلة",
        description: "حدث خطأ أثناء تغيير حالة الرحلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle vehicle creation
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userProfile?.role !== 'driver') return;

    try {
      const vehicle = await BrowserDatabaseService.createVehicle({
        driverId: user.id.toString(),
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: parseInt(vehicleForm.year),
        color: vehicleForm.color,
        licensePlate: vehicleForm.licensePlate,
        seats: parseInt(vehicleForm.seats),
      });

      // Send notifications about new vehicle
      try {
        const { NotificationService } = await import('@/integrations/database/notificationService');
        
        // Notify driver about successful vehicle addition
        await NotificationService.notifyVehicleAdded({
          driverId: user.id.toString(),
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.make} ${vehicle.model}`,
          licensePlate: vehicle.licensePlate
        });
        
        // Notify admins about new vehicle for approval
        await NotificationService.notifyAdminNewVehicle({
          driverId: user.id.toString(),
          driverName: userProfile.fullName,
          vehicleId: vehicle.id,
          vehicleDetails: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.licensePlate}`
        });
      } catch (notificationError) {
        console.error('Error sending vehicle notifications:', notificationError);
      }

      toast({
        title: "تم إضافة المركبة بنجاح",
        description: "تم إضافة مركبتك الجديدة بنجاح",
      });

      setShowVehicleForm(false);
      setVehicleForm({
        id: "",
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        seats: "4"
      });

      await fetchVehicles();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "خطأ في إضافة المركبة",
        description: "حدث خطأ أثناء إضافة المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Add debug logs to handleUpdateVehicle
  const handleUpdateVehicle = async (vehicleId: string, data: any) => {
    console.log('DEBUG: Updating vehicle with ID:', vehicleId, 'Data:', data);
    try {
      const result = await BrowserDatabaseService.updateVehicle(vehicleId, data);
      console.log('DEBUG: Vehicle update result:', result);
      
      toast({
        title: "تم تحديث المركبة",
        description: "تم تحديث معلومات المركبة بنجاح",
      });
      
      await fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "خطأ في تحديث المركبة",
        description: "حدث خطأ أثناء تحديث المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle vehicle deletion
  const handleDeleteVehicle = async (vehicleId: string) => {
    console.log('DEBUG: handleDeleteVehicle called with vehicleId:', vehicleId);
    if (!user || userProfile?.role !== 'driver') {
      console.log('DEBUG: User not authorized to delete vehicle');
      return;
    }

    try {
      console.log('DEBUG: Attempting to delete vehicle from Supabase...');
      await BrowserDatabaseService.deleteVehicle(vehicleId);
      console.log('DEBUG: Vehicle deleted successfully from Supabase');
      
      toast({
        title: "تم حذف المركبة",
        description: "تم حذف المركبة بنجاح",
      });
      
      await Promise.all([fetchVehicles(), fetchTrips()]); // Refresh both since vehicle deletion affects trips
      console.log('DEBUG: Data refreshed after vehicle deletion');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "خطأ في حذف المركبة",
        description: "حدث خطأ أثناء حذف المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Add debug logs to handleToggleVehicleStatus
  const handleToggleVehicleStatus = async (vehicleId: string, isActive: boolean) => {
    console.log('DEBUG: Toggling vehicle status for ID:', vehicleId, 'Current status:', isActive);
    try {
      await BrowserDatabaseService.updateVehicle(vehicleId, { is_active: !isActive });
      
      // Send notification about vehicle status change
      try {
        const { NotificationService } = await import('@/integrations/database/notificationService');
        const vehicle = vehicles.find(v => v.id === vehicleId);
        
        if (vehicle && user) {
          await NotificationService.notifyVehicleStatusUpdate({
            driverId: user.id.toString(),
            vehicleId: vehicleId,
            vehicleName: `${vehicle.make} ${vehicle.model}`,
            newStatus: !isActive ? 'active' : 'inactive',
            reason: !isActive ? 'تم تفعيل المركبة بناءً على طلبك' : 'تم إلغاء تفعيل المركبة بناءً على طلبك'
          });
        }
      } catch (notificationError) {
        console.error('Error sending vehicle status notification:', notificationError);
      }
      
      toast({
        title: isActive ? "تم إلغاء تفعيل المركبة" : "تم تفعيل المركبة",
        description: isActive ? "تم إلغاء تفعيل المركبة بنجاح" : "تم تفعيل المركبة بنجاح",
      });
      
      await fetchVehicles();
    } catch (error) {
      console.error('Error toggling vehicle status:', error);
      toast({
        title: "خطأ في تغيير حالة المركبة",
        description: "حدث خطأ أثناء تغيير حالة المركبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Handle booking confirmation (for drivers)
  const handleConfirmBooking = async (bookingId: string | number) => {
    try {
      await BookingTrackingService.trackStatusChange(
        bookingId.toString(),
        BookingStatus.CONFIRMED,
        'driver',
        user!.id,
        'تم قبول الحجز من قبل السائق'
      );
      
      await Promise.all([fetchBookings(), fetchTrips(), fetchNotificationStats()]); // Refresh both to update available seats
      
      toast({
        title: "تم تأكيد الحجز",
        description: "تم تأكيد الحجز وإرسال إشعار للراكب",
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تأكيد الحجز",
        variant: "destructive"
      });
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string | number) => {
    try {
      const userRole = userProfile?.role === 'driver' ? 'driver' : 'passenger';
      await BookingTrackingService.trackStatusChange(
        bookingId.toString(),
        BookingStatus.CANCELLED,
        userRole as 'driver' | 'passenger',
        user!.id,
        'تم إلغاء الحجز من قبل المستخدم'
      );
      
      await Promise.all([fetchBookings(), fetchTrips(), fetchNotificationStats()]); // Refresh both to update available seats
      
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء الحجز وإرسال إشعار للأطراف المعنية",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء الحجز",
        variant: "destructive"
      });
    }
  };

  // Handle booking completion (for drivers)
  const handleCompleteBooking = async (bookingId: string | number) => {
    try {
      await BookingTrackingService.trackStatusChange(
        bookingId.toString(),
        BookingStatus.COMPLETED,
        'driver',
        user!.id,
        'تم إكمال الرحلة بنجاح'
      );
      
      await Promise.all([fetchBookings(), fetchTrips(), fetchNotificationStats()]);
      
      toast({
        title: "تم إكمال الرحلة",
        description: "تم إكمال الرحلة بنجاح وإرسال إشعار للراكب",
      });
    } catch (error) {
      console.error('Error completing booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إكمال الرحلة",
        variant: "destructive"
      });
    }
  };

  // Handle booking a trip
  const handleBookTrip = (trip: any) => {
    setSelectedTrip(trip);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    // Refresh bookings and trips to reflect the new booking
    Promise.all([fetchBookings(), fetchTrips()]);
  };

  const getStatusBadge = (status: string) => {
    return BookingTrackingService.getStatusInfo(status);
  };

  const getRoleInfo = () => {
    switch (userProfile?.role) {
      case 'driver':
        return {
          title: 'لوحة السائق',
          description: 'إدارة رحلاتك وحجوزاتك',
          icon: Car,
          color: 'bg-green-500'
        };
      case 'passenger':
        return {
          title: 'لوحة الراكب',
          description: 'إدارة حجوزاتك والبحث عن رحلات',
          icon: User,
          color: 'bg-blue-500'
        };
      case 'admin':
        return {
          title: 'لوحة الإدارة',
          description: 'إدارة النظام والمستخدمين',
          icon: Shield,
          color: 'bg-purple-500'
        };
      default:
        return {
          title: 'لوحة المستخدم',
          description: 'مرحباً بك في DZ Taxi',
          icon: User,
          color: 'bg-gray-500'
        };
    }
  };

  const handleEditVehicle = (vehicle: any) => {
    console.log('DEBUG: handleEditVehicle called with vehicle:', vehicle);
    setVehicleForm({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      seats: vehicle.seats.toString()
    });
    console.log('DEBUG: vehicleForm set to:', {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      seats: vehicle.seats.toString()
    });
    setShowVehicleForm(true);
  };

  // Handle vehicle form submission (both create and update)
  const handleSubmitVehicleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userProfile?.role !== 'driver') return;

    console.log('DEBUG: handleSubmitVehicleForm called with vehicleForm:', vehicleForm);

    try {
      if (vehicleForm.id) {
        // Update existing vehicle
        console.log('DEBUG: Updating existing vehicle with ID:', vehicleForm.id);
        await handleUpdateVehicle(vehicleForm.id, {
          make: vehicleForm.make,
          model: vehicleForm.model,
          year: parseInt(vehicleForm.year),
          color: vehicleForm.color,
          license_plate: vehicleForm.licensePlate,
          seats: parseInt(vehicleForm.seats),
        });
      } else {
        // Create new vehicle
        await BrowserDatabaseService.createVehicle({
          driverId: user.id.toString(),
          make: vehicleForm.make,
          model: vehicleForm.model,
          year: parseInt(vehicleForm.year),
          color: vehicleForm.color,
          licensePlate: vehicleForm.licensePlate,
          seats: parseInt(vehicleForm.seats),
        });

        // Send notifications about new vehicle
        try {
          const { NotificationService } = await import('@/integrations/database/notificationService');
          
          // Notify driver about successful vehicle addition
          await NotificationService.notifyVehicleAdded({
            driverId: user.id.toString(),
            vehicleId: vehicleForm.id,
            vehicleName: `${vehicleForm.make} ${vehicleForm.model}`,
            licensePlate: vehicleForm.licensePlate
          });
          
          // Notify admins about new vehicle for approval
          await NotificationService.notifyAdminNewVehicle({
            driverId: user.id.toString(),
            driverName: userProfile.fullName,
            vehicleId: vehicleForm.id,
            vehicleDetails: `${vehicleForm.make} ${vehicleForm.model} (${vehicleForm.year}) - ${vehicleForm.licensePlate}`
          });
        } catch (notificationError) {
          console.error('Error sending vehicle notifications:', notificationError);
        }
      }

      toast({
        title: vehicleForm.id ? "تم تحديث المركبة بنجاح" : "تم إضافة المركبة بنجاح",
        description: vehicleForm.id ? "تم تحديث معلومات المركبة بنجاح" : "تم إضافة مركبتك الجديدة بنجاح",
      });

      setShowVehicleForm(false);
      setVehicleForm({
        id: "",
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        seats: "4"
      });

      await fetchVehicles();
    } catch (error) {
      console.error('Error submitting vehicle form:', error);
      toast({
        title: "خطأ في إرسال النموذج",
        description: "حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل لوحة التحكم...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className={`${roleInfo.color} rounded-xl p-6 text-white`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar className="h-16 w-16 border-2 border-white/20 flex-shrink-0">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-white/20 text-white">
                  {displayName?.charAt(0) || 'ع'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold truncate">{roleInfo.title}</h1>
                <p className="text-white/90 truncate">{roleInfo.description}</p>
                <p className="text-white/80 text-sm truncate">
                  مرحباً، {displayName}
                </p>
              </div>
            </div>
            <div className="text-right min-w-0 bg-white/10 p-3 rounded-lg">
              <div className="text-sm text-white/80 truncate">
                {userProfile?.role === 'driver' ? 'رحلاتي' : 
                 userProfile?.role === 'passenger' ? 'حجوزاتي' : 
                 'إجمالي المستخدمين'}
              </div>
              <div className="text-2xl font-bold truncate">
                {userProfile?.role === 'driver' ? trips.length :
                 userProfile?.role === 'passenger' ? bookings.length :
                 adminStats.totalUsers}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions for Admins */}
        {userProfile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>الوصول السريع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => window.location.href = "/data-management"}>
                  <Database className="h-4 w-4 ml-2" />
                  إدارة البيانات
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/dashboard?tab=users"}>
                  <Users className="h-4 w-4 ml-2" />
                  المستخدمين
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/dashboard?tab=admin-trips"}>
                  <Route className="h-4 w-4 ml-2" />
                  الرحلات
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/dashboard?tab=admin-bookings"}>
                  <Calendar className="h-4 w-4 ml-2" />
                  الحجوزات
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{bookings.length}</div>
              <div className="text-sm text-muted-foreground">
                {userProfile?.role === 'driver' ? 'حجوزاتي' : 'حجوزاتي'}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {bookings.filter((b: any) => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-muted-foreground">مؤكدة</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Route className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-sm text-muted-foreground">
                {userProfile?.role === 'driver' ? 'رحلاتي' : 'رحلات متاحة'}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Bell className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{notificationStats.unread}</div>
              <div className="text-sm text-muted-foreground">إشعارات جديدة</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">نظرة</span>
            </TabsTrigger>
            {userProfile?.role === 'driver' && (
              <TabsTrigger 
                value="vehicles" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">المركبات</span>
                <span className="sm:hidden">مركبات</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="trips"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Route className="h-4 w-4" />
              {userProfile?.role === 'driver' ? (
                <>
                  <span className="hidden sm:inline">رحلاتي</span>
                  <span className="sm:hidden">رحلات</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">الرحلات</span>
                  <span className="sm:hidden">رحلات</span>
                </>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">حجوزاتي</span>
              <span className="sm:hidden">حجوزات</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">الإشعارات</span>
                <span className="sm:hidden">تنبيهات</span>
                {notificationStats.unread > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notificationStats.unread}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            {userProfile?.role === 'admin' && (
              <>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">المستخدمين</span>
                  <span className="sm:hidden">مستخدمون</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin-trips" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Route className="h-4 w-4" />
                  <span className="hidden sm:inline">الرحلات</span>
                  <span className="sm:hidden">رحلات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin-bookings" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">الحجوزات</span>
                  <span className="sm:hidden">حجوزات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="database" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">قاعدة البيانات</span>
                  <span className="sm:hidden">بيانات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">الإعدادات</span>
                  <span className="sm:hidden">إعدادات</span>
                </TabsTrigger>
              </>
            )}
            {/* Add this new tab for all users to access database settings */}
            <TabsTrigger 
              value="db-settings" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">إعدادات البيانات</span>
              <span className="sm:hidden">بيانات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {userProfile?.role === 'driver' && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات السائق</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">

                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
                        <div className="text-sm text-muted-foreground">إجمالي المركبات</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {vehicles.filter((v: any) => v.isActive).length}
                        </div>
                        <div className="text-sm text-muted-foreground">مركبات نشطة</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                        <div className="text-sm text-muted-foreground">الرحلات</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">الحجوزات</div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)} دج
                        </div>
                        <div className="text-sm text-muted-foreground">الأرباح</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {userProfile?.role === 'passenger' && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات الراكب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">إجمالي الحجوزات</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {bookings.filter((b: any) => b.status === 'confirmed').length}
                        </div>
                        <div className="text-sm text-muted-foreground">حجوزات مؤكدة</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                        <div className="text-sm text-muted-foreground">رحلات متاحة</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {userProfile?.role === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات الإدارة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{adminStats.totalUsers}</div>
                        <div className="text-sm text-muted-foreground">المستخدمين</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{trips.length}</div>
                        <div className="text-sm text-muted-foreground">الرحلات</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">الحجوزات</div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/5 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)} دج
                        </div>
                        <div className="text-sm text-muted-foreground">إجمالي الأرباح</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Vehicles Tab (Driver only) */}
          {userProfile?.role === 'driver' && (
            <TabsContent value="vehicles" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">مركباتي</h2>
                <Button onClick={() => setShowVehicleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مركبة
                </Button>
              </div>

              {showVehicleForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{vehicleForm.id ? "تعديل المركبة" : "إضافة مركبة جديدة"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitVehicleForm} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الماركة</label>
                          <input
                            type="text"
                            value={vehicleForm.make}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="مثال: Renault"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الموديل</label>
                          <input
                            type="text"
                            value={vehicleForm.model}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="مثال: Symbol"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">سنة الصنع</label>
                          <input
                            type="number"
                            value={vehicleForm.year}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="2020"
                            min="1990"
                            max="2024"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">اللون</label>
                          <input
                            type="text"
                            value={vehicleForm.color}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="أبيض"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">رقم اللوحة</label>
                          <input
                            type="text"
                            value={vehicleForm.licensePlate}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            placeholder="123-456-16"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">عدد المقاعد</label>
                          <input
                            type="number"
                            value={vehicleForm.seats}
                            onChange={(e) => setVehicleForm(prev => ({ ...prev, seats: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            min="2"
                            max="8"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          {vehicleForm.id ? "تحديث المركبة" : "إضافة المركبة"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowVehicleForm(false)}>
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {vehicles.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">لا توجد مركبات</h3>
                      <p className="text-muted-foreground mb-4">
                        لم تقم بإضافة أي مركبة بعد. أضف مركبتك الأولى للبدء.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        إضافة مركبة
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  vehicles.map((vehicle: any) => (
                    <Card key={vehicle.id} className="hover:shadow-elegant transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h3>
                              <p className="text-muted-foreground">
                                {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{vehicle.seats} مقاعد</span>
                                <Badge variant={vehicle.isActive ? "default" : "secondary"} className="text-xs">
                                  {vehicle.isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleVehicleStatus(vehicle.id, vehicle.isActive)}
                            >
                              {vehicle.isActive ? (
                                <PowerOff className="h-4 w-4 mr-2" />
                              ) : (
                                <Power className="h-4 w-4 mr-2" />
                              )}
                              {vehicle.isActive ? "إلغاء التفعيل" : "تفعيل"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              تعديل
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                console.log('DEBUG: Delete button clicked for vehicle:', vehicle.id);
                                if (confirm('هل أنت متأكد من حذف هذه المركبة؟ سيتم حذف جميع الرحلات المرتبطة بها.')) {
                                  console.log('DEBUG: User confirmed deletion, calling handleDeleteVehicle');
                                  handleDeleteVehicle(vehicle.id);
                                } else {
                                  console.log('DEBUG: User cancelled deletion');
                                }
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {userProfile?.role === 'driver' ? 'رحلاتي' : 'الرحلات المتاحة'}
              </h2>
              {userProfile?.role === 'driver' && (
                <Button 
                  onClick={() => setShowTripForm(true)}
                  disabled={!userProfile?.isVerified}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء رحلة
                </Button>
              )}
            </div>

            {/* Show verification message for unverified drivers */}
            {userProfile?.role === 'driver' && !userProfile?.isVerified && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">الحساب بانتظار الموافقة</h3>
                      <p className="text-yellow-700">
                        يجب أن يوافق المدير على حسابك قبل أن تتمكن من إنشاء رحلات. 
                        يرجى الانتظار حتى تتم الموافقة على حسابك.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showTripForm && userProfile?.role === 'driver' && userProfile?.isVerified && (
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء رحلة جديدة</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTrip} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">من</label>
                        <select
                          value={tripForm.fromWilayaId}
                          onChange={(e) => setTripForm(prev => ({ ...prev, fromWilayaId: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">اختر الولاية</option>
                          {wilayas.map((wilaya, index) => (
                            <option key={index} value={index + 1}>{wilaya.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">إلى</label>
                        <select
                          value={tripForm.toWilayaId}
                          onChange={(e) => setTripForm(prev => ({ ...prev, toWilayaId: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">اختر الولاية</option>
                          {wilayas.map((wilaya, index) => (
                            <option key={index} value={index + 1}>{wilaya.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المركبة</label>
                      {vehicles.filter((v: any) => v.isActive).length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            لا توجد مركبات نشطة. يرجى إضافة مركبة أولاً أو تفعيل إحدى المركبات الموجودة.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={tripForm.vehicleId}
                          onChange={(e) => setTripForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">اختر المركبة</option>
                          {vehicles.filter((v: any) => v.isActive).map((vehicle: any) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">التاريخ</label>
                        <input
                          type="date"
                          value={tripForm.departureDate}
                          onChange={(e) => setTripForm(prev => ({ ...prev, departureDate: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الوقت</label>
                        <input
                          type="time"
                          value={tripForm.departureTime}
                          onChange={(e) => setTripForm(prev => ({ ...prev, departureTime: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">سعر المقعد (دج)</label>
                        <input
                          type="number"
                          value={tripForm.pricePerSeat}
                          onChange={(e) => setTripForm(prev => ({ ...prev, pricePerSeat: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">عدد المقاعد</label>
                        <input
                          type="number"
                          value={tripForm.totalSeats}
                          onChange={(e) => setTripForm(prev => ({ ...prev, totalSeats: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الوصف (اختياري)</label>
                      <textarea
                        value={tripForm.description}
                        onChange={(e) => setTripForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        إنشاء الرحلة
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowTripForm(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter Section for Passengers and Admins */}
            {(userProfile?.role === 'passenger' || userProfile?.role === 'admin') && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">من الولاية</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => {
                          // In a real implementation, this would filter the trips
                          console.log('Filter by from wilaya:', e.target.value);
                        }}
                      >
                        <option value="">الكل</option>
                        {wilayas.map((wilaya, index) => (
                          <option key={index} value={index + 1}>{wilaya.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">إلى الولاية</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => {
                          // In a real implementation, this would filter the trips
                          console.log('Filter by to wilaya:', e.target.value);
                        }}
                      >
                        <option value="">الكل</option>
                        {wilayas.map((wilaya, index) => (
                          <option key={index} value={index + 1}>{wilaya.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">التاريخ</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => {
                          // In a real implementation, this would filter the trips
                          console.log('Filter by date:', e.target.value);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">السعر الأقصى</label>
                      <input
                        type="number"
                        placeholder="السعر بالدينار"
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => {
                          // In a real implementation, this would filter the trips
                          console.log('Filter by max price:', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {trips.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد رحلات</h3>
                    <p className="text-muted-foreground">
                      {userProfile?.role === 'driver' 
                        ? 'لم تقم بإنشاء أي رحلة بعد. أنشئ رحلتك الأولى للبدء.'
                        : 'لا توجد رحلات متاحة حالياً. تحقق لاحقاً.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                trips.map((trip: any) => (
                  <Card key={trip.id} className="hover:shadow-elegant transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-lg font-medium mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{trip.fromWilayaName || getWilayaName(trip.fromWilayaId)}</span>
                            <span className="text-muted-foreground">←</span>
                            <span>{trip.toWilayaName || getWilayaName(trip.toWilayaId)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>السائق: {trip.driver?.fullName}</span>
                            <Phone className="h-4 w-4" />
                            <span>{trip.driver?.phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{trip.pricePerSeat} دج</div>
                          <div className="text-sm text-muted-foreground">
                            {trip.availableSeats}/{trip.totalSeats} مقاعد متاحة
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.departureDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.vehicle?.make} {trip.vehicle?.model}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>تقييم: 4.8</span>
                        </div>
                      </div>

                      {trip.description && (
                        <p className="text-sm text-muted-foreground mb-4">{trip.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {userProfile?.role === 'passenger' && (
                          <Button className="flex-1" onClick={() => handleBookTrip(trip)}>
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">حجز مقعد</span>
                            <span className="sm:hidden">حجز</span>
                          </Button>
                        )}
                        {userProfile?.role === 'driver' && trip.driverId === user?.id && (
                          <div className="flex flex-wrap gap-2">
                            {/* Activate/Deactivate Button */}
                            <Button 
                              variant={trip.status === 'scheduled' ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleTripStatus(trip.id, trip.status)}
                              className={trip.status === 'scheduled' ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50" : ""}
                              disabled={!userProfile?.isVerified}
                            >
                              {trip.status === 'scheduled' ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">إلغاء</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">تفعيل</span>
                                </>
                              )}
                            </Button>
                            
                            {/* Delete Button */}
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذه الرحلة؟ سيتم حذف جميع الحجوزات المرتبطة بها.')) {
                                  handleDeleteTrip(trip.id);
                                }
                              }}
                              disabled={!userProfile?.isVerified}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">حذف</span>
                            </Button>
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">تفاصيل</span>
                          <span className="sm:hidden">تفاصيل</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>



          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">حجوزاتي</h2>
            </div>

            <div className="grid gap-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات</h3>
                    <p className="text-muted-foreground mb-4">
                      لم تقم بحجز أي رحلة بعد. ابدأ بالبحث عن رحلة مناسبة لك.
                    </p>
                    <Button>
                      <Search className="h-4 w-4 mr-2" />
                      البحث عن رحلة
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking: any) => (
                  <Card key={booking.id} className="hover:shadow-elegant transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusBadge(booking.status).variant}>
                              {getStatusBadge(booking.status).label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">#{booking.id}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-lg font-medium mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{booking.pickupLocation}</span>
                            <span className="text-muted-foreground">←</span>
                            <span>{booking.destinationLocation}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              {userProfile?.role === 'driver' 
                                ? `الراكب: ${booking.passenger?.fullName}` 
                                : `السائق: ${booking.driver?.fullName}`}
                            </span>
                            <Phone className="h-4 w-4" />
                            <span>
                              {userProfile?.role === 'driver' 
                                ? booking.passenger?.phone 
                                : booking.driver?.phone}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{booking.totalAmount} دج</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.seatsBooked} مقعد
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {booking.paymentMethod === 'cod' ? 'نقداً' : 'بريدي موب'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.trip?.departureDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.trip?.vehicle?.make} {booking.trip?.vehicle?.model}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.trip?.availableSeats}/{booking.trip?.totalSeats} مقاعد</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm"><strong>ملاحظات:</strong> {booking.notes}</p>
                        </div>
                      )}

                      {booking.specialRequests && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm"><strong>طلبات خاصة:</strong> {booking.specialRequests}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {userProfile?.role === 'driver' && booking.status === "pending" && (
                          <div className="flex flex-wrap gap-2 w-full">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleConfirmBooking(booking.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">قبول</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">رفض</span>
                            </Button>
                          </div>
                        )}
                        {userProfile?.role === 'driver' && booking.status === "confirmed" && (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleCompleteBooking(booking.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">إكمال الرحلة</span>
                            <span className="sm:hidden">إكمال</span>
                          </Button>
                        )}
                        {userProfile?.role === 'passenger' && booking.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">إلغاء الحجز</span>
                            <span className="sm:hidden">إلغاء</span>
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">تفاصيل</span>
                          <span className="sm:hidden">تفاصيل</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <NotificationCenter />
          </TabsContent>

          {/* Users Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="users" className="space-y-4">
              <UserManagement 
                users={users} 
                onUserAction={(userId: string, action: string) => {
                  console.log('User action:', userId, action);
                  // TODO: Implement user actions
                }}
              />
            </TabsContent>
          )}

          {/* Trips Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="admin-trips" className="space-y-4">
              <TripManagement />
            </TabsContent>
          )}

          {/* Bookings Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="admin-bookings" className="space-y-4">
              <BookingManagement />
            </TabsContent>
          )}

          {/* Database Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="database" className="space-y-4">
              <DatabaseManagement />
            </TabsContent>
          )}

          {/* Settings Tab (Admin only) */}
          {userProfile?.role === 'admin' && (
            <TabsContent value="settings" className="space-y-4">
              <SystemSettings />
            </TabsContent>
          )}

          {/* Database Settings Tab (For all users) */}
          <TabsContent value="db-settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">إعدادات قاعدة البيانات</h2>
            </div>
            <DatabaseSwitch />
          </TabsContent>

        </Tabs>
      </main>

      <Footer />
      
      {/* Booking Modal */}
      {showBookingModal && selectedTrip && (
        <BookingModal
          trip={selectedTrip}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTrip(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default UserDashboard;
