import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import {
  useReportingStore,
  ErrorReport,
  ReportType,
  CorrectedScore,
} from '../store/reportingStore';
import { useMatchStore } from '../store/matchStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for match error reporting
 * Handles reporting wrong data and submitting corrections
 */
export const useMatchReporting = () => {
  const {
    reports,
    correctedScores,
    setReports,
    addReport,
    updateReport,
    setCorrectedScores,
    addCorrectedScore,
    setLoading,
    setSubmitting,
    setError,
  } = useReportingStore();
  const { currentMatch, updateMatch } = useMatchStore();
  const { user } = useAuthStore();

  /**
   * Report wrong player score
   */
  const reportPlayerScore = useCallback(
    async (
      matchId: string,
      playerId: string,
      playerName: string,
      description: string,
      correctedScore?: CorrectedScore
    ) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setSubmitting(true);
      setError(null);

      try {
        // Check if report already exists
        const { data: existingReport } = await supabase
          .from('error_reports')
          .select('*')
          .eq('matchId', matchId)
          .eq('targetPlayerId', playerId)
          .eq('reportType', 'player_score')
          .single();

        let reportData: ErrorReport;

        if (existingReport) {
          // Update existing report count
          const newCount = (existingReport.reportCount || 1) + 1;
          const { data, error: updateError } = await supabase
            .from('error_reports')
            .update({
              reportCount: newCount,
              description: `${existingReport.description}\n\nAdditional report: ${description}`,
              proposedCorrection: correctedScore || existingReport.proposedCorrection,
              updatedAt: new Date().toISOString(),
            })
            .eq('id', existingReport.id)
            .select()
            .single();

          if (updateError) {
            setError(updateError.message);
            return { success: false };
          }

          reportData = data as ErrorReport;
          updateReport(existingReport.id, reportData);

          // If 2 or more reports, allow correction
          if (newCount >= 2 && correctedScore) {
            await applyPlayerScoreCorrection(matchId, correctedScore);
          }
        } else {
          // Create new report
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('fullName, displayName')
            .eq('id', user.id)
            .single();

          const reporterName =
            profileData?.fullName || profileData?.displayName || user.email || 'Unknown';

          const { data, error: createError } = await supabase
            .from('error_reports')
            .insert({
              matchId,
              reportedBy: user.id,
              reportedByName: reporterName,
              reportType: 'player_score',
              targetPlayerId: playerId,
              targetPlayerName: playerName,
              description,
              proposedCorrection: correctedScore || null,
              status: 'pending',
              reportCount: 1,
            })
            .select()
            .single();

          if (createError) {
            setError(createError.message);
            return { success: false };
          }

          reportData = data as ErrorReport;
          addReport(reportData);
        }

        return { success: true, data: reportData };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
        setError(errorMessage);
        return { success: false };
      } finally {
        setSubmitting(false);
      }
    },
    [user, addReport, updateReport, setSubmitting, setError]
  );

  /**
   * Report wrong match result
   */
  const reportMatchResult = useCallback(
    async (matchId: string, description: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setSubmitting(true);
      setError(null);

      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('fullName, displayName')
          .eq('id', user.id)
          .single();

        const reporterName =
          profileData?.fullName || profileData?.displayName || user.email || 'Unknown';

        // Check if report exists
        const { data: existingReport } = await supabase
          .from('error_reports')
          .select('*')
          .eq('matchId', matchId)
          .eq('reportType', 'entire_match')
          .single();

        let reportData: ErrorReport;

        if (existingReport) {
          const newCount = (existingReport.reportCount || 1) + 1;
          const { data, error: updateError } = await supabase
            .from('error_reports')
            .update({
              reportCount: newCount,
              description: `${existingReport.description}\n\nAdditional report: ${description}`,
              updatedAt: new Date().toISOString(),
            })
            .eq('id', existingReport.id)
            .select()
            .single();

          if (updateError) {
            setError(updateError.message);
            return { success: false };
          }

          reportData = data as ErrorReport;
          updateReport(existingReport.id, reportData);

          // If 2 or more reports, mark match as invalid
          if (newCount >= 2) {
            await markMatchAsInvalid(matchId);
          }
        } else {
          const { data, error: createError } = await supabase
            .from('error_reports')
            .insert({
              matchId,
              reportedBy: user.id,
              reportedByName: reporterName,
              reportType: 'entire_match',
              description,
              status: 'pending',
              reportCount: 1,
            })
            .select()
            .single();

          if (createError) {
            setError(createError.message);
            return { success: false };
          }

          reportData = data as ErrorReport;
          addReport(reportData);
        }

        return { success: true, data: reportData };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
        setError(errorMessage);
        return { success: false };
      } finally {
        setSubmitting(false);
      }
    },
    [user, addReport, updateReport, setSubmitting, setError]
  );

  /**
   * Apply player score correction
   */
  const applyPlayerScoreCorrection = useCallback(
    async (matchId: string, correctedScore: CorrectedScore) => {
      if (!currentMatch) {
        setError('Match not loaded');
        return { success: false };
      }

      try {
        // Update scorecard with corrected data
        const updatedScorecard1 = currentMatch.team1Scorecard
          ? {
              ...currentMatch.team1Scorecard,
              players: currentMatch.team1Scorecard.players.map((p) =>
                p.playerId === correctedScore.playerId
                  ? {
                      ...p,
                      runs: correctedScore.proposedRuns,
                      wickets: correctedScore.proposedWickets ?? p.wickets,
                      overs: correctedScore.proposedOvers ?? p.overs,
                      strikeRate: calculateStrikeRate(
                        correctedScore.proposedRuns,
                        p.balls
                      ),
                      economy: correctedScore.proposedOvers
                        ? calculateEconomy(
                            correctedScore.proposedRuns ?? p.runsConceded ?? 0,
                            correctedScore.proposedOvers
                          )
                        : p.economy,
                    }
                  : p
              ),
            }
          : null;

        const updatedScorecard2 = currentMatch.team2Scorecard
          ? {
              ...currentMatch.team2Scorecard,
              players: currentMatch.team2Scorecard.players.map((p) =>
                p.playerId === correctedScore.playerId
                  ? {
                      ...p,
                      runs: correctedScore.proposedRuns,
                      wickets: correctedScore.proposedWickets ?? p.wickets,
                      overs: correctedScore.proposedOvers ?? p.overs,
                      strikeRate: calculateStrikeRate(
                        correctedScore.proposedRuns,
                        p.balls
                      ),
                      economy: correctedScore.proposedOvers
                        ? calculateEconomy(
                            correctedScore.proposedRuns ?? p.runsConceded ?? 0,
                            correctedScore.proposedOvers
                          )
                        : p.economy,
                    }
                  : p
              ),
            }
          : null;

        // Recalculate team totals
        if (updatedScorecard1) {
          updatedScorecard1.runs = updatedScorecard1.players.reduce(
            (sum, p) => sum + p.runs,
            0
          );
        }
        if (updatedScorecard2) {
          updatedScorecard2.runs = updatedScorecard2.players.reduce(
            (sum, p) => sum + p.runs,
            0
          );
        }

        // Update match in database
        const { error: updateError } = await supabase
          .from('matches')
          .update({
            team1Scorecard: updatedScorecard1,
            team2Scorecard: updatedScorecard2,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', matchId);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }

        // Update local state
        updateMatch(matchId, {
          team1Scorecard: updatedScorecard1,
          team2Scorecard: updatedScorecard2,
        });

        // Mark report as resolved
        const { data: reportData } = await supabase
          .from('error_reports')
          .select('id')
          .eq('matchId', matchId)
          .eq('targetPlayerId', correctedScore.playerId)
          .eq('reportType', 'player_score')
          .single();

        if (reportData) {
          await supabase
            .from('error_reports')
            .update({ status: 'resolved' })
            .eq('id', reportData.id);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to apply correction';
        setError(errorMessage);
        return { success: false };
      }
    },
    [currentMatch, updateMatch, setError]
  );

  /**
   * Mark match as invalid and remove team from tournament
   */
  const markMatchAsInvalid = useCallback(async (matchId: string) => {
    if (!currentMatch) {
      setError('Match not loaded');
      return { success: false };
    }

    try {
      // Update match status to invalid
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          status: 'invalid',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (matchError) {
        setError(matchError.message);
        return { success: false };
      }

      updateMatch(matchId, { status: 'invalid' });

      // Remove teams from tournament
      if (currentMatch.tournamentId) {
        await supabase
          .from('tournament_teams')
          .update({ status: 'declined' })
          .in('team_id', [currentMatch.team1Id, currentMatch.team2Id])
          .eq('tournament_id', currentMatch.tournamentId);
      }

      // Mark reports as resolved
      await supabase
        .from('error_reports')
        .update({ status: 'resolved' })
        .eq('matchId', matchId)
        .eq('reportType', 'entire_match');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark match as invalid';
      setError(errorMessage);
      return { success: false };
    }
  }, [currentMatch, updateMatch, setError]);

  /**
   * Helper: Calculate strike rate
   */
  const calculateStrikeRate = (runs: number, balls: number): number => {
    if (balls === 0) return 0;
    return Math.round((runs / balls) * 100 * 100) / 100;
  };

  /**
   * Helper: Calculate economy
   */
  const calculateEconomy = (runs: number, overs: number): number => {
    if (overs === 0) return 0;
    return Math.round((runs / overs) * 100) / 100;
  };

  return {
    reports,
    correctedScores,
    reportPlayerScore,
    reportMatchResult,
    applyPlayerScoreCorrection,
    addCorrectedScore,
    removeCorrectedScore: (playerId: string) => {
      setCorrectedScores(correctedScores.filter((s) => s.playerId !== playerId));
    },
  };
};

