import { create } from 'zustand';

/**
 * Report type
 */
export type ReportType = 'player_score' | 'match_result' | 'entire_match';

/**
 * Report status
 */
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';

/**
 * Error report interface
 */
export interface ErrorReport {
  id: string;
  matchId: string;
  reportedBy: string;
  reportedByName: string;
  reportType: ReportType;
  targetPlayerId?: string | null;
  targetPlayerName?: string | null;
  description: string;
  proposedCorrection?: any | null;
  status: ReportStatus;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Corrected score proposal
 */
export interface CorrectedScore {
  playerId: string;
  playerName: string;
  originalRuns: number;
  proposedRuns: number;
  originalWickets?: number;
  proposedWickets?: number;
  originalOvers?: number;
  proposedOvers?: number;
  reason: string;
}

/**
 * Reporting state interface
 */
interface ReportingState {
  reports: ErrorReport[];
  correctedScores: CorrectedScore[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  setReports: (reports: ErrorReport[]) => void;
  addReport: (report: ErrorReport) => void;
  updateReport: (id: string, updates: Partial<ErrorReport>) => void;
  setCorrectedScores: (scores: CorrectedScore[]) => void;
  addCorrectedScore: (score: CorrectedScore) => void;
  removeCorrectedScore: (playerId: string) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  reports: [],
  correctedScores: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

/**
 * Zustand store for managing error reports and corrections
 * Handles match data error reporting and correction proposals
 */
export const useReportingStore = create<ReportingState>((set) => ({
  ...initialState,

  setReports: (reports) => set({ reports, error: null }),

  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, report],
    })),

  updateReport: (id, updates) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    })),

  setCorrectedScores: (scores) => set({ correctedScores: scores }),

  addCorrectedScore: (score) =>
    set((state) => ({
      correctedScores: [...state.correctedScores.filter((s) => s.playerId !== score.playerId), score],
    })),

  removeCorrectedScore: (playerId) =>
    set((state) => ({
      correctedScores: state.correctedScores.filter((s) => s.playerId !== playerId),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

