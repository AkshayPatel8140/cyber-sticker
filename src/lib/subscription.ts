/**
 * Subscription management utilities using Supabase
 */

import { supabase } from './supabase';

export type SubscriptionPlan = 'free' | 'pro' | 'studio';

/**
 * Get user's subscription plan from Supabase
 * Defaults to 'free' for new users
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
          console.error('Error creating subscription plan:', insertError);
          throw insertError;
        }
        return;
      } else {
        // Actual database error - don't proceed
        console.error('Error checking for existing subscription:', checkError);
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
        console.error('Error updating subscription plan:', updateError);
        throw updateError;
      }
    }
  } catch (error) {
    console.error('Failed to save subscription plan:', error);
    throw error;
  }
}

/**
 * Initialize subscription plan for new user (defaults to free)
 * Creates a record if one doesn't exist
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
          console.error('Error checking for existing subscription during initialization:', checkError);
          return 'free';
        }
      } else if (!existing) {
        // No error but no data (shouldn't happen, but handle gracefully)
        await setUserSubscriptionPlan(userId, 'free');
      }
    }
    
    return currentPlan;
  } catch (error) {
    console.error('Error initializing subscription:', error);
    return 'free';
  }
}

/**
 * Check if user can access a plan (tier hierarchy)
 * Studio includes Pro and Free
 * Pro includes Free
 */
export function canAccessPlan(userPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean {
  if (targetPlan === 'free') return true; // Everyone can access free
  if (targetPlan === 'pro') return userPlan === 'pro' || userPlan === 'studio';
  if (targetPlan === 'studio') return userPlan === 'studio';
  return false;
}

/**
 * Check if plan is current plan or included in current plan
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
