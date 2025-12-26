/**
 * Centralized Subscriptions API Service
 * All subscription-related database operations should be handled here
 */

import { supabase } from '../supabase';

export type SubscriptionPlan = 'free' | 'pro' | 'studio';

/**
 * Get user's subscription plan from Supabase using email as the stable identifier
 * Defaults to 'free' for new users
 * 
 * @param email - The user's email address (stable identifier)
 * @returns The user's subscription plan
 */
export async function getUserSubscriptionPlan(email: string | null | undefined): Promise<SubscriptionPlan> {
  try {
    // If no email provided, return free plan
    if (!email) {
      return 'free';
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      // User doesn't have a subscription record yet, return free
      return 'free';
    }

    return (data.plan as SubscriptionPlan) || 'free';
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return 'free';
  }
}

/**
 * Set user's subscription plan in Supabase using email as the stable identifier
 * 
 * @param email - The user's email address (stable identifier)
 * @param plan - The subscription plan to set
 * @param userId - Optional: current user_id for tracking (can be different each login)
 */
export async function setUserSubscriptionPlan(
  email: string | null | undefined,
  plan: SubscriptionPlan,
  userId?: string
): Promise<void> {
  try {
    // If no email provided, cannot create subscription
    if (!email) {
      throw new Error('Email is required to set subscription plan');
    }

    // First, check if user already has a subscription record by email
    const { data: existing, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    // Handle errors (PGRST116 means no rows found, which is expected for new users)
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing subscription:', checkError);
      throw checkError;
    }

    // If no record exists, create one
    if (!existing) {
      const insertData: {
        email: string;
        plan: SubscriptionPlan;
        subscription_status: string;
        user_id?: string;
      } = {
        email,
        plan,
        subscription_status: 'active',
      };
      
      // Include user_id if provided (for tracking, but email is the key)
      if (userId) {
        insertData.user_id = userId;
      }

      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating subscription plan:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
        throw insertError;
      }
      
      return;
    }

    // Record exists, update it by email
    const updateData: {
      plan: SubscriptionPlan;
      updated_at: string;
      user_id?: string;
    } = {
      plan,
      updated_at: new Date().toISOString(),
    };
    
    // Update user_id if provided (to track latest login)
    if (userId) {
      updateData.user_id = userId;
    }

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('email', email);

    if (updateError) {
      console.error('Error updating subscription plan:', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      throw updateError;
    }
  } catch (error) {
    // Handle both Supabase errors and generic errors
    if (error && typeof error === 'object' && 'message' in error) {
      const supabaseError = error as { message?: string; code?: string; details?: string; hint?: string };
      console.error('Failed to save subscription plan:', {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint,
      });
    } else {
      console.error('Failed to save subscription plan:', error);
    }
    throw error;
  }
}

/**
 * Initialize subscription plan for new user (defaults to free)
 * Creates a record if one doesn't exist using email as the stable identifier
 * Also updates user_id if provided to track the latest login session
 * 
 * @param email - The user's email address (stable identifier)
 * @param userId - Optional: current user_id for tracking
 * @returns The user's subscription plan
 */
export async function initializeUserSubscription(
  email: string | null | undefined,
  userId?: string
): Promise<SubscriptionPlan> {
  try {
    // If no email provided, return free plan
    if (!email) {
      console.warn('initializeUserSubscription: No email provided');
      return 'free';
    }

    // First, check if a subscription record exists for this email
    const { data: existing, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('plan, user_id')
      .eq('email', email)
      .maybeSingle();

    // Handle errors (PGRST116 means no rows found, which is expected for new users)
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing subscription:', checkError);
      return 'free';
    }

    // If record exists, update user_id if provided and different
    if (existing && existing.plan) {
      // Update user_id if provided and it's different from current
      if (userId && existing.user_id !== userId) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ 
            user_id: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating user_id in subscription:', updateError);
          // Don't fail - just log the error and return the plan
        }
      }
      
      return (existing.plan as SubscriptionPlan) || 'free';
    }

    // No record exists - create one with 'free' plan
    await setUserSubscriptionPlan(email, 'free', userId);
    
    // Verify it was created and return
    const { data: created } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('email', email)
      .maybeSingle();
    
    return (created?.plan as SubscriptionPlan) || 'free';
  } catch (error) {
    // Handle both Supabase errors and generic errors
    if (error && typeof error === 'object' && 'message' in error) {
      const supabaseError = error as { message?: string; code?: string; details?: string; hint?: string };
      console.error('Error initializing subscription:', {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint,
      });
    } else {
      console.error('Error initializing subscription:', error);
    }
    return 'free';
  }
}

/**
 * Check if user can access a plan (tier hierarchy)
 * Studio includes Pro and Free
 * Pro includes Free
 * 
 * @param userPlan - The user's current plan
 * @param targetPlan - The plan to check access for
 * @returns True if user can access the target plan
 */
export function canAccessPlan(userPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean {
  if (targetPlan === 'free') return true; // Everyone can access free
  if (targetPlan === 'pro') return userPlan === 'pro' || userPlan === 'studio';
  if (targetPlan === 'studio') return userPlan === 'studio';
  return false;
}

/**
 * Check if plan is current plan or included in current plan
 * 
 * @param userPlan - The user's current plan
 * @param targetPlan - The plan to check
 * @returns True if target plan is included in user's plan
 */
export function isCurrentOrIncludedPlan(userPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean {
  if (userPlan === 'studio') {
    // Studio includes all plans
    return true;
  }
  if (userPlan === 'pro') {
    // Pro includes Free and Pro
    return targetPlan === 'free' || targetPlan === 'pro';
  }
  // Free only includes Free
  return targetPlan === 'free';
}

