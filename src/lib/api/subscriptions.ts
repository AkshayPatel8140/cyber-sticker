/**
 * Centralized Subscriptions API Service
 * All subscription-related database operations should be handled here
 */

import { supabase } from '../supabase';

export type SubscriptionPlan = 'free' | 'pro' | 'studio';

/**
 * Get user's subscription plan from Supabase
 * Defaults to 'free' for new users
 * 
 * @param userId - The user ID to fetch subscription for
 * @returns The user's subscription plan
 */
export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .single();

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
 * Set user's subscription plan in Supabase
 * 
 * @param userId - The user ID
 * @param plan - The subscription plan to set
 */
export async function setUserSubscriptionPlan(userId: string, plan: SubscriptionPlan): Promise<void> {
  try {
    // First, check if user already has a subscription record
    const { data: existing, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Check if error is "no rows returned" (PGRST116) vs actual database error
    if (checkError) {
      // PGRST116 means no rows found - this is expected for new users
      if (checkError.code === 'PGRST116') {
        // No record exists, proceed with insert
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan,
            subscription_status: 'active',
          });

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
      } else {
        // Actual database error - don't proceed
        console.error('Error checking for existing subscription:', {
          message: checkError.message,
          code: checkError.code,
          details: checkError.details,
          hint: checkError.hint,
        });
        throw checkError;
      }
    }

    // Record exists, update it
    if (existing) {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating subscription plan:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
        });
        throw updateError;
      }
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
 * Creates a record if one doesn't exist
 * 
 * @param userId - The user ID
 * @returns The user's subscription plan
 */
export async function initializeUserSubscription(userId: string): Promise<SubscriptionPlan> {
  try {
    const currentPlan = await getUserSubscriptionPlan(userId);
    
    // If user doesn't have a record, create one with 'free' plan
    if (currentPlan === 'free') {
      const { data: existing, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      // Check if error is "no rows returned" (PGRST116) vs actual database error
      if (checkError) {
        // PGRST116 means no rows found - this is expected for new users
        if (checkError.code === 'PGRST116') {
          // User is new, create free subscription record
          await setUserSubscriptionPlan(userId, 'free');
        } else {
          // Actual database error - log and return free plan as fallback
          console.error('Error checking for existing subscription during initialization:', {
            message: checkError.message,
            code: checkError.code,
            details: checkError.details,
            hint: checkError.hint,
          });
          return 'free';
        }
      } else if (!existing) {
        // No error but no data (shouldn't happen, but handle gracefully)
        await setUserSubscriptionPlan(userId, 'free');
      }
    }
    
    return currentPlan;
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

