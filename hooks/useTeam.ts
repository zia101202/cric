import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useTeamStore, Team, TeamStatus } from '../store/teamStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for team operations
 * Handles team creation, updates, and management
 */
export const useTeam = () => {
  const {
    teams,
    currentTeam,
    isLoading,
    isCreating,
    error,
    setTeams,
    addTeam,
    updateTeam,
    setCurrentTeam,
    setLoading,
    setCreating,
    setUpdating,
    setError,
  } = useTeamStore();
  const { user } = useAuthStore();
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Fetch all teams
   */
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch teams - owner_name is already stored in teams table
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return { success: false };
      }

      const formattedTeams: Team[] = (data || []).map((t: any) => ({
        id: t.id,
        ownerId: t.owner_id,
        ownerName: t.owner?.full_name || t.owner?.display_name || t.owner_name || 'Unknown',
        name: t.name,
        logoUrl: t.logo_url,
        description: t.description,
        status: t.status,
        captainId: t.captain_id,
        captainName: t.captain_name,
        viceCaptainId: t.vice_captain_id,
        viceCaptainName: t.vice_captain_name,
        totalPlayers: t.total_players || 0,
        acceptedPlayers: t.accepted_players || 0,
        matchesPlayed: 0, // Will be fetched from team_stats if needed
        wins: 0,
        losses: 0,
        ties: 0,
        winRate: 0,
        strengthScore: 0,
        followers: 0,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      setTeams(formattedTeams);
      return { success: true, data: formattedTeams };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teams';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setTeams, setLoading, setError]);

  /**
   * Fetch team by ID
   */
  const fetchTeamById = useCallback(
    async (teamId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const team: Team = {
          id: data.id,
          ownerId: data.owner_id,
          ownerName: (data as any).owner?.full_name || (data as any).owner?.display_name || data.owner_name || 'Unknown',
          name: data.name,
          logoUrl: data.logo_url,
          description: data.description,
          status: data.status,
          captainId: data.captain_id,
          captainName: data.captain_name,
          viceCaptainId: data.vice_captain_id,
          viceCaptainName: data.vice_captain_name,
          totalPlayers: data.total_players || 0,
          acceptedPlayers: data.accepted_players || 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          strengthScore: 0,
          followers: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setCurrentTeam(team);
        return { success: true, data: team };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [setCurrentTeam, setLoading, setError]
  );

  /**
   * Create a new team
   */
  const createTeam = useCallback(
    async (teamData: {
      name: string;
      description?: string;
      minPlayers?: number;
    }) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setCreating(true);
      setError(null);

      try {
        // First ensure user profile exists in database
        let profileData;
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('full_name, display_name')
          .eq('id', user.id)
          .maybeSingle();

        // If profile doesn't exist (null data or PGRST116 error), create it
        if (!existingProfile || (fetchError && (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows')))) {
          const displayName = user.email?.split('@')[0] || 'User';
          const { data: newProfile, error: createProfileError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: displayName,
              display_name: displayName,
            })
            .select('full_name, display_name')
            .single();

          if (createProfileError) {
            setError(`Failed to create user profile: ${createProfileError.message}. Please ensure your user profile exists.`);
            return { success: false };
          }
          profileData = newProfile;
        } else if (fetchError) {
          setError(`Failed to fetch user profile: ${fetchError.message}`);
          return { success: false };
        } else {
          profileData = existingProfile;
        }

        const ownerName = profileData?.full_name || profileData?.display_name || user.email || 'Unknown';

        const { data, error: createError } = await supabase
          .from('teams')
          .insert({
            owner_id: user.id,
            owner_name: ownerName,
            name: teamData.name,
            description: teamData.description,
            status: 'draft',
            total_players: 0,
            accepted_players: 0,
            min_players: teamData.minPlayers || 11,
          })
          .select()
          .single();

        if (createError) {
          setError(createError.message);
          return { success: false };
        }

        const newTeam: Team = {
          id: data.id,
          ownerId: user.id,
          ownerName: ownerName,
          name: data.name,
          logoUrl: data.logo_url,
          description: data.description,
          status: data.status,
          captainId: data.captain_id || null,
          captainName: data.captain_name || null,
          viceCaptainId: data.vice_captain_id || null,
          viceCaptainName: data.vice_captain_name || null,
          totalPlayers: data.total_players || 0,
          acceptedPlayers: data.accepted_players || 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          strengthScore: 0,
          followers: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        addTeam(newTeam);
        setCurrentTeam(newTeam);

        return { success: true, data: newTeam };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
        setError(errorMessage);
        return { success: false };
      } finally {
        setCreating(false);
      }
    },
    [user, addTeam, setCurrentTeam, setCreating, setError]
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
      setUploadProgress(0);

      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileExt = imageUri.split('.').pop() || 'jpg';
        const fileName = `team-${teamId}-${Date.now()}.${fileExt}`;
        const filePath = `team-logos/${fileName}`;

        setUploadProgress(30);

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

        setUploadProgress(70);

        const {
          data: { publicUrl },
        } = supabase.storage.from('team-assets').getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('teams')
          .update({ logo_url: publicUrl })
          .eq('id', teamId);

        if (updateError) {
          setError(updateError.message);
          return { success: false, url: null };
        }

        updateTeam(teamId, { logoUrl: publicUrl });
        setUploadProgress(100);

        return { success: true, url: publicUrl };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
        setError(errorMessage);
        return { success: false, url: null };
      } finally {
        setUpdating(false);
        setUploadProgress(0);
      }
    },
    [user, updateTeam, setUpdating, setError]
  );

  /**
   * Update team details
   */
  const updateTeamDetails = useCallback(
    async (teamId: string, updates: Partial<Team>) => {
      setUpdating(true);
      setError(null);

      try {
        // Convert camelCase updates to snake_case for database
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
        if (updates.captainId !== undefined) dbUpdates.captain_id = updates.captainId;
        if (updates.captainName !== undefined) dbUpdates.captain_name = updates.captainName;
        if (updates.viceCaptainId !== undefined) dbUpdates.vice_captain_id = updates.viceCaptainId;
        if (updates.viceCaptainName !== undefined) dbUpdates.vice_captain_name = updates.viceCaptainName;
        dbUpdates.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from('teams')
          .update(dbUpdates)
          .eq('id', teamId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeam(teamId, updates);
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update team';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTeam, setUpdating, setError]
  );

  /**
   * Set team captain
   */
  const setCaptain = useCallback(
    async (teamId: string, playerId: string, playerName: string) => {
      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            captain_id: playerId,
            captain_name: playerName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeam(teamId, {
          captainId: playerId,
          captainName: playerName,
        });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set captain';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTeam, setUpdating, setError]
  );

  /**
   * Set team vice-captain
   */
  const setViceCaptain = useCallback(
    async (teamId: string, playerId: string, playerName: string) => {
      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            vice_captain_id: playerId,
            vice_captain_name: playerName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeam(teamId, {
          viceCaptainId: playerId,
          viceCaptainName: playerName,
        });

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set vice-captain';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTeam, setUpdating, setError]
  );

  /**
   * Make team official (when minimum players accept)
   */
  const makeTeamOfficial = useCallback(
    async (teamId: string) => {
      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            status: 'official',
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTeam(teamId, { status: 'official' });
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to make team official';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTeam, setUpdating, setError]
  );

  return {
    teams,
    currentTeam,
    isLoading,
    isCreating,
    error,
    fetchTeams,
    fetchTeamById,
    createTeam,
    uploadTeamLogo,
    updateTeamDetails,
    setCaptain,
    setViceCaptain,
    makeTeamOfficial,
    uploadProgress,
  };
};

