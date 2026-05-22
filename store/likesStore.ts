import { create } from 'zustand';

/**
 * Likeable entity types
 */
export type LikeableType = 'match' | 'tournament' | 'winning_moment' | 'post' | 'milestone';

/**
 * Like interface
 */
export interface Like {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  entityType: LikeableType;
  entityId: string;
  createdAt: string;
}

/**
 * Likes state interface
 */
interface LikesState {
  likes: Map<string, Like[]>; // entityId -> likes[]
  userLikes: Map<string, boolean>; // entityId -> isLiked
  likeCounts: Map<string, number>; // entityId -> count
  isLoading: boolean;
  isLiking: boolean;
  error: string | null;
  setLikes: (entityId: string, likes: Like[]) => void;
  addLike: (entityId: string, like: Like) => void;
  removeLike: (entityId: string, userId: string) => void;
  setUserLike: (entityId: string, isLiked: boolean) => void;
  setLikeCount: (entityId: string, count: number) => void;
  incrementLikeCount: (entityId: string) => void;
  decrementLikeCount: (entityId: string) => void;
  setLoading: (loading: boolean) => void;
  setLiking: (liking: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  likes: new Map<string, Like[]>(),
  userLikes: new Map<string, boolean>(),
  likeCounts: new Map<string, number>(),
  isLoading: false,
  isLiking: false,
  error: null,
};

/**
 * Zustand store for managing likes
 * Provides global access to likes data with efficient updates
 */
export const useLikesStore = create<LikesState>((set) => ({
  ...initialState,

  setLikes: (entityId, likes) =>
    set((state) => {
      const newLikes = new Map(state.likes);
      newLikes.set(entityId, likes);
      return { likes: newLikes };
    }),

  addLike: (entityId, like) =>
    set((state) => {
      const newLikes = new Map(state.likes);
      const currentLikes = newLikes.get(entityId) || [];
      newLikes.set(entityId, [...currentLikes, like]);
      return { likes: newLikes };
    }),

  removeLike: (entityId, userId) =>
    set((state) => {
      const newLikes = new Map(state.likes);
      const currentLikes = newLikes.get(entityId) || [];
      newLikes.set(
        entityId,
        currentLikes.filter((like) => like.userId !== userId)
      );
      return { likes: newLikes };
    }),

  setUserLike: (entityId, isLiked) =>
    set((state) => {
      const newUserLikes = new Map(state.userLikes);
      newUserLikes.set(entityId, isLiked);
      return { userLikes: newUserLikes };
    }),

  setLikeCount: (entityId, count) =>
    set((state) => {
      const newCounts = new Map(state.likeCounts);
      newCounts.set(entityId, count);
      return { likeCounts: newCounts };
    }),

  incrementLikeCount: (entityId) =>
    set((state) => {
      const newCounts = new Map(state.likeCounts);
      const currentCount = newCounts.get(entityId) || 0;
      newCounts.set(entityId, currentCount + 1);
      return { likeCounts: newCounts };
    }),

  decrementLikeCount: (entityId) =>
    set((state) => {
      const newCounts = new Map(state.likeCounts);
      const currentCount = newCounts.get(entityId) || 0;
      newCounts.set(entityId, Math.max(0, currentCount - 1));
      return { likeCounts: newCounts };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setLiking: (isLiking) => set({ isLiking }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

