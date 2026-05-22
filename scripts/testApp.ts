/**
 * Test Script for App Features
 * Run this to verify all features are working
 */

import { supabase } from '../config/supabase';

/**
 * Test database connection
 */
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

/**
 * Test user profiles fetch
 */
export const testUserProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, display_name, player_role, rating')
      .limit(10);
    
    if (error) throw error;
    console.log(`✅ Found ${data?.length || 0} user profiles`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch user profiles:', error);
    return null;
  }
};

/**
 * Test teams fetch
 */
export const testTeams = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, status, accepted_players')
      .limit(10);
    
    if (error) throw error;
    console.log(`✅ Found ${data?.length || 0} teams`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch teams:', error);
    return null;
  }
};

/**
 * Test tournaments fetch
 */
export const testTournaments = async () => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, status, current_teams')
      .limit(10);
    
    if (error) throw error;
    console.log(`✅ Found ${data?.length || 0} tournaments`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch tournaments:', error);
    return null;
  }
};

/**
 * Test matches fetch
 */
export const testMatches = async () => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('id, team1_name, team2_name, scheduled_date, status')
      .limit(10);
    
    if (error) throw error;
    console.log(`✅ Found ${data?.length || 0} matches`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch matches:', error);
    return null;
  }
};

/**
 * Test team stats fetch
 */
export const testTeamStats = async () => {
  try {
    const { data, error } = await supabase
      .from('team_stats')
      .select('team_id, matches_played, wins, losses, win_rate, strength_score')
      .limit(10);
    
    if (error) throw error;
    console.log(`✅ Found ${data?.length || 0} team stats`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch team stats:', error);
    return null;
  }
};

/**
 * Test wallets fetch
 */
export const testWallets = async () => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('user_id, balance')
      .limit(10);
    
    if (error) throw error;
    console.log(`✅ Found ${data?.length || 0} wallets`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch wallets:', error);
    return null;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🧪 Starting app feature tests...\n');
  
  const results = {
    database: await testDatabaseConnection(),
    userProfiles: await testUserProfiles(),
    teams: await testTeams(),
    tournaments: await testTournaments(),
    matches: await testMatches(),
    teamStats: await testTeamStats(),
    wallets: await testWallets(),
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Database Connection:', results.database ? '✅' : '❌');
  console.log('User Profiles:', results.userProfiles ? `✅ (${results.userProfiles.length})` : '❌');
  console.log('Teams:', results.teams ? `✅ (${results.teams.length})` : '❌');
  console.log('Tournaments:', results.tournaments ? `✅ (${results.tournaments.length})` : '❌');
  console.log('Matches:', results.matches ? `✅ (${results.matches.length})` : '❌');
  console.log('Team Stats:', results.teamStats ? `✅ (${results.teamStats.length})` : '❌');
  console.log('Wallets:', results.wallets ? `✅ (${results.wallets.length})` : '❌');
  
  return results;
};

