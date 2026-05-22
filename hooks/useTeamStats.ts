import { useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  useTeamStore,
  TeamStats,
} from '../store/teamStore';

/**
 * Custom hook for team statistics
 * Handles fetching and computing team performance metrics
 */
export const useTeamStats = () => {
  const {
    teamStats,
    setTeamStats,
    setError,
  } = useTeamStore();

  /**
   * Fetch team statistics
   */
  const fetchTeamStats = useCallback(
    async (teamId: string) => {
      setError(null);

      try {
        // Fetch from team_stats table if available
        const { data: statsData, error: statsError } = await supabase
          .from('team_stats')
          .select('*')
          .eq('teamId', teamId)
          .single();

        if (!statsError && statsData) {
          const stats: TeamStats = {
            teamId: statsData.teamId,
            matchesPlayed: statsData.matchesPlayed || 0,
            wins: statsData.wins || 0,
            losses: statsData.losses || 0,
            ties: statsData.ties || 0,
            winRate: statsData.winRate || 0,
            strengthScore: statsData.strengthScore || 0,
            netRunRate: statsData.netRunRate || 0,
            totalRunsScored: statsData.totalRunsScored || 0,
            totalRunsConceded: statsData.totalRunsConceded || 0,
            updatedAt: statsData.updatedAt,
          };

          setTeamStats(teamId, stats);
          return { success: true, data: stats };
        }

        // If no stats table, compute from matches
        return await computeTeamStats(teamId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team stats';
        setError(errorMessage);
        return { success: false };
      }
    },
    [setTeamStats, setError]
  );

  /**
   * Compute team statistics from match data
   */
  const computeTeamStats = useCallback(
    async (teamId: string) => {
      try {
        // Fetch all completed matches for this team
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .or(`team1Id.eq.${teamId},team2Id.eq.${teamId}`)
          .eq('status', 'completed');

        if (!matches || matches.length === 0) {
          const emptyStats: TeamStats = {
            teamId,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            ties: 0,
            winRate: 0,
            strengthScore: 0,
            netRunRate: 0,
            totalRunsScored: 0,
            totalRunsConceded: 0,
            updatedAt: new Date().toISOString(),
          };
          setTeamStats(teamId, emptyStats);
          return { success: true, data: emptyStats };
        }

        let wins = 0;
        let losses = 0;
        let ties = 0;
        let totalRunsScored = 0;
        let totalRunsConceded = 0;
        let totalOversFaced = 0;
        let totalOversBowled = 0;

        matches.forEach((match: any) => {
          const isTeam1 = match.team1Id === teamId;
          const teamScorecard = isTeam1 ? match.team1Scorecard : match.team2Scorecard;
          const opponentScorecard = isTeam1 ? match.team2Scorecard : match.team1Scorecard;

          if (teamScorecard) {
            totalRunsScored += teamScorecard.runs || 0;
            totalOversFaced += teamScorecard.overs || 0;
          }

          if (opponentScorecard) {
            totalRunsConceded += opponentScorecard.runs || 0;
            totalOversBowled += opponentScorecard.overs || 0;
          }

          if (match.result) {
            if (match.result.winnerId === teamId) {
              wins++;
            } else if (match.result.winnerId === null) {
              ties++;
            } else {
              losses++;
            }
          }
        });

        const matchesPlayed = matches.length;
        const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

        // Calculate net run rate
        const nrr =
          totalOversFaced > 0 && totalOversBowled > 0
            ? (totalRunsScored / totalOversFaced - totalRunsConceded / totalOversBowled) / 10
            : 0;

        // Calculate strength score (simplified formula)
        const strengthScore = Math.min(
          100,
          winRate * 0.5 + Math.min(nrr * 10, 30) + Math.min((wins / matchesPlayed) * 50, 20)
        );

        const stats: TeamStats = {
          teamId,
          matchesPlayed,
          wins,
          losses,
          ties,
          winRate: Math.round(winRate * 100) / 100,
          strengthScore: Math.round(strengthScore * 100) / 100,
          netRunRate: Math.round(nrr * 100) / 100,
          totalRunsScored,
          totalRunsConceded,
          updatedAt: new Date().toISOString(),
        };

        setTeamStats(teamId, stats);

        // Update team_stats table if it exists
        await supabase.from('team_stats').upsert(stats, {
          onConflict: 'teamId',
        });

        return { success: true, data: stats };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to compute team stats';
        setError(errorMessage);
        return { success: false };
      }
    },
    [setTeamStats, setError]
  );

  /**
   * Update team strength score
   */
  const updateTeamStrength = useCallback(
    async (teamId: string) => {
      let stats = teamStats.get(teamId);
      if (!stats) {
        const result = await computeTeamStats(teamId);
        if (!result.success) {
          return result;
        }
        stats = teamStats.get(teamId);
        if (!stats) {
          return { success: false };
        }
      }

      // Recalculate strength score
      const strengthScore = Math.min(
        100,
        stats.winRate * 0.5 +
          Math.min(stats.netRunRate * 10, 30) +
          Math.min((stats.wins / (stats.matchesPlayed || 1)) * 50, 20)
      );

      const updatedStats: TeamStats = {
        ...stats,
        strengthScore: Math.round(strengthScore * 100) / 100,
        updatedAt: new Date().toISOString(),
      };

      setTeamStats(teamId, updatedStats);

      await supabase.from('team_stats').upsert(updatedStats, {
        onConflict: 'teamId',
      });

      return { success: true, data: updatedStats };
    },
    [teamStats, computeTeamStats, setTeamStats]
  );

  /**
   * Subscribe to real-time stats updates
   */
  const subscribeToStats = useCallback(
    (teamId: string) => {
      const channel = supabase
        .channel(`team-stats:${teamId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `team1Id=eq.${teamId}`,
          },
          () => {
            // Recompute stats when match is updated
            computeTeamStats(teamId);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `team2Id=eq.${teamId}`,
          },
          () => {
            computeTeamStats(teamId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
    [computeTeamStats]
  );

  return {
    teamStats: (teamId: string) => teamStats.get(teamId),
    fetchTeamStats,
    computeTeamStats,
    updateTeamStrength,
    subscribeToStats,
  };
};

