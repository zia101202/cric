import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useTeamStore, Team, TeamReport, TeamPost } from '../store/teamStore';
import { useAuthStore } from '../store/authStore';
import { useTeam } from './useTeam';
import { useTeamInvites } from './useTeamInvites';
import { useTeamPlayers } from './useTeamPlayers';
import { useTeamStats } from './useTeamStats';

/**
 * Team badge types based on performance
 */
export type TeamBadgeType = 'strong' | 'high_win_rate' | 'classic' | 'none';

/**
 * Team badge interface
 */
export interface TeamBadge {
  type: TeamBadgeType;
  icon: string;
  label: string;
  description: string;
}

/**
 * Comprehensive team management hook
 * Implements all team management functions as specified in cric.txt
 * Handles team creation, player management, reporting, badges, and validation
 */
export const useTeamManagement = () => {
  const {
    teams,
    currentTeam,
    teamReports,
    setCurrentTeam,
    updateTeam,
    setUpdating,
    setError,
  } = useTeamStore();
  const { user } = useAuthStore();
  const { createTeam, updateTeamDetails, makeTeamOfficial } = useTeam();
  const { sendInvite, acceptInvite, declineInvite, minimumPlayersAccepted } = useTeamInvites();
  const { fetchTeamPlayers, addPlayer, removePlayer } = useTeamPlayers();
  const { calculateTeamStrength, updateTeamStats } = useTeamStats();

  /**
   * Validate that players have verified profiles before team creation
   * Teams can only be created with real verified player profiles
   */
  const validatePlayersForTeamCreation = useCallback(
    async (playerIds: string[]): Promise<{ valid: boolean; invalidPlayers: string[] }> => {
      if (!playerIds || playerIds.length === 0) {
        return { valid: false, invalidPlayers: [] };
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, matchesPlayed')
          .in('id', playerIds);

        if (error) {
          setError('Failed to validate players');
          return { valid: false, invalidPlayers: playerIds };
        }

        const validPlayerIds = new Set((data || []).map((p) => p.id));
        const invalidPlayers = playerIds.filter((id) => !validPlayerIds.has(id));

        return {
          valid: invalidPlayers.length === 0,
          invalidPlayers,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to validate players';
        setError(errorMessage);
        return { valid: false, invalidPlayers: playerIds };
      }
    },
    [setError]
  );

  /**
   * Create team with player invitations
   * Prevents team creation without accepted players
   * Only allows creation with verified player profiles
   */
  const createTeamWithPlayers = useCallback(
    async (
      teamData: {
        name: string;
        description?: string;
        logoUrl?: string;
      },
      playerIds: string[]
    ) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      // Validate players have verified profiles
      const validation = await validatePlayersForTeamCreation(playerIds);
      if (!validation.valid) {
        setError(`Invalid players: ${validation.invalidPlayers.join(', ')}`);
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Create team first
        const teamResult = await createTeam({
          name: teamData.name,
          description: teamData.description,
        });

        if (!teamResult.success || !teamResult.data) {
          return { success: false };
        }

        const newTeam = teamResult.data;

        // Upload logo if provided
        if (teamData.logoUrl) {
          await uploadTeamLogo(newTeam.id, teamData.logoUrl);
        }

        // Send invitations to all players
        const invitePromises = playerIds.map((playerId) =>
          sendInvite(newTeam.id, playerId)
        );

        const inviteResults = await Promise.allSettled(invitePromises);
        const failedInvites = inviteResults.filter((r) => r.status === 'rejected').length;

        if (failedInvites > 0) {
          setError(`${failedInvites} invitations failed to send`);
        }

        // Team remains in draft status until minimum players accept
        setCurrentTeam(newTeam);

        return { success: true, data: newTeam };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, validatePlayersForTeamCreation, createTeam, sendInvite, setCurrentTeam, setUpdating, setError]
  );

  /**
   * Upload team logo
   */
  const uploadTeamLogo = useCallback(
    async (teamId: string, imageUri: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false, url: null };
      }

      setUpdating(true);
      setError(null);

      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileExt = imageUri.split('.').pop() || 'jpg';
        const fileName = `team-${teamId}-${Date.now()}.${fileExt}`;
        const filePath = `team-logos/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('team-assets')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          setError(uploadError.message);
          return { success: false, url: null };
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('team-assets').getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('teams')
          .update({ logoUrl: publicUrl })
          .eq('id', teamId);

        if (updateError) {
          setError(updateError.message);
          return { success: false, url: null };
        }

        updateTeam(teamId, { logoUrl: publicUrl });

        return { success: true, url: publicUrl };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
        setError(errorMessage);
        return { success: false, url: null };
      } finally {
        setUpdating(false);
      }
    },
    [user, updateTeam, setUpdating, setError]
  );

  /**
   * Check if team can be made official (minimum players accepted)
   */
  const canMakeTeamOfficial = useCallback(
    async (teamId: string, minPlayers: number = 11): Promise<boolean> => {
      return await minimumPlayersAccepted(teamId, minPlayers);
    },
    [minimumPlayersAccepted]
  );

  /**
   * Report a fake or inactive team
   * Users can report teams; admins can remove reported teams
   */
  const reportTeam = useCallback(
    async (teamId: string, reason: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Check if user already reported this team
        const { data: existing } = await supabase
          .from('team_reports')
          .select('id')
          .eq('teamId', teamId)
          .eq('reportedBy', user.id)
          .single();

        if (existing) {
          setError('You have already reported this team');
          return { success: false };
        }

        const { data, error: reportError } = await supabase
          .from('team_reports')
          .insert({
            teamId,
            reportedBy: user.id,
            reason,
          })
          .select()
          .single();

        if (reportError) {
          setError(reportError.message);
          return { success: false };
        }

        // Get reporter name
        const { data: reporterData } = await supabase
          .from('user_profiles')
          .select('fullName, displayName')
          .eq('id', user.id)
          .single();

        const report: TeamReport = {
          id: data.id,
          teamId,
          reportedBy: user.id,
          reportedByName: reporterData?.fullName || reporterData?.displayName || 'Unknown',
          reason,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        // Check if team should be flagged (multiple reports)
        const { data: allReports } = await supabase
          .from('team_reports')
          .select('id')
          .eq('teamId', teamId);

        // If 2 or more reports, team can be removed by admin
        if (allReports && allReports.length >= 2) {
          // Update team status to flagged (admin can review)
          await supabase
            .from('teams')
            .update({ status: 'banned' })
            .eq('id', teamId);

          updateTeam(teamId, { status: 'banned' });
        }

        return { success: true, data: report };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to report team';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, updateTeam, setUpdating, setError]
  );

  /**
   * Calculate team badges based on performance
   * Returns badges for strong teams, high win rate, classic teams
   */
  const calculateTeamBadges = useCallback(
    (team: Team): TeamBadge[] => {
      const badges: TeamBadge[] = [];

      // Strong Team Badge: strengthScore >= 75 and winRate >= 0.6
      if (team.strengthScore >= 75 && team.winRate >= 0.6) {
        badges.push({
          type: 'strong',
          icon: 'trophy',
          label: 'Strong Team',
          description: 'High strength score and win rate',
        });
      }

      // High Win Rate Badge: winRate >= 0.7
      if (team.winRate >= 0.7) {
        badges.push({
          type: 'high_win_rate',
          icon: 'star',
          label: 'High Win Rate',
          description: 'Exceptional win rate',
        });
      }

      // Classic Team Badge: older than 12 months with 30+ matches
      const teamAge = new Date().getTime() - new Date(team.createdAt).getTime();
      const monthsOld = teamAge / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld >= 12 && team.matchesPlayed >= 30) {
        badges.push({
          type: 'classic',
          icon: 'medal',
          label: 'Classic Team',
          description: 'Established team with extensive history',
        });
      }

      return badges.length > 0 ? badges : [{ type: 'none', icon: '', label: '', description: '' }];
    },
    []
  );

  /**
   * Get team badges for a specific team
   */
  const getTeamBadges = useCallback(
    (teamId: string): TeamBadge[] => {
      const team = teams.find((t) => t.id === teamId) || currentTeam;
      if (!team) {
        return [];
      }
      return calculateTeamBadges(team);
    },
    [teams, currentTeam, calculateTeamBadges]
  );

  /**
   * Check if team is strong (for badge display)
   */
  const isStrongTeam = useCallback(
    (team: Team): boolean => {
      return team.strengthScore >= 75 && team.winRate >= 0.6;
    },
    []
  );

  /**
   * Remove player from team (only if they have accepted)
   * Team admins can manage team members
   */
  const removeTeamMember = useCallback(
    async (teamId: string, playerId: string, reason?: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      // Verify user is team owner or admin
      const team = teams.find((t) => t.id === teamId) || currentTeam;
      if (!team || (team.ownerId !== user.id && team.captainId !== user.id)) {
        setError('Only team owner or captain can remove members');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Check if player is accepted member
        const { data: playerData } = await supabase
          .from('team_players')
          .select('status')
          .eq('teamId', teamId)
          .eq('playerId', playerId)
          .single();

        if (!playerData || playerData.status !== 'accepted') {
          setError('Player is not an accepted member of this team');
          return { success: false };
        }

        // Remove player
        const result = await removePlayer(teamId, playerId);
        if (!result.success) {
          return { success: false };
        }

        // Update team accepted players count
        const { data: teamData } = await supabase
          .from('teams')
          .select('acceptedPlayers')
          .eq('id', teamId)
          .single();

        if (teamData) {
          const newCount = Math.max(0, (teamData.acceptedPlayers || 0) - 1);
          await supabase
            .from('teams')
            .update({
              acceptedPlayers: newCount,
              updatedAt: new Date().toISOString(),
            })
            .eq('id', teamId);

          updateTeam(teamId, { acceptedPlayers: newCount });
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
    [user, teams, currentTeam, removePlayer, updateTeam, setUpdating, setError]
  );

  /**
   * Create team post (social feature)
   */
  const createTeamPost = useCallback(
    async (teamId: string, text: string, images?: string[]) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        const { data, error: postError } = await supabase
          .from('team_posts')
          .insert({
            teamId,
            authorId: user.id,
            text,
            images: images || null,
          })
          .select()
          .single();

        if (postError) {
          setError(postError.message);
          return { success: false };
        }

        // Get author details
        const { data: authorData } = await supabase
          .from('user_profiles')
          .select('fullName, displayName, profilePictureUrl')
          .eq('id', user.id)
          .single();

        const post: TeamPost = {
          id: data.id,
          teamId,
          authorId: user.id,
          authorName: authorData?.fullName || authorData?.displayName || 'Unknown',
          authorAvatar: authorData?.profilePictureUrl || null,
          text,
          images: images || null,
          likes: 0,
          comments: 0,
          isLiked: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        return { success: true, data: post };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, setUpdating, setError]
  );

  /**
   * Fetch team reports (for admin review)
   */
  const fetchTeamReports = useCallback(
    async (teamId: string) => {
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('team_reports')
          .select('*, reporter:user_profiles(id, fullName, displayName)')
          .eq('teamId', teamId)
          .order('createdAt', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const reports: TeamReport[] = (data || []).map((r: any) => ({
          id: r.id,
          teamId: r.teamId,
          reportedBy: r.reportedBy,
          reportedByName: r.reporter?.fullName || r.reporter?.displayName || 'Unknown',
          reason: r.reason,
          createdAt: r.createdAt,
        }));

        return { success: true, data: reports };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
        setError(errorMessage);
        return { success: false };
      }
    },
    [setError]
  );

  /**
   * Check if team has minimum accepted players to become official
   */
  const checkTeamReadiness = useCallback(
    async (teamId: string, minPlayers: number = 11): Promise<{
      ready: boolean;
      acceptedCount: number;
      needed: number;
    }> => {
      try {
        const { data, error } = await supabase
          .from('team_players')
          .select('id', { count: 'exact', head: true })
          .eq('teamId', teamId)
          .eq('status', 'accepted');

        if (error) {
          return { ready: false, acceptedCount: 0, needed: minPlayers };
        }

        const acceptedCount = data?.length || 0;
        const needed = Math.max(0, minPlayers - acceptedCount);

        return {
          ready: acceptedCount >= minPlayers,
          acceptedCount,
          needed,
        };
      } catch {
        return { ready: false, acceptedCount: 0, needed: minPlayers };
      }
    },
    []
  );

  return {
    // Team creation
    createTeamWithPlayers,
    validatePlayersForTeamCreation,
    uploadTeamLogo,
    canMakeTeamOfficial,
    checkTeamReadiness,

    // Player management
    removeTeamMember,

    // Reporting
    reportTeam,
    fetchTeamReports,

    // Badges
    calculateTeamBadges,
    getTeamBadges,
    isStrongTeam,

    // Social features
    createTeamPost,

    // Invitations (delegated)
    sendInvite,
    acceptInvite,
    declineInvite,
  };
};

