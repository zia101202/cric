import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useMatchStore,
  Match,
  TeamScorecard,
  PlayerScorecard,
  MatchResult,
} from '../store/matchStore';
import { useAuthStore } from '../store/authStore';

/**
 * Normalize player scorecard (handles snake_case ↔ camelCase)
 */
const mapPlayerScorecard = (player?: any): PlayerScorecard => {
  if (!player) {
    return {
      playerId: '',
      playerName: '',
      role: 'batsman',
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    };
  }

  return {
    playerId: player.player_id ?? player.playerId ?? '',
    playerName: player.player_name ?? player.playerName ?? '',
    role: player.role ?? 'batsman',
    runs: player.runs ?? 0,
    balls: player.balls ?? 0,
    fours: player.fours ?? 0,
    sixes: player.sixes ?? 0,
    strikeRate: player.strike_rate ?? player.strikeRate ?? 0,
    wickets: player.wickets ?? undefined,
    overs: player.overs ?? undefined,
    runsConceded: player.runs_conceded ?? player.runsConceded ?? undefined,
    economy: player.economy ?? undefined,
    maidens: player.maidens ?? undefined,
    isOut: player.is_out ?? player.isOut ?? false,
    dismissalType: player.dismissal_type ?? player.dismissalType ?? undefined,
    dismissedBy: player.dismissed_by ?? player.dismissedBy ?? undefined,
  };
};

/**
 * Normalize team scorecard
 */
const mapTeamScorecard = (scorecard?: any): TeamScorecard | null => {
  if (!scorecard) {
    return null;
  }

  return {
    teamId: scorecard.team_id ?? scorecard.teamId ?? '',
    teamName: scorecard.team_name ?? scorecard.teamName ?? '',
    runs: scorecard.runs ?? 0,
    wickets: scorecard.wickets ?? 0,
    overs: scorecard.overs ?? 0,
    balls: scorecard.balls ?? 0,
    strikeRate: scorecard.strike_rate ?? scorecard.strikeRate ?? 0,
    players: (scorecard.players ?? []).map(mapPlayerScorecard),
  };
};

/**
 * Normalize match result
 */
const mapMatchResult = (result?: any): MatchResult | undefined => {
  if (!result) {
    return undefined;
  }

  return {
    winnerId: result.winner_id ?? result.winnerId ?? '',
    winnerName: result.winner_name ?? result.winnerName ?? '',
    winningMargin: result.winning_margin ?? result.winningMargin ?? '',
    mvpId: result.mvp_id ?? result.mvpId ?? '',
    mvpName: result.mvp_name ?? result.mvpName ?? '',
    mvpStats: result.mvp_stats ?? result.mvpStats ?? '',
  };
};

/**
 * Normalize a Supabase match record to the frontend Match shape
 */
const mapMatchRecord = (record: any): Match => ({
  id: record.id,
  tournamentId: record.tournament_id ?? record.tournamentId ?? '',
  matchNumber: record.match_number ?? record.matchNumber ?? 0,
  team1Id: record.team1_id ?? record.team1Id ?? '',
  team1Name: record.team1_name ?? record.team1Name ?? '',
  team2Id: record.team2_id ?? record.team2Id ?? '',
  team2Name: record.team2_name ?? record.team2Name ?? '',
  scheduledDate: record.scheduled_date ?? record.scheduledDate ?? '',
  scheduledTime: record.scheduled_time ?? record.scheduledTime ?? '',
  venueId: record.venue_id ?? record.venueId ?? '',
  venueName: record.venue_name ?? record.venueName ?? '',
  format: record.format ?? '',
  overs: record.overs ?? record.custom_overs ?? record.customOvers ?? null,
  status: record.status ?? 'scheduled',
  team1Scorecard: mapTeamScorecard(
    record.team1_scorecard ?? record.team1Scorecard ?? record.scorecard?.team1
  ),
  team2Scorecard: mapTeamScorecard(
    record.team2_scorecard ?? record.team2Scorecard ?? record.scorecard?.team2
  ),
  result: mapMatchResult(record.result ?? record.match_result),
  winningMomentImages:
    record.winning_moment_images ??
    record.winning_moments ??
    record.winningMomentImages ??
    null,
  reportedBy: record.reported_by ?? record.reportedBy ?? null,
  reportedAt: record.reported_at ?? record.reportedAt ?? null,
  isVerified: record.is_verified ?? record.isVerified ?? false,
  createdAt: record.created_at ?? record.createdAt ?? new Date().toISOString(),
  updatedAt: record.updated_at ?? record.updatedAt ?? new Date().toISOString(),
});

