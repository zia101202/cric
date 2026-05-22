import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Reputation level
 */
export type ReputationLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

/**
 * Reputation event type
 */
export type ReputationEventType =
  | 'match_win'
  | 'match_participation'
  | 'positive_report'
  | 'milestone'
  | 'community_action'
  | 'poor_conduct'
  | 'dispute';

/**
 * Reputation event interface
 */
export interface ReputationEvent {
  id: string;
  userId: string;
  eventType: ReputationEventType;
  points: number;
  meta: Record<string, any>;
  createdAt: string;
}

/**
 * Reputation totals interface
 */
export interface ReputationTotals {
  userId: string;
  totalPoints: number;
  level: ReputationLevel;
  badges: string[];
  updatedAt: string;
}

/**
 * Badge interface
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

/**
 * Custom hook for reputation system
 * Handles fetching reputation, events, badges, and level calculations
 */
export const useReputation = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate level from total points
   */
  const calculateLevel = useCallback((points: number): ReputationLevel => {
    if (points >= 10000) return 'Diamond';
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  }, []);

  /**
   * Get reputation totals for a user
   */
  const getReputationTotals = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      return { success: false, error: 'User ID required' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reputation_totals')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (fetchError) {
        // If no record exists, create one
        if (fetchError.code === 'PGRST116') {
          const newTotals: ReputationTotals = {
            userId: targetUserId,
            totalPoints: 0,
            level: 'Bronze',
            badges: [],
            updatedAt: new Date().toISOString(),
          };

          const { data: insertData, error: insertError } = await supabase
            .from('reputation_totals')
            .insert({
              user_id: targetUserId,
              total_points: 0,
              level: 'Bronze',
              badges: [],
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          return { success: true, data: newTotals };
        }
        throw fetchError;
      }

      const totals: ReputationTotals = {
        userId: data.user_id,
        totalPoints: data.total_points || 0,
        level: (data.level || 'Bronze') as ReputationLevel,
        badges: data.badges || [],
        updatedAt: data.updated_at,
      };

      return { success: true, data: totals };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reputation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get reputation events for a user
   */
  const getReputationEvents = useCallback(
    async (userId?: string, limit: number = 50) => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        return { success: false, error: 'User ID required' };
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('reputation_events')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) {
          throw fetchError;
        }

        const events: ReputationEvent[] =
          data?.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            eventType: item.event_type as ReputationEventType,
            points: item.points,
            meta: item.meta || {},
            createdAt: item.created_at,
          })) || [];

        return { success: true, data: events };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Add reputation points (typically called server-side, but available for admin actions)
   */
  const addReputationPoints = useCallback(
    async (
      userId: string,
      eventType: ReputationEventType,
      points: number,
      meta?: Record<string, any>
    ) => {
      setLoading(true);
      setError(null);

      try {
        // Create reputation event
        const { data: eventData, error: eventError } = await supabase
          .from('reputation_events')
          .insert({
            user_id: userId,
            event_type: eventType,
            points,
            meta: meta || {},
          })
          .select()
          .single();

        if (eventError) {
          throw eventError;
        }

        // Update reputation totals
        const { data: totals, error: totalsError } = await supabase
          .from('reputation_totals')
          .select('total_points')
          .eq('user_id', userId)
          .single();

        if (totalsError && totalsError.code !== 'PGRST116') {
          throw totalsError;
        }

        const currentPoints = totals?.total_points || 0;
        const newPoints = currentPoints + points;
        const newLevel = calculateLevel(newPoints);

        // Update or insert totals
        const { error: updateError } = await supabase
          .from('reputation_totals')
          .upsert({
            user_id: userId,
            total_points: newPoints,
            level: newLevel,
            updated_at: new Date().toISOString(),
          });

        if (updateError) {
          throw updateError;
        }

        return {
          success: true,
          data: {
            event: eventData,
            newTotal: newPoints,
            newLevel,
          },
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add reputation points';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [calculateLevel]
  );

  /**
   * Check and award badges based on reputation
   */
  const checkBadges = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const totalsResult = await getReputationTotals(userId);
      if (!totalsResult.success || !totalsResult.data) {
        throw new Error('Failed to get reputation totals');
      }

      const totals = totalsResult.data;
      const newBadges: string[] = [...(totals.badges || [])];

      // Badge rules (configurable)
      if (totals.totalPoints >= 10000 && !newBadges.includes('DiamondPlayer')) {
        newBadges.push('DiamondPlayer');
      } else if (totals.totalPoints >= 5000 && !newBadges.includes('PlatinumPlayer')) {
        newBadges.push('PlatinumPlayer');
      } else if (totals.totalPoints >= 2000 && !newBadges.includes('GoldPlayer')) {
        newBadges.push('GoldPlayer');
      } else if (totals.totalPoints >= 500 && !newBadges.includes('SilverPlayer')) {
        newBadges.push('SilverPlayer');
      }

      // Update badges if new ones were added
      if (newBadges.length > totals.badges.length) {
        const { error: updateError } = await supabase
          .from('reputation_totals')
          .update({ badges: newBadges })
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }

        return {
          success: true,
          data: {
            newBadges: newBadges.filter((b) => !totals.badges.includes(b)),
            allBadges: newBadges,
          },
        };
      }

      return { success: true, data: { newBadges: [], allBadges: totals.badges } };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check badges';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getReputationTotals]);

  /**
   * Get points needed for next level
   */
  const getPointsForNextLevel = useCallback((currentLevel: ReputationLevel): number => {
    const thresholds: Record<ReputationLevel, number> = {
      Bronze: 500,
      Silver: 2000,
      Gold: 5000,
      Platinum: 10000,
      Diamond: Infinity,
    };

    return thresholds[currentLevel];
  }, []);

  /**
   * Get progress to next level (0-1)
   */
  const getProgressToNextLevel = useCallback(
    (currentPoints: number, currentLevel: ReputationLevel): number => {
      const nextThreshold = getPointsForNextLevel(currentLevel);
      if (nextThreshold === Infinity) return 1;

      const previousThreshold =
        currentLevel === 'Bronze'
          ? 0
          : getPointsForNextLevel(
              (['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as ReputationLevel[])[
                (['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as ReputationLevel[]).indexOf(
                  currentLevel
                ) - 1
              ]
            );

      const range = nextThreshold - previousThreshold;
      const progress = (currentPoints - previousThreshold) / range;

      return Math.max(0, Math.min(1, progress));
    },
    [getPointsForNextLevel]
  );

  return {
    loading,
    error,
    calculateLevel,
    getReputationTotals,
    getReputationEvents,
    addReputationPoints,
    checkBadges,
    getPointsForNextLevel,
    getProgressToNextLevel,
  };
};

