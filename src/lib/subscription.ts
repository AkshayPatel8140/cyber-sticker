/**
 * Subscription management utilities
 * In a real app, this would interact with a database/API
 * For now, we use localStorage to persist subscription plans
 */

export type SubscriptionPlan = 'free' | 'pro' | 'studio';

const STORAGE_KEY = 'user_subscription_plan';

/**
 * Get user's subscription plan
 * Defaults to 'free' for new users
 */
export function getUserSubscriptionPlan(userId: string): SubscriptionPlan {
  if (typeof window === 'undefined') return 'free';
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return (stored as SubscriptionPlan) || 'free';
  } catch {
    return 'free';
  }
}

/**
 * Set user's subscription plan
 */
export function setUserSubscriptionPlan(userId: string, plan: SubscriptionPlan): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, plan);
  } catch (error) {
    console.error('Failed to save subscription plan:', error);
  }
}

/**
 * Initialize subscription plan for new user (defaults to free)
 */
export function initializeUserSubscription(userId: string): SubscriptionPlan {
  const currentPlan = getUserSubscriptionPlan(userId);
  if (currentPlan === 'free') {
    // User is new, ensure they have free plan
    setUserSubscriptionPlan(userId, 'free');
  }
  return currentPlan;
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
