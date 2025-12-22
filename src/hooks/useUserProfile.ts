'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id?: number;
  user_id: string;
  email: string | null;
  display_name: string | null;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  social_links: string[]; // stored as JSON array in Supabase
  member_since: string | null;
  last_updated_at: string | null;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        setError('Failed to load profile');
        setProfile(null);
      } else if (!data) {
        // No profile yet, construct a default profile object (not saved until user edits)
        const defaultProfile: UserProfile = {
          user_id: session.user.id,
          email: session.user.email ?? null,
          display_name: session.user.name ?? null,
          title: null,
          bio: null,
          avatar_url: session.user.image ?? null,
          social_links: [],
          member_since: null,
          last_updated_at: null,
        };
        setProfile(defaultProfile);
      } else {
        setProfile({
          ...data,
          social_links: Array.isArray(data.social_links)
            ? data.social_links
            : [],
        } as UserProfile);
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      setError('Failed to load profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return {
    profile,
    isLoading,
    error,
    refresh: loadProfile,
  };
}


