import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Subscription plan
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'annual';
  features: string[];
}

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

/**
 * User subscription
 */
export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd?: boolean;
  plan?: SubscriptionPlan;
}

/**
 * Custom hook for subscription management
 * Handles premium features, subscriptions, and billing
 */
export const useSubscriptions = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSubscription();
    }
  }, [user]);

  /**
   * Load user subscription
   */
  const loadSubscription = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const userSubscription: UserSubscription = {
          id: data.id,
          userId: data.user_id,
          planId: data.plan_id,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          plan: data.subscription_plans,
        };
        setSubscription(userSubscription);
        setIsPremium(true);
      } else {
        setSubscription(null);
        setIsPremium(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription';
      setError(errorMessage);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get available subscription plans
   */
  const getPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const plans: SubscriptionPlan[] =
        data?.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          currency: item.currency || 'INR',
          interval: item.interval,
          features: item.features || [],
        })) || [];

      return { success: true, data: plans };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get plans';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subscribe to a plan
   */
  const subscribe = useCallback(
    async (planId: string, paymentMethodId?: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading(true);
      setError(null);

      try {
        // In production, this would integrate with Stripe or other payment gateway
        // For now, create a subscription record directly

        const startDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // Default to monthly

        const { data, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_id: planId,
            status: 'active',
            start_date: startDate,
            end_date: endDate.toISOString(),
            payment_method_id: paymentMethodId,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        await loadSubscription();

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user, loadSubscription]
  );

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(
    async (cancelAtPeriodEnd: boolean = true) => {
      if (!subscription) {
        return { success: false, error: 'No active subscription' };
      }

      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: cancelAtPeriodEnd,
            status: cancelAtPeriodEnd ? 'active' : 'cancelled',
          })
          .eq('id', subscription.id);

        if (updateError) {
          throw updateError;
        }

        await loadSubscription();

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [subscription, loadSubscription]
  );

  /**
   * Check if user has premium access
   */
  const checkPremiumAccess = useCallback((feature: string): boolean => {
    if (!isPremium || !subscription) {
      return false;
    }

    // Check if feature is available in plan
    // This would be configured based on plan features
    return true;
  }, [isPremium, subscription]);

  return {
    loading,
    error,
    subscription,
    isPremium,
    loadSubscription,
    getPlans,
    subscribe,
    cancelSubscription,
    checkPremiumAccess,
  };
};

