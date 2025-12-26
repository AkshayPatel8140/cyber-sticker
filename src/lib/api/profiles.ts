/**
 * Centralized User Profiles API Service
 * All user profile-related database operations should be handled here
 */

import { supabase } from '../supabase';

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

/**
 * Fetches a user profile by user_id
 * 
 * @param userId - The user ID to fetch profile for
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', fetchError);
      return null;
    }

    if (!data) {
      return null;
    }

    // Ensure social_links is always an array
    return {
      ...data,
      social_links: Array.isArray(data.social_links) ? data.social_links : [],
    } as UserProfile;
  } catch (error) {
    console.error('Unexpected error loading profile:', error);
    return null;
  }
}

/**
 * Updates or creates a user profile (upsert operation)
 * If profile exists, it updates; if not, it creates a new one
 * 
 * @param userId - The user ID
 * @param profileData - Partial profile data to update/insert
 * @returns The updated/created profile or null on error
 */
export async function upsertUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const payload = {
      user_id: userId,
      ...profileData,
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Ensure social_links is always an array
    return {
      ...data,
      social_links: Array.isArray(data.social_links) ? data.social_links : [],
    } as UserProfile;
  } catch (error) {
    console.error('Unexpected error upserting profile:', error);
    return null;
  }
}

