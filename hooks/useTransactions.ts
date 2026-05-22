import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useTransactionStore,
  Transaction,
  TransactionFilters,
  TransactionType,
  TransactionStatus,
} from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for transaction operations
 * Handles fetching, filtering, and creating transactions
 */
export const useTransactions = () => {
  const {
    transactions,
    filters,
    pagination,
    setTransactions,
    addTransaction,
    updateTransaction,
    setFilters,
    setPagination,
    setLoading,
    setFetchingMore,
    setError,
  } = useTransactionStore();
  const { user } = useAuthStore();

  /**
   * Fetch user transactions with filters and pagination
   */
  const getUserTransactions = useCallback(
    async (loadMore: boolean = false) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      if (loadMore) {
        setFetchingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const page = loadMore ? pagination.page + 1 : 1;
        const pageSize = pagination.pageSize;

        let query = supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('userId', user.id)
          .order('createdAt', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        // Apply filters
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.startDate) {
          query = query.gte('createdAt', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('createdAt', filters.endDate);
        }

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const formattedTransactions: Transaction[] = (data || []).map((t: any) => ({
          id: t.id,
          userId: t.userId,
          type: t.type as TransactionType,
          amount: parseFloat(t.amount) || 0,
          status: t.status as TransactionStatus,
          meta: t.meta || null,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }));

        if (loadMore) {
          setTransactions([...transactions, ...formattedTransactions]);
        } else {
          setTransactions(formattedTransactions);
        }

        const hasMore = count ? count > page * pageSize : false;
        setPagination({ page, hasMore });

        return { success: true, data: formattedTransactions };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [
      user,
      transactions,
      filters,
      pagination,
      setTransactions,
      setPagination,
      setLoading,
      setFetchingMore,
      setError,
    ]
  );

  /**
   * Filter transactions by criteria
   */
  const filterTransactions = useCallback(
    (newFilters: Partial<TransactionFilters>) => {
      setFilters(newFilters);
      getUserTransactions(false);
    },
    [setFilters, getUserTransactions]
  );

  /**
   * Create a new transaction
   */
  const createTransaction = useCallback(
    async (
      type: TransactionType,
      amount: number,
      status: TransactionStatus = 'pending',
      meta?: Record<string, any>
    ) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setError(null);

      try {
        const { data, error: createError } = await supabase
          .from('transactions')
          .insert({
            userId: user.id,
            type,
            amount,
            status,
            meta: meta || null,
          })
          .select()
          .single();

        if (createError) {
          setError(createError.message);
          return { success: false };
        }

        const transaction: Transaction = {
          id: data.id,
          userId: data.userId,
          type: data.type as TransactionType,
          amount: parseFloat(data.amount) || 0,
          status: data.status as TransactionStatus,
          meta: data.meta || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        addTransaction(transaction);
        return { success: true, data: transaction };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, addTransaction, setError]
  );

  return {
    transactions,
    filters,
    pagination,
    getUserTransactions,
    filterTransactions,
    createTransaction,
  };
};

