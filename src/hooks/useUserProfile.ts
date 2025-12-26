'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProfile, type UserProfile } from '@/lib/api/profiles';

// Re-export UserProfile for backward compatibility
export type { UserProfile };

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
    // Use email as the stable identifier (doesn't change across login sessions)
    if (!session?.user?.email) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use email as primary lookup (stable identifier)
      const profileData = await getUserProfile(session.user.email, true);

      if (!profileData) {
        // No profile yet, construct a default profile object (not saved until user edits)
        const defaultProfile: UserProfile = {
          user_id: session.user.id || '',
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
        setProfile(profileData);
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
  }, [session?.user?.email]);

  return {
    profile,
    isLoading,
    error,
    refresh: loadProfile,
  };
}


