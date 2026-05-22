import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useWallet } from './useWallet';
import { useTransactions } from './useTransactions';
import { useAuthStore } from '../store/authStore';

/**
 * Withdraw request interface
 */
export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom hook for withdrawal operations
 * Handles withdrawal requests, admin approval, and status updates
 */
export const useWithdraw = () => {
  const { deductBalance } = useWallet();
  const { createTransaction } = useTransactions();
  const { user } = useAuthStore();

  /**
   * Request withdrawal
   */
  const requestWithdraw = useCallback(
    async (amount: number, minWithdrawal: number = 100) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      if (amount < minWithdrawal) {
        return {
          success: false,
          error: `Minimum withdrawal amount is PKR ${minWithdrawal}`,
        };
      }

      try {
        // Check wallet balance
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('userId', user.id)
          .single();

        if (!wallet || parseFloat(wallet.balance) < amount) {
          return { success: false, error: 'Insufficient balance' };
        }

        // Check for pending requests
        const { data: pending } = await supabase
          .from('withdraw_requests')
          .select('id')
          .eq('userId', user.id)
          .eq('status', 'pending')
          .single();

        if (pending) {
          return { success: false, error: 'You have a pending withdrawal request' };
        }

        // Create withdrawal request
        const { data, error: createError } = await supabase
          .from('withdraw_requests')
          .insert({
            userId: user.id,
            amount,
            status: 'pending',
          })
          .select()
          .single();

        if (createError) {
          return { success: false, error: createError.message };
        }

        // Create transaction record
        await createTransaction('withdraw', amount, 'pending', {
          withdrawRequestId: data.id,
          description: 'Withdrawal request',
        });

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Withdrawal request failed';
        return { success: false, error: errorMessage };
      }
    },
    [user, createTransaction]
  );

  /**
   * Admin: Approve withdrawal request
   */
  const approveWithdraw = useCallback(
    async (requestId: string, adminId: string) => {
      try {
        // Get withdrawal request
        const { data: request, error: fetchError } = await supabase
          .from('withdraw_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (fetchError || !request) {
          return { success: false, error: 'Withdrawal request not found' };
        }

        if (request.status !== 'pending') {
          return { success: false, error: 'Request is not pending' };
        }

        // Deduct from user wallet
        const deductResult = await deductBalance(request.amount);
        if (!deductResult.success) {
          return { success: false, error: 'Failed to deduct balance' };
        }

        // Update withdrawal request
        const { error: updateError } = await supabase
          .from('withdraw_requests')
          .update({
            status: 'approved',
            approvedBy: adminId,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (updateError) {
          // Rollback wallet deduction
          await supabase
            .from('wallets')
            .update({
              balance: (parseFloat(request.amount) || 0) + (deductResult.newBalance || 0),
              updatedAt: new Date().toISOString(),
            })
            .eq('userId', request.userId);
          return { success: false, error: updateError.message };
        }

        // Update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'success',
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', request.userId)
          .eq('type', 'withdraw')
          .eq('meta->>withdrawRequestId', requestId);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Approval failed';
        return { success: false, error: errorMessage };
      }
    },
    [deductBalance]
  );

  /**
   * Admin: Reject withdrawal request
   */
  const rejectWithdraw = useCallback(
    async (requestId: string, adminId: string, reason?: string) => {
      try {
        const { error: updateError } = await supabase
          .from('withdraw_requests')
          .update({
            status: 'rejected',
            approvedBy: adminId,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        // Update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            updatedAt: new Date().toISOString(),
          })
          .eq('type', 'withdraw')
          .eq('meta->>withdrawRequestId', requestId);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Rejection failed';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Get user's withdrawal requests
   */
  const getWithdrawRequests = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('withdraw_requests')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch requests';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  return {
    requestWithdraw,
    approveWithdraw,
    rejectWithdraw,
    getWithdrawRequests,
  };
};

