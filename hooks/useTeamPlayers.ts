import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useTeamStore,
  TeamPlayer,
  PlayerRole,
  TeamPlayerStatus,
} from '../store/teamStore';
import { useAuthStore } from '../store/authStore';
import { useTeam } from './useTeam';

/**
 * Custom hook for team player management
 * Handles adding, removing, and updating team players
 */
export const useTeamPlayers = () => {
  const {
    teamPlayers,
    setTeamPlayers,
    addTeamPlayer,
    updateTeamPlayer,
    removeTeamPlayer,
    setUpdating,
    setError,
  } = useTeamStore();
  const { user } = useAuthStore();
  const { makeTeamOfficial } = useTeam();

  /**
   * Fetch team players
   */
  const fetchTeamPlayers = useCallback(
    async (teamId: string) => {
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('team_players')
          .select('*, player:user_profiles!team_players_player_id_fkey(id, full_name, display_name, profile_picture_url)')
          .eq('team_id', teamId)
          .order('joined_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const players: TeamPlayer[] = (data || []).map((p: any) => ({
          id: p.id,
          teamId: p.team_id,
          playerId: p.player_id,
          playerName: p.player?.full_name || p.player?.display_name || 'Unknown',
          playerAvatar: p.player?.profile_picture_url || null,
          role: p.role,
          status: p.status,
          isCaptain: p.is_captain || false,
          isViceCaptain: p.is_vice_captain || false,
          joinedAt: p.joined_at,
          invitedAt: p.created_at,
        }));

        setTeamPlayers(teamId, players);
        return { success: true, data: players };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team players';
        setError(errorMessage);
        return { success: false };
      }
    },
    [setTeamPlayers, setError]
  );

  /**
   * Add player to team (sends invitation)
   */
  const addPlayer = useCallback(
    async (teamId: string, playerId: string, role?: PlayerRole) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Check if player already invited
        const { data: existing } = await supabase
          .from('team_players')
          .select('id')
          .eq('team_id', teamId)
          .eq('player_id', playerId)
          .maybeSingle();

        if (existing) {
          setError('Player already invited to this team');
          return { success: false };
        }

        // Get player details
        const { data: playerData } = await supabase
          .from('user_profiles')
          .select('id, full_name, display_name, profile_picture_url')
          .eq('id', playerId)
          .single();

        if (!playerData) {
          setError('Player not found');
          return { success: false };
        }

        const { data, error: insertError } = await supabase
          .from('team_players')
          .insert({
            team_id: teamId,
            player_id: playerId,
            role: role || null,
            status: 'requested',
            is_captain: false,
            is_vice_captain: false,
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          return { success: false };
        }

        const newPlayer: TeamPlayer = {
          id: data.id,
          teamId,
          playerId,
          playerName: playerData.full_name || playerData.display_name || 'Unknown',
          playerAvatar: playerData.profile_picture_url || null,
          role: role || null,
          status: 'requested',
          isCaptain: false,
          isViceCaptain: false,
          invitedAt: data.created_at,
        };

        addTeamPlayer(teamId, newPlayer);

        // Update team total players count
        const { data: teamData } = await supabase
          .from('teams')
          .select('total_players')
          .eq('id', teamId)
          .single();

        if (teamData) {
          await supabase
            .from('teams')
            .update({
              total_players: (teamData.total_players || 0) + 1,
            })
            .eq('id', teamId);
        }

        return { success: true, data: newPlayer };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add player';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, addTeamPlayer, setUpdating, setError]
  );

  /**
   * Remove player from team
   */
  const removePlayer = useCallback(
    async (teamId: string, playerId: string, reason?: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('team_players')
          .update({
            status: 'removed',
            updated_at: new Date().toISOString(),
          })
          .eq('team_id', teamId)
          .eq('player_id', playerId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        removeTeamPlayer(teamId, playerId);

        // Update team accepted players count
        const { data: teamData } = await supabase
          .from('teams')
          .select('accepted_players')
          .eq('id', teamId)
          .single();

        if (teamData) {
          await supabase
            .from('teams')
            .update({
              accepted_players: Math.max(0, (teamData.accepted_players || 0) - 1),
            })
            .eq('id', teamId);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove player';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, removeTeamPlayer, setUpdating, setError]
  );

  /**
   * Change player role
   */
  const changeRole = useCallback(
    async (teamId: string, playerId: string, role: PlayerRole) => {
      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('team_players')
          .update({
            role,
            updated_at: new Date().toISOString(),
          })
          .eq('team_id', teamId)
          .eq('player_id', playerId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeamPlayer(teamId, playerId, { role });
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to change role';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTeamPlayer, setUpdating, setError]
  );

  /**
   * Get accepted players count
   */
  const getAcceptedPlayersCount = useCallback(
    (teamId: string): number => {
      const players = teamPlayers.get(teamId) || [];
      return players.filter((p) => p.status === 'accepted').length;
    },
    [teamPlayers]
  );

  /**
   * Check if minimum players accepted (11 for cricket)
   */
  const checkMinimumPlayersAccepted = useCallback(
    async (teamId: string, minPlayers: number = 11): Promise<boolean> => {
      const acceptedCount = getAcceptedPlayersCount(teamId);
      return acceptedCount >= minPlayers;
    },
    [getAcceptedPlayersCount]
  );

  return {
    teamPlayers: (teamId: string) => teamPlayers.get(teamId) || [],
    fetchTeamPlayers,
    addPlayer,
    removePlayer,
    changeRole,
    getAcceptedPlayersCount,
    checkMinimumPlayersAccepted,
  };
};

