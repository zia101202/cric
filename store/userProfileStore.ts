import { create } from 'zustand';

/**
 * Player role types
 */
export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  playerRole: PlayerRole | null;
  profilePictureUrl: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  location: string | null;
  // Statistics
  battingAverage: number | null;
  strikeRate: number | null;
  economyRate: number | null;
  wickets: number;
  runs: number;
  matchesPlayed: number;
  rating: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile state interface
 */
interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial profile state
 */
const initialProfile: UserProfile = {
  id: '',
  email: '',
  fullName: '',
  displayName: '',
  playerRole: null,
  profilePictureUrl: null,
  bio: null,
  dateOfBirth: null,
  phoneNumber: null,
  location: null,
  battingAverage: null,
  strikeRate: null,
  economyRate: null,
  wickets: 0,
  runs: 0,
  matchesPlayed: 0,
  rating: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Zustand store for managing user profile state
 * Provides global access to user profile data and update methods
 */
export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  setProfile: (profile) =>
    set({
      profile,
      error: null,
    }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setUpdating: (isUpdating) => set({ isUpdating }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      profile: null,
      isLoading: false,
      isUpdating: false,
      error: null,
    }),
}));

