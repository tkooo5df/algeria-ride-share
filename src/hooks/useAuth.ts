import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
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
      // First, try to get the profile
      let { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // If profiles table doesn't exist or has different schema, create a basic profile
        if (error.code === 'PGRST116' || error.code === 'PGRST204') {
          // Try to create a basic profile entry
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const basicProfile = {
              id: userId,
              email: userData.user.email,
              role: 'passenger',
              created_at: new Date().toISOString()
            };
            
            // Try to insert with minimal schema
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert([basicProfile])
              .select('id, email, role, created_at')
              .single();
              
            if (!insertError) {
              return insertData;
            }
          }
        }
        console.error('Error fetching profile:', error.message);
        return null;
      }

      return data || null;
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