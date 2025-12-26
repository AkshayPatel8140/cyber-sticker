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
 * Fetches a user profile by email (preferred) or user_id (fallback)
 * Email is the stable identifier that doesn't change across login sessions
 * 
 * @param identifier - Email (preferred) or user_id (fallback)
 * @param useEmail - If true, treats identifier as email; if false, as user_id
 * @returns The user profile or null if not found
 */
export async function getUserProfile(
  identifier: string,
  useEmail: boolean = true
): Promise<UserProfile | null> {
  try {
    if (!identifier) {
      return null;
    }

    // Use email as primary lookup (stable identifier)
    if (useEmail) {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', identifier)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile by email:', fetchError);
        return null;
      }

      if (data) {
        return {
          ...data,
          social_links: Array.isArray(data.social_links) ? data.social_links : [],
        } as UserProfile;
      }
    }

    // Fallback to user_id lookup (for backward compatibility)
    const { data, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', identifier)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile by user_id:', fetchError);
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
 * Uses email as the stable identifier to prevent duplicate profiles
 * 
 * @param email - The user's email address (stable identifier)
 * @param profileData - Partial profile data to update/insert
 * @param userId - Optional: current user_id for tracking (can be different each login)
 * @returns The updated/created profile or null on error
 */
export async function upsertUserProfile(
  email: string | null | undefined,
  profileData: Partial<UserProfile>,
  userId?: string
): Promise<UserProfile | null> {
  try {
    // Email is required for upsert
    if (!email) {
      console.error('Email is required to upsert user profile');
      return null;
    }

    // Check if profile already exists by email
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const payload: Partial<UserProfile> = {
      email,
      ...profileData,
    };

    // Include user_id if provided (for tracking, but email is the key)
    if (userId) {
      payload.user_id = userId;
    }

    // Use email as the conflict key to prevent duplicates
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' })
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

