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
    // Use requestAnimationFrame to defer state updates and avoid synchronous setState
    const updateState = () => {
      if (session?.user?.id) {
        // Initialize subscription for user (defaults to free if new)
        const userPlan = initializeUserSubscription(session.user.id);
        setPlan(userPlan);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    requestAnimationFrame(updateState);
  }, [session?.user?.id]);

  const updatePlan = (newPlan: SubscriptionPlan) => {
    if (session?.user?.id) {
      setUserSubscriptionPlan(session.user.id, newPlan);
      setPlan(newPlan);
    }
  };

  return {
    plan,
    updatePlan,
    isLoading,
    isAuthenticated: !!session?.user,
  };
}
