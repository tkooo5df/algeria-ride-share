import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { BrowserDatabaseService } from '@/integrations/database/browserServices';
import { toast } from '@/hooks/use-toast';

interface LocalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  role: 'driver' | 'passenger' | 'admin';
  wilaya: string;
  commune: string;
  address: string;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const useLocalAuth = () => {
  const { getDatabaseService, isInitialized } = useDatabase();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Test accounts
  const testAccounts = {
    driver: {
      email: 'driver@test.com',
      password: 'driver123',
      role: 'driver' as const
    },
    passenger: {
      email: 'passenger@test.com',
      password: 'passenger123',
      role: 'passenger' as const
    },
    admin: {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin' as const
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('localUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('localUser');
        }
      }
    };

    if (isInitialized) {
      checkAuth();
    }
  }, [isInitialized]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Check if it's a test account
      const testAccount = Object.values(testAccounts).find(account => 
        account.email === email && account.password === password
      );

      if (testAccount) {
        // Create or get test account profile
        let profile = await BrowserDatabaseService.getProfileByEmail(email);
        
        if (!profile) {
          // Create test account profile
          const profileData = {
            id: `test-${testAccount.role}-${Date.now()}`,
            email: email,
            firstName: testAccount.role === 'driver' ? 'أحمد' : testAccount.role === 'passenger' ? 'فاطمة' : 'مدير',
            lastName: testAccount.role === 'driver' ? 'السائق' : testAccount.role === 'passenger' ? 'الراكبة' : 'النظام',
            fullName: testAccount.role === 'driver' ? 'أحمد السائق' : testAccount.role === 'passenger' ? 'فاطمة الراكبة' : 'مدير النظام',
            phone: '+213 555 123 456',
            role: testAccount.role,
            wilaya: 'الجزائر',
            commune: 'الجزائر الوسطى',
            address: 'شارع ديدوش مراد، الجزائر',
            isVerified: true,
          };

          profile = await BrowserDatabaseService.createProfile(profileData);
        }

        // Convert to LocalUser format
        const localUser: LocalUser = {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: profile.fullName,
          phone: profile.phone,
          role: profile.role as 'driver' | 'passenger' | 'admin',
          wilaya: profile.wilaya,
          commune: profile.commune,
          address: profile.address,
          isVerified: profile.isVerified,
          avatarUrl: profile.avatarUrl,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        };

        setUser(localUser);
        localStorage.setItem('localUser', JSON.stringify(localUser));

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${localUser.fullName}!`,
        });

        return { user: localUser, error: null };
      } else {
        // Try to find user in database
        const profile = await BrowserDatabaseService.getProfileByEmail(email);
        
        if (profile) {
          // For now, we'll just check if the profile exists
          // In a real app, you'd verify the password hash
          const localUser: LocalUser = {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            fullName: profile.fullName,
            phone: profile.phone,
            role: profile.role as 'driver' | 'passenger' | 'admin',
            wilaya: profile.wilaya,
            commune: profile.commune,
            address: profile.address,
            isVerified: profile.isVerified,
            avatarUrl: profile.avatarUrl,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          };

          setUser(localUser);
          localStorage.setItem('localUser', JSON.stringify(localUser));

          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحباً ${localUser.fullName}!`,
          });

          return { user: localUser, error: null };
        } else {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || 'حدث خطأ غير متوقع',
        variant: "destructive"
      });
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('localUser');
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  };

  const updateProfile = async (updates: Partial<LocalUser>) => {
    if (!user) return { error: 'No user logged in' };
    
    try {
      const updatedProfile = await BrowserDatabaseService.updateProfile(user.id, updates);
      
      if (updatedProfile) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('localUser', JSON.stringify(updatedUser));
        
        toast({
          title: "تم تحديث الملف الشخصي",
          description: "تم حفظ التغييرات بنجاح",
        });
        
        return { user: updatedUser, error: null };
      } else {
        throw new Error('فشل في تحديث الملف الشخصي');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message || 'حدث خطأ غير متوقع',
        variant: "destructive"
      });
      return { user: null, error: error.message };
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
    testAccounts,
    // Quick login without password: ensures Local DB mode and signs in as a role
    loginAs: async (role: 'admin' | 'driver' | 'passenger') => {
      try {
        // Force Local DB mode for the app
        localStorage.setItem('database_type', 'local');

        const defaultEmail = role === 'admin' ? 'admin@test.com' : role === 'driver' ? 'driver@test.com' : 'passenger@test.com';
        let profile = await BrowserDatabaseService.getProfileByEmail(defaultEmail);
        if (!profile) {
          profile = await BrowserDatabaseService.createProfile({
            id: `user-${role}-${Date.now()}`,
            email: defaultEmail,
            firstName: role === 'admin' ? 'مدير' : role === 'driver' ? 'أحمد' : 'فاطمة',
            lastName: role === 'admin' ? 'النظام' : role === 'driver' ? 'السائق' : 'الراكبة',
            fullName: role === 'admin' ? 'مدير النظام' : role === 'driver' ? 'أحمد السائق' : 'فاطمة الراكبة',
            phone: '+213 555 000 000',
            role,
            wilaya: 'الجزائر',
            commune: 'الجزائر الوسطى',
            address: 'غير محدد',
            isVerified: true,
          });
        }

        const localUser: LocalUser = {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: profile.fullName,
          phone: profile.phone || '',
          role: profile.role as 'admin' | 'driver' | 'passenger',
          wilaya: profile.wilaya,
          commune: profile.commune,
          address: profile.address,
          isVerified: profile.isVerified,
          avatarUrl: profile.avatarUrl,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        };

        setUser(localUser);
        localStorage.setItem('localUser', JSON.stringify(localUser));
        toast({ title: 'تم تسجيل الدخول محلياً', description: `مرحباً ${localUser.fullName}` });
        return { user: localUser };
      } catch (error: any) {
        toast({ title: 'تعذر تسجيل الدخول محلياً', description: error?.message || 'حدث خطأ', variant: 'destructive' });
        return { user: null };
      }
    }
  };
};
