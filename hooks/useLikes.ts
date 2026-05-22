import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  useLikesStore,
  Like,
  LikeableType,
} from '../store/likesStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for likes operations
 * Handles liking/unliking entities with real-time updates
 */
export const useLikes = () => {
  const {
    likes,
    userLikes,
    likeCounts,
    setLikes,
    addLike,
    removeLike,
    setUserLike,
    setLikeCount,
    incrementLikeCount,
    decrementLikeCount,
    setLoading,
    setLiking,
    setError,
  } = useLikesStore();
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Map<string, any>>(new Map());

  /**
   * Fetch likes for an entity
   */
  const fetchLikes = useCallback(
    async (entityType: LikeableType, entityId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('likes')
          .select('*, user:user_profiles(id, fullName, displayName, profilePictureUrl)')
          .eq('entityType', entityType)
          .eq('entityId', entityId)
          .order('createdAt', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const formattedLikes: Like[] = (data || []).map((like: any) => ({
          id: like.id,
          userId: like.userId,
          userName: like.user?.fullName || like.user?.displayName || 'Unknown',
          userAvatar: like.user?.profilePictureUrl || null,
          entityType: like.entityType,
          entityId: like.entityId,
          createdAt: like.createdAt,
        }));

        setLikes(entityId, formattedLikes);
        setLikeCount(entityId, formattedLikes.length);

        // Check if current user has liked
        if (user?.id) {
          const isLiked = formattedLikes.some((like) => like.userId === user.id);
          setUserLike(entityId, isLiked);
        }

        return { success: true, data: formattedLikes };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch likes';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [user, setLikes, setLikeCount, setUserLike, setLoading, setError]
  );

  /**
   * Toggle like on an entity
   */
  const toggleLike = useCallback(
    async (entityType: LikeableType, entityId: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      const isCurrentlyLiked = userLikes.get(entityId) || false;
      setLiking(true);
      setError(null);

      try {
        if (isCurrentlyLiked) {
          // Unlike
          const { error: deleteError } = await supabase
            .from('likes')
            .delete()
            .eq('entityType', entityType)
            .eq('entityId', entityId)
            .eq('userId', user.id);

          if (deleteError) {
            setError(deleteError.message);
            return { success: false };
          }

          removeLike(entityId, user.id);
          setUserLike(entityId, false);
          decrementLikeCount(entityId);
        } else {
          // Like
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('fullName, displayName, profilePictureUrl')
            .eq('id', user.id)
            .single();

          const { data, error: insertError } = await supabase
            .from('likes')
            .insert({
              entityType,
              entityId,
              userId: user.id,
            })
            .select()
            .single();

          if (insertError) {
            setError(insertError.message);
            return { success: false };
          }

          const newLike: Like = {
            id: data.id,
            userId: user.id,
            userName: profileData?.fullName || profileData?.displayName || user.email || 'Unknown',
            userAvatar: profileData?.profilePictureUrl || null,
            entityType,
            entityId,
            createdAt: data.createdAt,
          };

          addLike(entityId, newLike);
          setUserLike(entityId, true);
          incrementLikeCount(entityId);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to toggle like';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLiking(false);
      }
    },
    [
      user,
      userLikes,
      addLike,
      removeLike,
      setUserLike,
      incrementLikeCount,
      decrementLikeCount,
      setLiking,
      setError,
    ]
  );

  /**
   * Subscribe to real-time like updates
   */
  const subscribeToLikes = useCallback(
    (entityType: LikeableType, entityId: string) => {
      const channelName = `likes:${entityType}:${entityId}`;

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
            table: 'likes',
            filter: `entityType=eq.${entityType} AND entityId=eq.${entityId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // New like added
              fetchLikes(entityType, entityId);
            } else if (payload.eventType === 'DELETE') {
              // Like removed
              fetchLikes(entityType, entityId);
            }
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
    [subscriptions, fetchLikes]
  );

  /**
   * Cleanup subscriptions on unmount
   */
  useEffect(() => {
    return () => {
      subscriptions.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions]);

  return {
    likes: (entityId: string) => likes.get(entityId) || [],
    isLiked: (entityId: string) => userLikes.get(entityId) || false,
    likeCount: (entityId: string) => likeCounts.get(entityId) || 0,
    fetchLikes,
    toggleLike,
    subscribeToLikes,
  };
};

