import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useTournamentManagementStore,
  TeamInvitation,
  TeamInvitationStatus,
} from '../store/tournamentManagementStore';
import { useAuthStore } from '../store/authStore';
import { useTournamentManagement } from './useTournamentManagement';

/**
 * Custom hook for team invitation and request management
 * Handles sending, accepting, and declining team invitations
 */
export const useTeamRequests = () => {
  const {
    teamInvitations,
    currentTournament,
    setTeamInvitations,
    addTeamInvitation,
    updateTeamInvitation,
    updateTournament,
    setUpdating,
    setError,
  } = useTournamentManagementStore();
  const { user } = useAuthStore();
  const { makeTournamentOfficial } = useTournamentManagement();

  /**
   * Send team invitation
   */
  const sendTeamRequest = useCallback(
    async (tournamentId: string, teamId: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Check if invitation already exists
        const { data: existing } = await supabase
          .from('tournament_teams')
          .select('id')
          .eq('tournament_id', tournamentId)
          .eq('team_id', teamId)
          .maybeSingle();

        if (existing) {
          setError('Team already invited');
          return { success: false };
        }

        // Get team details
        const { data: teamData } = await supabase
          .from('teams')
          .select('id, name, logo_url')
          .eq('id', teamId)
          .single();

        if (!teamData) {
          setError('Team not found');
          return { success: false };
        }

        const { data, error: inviteError } = await supabase
          .from('tournament_teams')
          .insert({
            tournament_id: tournamentId,
            team_id: teamId,
            team_name: teamData.name,
            status: 'requested',
            requested_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (inviteError) {
          setError(inviteError.message);
          return { success: false };
        }

        const invitation: TeamInvitation = {
          id: data.id,
          tournamentId: data.tournament_id,
          teamId: data.team_id,
          teamName: data.team_name || teamData.name,
          teamLogo: teamData.logo_url || null,
          status: data.status as TeamInvitationStatus,
          requestedAt: data.requested_at || new Date().toISOString(),
          respondedAt: data.responded_at || null,
        };

        addTeamInvitation(invitation);
        return { success: true, data: invitation };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send team request';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, addTeamInvitation, setUpdating, setError]
  );

  /**
   * Accept team invitation
   */
  const acceptRequest = useCallback(
    async (invitationId: string) => {
      setUpdating(true);
      setError(null);

      try {
        const invitation = teamInvitations.find((inv) => inv.id === invitationId);
        if (!invitation) {
          setError('Invitation not found');
          return { success: false };
        }

        const { error: updateError } = await supabase
          .from('tournament_teams')
          .update({
            status: 'accepted',
            responded_at: new Date().toISOString(),
          })
          .eq('id', invitationId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeamInvitation(invitationId, {
          status: 'accepted',
          respondedAt: new Date().toISOString(),
        });

        // Update tournament team count
        if (currentTournament) {
          const acceptedCount = teamInvitations.filter((inv) => inv.status === 'accepted').length + 1;
          const newStatus = acceptedCount >= currentTournament.minTeams ? 'official' : 'pending';

          await supabase
            .from('tournaments')
            .update({
              current_teams: acceptedCount,
              status: newStatus,
            })
            .eq('id', currentTournament.id);

          updateTournament(currentTournament.id, {
            currentTeams: acceptedCount,
            status: newStatus,
          });

          // If 8 teams accepted, make tournament official
          if (acceptedCount >= currentTournament.minTeams && currentTournament.status !== 'official') {
            await makeTournamentOfficial(currentTournament.id);
          }
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to accept request';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [teamInvitations, currentTournament, updateTeamInvitation, updateTournament, makeTournamentOfficial, setUpdating, setError]
  );

  /**
   * Decline team invitation
   */
  const declineRequest = useCallback(
    async (invitationId: string) => {
      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('tournament_teams')
          .update({
            status: 'declined',
            responded_at: new Date().toISOString(),
          })
          .eq('id', invitationId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeamInvitation(invitationId, {
          status: 'declined',
          respondedAt: new Date().toISOString(),
        });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to decline request';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTeamInvitation, setUpdating, setError]
  );

  /**
   * Check if 8 teams have accepted
   */
  const checkEightTeamsAccepted = useCallback(
    async (tournamentId: string): Promise<boolean> => {
      try {
        const { count, error } = await supabase
          .from('tournament_teams')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', tournamentId)
          .eq('status', 'accepted');

        if (error) {
          return false;
        }

        return (count || 0) >= 8;
      } catch {
        return false;
      }
    },
    []
  );

  /**
   * Fetch team invitations for a tournament
   */
  const fetchTeamInvitations = useCallback(
    async (tournamentId: string) => {
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('tournament_teams')
          .select('*, team:teams!tournament_teams_team_id_fkey(id, name, logo_url)')
          .eq('tournament_id', tournamentId)
          .order('requested_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const invitations: TeamInvitation[] = (data || []).map((inv: any) => ({
          id: inv.id,
          tournamentId: inv.tournament_id,
          teamId: inv.team_id,
          teamName: inv.team_name || inv.team?.name || 'Unknown Team',
          teamLogo: inv.team?.logo_url || null,
          status: inv.status,
          requestedAt: inv.requested_at,
          respondedAt: inv.responded_at,
        }));

        setTeamInvitations(invitations);
        return { success: true, data: invitations };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invitations';
        setError(errorMessage);
        return { success: false };
      }
    },
    [setTeamInvitations, setError]
  );

  return {
    teamInvitations,
    sendTeamRequest,
    acceptRequest,
    declineRequest,
    checkEightTeamsAccepted,
    fetchTeamInvitations,
  };
};

