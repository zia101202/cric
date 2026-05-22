import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useTournamentStore,
  Tournament,
  TeamInvitation,
  Match,
  Venue,
  TournamentStatus,
  TournamentFormat,
  TournamentType,
  InvitationStatus,
  MatchStatus,
} from '../store/tournamentStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for tournament operations
 * Handles tournament creation, team invitations, match scheduling, and venue management
 */
export const useTournament = () => {
  const {
    tournaments,
    currentTournament,
    invitations,
    matches,
    venues,
    setTournaments,
    addTournament,
    updateTournament,
    setCurrentTournament,
    setInvitations,
    addInvitation,
    updateInvitation,
    setMatches,
    addMatch,
    updateMatch,
    setVenues,
    addVenue,
    setPointTable,
    setLoading,
    setCreating,
    setUpdating,
    setError,
  } = useTournamentStore();
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

      // Map snake_case to camelCase for frontend
      const formattedTournaments: Tournament[] = (data || []).map((t: any) => ({
        id: t.id,
        organizerId: t.creator_id,
        organizerName: t.creator_name,
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
        startDate: t.start_date,
        endDate: t.end_date,
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
   * Fetch tournament by ID with all related data
   */
  const fetchTournamentById = useCallback(
    async (tournamentId: string) => {
      setLoading(true);
      setError(null);

      try {
        // Fetch tournament
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', tournamentId)
          .single();

        if (tournamentError) {
          setError(tournamentError.message);
          return { success: false };
        }

        // Map snake_case to camelCase
        const tournament: Tournament = {
          id: tournamentData.id,
          organizerId: tournamentData.creator_id,
          organizerName: tournamentData.creator_name,
          name: tournamentData.name,
          description: tournamentData.description,
          format: tournamentData.format,
          type: tournamentData.type,
          entryFee: tournamentData.entry_fee,
          prizeDistribution: tournamentData.prize_distribution || [],
          logoUrl: tournamentData.logo_url,
          status: tournamentData.status,
          minTeams: tournamentData.min_teams || 8,
          currentTeams: tournamentData.current_teams || 0,
          totalMatches: tournamentData.total_matches || 0,
          completedMatches: tournamentData.completed_matches || 0,
          startDate: tournamentData.start_date,
          endDate: tournamentData.end_date,
          createdAt: tournamentData.created_at,
          updatedAt: tournamentData.updated_at,
        };

        setCurrentTournament(tournament);

        // Fetch invitations (using tournament_teams table)
        const { data: invitationsData } = await supabase
          .from('tournament_teams')
          .select('*, team:teams(id, name, logo_url)')
          .eq('tournament_id', tournamentId);

        if (invitationsData) {
          const formattedInvitations: TeamInvitation[] = invitationsData.map((inv: any) => ({
            id: inv.id,
            tournamentId: inv.tournament_id,
            teamId: inv.team_id,
            teamName: inv.team_name || inv.team?.name || 'Unknown Team',
            teamLogo: inv.team?.logo_url || null,
            status: inv.status,
            invitedAt: inv.requested_at,
            respondedAt: inv.responded_at,
            invitedBy: null, // tournament_teams doesn't have invited_by
          }));
          setInvitations(formattedInvitations);
        }

        // Fetch matches
        const { data: matchesData } = await supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('scheduled_date', { ascending: true });

        if (matchesData) {
          setMatches(matchesData as Match[]);
        }

        // Fetch point table
        await calculatePointTable(tournamentId);

        return { success: true, data: tournament };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournament';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [setCurrentTournament, setInvitations, setMatches, setLoading, setError]
  );

  /**
   * Create a new tournament
   */
  const createTournament = useCallback(
    async (tournamentData: {
      name: string;
      description?: string;
      format: TournamentFormat;
      customOvers?: number;
      type: TournamentType;
      startDate: string;
      endDate: string;
      registrationDeadline: string;
      prizeAmount?: number;
      prizeCurrency?: string;
      rules?: string;
      minTeams: number;
      maxTeams?: number;
      venueId?: string;
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

        const organizerName = profileData?.full_name || profileData?.display_name || user.email || '';

        const { data, error: createError } = await supabase
          .from('tournaments')
          .insert({
            creator_id: user.id,
            creator_name: organizerName,
            name: tournamentData.name,
            description: tournamentData.description,
            format: tournamentData.format,
            type: tournamentData.type,
            entry_fee: tournamentData.prizeAmount || 0,
            prize_distribution: tournamentData.prizeCurrency ? [] : [],
            start_date: tournamentData.startDate,
            end_date: tournamentData.endDate,
            status: 'pending',
            min_teams: tournamentData.minTeams,
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

        // Map snake_case to camelCase
        const newTournament: Tournament = {
          id: data.id,
          organizerId: data.creator_id,
          organizerName: data.creator_name,
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
          startDate: data.start_date,
          endDate: data.end_date,
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
   * Send team invitation
   */
  const sendTeamInvitation = useCallback(
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
          .select('id, status')
          .eq('tournament_id', tournamentId)
          .eq('team_id', teamId)
          .maybeSingle();

        if (existing) {
          if (existing.status === 'accepted') {
            setError('Team is already part of this tournament');
            return { success: false };
          }
          if (existing.status === 'requested') {
            setError('Invitation already sent to this team');
            return { success: false };
          }
        }

        // Get team name
        const { data: teamData } = await supabase
          .from('teams')
          .select('name')
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
          .select('*, team:teams!tournament_teams_team_id_fkey(id, name, logo_url)')
          .single();

        if (inviteError) {
          setError(inviteError.message);
          return { success: false };
        }

        const invitation: TeamInvitation = {
          id: data.id,
          tournamentId: data.tournament_id,
          teamId: data.team_id,
          teamName: data.team_name || (data as any).team?.name || 'Unknown Team',
          teamLogo: (data as any).team?.logo_url || null,
          status: data.status,
          invitedAt: data.requested_at,
          respondedAt: data.responded_at,
          invitedBy: user.id, // Set the creator as the inviter
        };

        addInvitation(invitation);
        return { success: true, data: invitation };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, addInvitation, setUpdating, setError]
  );

  /**
   * Update invitation status (accept/reject)
   */
  const updateInvitationStatus = useCallback(
    async (invitationId: string, status: InvitationStatus) => {
      setUpdating(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from('tournament_teams')
          .update({
            status,
            responded_at: new Date().toISOString(),
          })
          .eq('id', invitationId)
          .select()
          .single();

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        updateInvitation(invitationId, {
          status: data.status,
          respondedAt: data.responded_at,
        });

        // If accepted, update tournament team count and check if tournament becomes official
        if (status === 'accepted' && currentTournament) {
          const acceptedCount = invitations.filter((inv) => inv.status === 'accepted').length + 1;
          const newStatus: TournamentStatus =
            acceptedCount >= currentTournament.minTeams ? 'official' : 'pending';

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
        }

        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update invitation';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [currentTournament, invitations, updateInvitation, updateTournament, setUpdating, setError]
  );

  /**
   * Schedule a match
   */
  const scheduleMatch = useCallback(
    async (matchData: {
      tournamentId: string;
      team1Id: string;
      team2Id: string;
      scheduledDate: string;
      scheduledTime: string;
      venueId: string;
      format: TournamentFormat;
      overs?: number;
    }) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setUpdating(true);
      setError(null);

      try {
        // Get team names
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', [matchData.team1Id, matchData.team2Id]);

        const team1 = teamsData?.find((t) => t.id === matchData.team1Id);
        const team2 = teamsData?.find((t) => t.id === matchData.team2Id);

        // Get venue name
        const { data: venueData } = await supabase
          .from('venues')
          .select('name')
          .eq('id', matchData.venueId)
          .single();

        // Get next match number
        const { count } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', matchData.tournamentId);

        const { data, error: matchError } = await supabase
          .from('matches')
          .insert({
            tournament_id: matchData.tournamentId,
            team1_id: matchData.team1Id,
            team1_name: team1?.name || 'Team 1',
            team2_id: matchData.team2Id,
            team2_name: team2?.name || 'Team 2',
            scheduled_date: matchData.scheduledDate,
            scheduled_time: matchData.scheduledTime,
            venue_id: matchData.venueId,
            venue_name: venueData?.name || 'Unknown Venue',
            format: matchData.format,
            overs: matchData.overs,
            match_number: (count || 0) + 1,
            status: 'scheduled',
          })
          .select()
          .single();

        if (matchError) {
          setError(matchError.message);
          return { success: false };
        }

        addMatch(data as Match);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to schedule match';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
      }
    },
    [user, addMatch, setUpdating, setError]
  );

  /**
   * Create or update venue
   */
  const saveVenue = useCallback(
    async (venueData: {
      name: string;
      address: string;
      city: string;
      state?: string;
      country: string;
      latitude: number;
      longitude: number;
      capacity?: number;
      facilities?: string[];
      imageUri?: string;
    }) => {
      setUpdating(true);
      setError(null);
      setUploadProgress(0);

      try {
        let imageUrl: string | null = null;

        // Upload venue image if provided
        if (venueData.imageUri && user?.id) {
          const response = await fetch(venueData.imageUri);
          const blob = await response.blob();
          const fileExt = venueData.imageUri.split('.').pop() || 'jpg';
          const fileName = `venue-${Date.now()}.${fileExt}`;
          const filePath = `venues/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('venues')
            .upload(filePath, blob, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('venues').getPublicUrl(filePath);
            imageUrl = publicUrl;
          }
        }

        const { data, error: venueError } = await supabase
          .from('venues')
          .insert({
            name: venueData.name,
            address: venueData.address,
            city: venueData.city,
            state: venueData.state,
            country: venueData.country,
            latitude: venueData.latitude,
            longitude: venueData.longitude,
            capacity: venueData.capacity,
            facilities: venueData.facilities,
            imageUrl,
          })
          .select()
          .single();

        if (venueError) {
          setError(venueError.message);
          return { success: false };
        }

        addVenue(data as Venue);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save venue';
        setError(errorMessage);
        return { success: false };
      } finally {
        setUpdating(false);
        setUploadProgress(0);
      }
    },
    [user, addVenue, setUpdating, setError]
  );

  /**
   * Calculate and update point table
   */
  const calculatePointTable = useCallback(async (tournamentId: string) => {
    try {
        // Fetch all completed matches for the tournament
      const { data: completedMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'completed');

      if (!completedMatches || completedMatches.length === 0) {
        setPointTable([]);
        return;
      }

      // Get all teams in tournament
      const { data: invitations } = await supabase
        .from('tournament_teams')
        .select('team_id, team:teams(id, name, logo_url)')
        .eq('tournament_id', tournamentId)
        .eq('status', 'accepted');

      const pointTableMap = new Map<string, any>();

      // Initialize point table entries
      invitations?.forEach((inv: any) => {
        pointTableMap.set(inv.team_id, {
          teamId: inv.team_id,
          teamName: inv.team?.name || 'Unknown',
          teamLogo: inv.team?.logo_url || null,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          matchesTied: 0,
          points: 0,
          netRunRate: 0,
          totalRunsScored: 0,
          totalOversFaced: 0,
          totalRunsConceded: 0,
          totalOversBowled: 0,
        });
      });

      // Calculate stats from matches
      completedMatches.forEach((match: any) => {
        const team1Entry = pointTableMap.get(match.team1_id);
        const team2Entry = pointTableMap.get(match.team2_id);

        if (team1Entry && team2Entry) {
          team1Entry.matchesPlayed++;
          team2Entry.matchesPlayed++;

          // Check result from scorecard JSONB
          const result = match.result || {};
          const winnerId = result.winner_id;
          
          if (winnerId === match.team1_id) {
            team1Entry.matchesWon++;
            team1Entry.points += 2;
            team2Entry.matchesLost++;
          } else if (winnerId === match.team2_id) {
            team2Entry.matchesWon++;
            team2Entry.points += 2;
            team1Entry.matchesLost++;
          } else {
            team1Entry.matchesTied++;
            team2Entry.matchesTied++;
            team1Entry.points += 1;
            team2Entry.points += 1;
          }

          // Calculate net run rate (simplified)
          const scorecard = match.scorecard || {};
          if (scorecard.team1_score && scorecard.team2_score) {
            team1Entry.totalRunsScored += scorecard.team1_score;
            team2Entry.totalRunsScored += scorecard.team2_score;
            team1Entry.totalRunsConceded += scorecard.team2_score;
            team2Entry.totalRunsConceded += scorecard.team1_score;
          }
        }
      });

      // Calculate net run rate and create final entries
      const pointTableEntries = Array.from(pointTableMap.values()).map((entry) => {
        const nrr =
          entry.totalOversFaced > 0 && entry.totalOversBowled > 0
            ? (entry.totalRunsScored / entry.totalOversFaced -
                entry.totalRunsConceded / entry.totalOversBowled) /
              10
            : 0;

        return {
          teamId: entry.teamId,
          teamName: entry.teamName,
          teamLogo: entry.teamLogo,
          matchesPlayed: entry.matchesPlayed,
          matchesWon: entry.matchesWon,
          matchesLost: entry.matchesLost,
          matchesTied: entry.matchesTied,
          points: entry.points,
          netRunRate: Math.round(nrr * 100) / 100,
        };
      });

      // Sort by points (desc) then NRR (desc)
      pointTableEntries.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.netRunRate - a.netRunRate;
      });

      // Add rank
      pointTableEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setPointTable(pointTableEntries);
    } catch (err) {
      console.error('Error calculating point table:', err);
    }
  }, [setPointTable]);

  return {
    tournaments,
    currentTournament,
    invitations,
    matches,
    venues,
    fetchTournaments,
    fetchTournamentById,
    createTournament,
    sendTeamInvitation,
    updateInvitationStatus,
    scheduleMatch,
    saveVenue,
    calculatePointTable,
    uploadProgress,
  };
};

