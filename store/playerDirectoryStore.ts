import { create } from 'zustand';
import { UserProfile } from './userProfileStore';

interface PlayerDirectoryState {
  selectedPlayer: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setSelectedPlayer: (player: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Store that keeps track of the player currently being previewed in the directory.
 * Keeps logic isolated from UI screens so we can reuse it in multiple entry points.
 */
export const usePlayerDirectoryStore = create<PlayerDirectoryState>((set) => ({
  selectedPlayer: null,
  isLoading: false,
  error: null,
  setSelectedPlayer: (selectedPlayer) => set({ selectedPlayer }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ selectedPlayer: null, isLoading: false, error: null }),
}));


