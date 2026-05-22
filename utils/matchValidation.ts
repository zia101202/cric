/**
 * Validation utilities for match scoring and reporting
 */

/**
 * Validate runs input
 */
export const validateRuns = (runs: number): { isValid: boolean; error?: string } => {
  if (runs < 0) {
    return { isValid: false, error: 'Runs cannot be negative' };
  }
  if (runs > 1000) {
    return { isValid: false, error: 'Runs value seems too high' };
  }
  if (!Number.isInteger(runs)) {
    return { isValid: false, error: 'Runs must be a whole number' };
  }
  return { isValid: true };
};

/**
 * Validate wickets input
 */
export const validateWickets = (wickets: number): { isValid: boolean; error?: string } => {
  if (wickets < 0) {
    return { isValid: false, error: 'Wickets cannot be negative' };
  }
  if (wickets > 10) {
    return { isValid: false, error: 'Wickets cannot exceed 10' };
  }
  if (!Number.isInteger(wickets)) {
    return { isValid: false, error: 'Wickets must be a whole number' };
  }
  return { isValid: true };
};

/**
 * Validate overs input
 */
export const validateOvers = (overs: number, maxOvers?: number): { isValid: boolean; error?: string } => {
  if (overs < 0) {
    return { isValid: false, error: 'Overs cannot be negative' };
  }
  if (maxOvers && overs > maxOvers) {
    return { isValid: false, error: `Overs cannot exceed ${maxOvers}` };
  }
  // Check if overs is in valid format (e.g., 10.5 means 10 overs and 5 balls)
  const oversDecimal = overs % 1;
  if (oversDecimal > 0.5) {
    return { isValid: false, error: 'Invalid overs format (max 0.5 for balls)' };
  }
  return { isValid: true };
};

/**
 * Validate balls input (0-5)
 */
export const validateBalls = (balls: number): { isValid: boolean; error?: string } => {
  if (balls < 0) {
    return { isValid: false, error: 'Balls cannot be negative' };
  }
  if (balls > 5) {
    return { isValid: false, error: 'Balls cannot exceed 5 in an over' };
  }
  if (!Number.isInteger(balls)) {
    return { isValid: false, error: 'Balls must be a whole number' };
  }
  return { isValid: true };
};

/**
 * Validate strike rate
 */
export const validateStrikeRate = (strikeRate: number): { isValid: boolean; error?: string } => {
  if (strikeRate < 0) {
    return { isValid: false, error: 'Strike rate cannot be negative' };
  }
  if (strikeRate > 500) {
    return { isValid: false, error: 'Strike rate seems too high' };
  }
  return { isValid: true };
};

/**
 * Validate economy rate
 */
export const validateEconomy = (economy: number): { isValid: boolean; error?: string } => {
  if (economy < 0) {
    return { isValid: false, error: 'Economy rate cannot be negative' };
  }
  if (economy > 50) {
    return { isValid: false, error: 'Economy rate seems too high' };
  }
  return { isValid: true };
};

/**
 * Validate match date
 */
export const validateMatchDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Match date is required' };
  }

  const matchDate = new Date(date);
  const today = new Date();

  if (isNaN(matchDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Allow dates up to 1 year in the future for scheduling
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);

  if (matchDate > oneYearFromNow) {
    return { isValid: false, error: 'Match date cannot be more than 1 year in the future' };
  }

  return { isValid: true };
};

/**
 * Validate match time
 */
export const validateMatchTime = (time: string): { isValid: boolean; error?: string } => {
  if (!time) {
    return { isValid: false, error: 'Match time is required' };
  }

  // Basic time format validation (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Invalid time format (use HH:MM)' };
  }

  return { isValid: true };
};

/**
 * Validate team scorecard totals
 */
export const validateScorecardTotals = (
  totalRuns: number,
  playerRuns: number[],
  totalWickets: number,
  playerWickets: number
): { isValid: boolean; error?: string } => {
  const sumPlayerRuns = playerRuns.reduce((sum, runs) => sum + runs, 0);
  if (totalRuns !== sumPlayerRuns) {
    return {
      isValid: false,
      error: `Total runs (${totalRuns}) must match sum of player runs (${sumPlayerRuns})`,
    };
  }

  if (totalWickets !== playerWickets) {
    return {
      isValid: false,
      error: `Total wickets (${totalWickets}) must match player wickets (${playerWickets})`,
    };
  }

  return { isValid: true };
};

