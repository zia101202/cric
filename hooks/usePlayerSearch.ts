import { useCallback, useState } from 'react';
import { supabase } from '../config/supabase';

export interface PlayerSummary {
  id: string;
  fullName: string;
  displayName: string;
  location: string | null;
  rating: number;
  playerRole: string | null;
}

/**
 * Lightweight hook to search available players for invitations.
 * Keeps Supabase querying logic out of UI components.
 */
export const usePlayerSearch = () => {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlayers = useCallback(
    async (query: string = '', excludePlayerIds: string[] = []) => {
      setIsLoading(true);
      setError(null);

      try {
        let request = supabase
          .from('user_profiles')
          .select('id, full_name, display_name, location, rating, player_role')
          .order('rating', { ascending: false })
          .limit(25);

        if (query) {
          request = request.ilike('full_name', `%${query}%`);
        }

        const { data, error: fetchError } = await request;

        if (fetchError) {
          throw fetchError;
        }

        const results =
          data
            ?.map((player) => ({
              id: player.id,
              fullName: player.full_name,
              displayName: player.display_name,
              location: player.location,
              rating: player.rating || 0,
              playerRole: player.player_role,
            }))
            .filter((player) => !excludePlayerIds.includes(player.id)) || [];

        setPlayers(results);
        return { success: true, data: results };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load players';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetResults = useCallback(() => {
    setPlayers([]);
    setError(null);
  }, []);

  return {
    players,
    isLoading,
    error,
    searchPlayers,
    resetResults,
  };
};


