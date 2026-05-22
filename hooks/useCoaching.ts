import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Coaching tip interface
 */
export interface CoachingTip {
  id: string;
  category: 'batting' | 'bowling' | 'fielding' | 'general';
  title: string;
  description: string;
  reason: string; // Why this tip was suggested
  drill?: string; // Suggested drill
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

/**
 * Performance analysis interface
 */
export interface PerformanceAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: CoachingTip[];
  overallRating: number; // 0-100
}

/**
 * Custom hook for AI-based coaching and performance tips
 * Provides personalized tips based on player analytics
 */
export const useCoaching = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get coaching tips for a player
   */
  const getCoachingTips = useCallback(
    async (playerId?: string) => {
      const targetPlayerId = playerId || user?.id;
      if (!targetPlayerId) {
        return { success: false, error: 'Player ID required' };
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch player stats
        const { data: playerStats, error: statsError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', targetPlayerId)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          throw statsError;
        }

        // Fetch recent matches
        const { data: recentMatches, error: matchesError } = await supabase
          .from('match_players')
          .select('*, matches(*)')
          .eq('player_id', targetPlayerId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (matchesError) {
          throw matchesError;
        }

        // Generate tips based on analytics
        const tips = generateTipsFromAnalytics(playerStats, recentMatches || []);

        return { success: true, data: tips };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get coaching tips';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Get performance analysis
   */
  const getPerformanceAnalysis = useCallback(
    async (playerId?: string) => {
      const targetPlayerId = playerId || user?.id;
      if (!targetPlayerId) {
        return { success: false, error: 'Player ID required' };
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch player stats
        const { data: playerStats, error: statsError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', targetPlayerId)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          throw statsError;
        }

        // Analyze performance
        const analysis = analyzePerformance(playerStats);

        return { success: true, data: analysis };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get performance analysis';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Generate tips from analytics (heuristic-based, can be replaced with AI model)
   */
  const generateTipsFromAnalytics = (
    stats: any,
    recentMatches: any[]
  ): CoachingTip[] => {
    const tips: CoachingTip[] = [];

    if (!stats) {
      tips.push({
        id: 'no-data',
        category: 'general',
        title: 'Start Playing Matches',
        description: 'Play more matches to get personalized coaching tips.',
        reason: 'Insufficient match data',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
      return tips;
    }

    // Batting tips
    if (stats.battingAverage && stats.battingAverage < 20) {
      tips.push({
        id: 'batting-average',
        category: 'batting',
        title: 'Improve Batting Average',
        description: 'Focus on building innings and playing longer.',
        reason: `Your batting average is ${stats.battingAverage.toFixed(1)}. Aim for 30+`,
        drill: 'Practice defensive shots and building partnerships',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }

    if (stats.strikeRate && stats.strikeRate < 80) {
      tips.push({
        id: 'strike-rate',
        category: 'batting',
        title: 'Increase Strike Rate',
        description: 'Work on rotating strike and finding gaps.',
        reason: `Your strike rate is ${stats.strikeRate.toFixed(1)}. Target 100+`,
        drill: 'Practice running between wickets and placement shots',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }

    // Bowling tips
    if (stats.economy && stats.economy > 7) {
      tips.push({
        id: 'economy',
        category: 'bowling',
        title: 'Improve Economy Rate',
        description: 'Focus on line and length to reduce runs.',
        reason: `Your economy rate is ${stats.economy.toFixed(2)}. Target below 6`,
        drill: 'Practice consistent line and length, work on variations',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }

    if (stats.bowlingAverage && stats.bowlingAverage > 35) {
      tips.push({
        id: 'bowling-average',
        category: 'bowling',
        title: 'Take More Wickets',
        description: 'Work on wicket-taking deliveries.',
        reason: `Your bowling average is ${stats.bowlingAverage.toFixed(1)}. Lower is better`,
        drill: 'Practice yorkers, bouncers, and spin variations',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }

    // Fielding tips
    if (stats.catches === 0 && recentMatches.length > 5) {
      tips.push({
        id: 'fielding',
        category: 'fielding',
        title: 'Improve Fielding',
        description: 'Focus on catching and fielding drills.',
        reason: 'No catches recorded in recent matches',
        drill: 'Practice catching high balls and ground fielding',
        priority: 'low',
        createdAt: new Date().toISOString(),
      });
    }

    return tips;
  };

  /**
   * Analyze performance (heuristic-based)
   */
  const analyzePerformance = (stats: any): PerformanceAnalysis => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    let overallRating = 50; // Base rating

    if (!stats) {
      return {
        strengths: [],
        weaknesses: ['Insufficient match data'],
        recommendations: [],
        overallRating: 0,
      };
    }

    // Analyze batting
    if (stats.battingAverage && stats.battingAverage >= 30) {
      strengths.push('Good batting average');
      overallRating += 15;
    } else if (stats.battingAverage && stats.battingAverage < 20) {
      weaknesses.push('Low batting average');
      overallRating -= 10;
    }

    if (stats.strikeRate && stats.strikeRate >= 100) {
      strengths.push('Good strike rate');
      overallRating += 10;
    } else if (stats.strikeRate && stats.strikeRate < 80) {
      weaknesses.push('Low strike rate');
      overallRating -= 5;
    }

    // Analyze bowling
    if (stats.economy && stats.economy <= 6) {
      strengths.push('Good economy rate');
      overallRating += 15;
    } else if (stats.economy && stats.economy > 7) {
      weaknesses.push('High economy rate');
      overallRating -= 10;
    }

    if (stats.bowlingAverage && stats.bowlingAverage <= 25) {
      strengths.push('Good bowling average');
      overallRating += 15;
    } else if (stats.bowlingAverage && stats.bowlingAverage > 35) {
      weaknesses.push('High bowling average');
      overallRating -= 10;
    }

    // Analyze fielding
    if (stats.catches && stats.catches > 5) {
      strengths.push('Good fielding');
      overallRating += 10;
    }

    overallRating = Math.max(0, Math.min(100, overallRating));

    const recommendations = generateTipsFromAnalytics(stats, []);

    return {
      strengths,
      weaknesses,
      recommendations,
      overallRating,
    };
  };

  return {
    loading,
    error,
    getCoachingTips,
    getPerformanceAnalysis,
  };
};