const mapMatchList = (records: any[] | null | undefined): Match[] =>
  (records ?? []).map(mapMatchRecord);

/**
 * Custom hook for match management operations
 * Handles match fetching, scorecard creation, and match result submission
 */
export const useMatchManagement = () => {
  const {
    currentMatch,
    matches,
    matchHistory,
    setCurrentMatch,
    setMatches,
    updateMatch,
    setMatchHistory,
    setLoading,
    setSaving,
    setError,
  } = useMatchStore();
  const { user } = useAuthStore();
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Fetch match by ID
   */
  const fetchMatch = useCallback(
    async (matchId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const match = mapMatchRecord(data);
        setCurrentMatch(match);
        return { success: true, data: match };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch match';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [setCurrentMatch, setLoading, setError]
  );

  /**
   * Fetch all matches
   */
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('matches')
          .select('*')
          .order('scheduled_date', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        return { success: false };
      }

      const normalized = mapMatchList(data);
      setMatches(normalized);
      return { success: true, data: normalized };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matches';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setMatches, setLoading, setError]);

  /**
   * Fetch matches for a tournament
   */
  const fetchTournamentMatches = useCallback(
    async (tournamentId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('scheduled_date', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const normalized = mapMatchList(data);
        setMatches(normalized);
        return { success: true, data: normalized };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matches';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [setMatches, setLoading, setError]
  );

  /**
   * Fetch match history for a user
   */
  const fetchUserMatchHistory = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);

      try {
        // Fetch matches where user's team participated
        // First get teams where user is a player
        const { data: userTeams } = await supabase
          .from('team_players')
          .select('team_id')
          .eq('player_id', userId)
          .eq('status', 'accepted');

        if (!userTeams || userTeams.length === 0) {
          setMatchHistory([]);
          return { success: true, data: [] };
        }

        const teamIds = userTeams.map((ut) => ut.team_id);

        const { data, error: fetchError } = await supabase
          .from('matches')
          .select('*')
          .in('team1_id', teamIds)
          .or(`team2_id.in.(${teamIds.join(',')})`)
          .eq('status', 'completed')
          .order('scheduled_date', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const normalized = mapMatchList(data);
        setMatchHistory(normalized);
        return { success: true, data: normalized };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch match history';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [setMatchHistory, setLoading, setError]
  );

  /**
   * Submit complete match scorecard
   * Only tournament admins can submit
   */
  const submitMatchScorecard = useCallback(
    async (
      matchId: string,
      team1Scorecard: TeamScorecard,
      team2Scorecard: TeamScorecard,
      result: MatchResult,
      winningMomentImages?: string[]
    ) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setSaving(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Verify user is tournament admin or team owner
        const { data: matchData } = await supabase
          .from('matches')
          .select('tournament_id, team1_id, team2_id')
          .eq('id', matchId)
          .single();

        if (!matchData) {
          setError('Match not found');
          return { success: false };
        }

        // Check if user is owner of either team or tournament creator
        const { data: teamCheck } = await supabase
          .from('teams')
          .select('owner_id')
          .in('id', [matchData.team1_id, matchData.team2_id])
          .eq('owner_id', user.id)
          .limit(1);

        const isTeamOwner = teamCheck && teamCheck.length > 0;

        // Check if user is tournament creator
        let isTournamentCreator = false;
        if (matchData.tournament_id) {
          const { data: tournamentCheck } = await supabase
            .from('tournaments')
            .select('creator_id')
            .eq('id', matchData.tournament_id)
            .eq('creator_id', user.id)
            .single();
          isTournamentCreator = !!tournamentCheck;
        }

        if (!isTeamOwner && !isTournamentCreator) {
          setError('Only team owners or tournament creators can submit match scorecards');
          return { success: false };
        }

        // Upload winning moment images if provided
        let uploadedImageUrls: string[] = [];
        if (winningMomentImages && winningMomentImages.length > 0) {
          for (let i = 0; i < winningMomentImages.length; i++) {
            const imageUri = winningMomentImages[i];
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const fileExt = imageUri.split('.').pop() || 'jpg';
            const fileName = `match-${matchId}-${Date.now()}-${i}.${fileExt}`;
            const filePath = `match-images/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('match-images')
              .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: false,
              });

            if (!uploadError && uploadData) {
              const {
                data: { publicUrl },
              } = supabase.storage.from('match-images').getPublicUrl(filePath);
              uploadedImageUrls.push(publicUrl);
            }

            setUploadProgress(((i + 1) / winningMomentImages.length) * 100);
          }
        }

        // Update match with scorecard and result
        const { data, error: updateError } = await supabase
          .from('matches')
          .update({
            scorecard: {
              team1: team1Scorecard,
              team2: team2Scorecard,
            },
            result,
            winning_moments: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
            status: 'completed',
            is_verified: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchId)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        // Map snake_case to camelCase for frontend store
        updateMatch(matchId, {
          scorecard: {
            team1: team1Scorecard,
            team2: team2Scorecard,
          },
          result,
          winningMomentImages: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
          status: 'completed',
          isVerified: false,
        } as any);

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit scorecard';
        setError(errorMessage);
        return { success: false };
      } finally {
        setSaving(false);
        setUploadProgress(0);
      }
    },
    [user, updateMatch, setSaving, setError]
  );

  /**
   * Calculate strike rate
   */
  const calculateStrikeRate = useCallback((runs: number, balls: number): number => {
    if (balls === 0) return 0;
    return Math.round((runs / balls) * 100 * 100) / 100;
  }, []);

  /**
   * Calculate economy rate
   */
  const calculateEconomy = useCallback((runs: number, overs: number): number => {
    if (overs === 0) return 0;
    return Math.round((runs / overs) * 100) / 100;
  }, []);

  /**
   * Validate scorecard
   */
  const validateScorecard = useCallback(
    (scorecard: TeamScorecard): { isValid: boolean; error?: string } => {
      if (scorecard.runs < 0) {
        return { isValid: false, error: 'Runs cannot be negative' };
      }
      if (scorecard.wickets < 0 || scorecard.wickets > 10) {
        return { isValid: false, error: 'Wickets must be between 0 and 10' };
      }
      if (scorecard.overs < 0) {
        return { isValid: false, error: 'Overs cannot be negative' };
      }
      if (scorecard.players.length === 0) {
        return { isValid: false, error: 'At least one player must be in the scorecard' };
      }

      // Validate total runs match sum of player runs
      const totalPlayerRuns = scorecard.players.reduce((sum, p) => sum + p.runs, 0);
      if (totalPlayerRuns !== scorecard.runs) {
        return {
          isValid: false,
          error: `Total runs (${scorecard.runs}) must match sum of player runs (${totalPlayerRuns})`,
        };
      }

      return { isValid: true };
    },
    []
  );

  return {
    currentMatch,
    matches,
    matchHistory,
    fetchMatch,
    fetchMatches,
    fetchTournamentMatches,
    fetchUserMatchHistory,
    submitMatchScorecard,
    calculateStrikeRate,
    calculateEconomy,
    validateScorecard,
    uploadProgress,
  };
};

