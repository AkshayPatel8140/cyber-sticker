'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  setUserSubscriptionPlan,
  initializeUserSubscription,
  type SubscriptionPlan 
} from '@/lib/api/subscriptions';

export function useSubscription() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (session?.user?.email) {
        try {
          // Initialize subscription for user using email (stable identifier)
          // Pass user.id for tracking, but email is the key
          const userPlan = await initializeUserSubscription(session.user.email, session.user.id);
          setPlan(userPlan);
        } catch (error) {
          console.error('Error loading subscription:', error);
          setPlan('free');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [session?.user?.email, session?.user?.id]);

  const updatePlan = async (newPlan: SubscriptionPlan) => {
    if (session?.user?.email) {
      try {
        // Use email as the stable identifier, pass user.id for tracking
        await setUserSubscriptionPlan(session.user.email, newPlan, session.user.id);
        setPlan(newPlan);
      } catch (error) {
        console.error('Error updating subscription plan:', error);
      }
    }
  };

  return {
    plan,
    updatePlan,
    isLoading,
    isAuthenticated: !!session?.user,
  };
}
