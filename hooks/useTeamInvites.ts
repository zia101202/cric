import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../store/authStore';
import { useTeam } from './useTeam';

/**
 * Custom hook for team invitation management
 * Handles sending, accepting, and declining team invitations
 */
export const useTeamInvites = () => {
  const {
    currentTeam,
    updateTeamPlayer,
    updateTeam,
    setUpdating,
    setError,
  } = useTeamStore();
  const { user } = useAuthStore();
  const { makeTeamOfficial } = useTeam();

  /**
   * Send invitation to player
   */
  const sendInvite = useCallback(
    async (teamId: string, playerId: string, role?: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Check if invitation already exists
        const { data: existing } = await supabase
          .from('team_players')
          .select('id, status')
          .eq('team_id', teamId)
          .eq('player_id', playerId)
          .maybeSingle();

        if (existing) {
          if (existing.status === 'accepted') {
            setError('Player is already a member of this team');
            return { success: false };
          }
          if (existing.status === 'requested') {
            setError('Invitation already sent');
            return { success: false };
          }
        }

        // Create or update invitation
        const { data, error: inviteError } = await supabase
          .from('team_players')
          .upsert({
            team_id: teamId,
            player_id: playerId,
            role: role || null,
            status: 'requested',
            is_captain: false,
            is_vice_captain: false,
          })
          .select()
          .single();

        if (inviteError) {
          setError(inviteError.message);
          return { success: false };
        }

        // Create notification for player
        await supabase.from('notifications').insert({
          user_id: playerId,
          type: 'team_invite',
          title: 'Team Invitation',
          message: `You have been invited to join ${currentTeam?.name || 'a team'}`,
          entity_type: 'team',
          entity_id: teamId,
          sender_id: user.id,
        });

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, currentTeam, setUpdating, setError]
  );

  /**
   * Accept team invitation
   */
  const acceptInvite = useCallback(
    async (teamId: string, invitationId?: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        let targetInvitationId = invitationId;
        if (!targetInvitationId) {
          const { data: invitation, error: lookupError } = await supabase
            .from('team_players')
            .select('id')
            .eq('team_id', teamId)
            .eq('player_id', user.id)
            .eq('status', 'requested')
            .maybeSingle();

          if (lookupError || !invitation) {
            setError('Invitation not found');
            return { success: false };
          }

          targetInvitationId = invitation.id;
        }

        const { error: updateError } = await supabase
          .from('team_players')
          .update({
            status: 'accepted',
            joined_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetInvitationId)
          .eq('player_id', user.id);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeamPlayer(teamId, user.id, {
          status: 'accepted',
          joinedAt: new Date().toISOString(),
        });

        // Update team accepted players count
        const { data: teamData } = await supabase
          .from('teams')
          .select('accepted_players, min_players')
          .eq('id', teamId)
          .single();

        if (teamData) {
          const newAcceptedCount = (teamData.accepted_players || 0) + 1;
          const minPlayers = teamData.min_players || 11;

          await supabase
            .from('teams')
            .update({
              accepted_players: newAcceptedCount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', teamId);

          updateTeam(teamId, {
            acceptedPlayers: newAcceptedCount,
          });

          // If minimum players accepted, make team official
          if (newAcceptedCount >= minPlayers && currentTeam?.status === 'draft') {
            await makeTeamOfficial(teamId);
          }
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, currentTeam, updateTeamPlayer, updateTeam, makeTeamOfficial, setUpdating, setError]
  );

  /**
   * Decline team invitation
   */
  const declineInvite = useCallback(
    async (teamId: string, invitationId?: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        let targetInvitationId = invitationId;
        if (!targetInvitationId) {
          const { data: invitation, error: lookupError } = await supabase
            .from('team_players')
            .select('id')
            .eq('team_id', teamId)
            .eq('player_id', user.id)
            .eq('status', 'requested')
            .maybeSingle();

          if (lookupError || !invitation) {
            setError('Invitation not found');
            return { success: false };
          }

          targetInvitationId = invitation.id;
        }

        const { error: updateError } = await supabase
          .from('team_players')
          .update({
            status: 'declined',
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetInvitationId)
          .eq('player_id', user.id);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeamPlayer(teamId, user.id, {
          status: 'declined',
        });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to decline invitation';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, updateTeamPlayer, setUpdating, setError]
  );

  /**
   * Check if minimum players have accepted
   */
  const minimumPlayersAccepted = useCallback(
    async (teamId: string, minPlayers: number = 11): Promise<boolean> => {
      try {
        const { count, error } = await supabase
          .from('team_players')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId)
          .eq('status', 'accepted');

        if (error) {
          return false;
        }

        return (count || 0) >= minPlayers;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    sendInvite,
    acceptInvite,
    declineInvite,
    minimumPlayersAccepted,
  };
};

