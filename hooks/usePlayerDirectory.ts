import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { PlayerRole, UserProfile } from '../store/userProfileStore';
import { usePlayerDirectoryStore } from '../store/playerDirectoryStore';

const mapProfile = (data: any): UserProfile => ({
  id: data.id,
  email: data.email,
  fullName: data.full_name,
  displayName: data.display_name,
  playerRole: data.player_role as PlayerRole | null,
  profilePictureUrl: data.profile_picture_url,
  bio: data.bio,
  dateOfBirth: data.date_of_birth,
  phoneNumber: data.phone_number,
  location: data.location,
  battingAverage: data.batting_average,
  strikeRate: data.strike_rate,
  economyRate: data.economy_rate,
  wickets: data.wickets || 0,
  runs: data.runs || 0,
  matchesPlayed: data.matches_played || 0,
  rating: data.rating || 0,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

/**
 * Hook that coordinates player directory operations (fetching, clearing).
 */
export const usePlayerDirectory = () => {
  const { setSelectedPlayer, setLoading, setError, reset } = usePlayerDirectoryStore();

  const fetchPlayerById = useCallback(
    async (playerId: string) => {
      if (!playerId) {
        setError('Player ID is required');
        return { success: false };
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) {
          throw error;
        }

        const profile = mapProfile(data);
        setSelectedPlayer(profile);
        return { success: true, data: profile };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load player';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setSelectedPlayer, setLoading, setError]
  );

  const clearSelection = useCallback(() => {
    reset();
  }, [reset]);

  return {
    fetchPlayerById,
    clearSelection,
  };
};


