import { create } from 'zustand';

/**
 * Commentable entity types
 */
export type CommentableType = 'match' | 'tournament' | 'milestone' | 'post';

/**
 * Comment interface
 */
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  entityType: CommentableType;
  entityId: string;
  content: string;
  parentId?: string | null;
  replies?: Comment[];
  replyCount: number;
  likes: number;
  isLiked: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Comment draft interface
 */
export interface CommentDraft {
  entityId: string;
  entityType: CommentableType;
  content: string;
  parentId?: string | null;
}

/**
 * Comments state interface
 */
interface CommentsState {
  comments: Map<string, Comment[]>; // entityId -> comments[]
  drafts: Map<string, CommentDraft>; // entityId -> draft
  isLoading: boolean;
  isSubmitting: boolean;
  isReplying: boolean;
  error: string | null;
  pagination: Map<string, { page: number; hasMore: boolean }>; // entityId -> pagination
  setComments: (entityId: string, comments: Comment[]) => void;
  addComment: (entityId: string, comment: Comment) => void;
  updateComment: (entityId: string, commentId: string, updates: Partial<Comment>) => void;
  removeComment: (entityId: string, commentId: string) => void;
  addReply: (entityId: string, parentId: string, reply: Comment) => void;
  setDraft: (entityId: string, draft: CommentDraft | null) => void;
  getDraft: (entityId: string) => CommentDraft | null;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setReplying: (replying: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (entityId: string, page: number, hasMore: boolean) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  comments: new Map<string, Comment[]>(),
  drafts: new Map<string, CommentDraft>(),
  isLoading: false,
  isSubmitting: false,
  isReplying: false,
  error: null,
  pagination: new Map<string, { page: number; hasMore: boolean }>(),
};

/**
 * Zustand store for managing comments
 * Provides global access to comments with reply support and drafts
 */
export const useCommentStore = create<CommentsState>((set, get) => ({
  ...initialState,

  setComments: (entityId, comments) =>
    set((state) => {
      const newComments = new Map(state.comments);
      newComments.set(entityId, comments);
      return { comments: newComments };
    }),

  addComment: (entityId, comment) =>
    set((state) => {
      const newComments = new Map(state.comments);
      const currentComments = newComments.get(entityId) || [];
      newComments.set(entityId, [comment, ...currentComments]);
      return { comments: newComments };
    }),

  updateComment: (entityId, commentId, updates) =>
    set((state) => {
      const newComments = new Map(state.comments);
      const currentComments = newComments.get(entityId) || [];
      newComments.set(
        entityId,
        currentComments.map((c) => (c.id === commentId ? { ...c, ...updates } : c))
      );
      return { comments: newComments };
    }),

  removeComment: (entityId, commentId) =>
    set((state) => {
      const newComments = new Map(state.comments);
      const currentComments = newComments.get(entityId) || [];
      newComments.set(
        entityId,
        currentComments.filter((c) => c.id !== commentId)
      );
      return { comments: newComments };
    }),

  addReply: (entityId, parentId, reply) =>
    set((state) => {
      const newComments = new Map(state.comments);
      const currentComments = newComments.get(entityId) || [];
      newComments.set(
        entityId,
        currentComments.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), reply],
              replyCount: (c.replyCount || 0) + 1,
            };
          }
          return c;
        })
      );
      return { comments: newComments };
    }),

  setDraft: (entityId, draft) =>
    set((state) => {
      const newDrafts = new Map(state.drafts);
      if (draft) {
        newDrafts.set(entityId, draft);
      } else {
        newDrafts.delete(entityId);
      }
      return { drafts: newDrafts };
    }),

  getDraft: (entityId) => {
    return get().drafts.get(entityId) || null;
  },

  setLoading: (isLoading) => set({ isLoading }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setReplying: (isReplying) => set({ isReplying }),

  setError: (error) => set({ error }),

  setPagination: (entityId, page, hasMore) =>
    set((state) => {
      const newPagination = new Map(state.pagination);
      newPagination.set(entityId, { page, hasMore });
      return { pagination: newPagination };
    }),

  reset: () => set(initialState),
}));

