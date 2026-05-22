import { create } from 'zustand';

/**
 * Transaction type
 */
export type TransactionType = 'add' | 'withdraw' | 'fee' | 'refund' | 'prize' | 'purchase';

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'success' | 'failed';

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  meta?: {
    tournamentId?: string;
    matchId?: string;
    teamId?: string;
    description?: string;
    [key: string]: any;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction filters
 */
export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

/**
 * Transaction store state interface
 */
interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  setPagination: (pagination: Partial<TransactionState['pagination']>) => void;
  setLoading: (loading: boolean) => void;
  setFetchingMore: (fetching: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  transactions: [],
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    hasMore: true,
  },
  isLoading: false,
  isFetchingMore: false,
  error: null,
};

/**
 * Zustand store for transaction management
 * Provides global access to transaction data and operations
 */
export const useTransactionStore = create<TransactionState>((set) => ({
  ...initialState,

  setTransactions: (transactions) => set({ transactions, error: null }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...initialState.pagination },
    })),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setFetchingMore: (isFetchingMore) => set({ isFetchingMore }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

