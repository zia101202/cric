import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useTournamentManagementStore,
  Tournament,
  TournamentFormat,
  TournamentType,
  PrizeDistribution,
} from '../store/tournamentManagementStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for tournament management operations
 * Handles tournament creation, updates, and status management
 */
export const useTournamentManagement = () => {
  const {
    tournaments,
    currentTournament,
    isLoading,
    isCreating,
    error,
    setTournaments,
    addTournament,
    updateTournament,
    setCurrentTournament,
    setLoading,
    setCreating,
    setUpdating,
    setError,
  } = useTournamentManagementStore();
  const { user } = useAuthStore();
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Fetch all tournaments
   */
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return { success: false };
      }

      const formattedTournaments: Tournament[] = (data || []).map((t: any) => ({
        id: t.id,
        creatorId: t.creator_id,
        creatorName: t.creator?.full_name || t.creator?.display_name || t.creator_name || 'Unknown',
        name: t.name,
        description: t.description,
        format: t.format,
        type: t.type,
        entryFee: t.entry_fee,
        prizeDistribution: t.prize_distribution || [],
        logoUrl: t.logo_url,
        status: t.status,
        minTeams: t.min_teams || 8,
        currentTeams: t.current_teams || 0,
        totalMatches: t.total_matches || 0,
        completedMatches: t.completed_matches || 0,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      setTournaments(formattedTournaments);
      return { success: true, data: formattedTournaments };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournaments';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setTournaments, setLoading, setError]);

  /**
   * Fetch tournament by ID
   */
  const fetchTournamentById = useCallback(
    async (tournamentId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', tournamentId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const tournament: Tournament = {
          id: data.id,
          creatorId: data.creator_id,
          creatorName: (data as any).creator?.full_name || (data as any).creator?.display_name || data.creator_name || 'Unknown',
          name: data.name,
          description: data.description,
          format: data.format,
          type: data.type,
          entryFee: data.entry_fee,
          prizeDistribution: data.prize_distribution || [],
          logoUrl: data.logo_url,
          status: data.status,
          minTeams: data.min_teams || 8,
          currentTeams: data.current_teams || 0,
          totalMatches: data.total_matches || 0,
          completedMatches: data.completed_matches || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setCurrentTournament(tournament);
        return { success: true, data: tournament };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournament';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [setCurrentTournament, setLoading, setError]
  );

  /**
   * Create a new tournament
   */
  const createTournament = useCallback(
    async (tournamentData: {
      name: string;
      description?: string;
      format: TournamentFormat;
      type: TournamentType;
      entryFee: number;
      prizeDistribution: PrizeDistribution[];
      minTeams?: number;
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

        const creatorName = profileData?.full_name || profileData?.display_name || user.email || 'Unknown';

        const { data, error: createError } = await supabase
          .from('tournaments')
          .insert({
            creator_id: user.id,
            creator_name: creatorName,
            name: tournamentData.name,
            description: tournamentData.description,
            format: tournamentData.format,
            type: tournamentData.type,
            entry_fee: tournamentData.entryFee,
            prize_distribution: tournamentData.prizeDistribution,
            min_teams: tournamentData.minTeams || 8,
            status: 'draft',
            current_teams: 0,
            total_matches: 0,
            completed_matches: 0,
          })
          .select()
          .single();

        if (createError) {
          setError(createError.message);
          return { success: false };
        }

        const newTournament: Tournament = {
          id: data.id,
          creatorId: user.id,
          creatorName: creatorName,
          name: data.name,
          description: data.description,
          format: data.format,
          type: data.type,
          entryFee: data.entry_fee,
          prizeDistribution: data.prize_distribution || [],
          logoUrl: data.logo_url,
          status: data.status,
          minTeams: data.min_teams || 8,
          currentTeams: 0,
          totalMatches: 0,
          completedMatches: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        addTournament(newTournament);
        setCurrentTournament(newTournament);

        return { success: true, data: newTournament };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create tournament';
        setError(errorMessage);
        return { success: false };
      } finally {
        setCreating(false);
      }
    },
    [user, addTournament, setCurrentTournament, setCreating, setError]
  );

  /**
   * Upload tournament logo
   */
  const uploadTournamentLogo = useCallback(
    async (tournamentId: string, imageUri: string) => {
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
        const fileName = `tournament-${tournamentId}-${Date.now()}.${fileExt}`;
        const filePath = `tournament-logos/${fileName}`;

        setUploadProgress(30);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tournament-assets')
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
        } = supabase.storage.from('tournament-assets').getPublicUrl(filePath);

        // Update tournament with logo URL
        const { error: updateError } = await supabase
          .from('tournaments')
          .update({ logo_url: publicUrl })
          .eq('id', tournamentId);

        if (updateError) {
          setError(updateError.message);
          return { success: false, url: null };
        }

        updateTournament(tournamentId, { logoUrl: publicUrl });
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
    [user, updateTournament, setUpdating, setError]
  );

  /**
   * Make tournament official (when 8 teams accept)
   */
  const makeTournamentOfficial = useCallback(
    async (tournamentId: string) => {
      setUpdating(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('tournaments')
          .update({
            status: 'official',
            updated_at: new Date().toISOString(),
          })
          .eq('id', tournamentId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTournament(tournamentId, { status: 'official' });
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to make tournament official';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTournament, setUpdating, setError]
  );

  /**
   * Update tournament details
   */
  const updateTournamentDetails = useCallback(
    async (tournamentId: string, updates: Partial<Tournament>) => {
      setUpdating(true);
      setError(null);

      try {
        // Convert camelCase updates to snake_case for database
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.format !== undefined) dbUpdates.format = updates.format;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.entryFee !== undefined) dbUpdates.entry_fee = updates.entryFee;
        if (updates.prizeDistribution !== undefined) dbUpdates.prize_distribution = updates.prizeDistribution;
        if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.minTeams !== undefined) dbUpdates.min_teams = updates.minTeams;
        if (updates.currentTeams !== undefined) dbUpdates.current_teams = updates.currentTeams;
        if (updates.totalMatches !== undefined) dbUpdates.total_matches = updates.totalMatches;
        if (updates.completedMatches !== undefined) dbUpdates.completed_matches = updates.completedMatches;
        dbUpdates.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from('tournaments')
          .update(dbUpdates)
          .eq('id', tournamentId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateTournament(tournamentId, updates);
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update tournament';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [updateTournament, setUpdating, setError]
  );

  return {
    tournaments,
    currentTournament,
    isLoading,
    isCreating,
    error,
    fetchTournaments,
    fetchTournamentById,
    createTournament,
    uploadTournamentLogo,
    makeTournamentOfficial,
    updateTournamentDetails,
    uploadProgress,
  };
};

