import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { Match, TeamScorecard, PlayerScorecard } from '../store/matchStore';
import { useUserProfileStore } from '../store/userProfileStore';

/**
 * Custom hook for updating player statistics after match completion
 * Automatically updates player profiles based on match results
 */
export const usePlayerStatsUpdate = () => {
  const { updateProfile } = useUserProfileStore();

  /**
   * Update player statistics from completed match
   * Called automatically when match is verified
   */
  /**
   * Update statistics for players in a team
   */
  const updateTeamPlayerStats = useCallback(
    async (teamScorecard: TeamScorecard, opponentScorecard: TeamScorecard) => {
      for (const player of teamScorecard.players) {
        // Fetch current player profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', player.playerId)
          .single();

        if (!profileData) continue;

        // Calculate new statistics
        const currentMatches = profileData.matchesPlayed || 0;
        const currentRuns = profileData.runs || 0;
        const currentWickets = profileData.wickets || 0;

        // Update runs
        const newRuns = currentRuns + player.runs;

        // Update wickets (if bowler)
        const newWickets = player.wickets
          ? (currentWickets || 0) + player.wickets
          : currentWickets;

        // Calculate batting average
        const totalMatches = currentMatches + 1;
        const battingAverage =
          totalMatches > 0 && player.isOut ? newRuns / totalMatches : profileData.battingAverage;

        // Calculate strike rate (weighted average)
        const currentStrikeRate = profileData.strikeRate || 0;
        const newStrikeRate =
          currentMatches > 0
            ? (currentStrikeRate * currentMatches + player.strikeRate) / totalMatches
            : player.strikeRate;

        // Calculate economy rate (if bowler)
        let newEconomyRate = profileData.economyRate;
        if (player.overs && player.overs > 0 && player.runsConceded !== undefined) {
          const currentEconomy = profileData.economyRate || 0;
          const currentOvers = profileData.totalOversBowled || 0;
          const newOvers = currentOvers + player.overs;
          const newRunsConceded = (profileData.totalRunsConceded || 0) + player.runsConceded;

          newEconomyRate = newOvers > 0 ? newRunsConceded / newOvers : currentEconomy;
        }

        // Update player profile
        await supabase
          .from('user_profiles')
          .update({
            runs: newRuns,
            wickets: newWickets,
            matchesPlayed: totalMatches,
            battingAverage: Math.round(battingAverage * 100) / 100,
            strikeRate: Math.round(newStrikeRate * 100) / 100,
            economyRate: newEconomyRate ? Math.round(newEconomyRate * 100) / 100 : null,
            totalOversBowled: player.overs
              ? (profileData.totalOversBowled || 0) + player.overs
              : profileData.totalOversBowled,
            totalRunsConceded: player.runsConceded
              ? (profileData.totalRunsConceded || 0) + player.runsConceded
              : profileData.totalRunsConceded,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', player.playerId);

        // Update local Zustand store if this is the current user
        // (This would require checking if player.playerId matches current user)
      }
    },
    []
  );

  /**
   * Update player statistics from completed match
   * Called automatically when match is verified
   */
  const updatePlayerStatsFromMatch = useCallback(
    async (match: Match) => {
      if (!match.team1Scorecard || !match.team2Scorecard || match.status !== 'completed') {
        return { success: false, error: 'Match not completed' };
      }

      try {
        // Process team 1 players
        await updateTeamPlayerStats(match.team1Scorecard, match.team2Scorecard);
        // Process team 2 players
        await updateTeamPlayerStats(match.team2Scorecard, match.team1Scorecard);

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update player stats';
        return { success: false, error: errorMessage };
      }
    },
    [updateTeamPlayerStats]
  );

  /**
   * Update statistics for players in a team
   */
  const updateTeamPlayerStats = useCallback(
    async (teamScorecard: TeamScorecard, opponentScorecard: TeamScorecard) => {
      for (const player of teamScorecard.players) {
        // Fetch current player profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', player.playerId)
          .single();

        if (!profileData) continue;

        // Calculate new statistics
        const currentMatches = profileData.matchesPlayed || 0;
        const currentRuns = profileData.runs || 0;
        const currentWickets = profileData.wickets || 0;

        // Update runs
        const newRuns = currentRuns + player.runs;

        // Update wickets (if bowler)
        const newWickets = player.wickets
          ? (currentWickets || 0) + player.wickets
          : currentWickets;

        // Calculate batting average
        const totalMatches = currentMatches + 1;
        const battingAverage =
          totalMatches > 0 && player.isOut ? newRuns / totalMatches : profileData.battingAverage;

        // Calculate strike rate (weighted average)
        const currentStrikeRate = profileData.strikeRate || 0;
        const newStrikeRate =
          currentMatches > 0
            ? (currentStrikeRate * currentMatches + player.strikeRate) / totalMatches
            : player.strikeRate;

        // Calculate economy rate (if bowler)
        let newEconomyRate = profileData.economyRate;
        if (player.overs && player.overs > 0 && player.runsConceded !== undefined) {
          const currentEconomy = profileData.economyRate || 0;
          const currentOvers = profileData.totalOversBowled || 0;
          const newOvers = currentOvers + player.overs;
          const newRunsConceded = (profileData.totalRunsConceded || 0) + player.runsConceded;

          newEconomyRate = newOvers > 0 ? newRunsConceded / newOvers : currentEconomy;
        }

        // Update player profile
        await supabase
          .from('user_profiles')
          .update({
            runs: newRuns,
            wickets: newWickets,
            matchesPlayed: totalMatches,
            battingAverage: Math.round(battingAverage * 100) / 100,
            strikeRate: Math.round(newStrikeRate * 100) / 100,
            economyRate: newEconomyRate ? Math.round(newEconomyRate * 100) / 100 : null,
            totalOversBowled: player.overs
              ? (profileData.totalOversBowled || 0) + player.overs
              : profileData.totalOversBowled,
            totalRunsConceded: player.runsConceded
              ? (profileData.totalRunsConceded || 0) + player.runsConceded
              : profileData.totalRunsConceded,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', player.playerId);

        // Update local Zustand store if this is the current user
        // (This would require checking if player.playerId matches current user)
      }
    },
    []
  );

  /**
   * Recalculate all player statistics from match history
   * Useful for data correction or migration
   */
  const recalculateAllPlayerStats = useCallback(async (userId: string) => {
    try {
      // Fetch all completed matches for user's teams
      const { data: userTeams } = await supabase
        .from('team_players')
        .select('team_id')
        .eq('player_id', userId)
        .eq('status', 'accepted');

      if (!userTeams || userTeams.length === 0) {
        return { success: false, error: 'User not in any teams' };
      }

      const teamIds = userTeams.map((ut) => ut.team_id);

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .in('team1_id', teamIds)
        .or(`team2_id.in.(${teamIds.join(',')})`)
        .eq('status', 'completed')
        .eq('is_verified', true)
        .order('scheduled_date', { ascending: true });

      if (!matches || matches.length === 0) {
        return { success: true, message: 'No matches found' };
      }

      // Reset player stats
      await supabase
        .from('user_profiles')
        .update({
          runs: 0,
          wickets: 0,
          matchesPlayed: 0,
          battingAverage: null,
          strikeRate: null,
          economyRate: null,
          totalOversBowled: 0,
          totalRunsConceded: 0,
        })
        .eq('id', userId);

      // Recalculate from all matches
      for (const match of matches as any[]) {
        // Match data from DB uses snake_case, need to check scorecard structure
        const scorecard = match.scorecard || {};
        const team1Scorecard = scorecard.team1;
        const team2Scorecard = scorecard.team2;
        
        if (team1Scorecard && team2Scorecard) {
          // Find which team the user was in
          const isTeam1 = teamIds.includes(match.team1_id);
          const userTeamScorecard = isTeam1 ? team1Scorecard : team2Scorecard;
          const opponentScorecard = isTeam1 ? team2Scorecard : team1Scorecard;

          const playerData = userTeamScorecard.players?.find((p: any) => p.playerId === userId || p.player_id === userId);
          if (playerData) {
            await updateTeamPlayerStats(userTeamScorecard, opponentScorecard);
          }
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to recalculate stats';
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    updatePlayerStatsFromMatch,
    recalculateAllPlayerStats,
  };
};

