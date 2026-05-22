import { create } from 'zustand';

/**
 * Match status types
 */
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed' | 'invalid';

/**
 * Player role in match
 */
export type PlayerMatchRole = 'batsman' | 'bowler' | 'wicketkeeper' | 'all-rounder';

/**
 * Player scorecard entry
 */
export interface PlayerScorecard {
  playerId: string;
  playerName: string;
  role: PlayerMatchRole;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  wickets?: number;
  overs?: number;
  runsConceded?: number;
  economy?: number;
  maidens?: number;
  isOut: boolean;
  dismissalType?: string;
  dismissedBy?: string;
}

/**
 * Team scorecard
 */
export interface TeamScorecard {
  teamId: string;
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  strikeRate: number;
  players: PlayerScorecard[];
}

/**
 * Match result
 */
export interface MatchResult {
  winnerId: string;
  winnerName: string;
  winningMargin: string;
  mvpId: string;
  mvpName: string;
  mvpStats: string;
}

/**
 * Match interface
 */
export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  scheduledDate: string;
  scheduledTime: string;
  venueId: string;
  venueName: string;
  format: string;
  overs?: number | null;
  status: MatchStatus;
  team1Scorecard?: TeamScorecard | null;
  team2Scorecard?: TeamScorecard | null;
  result?: MatchResult | null;
  winningMomentImages?: string[] | null;
  reportedBy?: string | null;
  reportedAt?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Live scoring state
 */
export interface LiveScoringState {
  currentTeam: 'team1' | 'team2';
  currentOver: number;
  currentBall: number;
  currentBatsmanId: string | null;
  currentBowlerId: string | null;
  isLive: boolean;
}

/**
 * Match state interface
 */
interface MatchState {
  currentMatch: Match | null;
  matches: Match[];
  matchHistory: Match[];
  liveScoring: LiveScoringState | null;
  isLoading: boolean;
  isSaving: boolean;
  isReporting: boolean;
  error: string | null;
  setCurrentMatch: (match: Match | null) => void;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  setMatchHistory: (matches: Match[]) => void;
  setLiveScoring: (scoring: LiveScoringState | null) => void;
  updateLiveScoring: (updates: Partial<LiveScoringState>) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setReporting: (reporting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  currentMatch: null,
  matches: [],
  matchHistory: [],
  liveScoring: null,
  isLoading: false,
  isSaving: false,
  isReporting: false,
  error: null,
};

/**
 * Zustand store for managing match state
 * Provides global access to match data and live scoring state
 */
export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,

  setCurrentMatch: (match) => set({ currentMatch: match, error: null }),

  setMatches: (matches) => set({ matches, error: null }),

  addMatch: (match) =>
    set((state) => ({
      matches: [...state.matches, match],
    })),

  updateMatch: (id, updates) =>
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      ),
      currentMatch:
        state.currentMatch?.id === id
          ? { ...state.currentMatch, ...updates, updatedAt: new Date().toISOString() }
          : state.currentMatch,
    })),

  setMatchHistory: (matches) => set({ matchHistory: matches, error: null }),

  setLiveScoring: (scoring) => set({ liveScoring: scoring }),

  updateLiveScoring: (updates) =>
    set((state) => ({
      liveScoring: state.liveScoring
        ? { ...state.liveScoring, ...updates }
        : ({
            currentTeam: 'team1',
            currentOver: 0,
            currentBall: 0,
            currentBatsmanId: null,
            currentBowlerId: null,
            isLive: false,
            ...updates,
          } as LiveScoringState),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setSaving: (isSaving) => set({ isSaving }),

  setReporting: (isReporting) => set({ isReporting }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

