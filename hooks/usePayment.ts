import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useWallet } from './useWallet';
import { useTransactions } from './useTransactions';
import { useAuthStore } from '../store/authStore';
import { TransactionType, TransactionStatus } from '../store/transactionStore';

/**
 * Payment receipt interface
 */
export interface PaymentReceipt {
  transactionId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  meta?: Record<string, any>;
}

/**
 * Custom hook for payment operations
 * Handles tournament payments, fund transfers, and receipt generation
 */
export const usePayment = () => {
  const { deductBalance, addBalance } = useWallet();
  const { createTransaction } = useTransactions();
  const { user } = useAuthStore();

  /**
   * Pay tournament entry fee
   */
  const payTournamentFee = useCallback(
    async (tournamentId: string, amount: number, teamId?: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      if (amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }

      try {
        // Check if payment already exists
        const { data: existing } = await supabase
          .from('tournament_payments')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('tournament_id', tournamentId)
          .single();

        if (existing && existing.status === 'success') {
          return { success: false, error: 'Payment already completed' };
        }

        // Deduct from user wallet
        const deductResult = await deductBalance(amount);
        if (!deductResult.success) {
          return { success: false, error: deductResult.error || 'Insufficient balance' };
        }

        // Create transaction record
        const transactionResult = await createTransaction(
          'fee',
          amount,
          'success',
          {
            tournamentId,
            teamId,
            description: `Tournament entry fee`,
          }
        );

        if (!transactionResult.success) {
          // Rollback wallet deduction
          await addBalance(amount);
          return { success: false, error: 'Failed to create transaction record' };
        }

        // Create or update tournament payment record
        if (existing) {
          const { error: updateError } = await supabase
            .from('tournament_payments')
            .update({
              amount,
              status: 'success',
              updatedAt: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            return { success: false, error: updateError.message };
          }
        } else {
          const { error: insertError } = await supabase
            .from('tournament_payments')
            .insert({
              userId: user.id,
              tournamentId,
              teamId,
              amount,
              status: 'success',
            });

          if (insertError) {
            return { success: false, error: insertError.message };
          }
        }

        // Get tournament organizer to transfer funds
        const { data: tournament } = await supabase
          .from('tournaments')
          .select('organizerId')
          .eq('id', tournamentId)
          .single();

        if (tournament) {
          // Transfer funds to organizer (add to their wallet)
          await transferFunds(user.id, tournament.organizerId, amount, {
            tournamentId,
            description: 'Tournament entry fee collection',
          });
        }

        const receipt = generatePaymentReceipt(
          transactionResult.data!.id,
          'fee',
          amount,
          'success',
          { tournamentId, teamId }
        );

        return { success: true, receipt };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment failed';
        return { success: false, error: errorMessage };
      }
    },
    [user, deductBalance, addBalance, createTransaction]
  );

  /**
   * Transfer funds between users
   */
  const transferFunds = useCallback(
    async (
      senderId: string,
      receiverId: string,
      amount: number,
      meta?: Record<string, any>
    ) => {
      if (amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }

      try {
        // Deduct from sender
        const { data: senderWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('userId', senderId)
          .single();

        if (!senderWallet || parseFloat(senderWallet.balance) < amount) {
          return { success: false, error: 'Insufficient balance' };
        }

        const senderNewBalance = parseFloat(senderWallet.balance) - amount;

        // Add to receiver
        const { data: receiverWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('userId', receiverId)
          .single();

        const receiverNewBalance = (parseFloat(receiverWallet?.balance || '0') || 0) + amount;

        // Update both wallets in a transaction
        const { error: senderError } = await supabase
          .from('wallets')
          .update({
            balance: senderNewBalance,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', senderId);

        if (senderError) {
          return { success: false, error: senderError.message };
        }

        const { error: receiverError } = await supabase
          .from('wallets')
          .update({
            balance: receiverNewBalance,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', receiverId);

        if (receiverError) {
          // Rollback sender
          await supabase
            .from('wallets')
            .update({
              balance: parseFloat(senderWallet.balance),
              updatedAt: new Date().toISOString(),
            })
            .eq('userId', senderId);
          return { success: false, error: receiverError.message };
        }

        // Create transaction records for both users
        await createTransaction('fee', amount, 'success', {
          ...meta,
          receiverId,
          description: 'Fund transfer',
        });

        // Create transaction for receiver (prize or refund)
        const receiverType = meta?.type === 'prize' ? 'prize' : 'refund';
        await supabase.from('transactions').insert({
          userId: receiverId,
          type: receiverType,
          amount,
          status: 'success',
          meta: { ...meta, senderId, description: 'Fund received' },
        });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
        return { success: false, error: errorMessage };
      }
    },
    [createTransaction]
  );

  /**
   * Generate payment receipt
   */
  const generatePaymentReceipt = useCallback(
    (
      transactionId: string,
      type: TransactionType,
      amount: number,
      status: TransactionStatus,
      meta?: Record<string, any>
    ): PaymentReceipt => {
      return {
        transactionId,
        type,
        amount,
        status,
        timestamp: new Date().toISOString(),
        meta,
      };
    },
    []
  );

  return {
    payTournamentFee,
    transferFunds,
    generatePaymentReceipt,
  };
};

