import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  language: string | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  date_of_birth: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear profile when signing out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // First, try to get the profile with all required fields
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name, phone, role, avatar_url, is_verified, language, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      // If no profile exists, synthesize one from metadata without attempting a client-side insert
      if (!data) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const metadata = userData.user.user_metadata || {};
          const normalizedRole = (metadata.role === 'driver'
            || metadata.role === 'passenger'
            || metadata.role === 'admin'
            || metadata.role === 'developer')
            ? metadata.role
            : 'passenger';

          const fallbackProfile: Profile = {
            id: userId,
            email: userData.user.email || null,
            full_name: metadata.full_name || metadata.name || null,
            first_name: metadata.first_name || null,
            last_name: metadata.last_name || null,
            phone: metadata.phone || null,
            role: normalizedRole,
            avatar_url: metadata.avatar_url || metadata.avatarURL || null,
            language: metadata.language || 'ar',
            wilaya: metadata.wilaya || null,
            commune: metadata.commune || null,
            address: metadata.address || null,
            date_of_birth: metadata.date_of_birth || null,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return fallbackProfile;
        }
      }

      // If profile exists but role is missing or incorrect, try to get it from user_metadata
      if (data && (!data.role || data.role === 'passenger')) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const metadata = userData.user.user_metadata || {};
          console.log('DEBUG: Checking role mismatch. Profile role:', data.role, 'Metadata role:', metadata.role);
          if (metadata.role && metadata.role !== 'passenger') {
            console.log('DEBUG: Role mismatch detected! Fixing profile role from', data.role, 'to', metadata.role);
            // Update the profile with the correct role from metadata
            const updatedProfile = { ...data, role: metadata.role };
            
            // Also update the database to fix the role for future logins
            try {
              await supabase
                .from('profiles')
                .update({ role: metadata.role })
                .eq('id', userId);
              console.log('DEBUG: Successfully updated profile role in database');
            } catch (updateError) {
              console.error('Error updating profile role:', updateError);
            }
            
            return updatedProfile;
          }
        }
      }

      return data as (Profile | null);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      };

      fetchUserProfile();
      
      // Set up real-time subscription for profile changes
      const profileSubscription = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setProfile(payload.new as Profile);
            }
          }
        )
        .subscribe();

      return () => {
        profileSubscription.unsubscribe();
      };
    } else {
      setProfile(null);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return { error: error.message };
    }
    
    setProfile(data);
    return { data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return { error: error.message };
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  };
  return { 
    session, 
    user, 
    profile, 
    loading, 
    updateProfile, 
    signOut,
    signInWithGoogle,
    signIn
  };
};