import { create } from 'zustand';

/**
 * Tournament status types
 */
export type TournamentStatus = 'draft' | 'pending' | 'official' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Tournament format types
 */
export type TournamentFormat = 'T10' | 'T20' | 'ODI';

/**
 * Tournament type (structure)
 */
export type TournamentType = 'knockout' | 'league' | 'group';

/**
 * Team invitation status
 */
export type TeamInvitationStatus = 'requested' | 'accepted' | 'declined';

/**
 * Match status
 */
export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled' | 'postponed';

/**
 * Score report type
 */
export type ScoreReportType = 'player-score' | 'full-match';

/**
 * Score report status
 */
export type ScoreReportStatus = 'pending' | 'verified' | 'rejected';

/**
 * Prize distribution entry
 */
export interface PrizeDistribution {
  position: number;
  amount: number;
  percentage?: number;
}

/**
 * Tournament interface
 */
export interface Tournament {
  id: string;
  creatorId: string;
  creatorName: string;
  name: string;
  description?: string | null;
  format: TournamentFormat;
  type: TournamentType;
  entryFee: number;
  prizeDistribution: PrizeDistribution[];
  logoUrl?: string | null;
  status: TournamentStatus;
  minTeams: number;
  currentTeams: number;
  totalMatches: number;
  completedMatches: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team invitation interface
 */
export interface TeamInvitation {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  teamLogo?: string | null;
  status: TeamInvitationStatus;
  requestedAt: string;
  respondedAt?: string | null;
}

/**
 * Match schedule interface
 */
export interface MatchSchedule {
  id: string;
  tournamentId: string;
  matchNumber: number;
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  scheduledAt: string;
  venueId: string;
  venueName: string;
  venueImages?: string[] | null;
  status: MatchStatus;
  result?: any | null;
  scorecard?: any | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Venue interface
 */
export interface Venue {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  images?: string[] | null;
  capacity?: number | null;
  facilities?: string[] | null;
  createdAt: string;
}

/**
 * Score report interface
 */
export interface ScoreReport {
  id: string;
  matchId: string;
  reportedBy: string;
  reportedByName: string;
  correctScore: any;
  type: ScoreReportType;
  status: ScoreReportStatus;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  teamLogo?: string | null;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  points: number;
  netRunRate: number;
  rank: number;
}

/**
 * Tournament management state interface
 */
interface TournamentManagementState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  teamInvitations: TeamInvitation[];
  matchSchedules: MatchSchedule[];
  venues: Venue[];
  scoreReports: ScoreReport[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  filters: {
    status?: TournamentStatus;
    format?: TournamentFormat;
    type?: TournamentType;
    searchQuery?: string;
  };
  setTournaments: (tournaments: Tournament[]) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  setCurrentTournament: (tournament: Tournament | null) => void;
  setTeamInvitations: (invitations: TeamInvitation[]) => void;
  addTeamInvitation: (invitation: TeamInvitation) => void;
  updateTeamInvitation: (id: string, updates: Partial<TeamInvitation>) => void;
  setMatchSchedules: (schedules: MatchSchedule[]) => void;
  addMatchSchedule: (schedule: MatchSchedule) => void;
  updateMatchSchedule: (id: string, updates: Partial<MatchSchedule>) => void;
  setVenues: (venues: Venue[]) => void;
  addVenue: (venue: Venue) => void;
  setScoreReports: (reports: ScoreReport[]) => void;
  addScoreReport: (report: ScoreReport) => void;
  updateScoreReport: (id: string, updates: Partial<ScoreReport>) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setFilters: (filters: Partial<TournamentManagementState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  tournaments: [],
  currentTournament: null,
  teamInvitations: [],
  matchSchedules: [],
  venues: [],
  scoreReports: [],
  leaderboard: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  filters: {},
};

/**
 * Zustand store for tournament management
 * Provides global access to tournament data and operations
 */
export const useTournamentManagementStore = create<TournamentManagementState>((set) => ({
  ...initialState,

  setTournaments: (tournaments) => set({ tournaments, error: null }),

  addTournament: (tournament) =>
    set((state) => ({
      tournaments: [tournament, ...state.tournaments],
    })),

  updateTournament: (id, updates) =>
    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
      currentTournament:
        state.currentTournament?.id === id
          ? { ...state.currentTournament, ...updates, updatedAt: new Date().toISOString() }
          : state.currentTournament,
    })),

  setCurrentTournament: (tournament) => set({ currentTournament: tournament, error: null }),

  setTeamInvitations: (invitations) => set({ teamInvitations: invitations, error: null }),

  addTeamInvitation: (invitation) =>
    set((state) => ({
      teamInvitations: [...state.teamInvitations, invitation],
    })),

  updateTeamInvitation: (id, updates) =>
    set((state) => ({
      teamInvitations: state.teamInvitations.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      ),
    })),

  setMatchSchedules: (schedules) => set({ matchSchedules: schedules, error: null }),

  addMatchSchedule: (schedule) =>
    set((state) => ({
      matchSchedules: [...state.matchSchedules, schedule],
    })),

  updateMatchSchedule: (id, updates) =>
    set((state) => ({
      matchSchedules: state.matchSchedules.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  setVenues: (venues) => set({ venues, error: null }),

  addVenue: (venue) =>
    set((state) => ({
      venues: [...state.venues, venue],
    })),

  setScoreReports: (reports) => set({ scoreReports: reports, error: null }),

  addScoreReport: (report) =>
    set((state) => ({
      scoreReports: [...state.scoreReports, report],
    })),

  updateScoreReport: (id, updates) =>
    set((state) => ({
      scoreReports: state.scoreReports.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    })),

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setCreating: (isCreating) => set({ isCreating }),

  setUpdating: (isUpdating) => set({ isUpdating }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

