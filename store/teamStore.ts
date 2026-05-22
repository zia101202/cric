import { create } from 'zustand';

/**
 * Team status types
 */
export type TeamStatus = 'draft' | 'official' | 'banned' | 'archived';

/**
 * Player role types
 * Note: Matches userProfileStore PlayerRole for consistency
 */
export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';

/**
 * Team player status
 */
export type TeamPlayerStatus = 'requested' | 'accepted' | 'declined' | 'removed';

/**
 * Team interface
 */
export interface Team {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  status: TeamStatus;
  captainId?: string | null;
  captainName?: string | null;
  viceCaptainId?: string | null;
  viceCaptainName?: string | null;
  totalPlayers: number;
  acceptedPlayers: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  strengthScore: number;
  followers: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team player interface
 */
export interface TeamPlayer {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string | null;
  role: PlayerRole | null;
  status: TeamPlayerStatus;
  isCaptain: boolean;
  isViceCaptain: boolean;
  joinedAt?: string | null;
  invitedAt: string;
}

/**
 * Team stats interface
 */
export interface TeamStats {
  teamId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  strengthScore: number;
  netRunRate: number;
  totalRunsScored: number;
  totalRunsConceded: number;
  updatedAt: string;
}

/**
 * Team post interface
 */
export interface TeamPost {
  id: string;
  teamId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  text: string;
  images?: string[] | null;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

/**
 * Team report interface
 */
export interface TeamReport {
  id: string;
  teamId: string;
  reportedBy: string;
  reportedByName: string;
  reason: string;
  createdAt: string;
}

/**
 * Team store state interface
 */
interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  teamPlayers: Map<string, TeamPlayer[]>; // teamId -> players[]
  teamStats: Map<string, TeamStats>; // teamId -> stats
  teamPosts: Map<string, TeamPost[]>; // teamId -> posts[]
  filters: {
    status?: TeamStatus;
    searchQuery?: string;
  };
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  setCurrentTeam: (team: Team | null) => void;
  setTeamPlayers: (teamId: string, players: TeamPlayer[]) => void;
  addTeamPlayer: (teamId: string, player: TeamPlayer) => void;
  updateTeamPlayer: (teamId: string, playerId: string, updates: Partial<TeamPlayer>) => void;
  removeTeamPlayer: (teamId: string, playerId: string) => void;
  setTeamStats: (teamId: string, stats: TeamStats) => void;
  setTeamPosts: (teamId: string, posts: TeamPost[]) => void;
  addTeamPost: (teamId: string, post: TeamPost) => void;
  updateTeamPost: (teamId: string, postId: string, updates: Partial<TeamPost>) => void;
  setFilters: (filters: Partial<TeamState['filters']>) => void;
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
  teams: [],
  currentTeam: null,
  teamPlayers: new Map<string, TeamPlayer[]>(),
  teamStats: new Map<string, TeamStats>(),
  teamPosts: new Map<string, TeamPost[]>(),
  filters: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

/**
 * Zustand store for team management
 * Provides global access to team data and operations
 */
export const useTeamStore = create<TeamState>((set) => ({
  ...initialState,

  setTeams: (teams) => set({ teams, error: null }),

  addTeam: (team) =>
    set((state) => ({
      teams: [team, ...state.teams],
    })),

  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
      currentTeam:
        state.currentTeam?.id === id
          ? { ...state.currentTeam, ...updates, updatedAt: new Date().toISOString() }
          : state.currentTeam,
    })),

  setCurrentTeam: (team) => set({ currentTeam: team, error: null }),

  setTeamPlayers: (teamId, players) =>
    set((state) => {
      const newPlayers = new Map(state.teamPlayers);
      newPlayers.set(teamId, players);
      return { teamPlayers: newPlayers };
    }),

  addTeamPlayer: (teamId, player) =>
    set((state) => {
      const newPlayers = new Map(state.teamPlayers);
      const currentPlayers = newPlayers.get(teamId) || [];
      newPlayers.set(teamId, [...currentPlayers, player]);
      return { teamPlayers: newPlayers };
    }),

  updateTeamPlayer: (teamId, playerId, updates) =>
    set((state) => {
      const newPlayers = new Map(state.teamPlayers);
      const currentPlayers = newPlayers.get(teamId) || [];
      newPlayers.set(
        teamId,
        currentPlayers.map((p) => (p.playerId === playerId ? { ...p, ...updates } : p))
      );
      return { teamPlayers: newPlayers };
    }),

  removeTeamPlayer: (teamId, playerId) =>
    set((state) => {
      const newPlayers = new Map(state.teamPlayers);
      const currentPlayers = newPlayers.get(teamId) || [];
      newPlayers.set(
        teamId,
        currentPlayers.filter((p) => p.playerId !== playerId)
      );
      return { teamPlayers: newPlayers };
    }),

  setTeamStats: (teamId, stats) =>
    set((state) => {
      const newStats = new Map(state.teamStats);
      newStats.set(teamId, stats);
      return { teamStats: newStats };
    }),

  setTeamPosts: (teamId, posts) =>
    set((state) => {
      const newPosts = new Map(state.teamPosts);
      newPosts.set(teamId, posts);
      return { teamPosts: newPosts };
    }),

  addTeamPost: (teamId, post) =>
    set((state) => {
      const newPosts = new Map(state.teamPosts);
      const currentPosts = newPosts.get(teamId) || [];
      newPosts.set(teamId, [post, ...currentPosts]);
      return { teamPosts: newPosts };
    }),

  updateTeamPost: (teamId, postId, updates) =>
    set((state) => {
      const newPosts = new Map(state.teamPosts);
      const currentPosts = newPosts.get(teamId) || [];
      newPosts.set(
        teamId,
        currentPosts.map((p) => (p.id === postId ? { ...p, ...updates } : p))
      );
      return { teamPosts: newPosts };
    }),

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

