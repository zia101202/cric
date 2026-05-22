import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  useCommentStore,
  Comment,
  CommentableType,
  CommentDraft,
} from '../store/commentStore';
import { useAuthStore } from '../store/authStore';

const COMMENTS_PER_PAGE = 20;

/**
 * Custom hook for comments operations
 * Handles commenting, replying, and real-time updates
 */
export const useComments = () => {
  const {
    comments,
    drafts,
    setComments,
    addComment,
    updateComment,
    removeComment,
    addReply,
    setDraft,
    getDraft,
    setLoading,
    setSubmitting,
    setReplying,
    setError,
    setPagination,
    pagination,
  } = useCommentStore();
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Map<string, any>>(new Map());

  /**
   * Fetch comments for an entity with pagination
   */
  const fetchComments = useCallback(
    async (entityType: CommentableType, entityId: string, page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const from = (page - 1) * COMMENTS_PER_PAGE;
        const to = from + COMMENTS_PER_PAGE - 1;

        const { data, error: fetchError, count } = await supabase
          .from('comments')
          .select('*, user:user_profiles(id, fullName, displayName, profilePictureUrl), replies:comments(*, user:user_profiles(id, fullName, displayName, profilePictureUrl))', { count: 'exact' })
          .eq('entityType', entityType)
          .eq('entityId', entityId)
          .is('parentId', null)
          .order('createdAt', { ascending: false })
          .range(from, to);

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const formattedComments: Comment[] = (data || []).map((comment: any) => ({
          id: comment.id,
          userId: comment.userId,
          userName: comment.user?.fullName || comment.user?.displayName || 'Unknown',
          userAvatar: comment.user?.profilePictureUrl || null,
          entityType: comment.entityType,
          entityId: comment.entityId,
          content: comment.content,
          parentId: comment.parentId,
          replies: (comment.replies || []).map((reply: any) => ({
            id: reply.id,
            userId: reply.userId,
            userName: reply.user?.fullName || reply.user?.displayName || 'Unknown',
            userAvatar: reply.user?.profilePictureUrl || null,
            entityType: reply.entityType,
            entityId: reply.entityId,
            content: reply.content,
            parentId: reply.parentId,
            replyCount: 0,
            likes: 0,
            isLiked: false,
            isReported: false,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
          })),
          replyCount: comment.replies?.length || 0,
          likes: 0,
          isLiked: false,
          isReported: false,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        }));

        if (page === 1) {
          setComments(entityId, formattedComments);
        } else {
          const currentComments = comments.get(entityId) || [];
          setComments(entityId, [...currentComments, ...formattedComments]);
        }

        const hasMore = count ? (page * COMMENTS_PER_PAGE) < count : false;
        setPagination(entityId, page, hasMore);

        return { success: true, data: formattedComments, hasMore };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [comments, setComments, setPagination, setLoading, setError]
  );

  /**
   * Submit a comment
   */
  const submitComment = useCallback(
    async (
      entityType: CommentableType,
      entityId: string,
      content: string,
      parentId?: string | null
    ) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      if (!content.trim()) {
        setError('Comment cannot be empty');
        return { success: false };
      }

      if (parentId) {
        setReplying(true);
      } else {
        setSubmitting(true);
      }
      setError(null);

      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('fullName, displayName, profilePictureUrl')
          .eq('id', user.id)
          .single();

        const { data, error: insertError } = await supabase
          .from('comments')
          .insert({
            entityType,
            entityId,
            userId: user.id,
            content: content.trim(),
            parentId: parentId || null,
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return { success: false };
        }

        const newComment: Comment = {
          id: data.id,
          userId: user.id,
          userName: profileData?.fullName || profileData?.displayName || user.email || 'Unknown',
          userAvatar: profileData?.profilePictureUrl || null,
          entityType,
          entityId,
          content: content.trim(),
          parentId: parentId || null,
          replies: [],
          replyCount: 0,
          likes: 0,
          isLiked: false,
          isReported: false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        if (parentId) {
          addReply(entityId, parentId, newComment);
        } else {
          addComment(entityId, newComment);
        }

        // Clear draft
        setDraft(entityId, null);

        return { success: true, data: newComment };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit comment';
        setError(errorMessage);
        return { success: false };
      } finally {
        setSubmitting(false);
        setReplying(false);
      }
    },
    [user, addComment, addReply, setDraft, setSubmitting, setReplying, setError]
  );

  /**
   * Report a comment
   */
  const reportComment = useCallback(
    async (commentId: string, reason: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      try {
        const { error: reportError } = await supabase.from('comment_reports').insert({
          commentId,
          reportedBy: user.id,
          reason,
        });

        if (reportError) {
          setError(reportError.message);
          return { success: false };
        }

        // Update comment as reported
        const comment = Array.from(comments.values())
          .flat()
          .find((c) => c.id === commentId);
        if (comment) {
          updateComment(comment.entityId, commentId, { isReported: true });
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to report comment';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, comments, updateComment, setError]
  );

  /**
   * Save comment draft
   */
  const saveDraft = useCallback(
    (entityId: string, draft: CommentDraft) => {
      setDraft(entityId, draft);
    },
    [setDraft]
  );

  /**
   * Subscribe to real-time comment updates
   */
  const subscribeToComments = useCallback(
    (entityType: CommentableType, entityId: string) => {
      const channelName = `comments:${entityType}:${entityId}`;

      // Clean up existing subscription
      const existingSub = subscriptions.get(channelName);
      if (existingSub) {
        supabase.removeChannel(existingSub);
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `entityType=eq.${entityType} AND entityId=eq.${entityId}`,
          },
          () => {
            // Refetch comments on any change
            const currentPage = pagination.get(entityId)?.page || 1;
            fetchComments(entityType, entityId, 1);
          }
        )
        .subscribe();

      setSubscriptions((prev) => {
        const newSubs = new Map(prev);
        newSubs.set(channelName, channel);
        return newSubs;
      });

      return () => {
        supabase.removeChannel(channel);
        setSubscriptions((prev) => {
          const newSubs = new Map(prev);
          newSubs.delete(channelName);
          return newSubs;
        });
      };
    },
    [subscriptions, pagination, fetchComments]
  );

  /**
   * Cleanup subscriptions
   */
  useEffect(() => {
    return () => {
      subscriptions.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions]);

  return {
    comments: (entityId: string) => comments.get(entityId) || [],
    draft: (entityId: string) => getDraft(entityId),
    fetchComments,
    submitComment,
    reportComment,
    saveDraft,
    subscribeToComments,
    hasMore: (entityId: string) => pagination.get(entityId)?.hasMore || false,
  };
};

