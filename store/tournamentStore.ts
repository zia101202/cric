import { create } from 'zustand';

/**
 * Tournament status types
 */
export type TournamentStatus = 'pending' | 'official' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Tournament format types
 */
export type TournamentFormat = 'T10' | 'T20' | 'ODI' | 'custom';

/**
 * Tournament type (structure)
 */
export type TournamentType = 'league' | 'knockout' | 'round-robin' | 'hybrid';

/**
 * Team invitation status
 */
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

/**
 * Match status
 */
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed';

/**
 * Team invitation interface
 */
export interface TeamInvitation {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  teamLogo?: string | null;
  status: InvitationStatus;
  invitedAt: string;
  respondedAt?: string | null;
  invitedBy: string;
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
  format: TournamentFormat;
  overs?: number | null;
  status: MatchStatus;
  team1Score?: number | null;
  team2Score?: number | null;
  winnerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Venue interface
 */
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string | null;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  capacity?: number | null;
  facilities?: string[] | null;
  createdAt: string;
}

/**
 * Tournament interface
 */
export interface Tournament {
  id: string;
  name: string;
  description?: string | null;
  organizerId: string;
  organizerName: string;
  format: TournamentFormat;
  customOvers?: number | null;
  type: TournamentType;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizeAmount?: number | null;
  prizeCurrency?: string | null;
  rules?: string | null;
  minTeams: number;
  maxTeams?: number | null;
  currentTeams: number;
  venueId?: string | null;
  venue?: Venue | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Point table entry
 */
export interface PointTableEntry {
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
 * Tournament state interface
 */
interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  invitations: TeamInvitation[];
  matches: Match[];
  venues: Venue[];
  pointTable: PointTableEntry[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  setTournaments: (tournaments: Tournament[]) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  setCurrentTournament: (tournament: Tournament | null) => void;
  setInvitations: (invitations: TeamInvitation[]) => void;
  addInvitation: (invitation: TeamInvitation) => void;
  updateInvitation: (id: string, updates: Partial<TeamInvitation>) => void;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  setVenues: (venues: Venue[]) => void;
  addVenue: (venue: Venue) => void;
  setPointTable: (pointTable: PointTableEntry[]) => void;
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
  invitations: [],
  matches: [],
  venues: [],
  pointTable: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

/**
 * Zustand store for managing tournament state
 * Provides global access to tournament data and operations
 */
export const useTournamentStore = create<TournamentState>((set) => ({
  ...initialState,

  setTournaments: (tournaments) => set({ tournaments, error: null }),

  addTournament: (tournament) =>
    set((state) => ({
      tournaments: [...state.tournaments, tournament],
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

  setInvitations: (invitations) => set({ invitations, error: null }),

  addInvitation: (invitation) =>
    set((state) => ({
      invitations: [...state.invitations, invitation],
    })),

  updateInvitation: (id, updates) =>
    set((state) => ({
      invitations: state.invitations.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      ),
    })),

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
    })),

  setVenues: (venues) => set({ venues, error: null }),

  addVenue: (venue) =>
    set((state) => ({
      venues: [...state.venues, venue],
    })),

  setPointTable: (pointTable) => set({ pointTable }),

  setLoading: (isLoading) => set({ isLoading }),

  setCreating: (isCreating) => set({ isCreating }),

  setUpdating: (isUpdating) => set({ isUpdating }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

