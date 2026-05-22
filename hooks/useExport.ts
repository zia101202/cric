import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'pdf' | 'json';

/**
 * Export type
 */
export type ExportType = 'scorecard' | 'tournament' | 'player_stats' | 'team_stats' | 'transactions';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeImages?: boolean;
  template?: string;
}

/**
 * Custom hook for export operations
 * Handles generating CSV, PDF, and JSON exports for various data types
 */
export const useExport = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  /**
   * Export match scorecard
   */
  const exportScorecard = useCallback(
    async (matchId: string, options: ExportOptions) => {
      setLoading(true);
      setError(null);
      setExportProgress(0);

      try {
        // Fetch match data
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select(
            '*, team1:teams(*), team2:teams(*), match_players(*, player:user_profiles(*))'
          )
          .eq('id', matchId)
          .single();

        if (matchError || !match) {
          throw new Error('Match not found');
        }

        setExportProgress(30);

        if (options.format === 'csv') {
          // Generate CSV
          const csv = generateScorecardCSV(match);
          return { success: true, data: csv, mimeType: 'text/csv' };
        } else if (options.format === 'json') {
          // Generate JSON
          const json = JSON.stringify(match, null, 2);
          return { success: true, data: json, mimeType: 'application/json' };
        } else {
          // PDF generation would require server-side processing
          // For now, return a placeholder
          return {
            success: false,
            error: 'PDF export requires server-side processing',
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
        setExportProgress(0);
      }
    },
    []
  );

  /**
   * Export tournament data
   */
  const exportTournament = useCallback(
    async (tournamentId: string, options: ExportOptions) => {
      setLoading(true);
      setError(null);
      setExportProgress(0);

      try {
        // Fetch tournament data
        const { data: tournament, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*, tournament_teams(*, teams(*)), matches(*)')
          .eq('id', tournamentId)
          .single();

        if (tournamentError || !tournament) {
          throw new Error('Tournament not found');
        }

        setExportProgress(30);

        if (options.format === 'csv') {
          const csv = generateTournamentCSV(tournament);
          return { success: true, data: csv, mimeType: 'text/csv' };
        } else if (options.format === 'json') {
          const json = JSON.stringify(tournament, null, 2);
          return { success: true, data: json, mimeType: 'application/json' };
        } else {
          return {
            success: false,
            error: 'PDF export requires server-side processing',
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
        setExportProgress(0);
      }
    },
    []
  );

  /**
   * Generate shareable poster image (placeholder - would need image generation service)
   */
  const generatePoster = useCallback(
    async (matchId: string, template: string = 'default') => {
      setLoading(true);
      setError(null);

      try {
        // Fetch match data
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('*, team1:teams(*), team2:teams(*)')
          .eq('id', matchId)
          .single();

        if (matchError || !match) {
          throw new Error('Match not found');
        }

        // In production, this would call a server-side image generation service
        // For now, return a placeholder URL
        return {
          success: true,
          data: {
            imageUrl: `https://placeholder.com/poster/${matchId}`,
            message: 'Poster generation requires server-side processing',
          },
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate poster';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Helper: Generate CSV for scorecard
   */
  const generateScorecardCSV = (match: any): string => {
    const rows: string[] = [];
    rows.push('Match Scorecard');
    rows.push(`Match ID,${match.id}`);
    rows.push(`Date,${match.scheduledDate || match.createdAt}`);
    rows.push(`Team 1,${match.team1?.name || 'Team 1'}`);
    rows.push(`Team 2,${match.team2?.name || 'Team 2'}`);
    rows.push('');

    if (match.team1Scorecard) {
      rows.push('Team 1 Scorecard');
      rows.push('Player,Runs,Balls,4s,6s,Strike Rate');
      // Add player data
    }

    if (match.team2Scorecard) {
      rows.push('');
      rows.push('Team 2 Scorecard');
      rows.push('Player,Runs,Balls,4s,6s,Strike Rate');
      // Add player data
    }

    return rows.join('\n');
  };

  /**
   * Helper: Generate CSV for tournament
   */
  const generateTournamentCSV = (tournament: any): string => {
    const rows: string[] = [];
    rows.push('Tournament Data');
    rows.push(`Tournament ID,${tournament.id}`);
    rows.push(`Name,${tournament.name}`);
    rows.push(`Format,${tournament.format}`);
    rows.push(`Status,${tournament.status}`);
    rows.push('');

    if (tournament.tournament_teams) {
      rows.push('Teams');
      rows.push('Team Name,Status,Requested At');
      tournament.tournament_teams.forEach((tt: any) => {
        rows.push(`${tt.teams?.name || ''},${tt.status},${tt.requested_at}`);
      });
    }

    return rows.join('\n');
  };

  return {
    loading,
    error,
    exportProgress,
    exportScorecard,
    exportTournament,
    generatePoster,
  };
};

