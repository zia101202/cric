import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useWalletStore, Wallet } from '../store/walletStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for wallet operations
 * Handles wallet balance fetching, real-time updates, and balance modifications
 */
export const useWallet = () => {
  const {
    wallet,
    setWallet,
    setBalance,
    setLoading,
    setError,
  } = useWalletStore();
  const { user } = useAuthStore();

  /**
   * Fetch wallet balance from Supabase
   */
  const getWalletBalance = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('userId', user.id)
        .single();

      if (fetchError) {
        // If wallet doesn't exist, create one
        if (fetchError.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({
              userId: user.id,
              balance: 0,
            })
            .select()
            .single();

          if (createError) {
            setError(createError.message);
            return { success: false };
          }

          const wallet: Wallet = {
            id: newWallet.id,
            userId: user.id,
            balance: parseFloat(newWallet.balance) || 0,
            updatedAt: newWallet.updatedAt,
          };

          setWallet(wallet);
          return { success: true, data: wallet };
        }

        setError(fetchError.message);
        return { success: false };
      }

      const wallet: Wallet = {
        id: data.id,
        userId: data.userId,
        balance: parseFloat(data.balance) || 0,
        updatedAt: data.updatedAt,
      };

      setWallet(wallet);
      return { success: true, data: wallet };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user, setWallet, setLoading, setError]);

  /**
   * Subscribe to real-time wallet updates
   */
  const subscribeWalletRealtime = useCallback(() => {
    if (!user?.id) return () => {};

    const channel = supabase
      .channel(`wallet:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          const updatedWallet = payload.new as any;
          setBalance(parseFloat(updatedWallet.balance) || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setBalance]);

  /**
   * Add balance to wallet
   */
  const addBalance = useCallback(
    async (amount: number) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      if (amount <= 0) {
        setError('Amount must be greater than zero');
        return { success: false };
      }

      setError(null);

      try {
        // Get current balance
        const currentBalance = wallet?.balance || 0;
        const newBalance = currentBalance + amount;

        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', user.id);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        setBalance(newBalance);
        return { success: true, newBalance };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add balance';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, wallet, setBalance, setError]
  );

  /**
   * Deduct balance from wallet
   */
  const deductBalance = useCallback(
    async (amount: number) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      if (amount <= 0) {
        setError('Amount must be greater than zero');
        return { success: false };
      }

      const currentBalance = wallet?.balance || 0;
      if (currentBalance < amount) {
        setError('Insufficient balance');
        return { success: false };
      }

      setError(null);

      try {
        const newBalance = currentBalance - amount;

        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', user.id);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        setBalance(newBalance);
        return { success: true, newBalance };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to deduct balance';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, wallet, setBalance, setError]
  );

  /**
   * Initialize wallet subscription on mount
   */
  useEffect(() => {
    if (user?.id) {
      getWalletBalance();
      const unsubscribe = subscribeWalletRealtime();
      return unsubscribe;
    }
  }, [user, getWalletBalance, subscribeWalletRealtime]);

  return {
    wallet,
    getWalletBalance,
    subscribeWalletRealtime,
    addBalance,
    deductBalance,
  };
};

