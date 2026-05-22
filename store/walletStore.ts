import { create } from 'zustand';

/**
 * Wallet interface
 */
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

/**
 * Wallet store state interface
 */
interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  setWallet: (wallet: Wallet | null) => void;
  setBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  wallet: null,
  isLoading: false,
  error: null,
};

/**
 * Zustand store for wallet management
 * Provides global access to wallet balance and operations
 */
export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,

  setWallet: (wallet) => set({ wallet, error: null }),

  setBalance: (balance) =>
    set((state) => ({
      wallet: state.wallet
        ? { ...state.wallet, balance, updatedAt: new Date().toISOString() }
        : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

