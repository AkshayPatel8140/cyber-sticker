'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  setUserSubscriptionPlan,
  initializeUserSubscription,
  type SubscriptionPlan 
} from '@/lib/subscription';

export function useSubscription() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (session?.user?.id) {
        try {
          // Initialize subscription for user (defaults to free if new)
          const userPlan = await initializeUserSubscription(session.user.id);
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
  }, [session?.user?.id]);

  const updatePlan = async (newPlan: SubscriptionPlan) => {
    if (session?.user?.id) {
      try {
        await setUserSubscriptionPlan(session.user.id, newPlan);
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
