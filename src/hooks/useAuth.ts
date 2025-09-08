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

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  first_name: user.user_metadata?.first_name || '',
                  last_name: user.user_metadata?.last_name || '',
                  role: user.user_metadata?.role || 'passenger',
                }
              ])
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              setProfile(newProfile);
            }
          }
        } else {
          setProfile(data);
        }
      };

      fetchProfile();
      
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

  return { 
    session, 
    user, 
    profile, 
    loading, 
    updateProfile, 
    signOut 
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