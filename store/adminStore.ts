import { create } from 'zustand';

/**
 * Admin scope types
 */
export type AdminScope = 'users' | 'tournaments' | 'matches' | 'disputes' | 'finance' | 'moderation' | 'analytics';

/**
 * Filter types for different scopes
 */
export interface UserFilters {
  query?: string;
  role?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  isBanned?: boolean;
  sortBy?: 'name' | 'email' | 'lastActive' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TournamentFilters {
  query?: string;
  status?: 'draft' | 'pending' | 'official' | 'ongoing' | 'completed';
  sortBy?: 'name' | 'createdAt' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

export interface MatchFilters {
  query?: string;
  tournamentId?: string;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  sortBy?: 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DisputeFilters {
  status?: 'pending' | 'resolved' | 'rejected';
  matchId?: string;
  sortBy?: 'createdAt' | 'resolvedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FinanceFilters {
  type?: 'withdrawal' | 'deposit' | 'refund' | 'payout';
  status?: 'pending' | 'approved' | 'rejected' | 'success' | 'failed';
  userId?: string;
  tournamentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ModerationFilters {
  contentType?: 'post' | 'comment' | 'image' | 'message' | 'team' | 'user';
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Admin state interface
 */
interface AdminState {
  // Selected scope
  selectedScope: AdminScope;
  setSelectedScope: (scope: AdminScope) => void;

  // Filters
  userFilters: UserFilters;
  tournamentFilters: TournamentFilters;
  matchFilters: MatchFilters;
  disputeFilters: DisputeFilters;
  financeFilters: FinanceFilters;
  moderationFilters: ModerationFilters;

  // Filter setters
  setUserFilters: (filters: Partial<UserFilters>) => void;
  setTournamentFilters: (filters: Partial<TournamentFilters>) => void;
  setMatchFilters: (filters: Partial<MatchFilters>) => void;
  setDisputeFilters: (filters: Partial<DisputeFilters>) => void;
  setFinanceFilters: (filters: Partial<FinanceFilters>) => void;
  setModerationFilters: (filters: Partial<ModerationFilters>) => void;

  // Bulk selection
  bulkSelection: Set<string>;
  toggleBulkSelection: (id: string) => void;
  clearBulkSelection: () => void;
  setBulkSelection: (ids: string[]) => void;

  // Loading and error states
  loadingState: Record<string, boolean>;
  errorState: Record<string, string | null>;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;

  // Pagination
  currentPage: Record<string, number>;
  setCurrentPage: (key: string, page: number) => void;

  // Reset all filters
  resetFilters: () => void;
}

/**
 * Zustand store for managing admin panel state
 * Keeps state ephemeral - does not store large datasets
 */
export const useAdminStore = create<AdminState>((set) => ({
  // Selected scope
  selectedScope: 'analytics',
  setSelectedScope: (scope) => set({ selectedScope: scope }),

  // Filters
  userFilters: {},
  tournamentFilters: {},
  matchFilters: {},
  disputeFilters: {},
  financeFilters: {},
  moderationFilters: {},

  // Filter setters
  setUserFilters: (filters) =>
    set((state) => ({
      userFilters: { ...state.userFilters, ...filters },
    })),
  setTournamentFilters: (filters) =>
    set((state) => ({
      tournamentFilters: { ...state.tournamentFilters, ...filters },
    })),
  setMatchFilters: (filters) =>
    set((state) => ({
      matchFilters: { ...state.matchFilters, ...filters },
    })),
  setDisputeFilters: (filters) =>
    set((state) => ({
      disputeFilters: { ...state.disputeFilters, ...filters },
    })),
  setFinanceFilters: (filters) =>
    set((state) => ({
      financeFilters: { ...state.financeFilters, ...filters },
    })),
  setModerationFilters: (filters) =>
    set((state) => ({
      moderationFilters: { ...state.moderationFilters, ...filters },
    })),

  // Bulk selection
  bulkSelection: new Set<string>(),
  toggleBulkSelection: (id) =>
    set((state) => {
      const newSelection = new Set(state.bulkSelection);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { bulkSelection: newSelection };
    }),
  clearBulkSelection: () => set({ bulkSelection: new Set<string>() }),
  setBulkSelection: (ids) => set({ bulkSelection: new Set(ids) }),

  // Loading and error states
  loadingState: {},
  errorState: {},
  setLoading: (key, loading) =>
    set((state) => ({
      loadingState: { ...state.loadingState, [key]: loading },
    })),
  setError: (key, error) =>
    set((state) => ({
      errorState: { ...state.errorState, [key]: error },
    })),

  // Pagination
  currentPage: {},
  setCurrentPage: (key, page) =>
    set((state) => ({
      currentPage: { ...state.currentPage, [key]: page },
    })),

  // Reset all filters
  resetFilters: () =>
    set({
      userFilters: {},
      tournamentFilters: {},
      matchFilters: {},
      disputeFilters: {},
      financeFilters: {},
      moderationFilters: {},
      bulkSelection: new Set<string>(),
      currentPage: {},
    }),
}));

