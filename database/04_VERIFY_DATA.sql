-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run this after inserting data to verify everything is correct
-- =====================================================

-- Overall counts
SELECT 'User Profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Teams', COUNT(*) FROM teams
UNION ALL
SELECT 'Team Players', COUNT(*) FROM team_players
UNION ALL
SELECT 'Team Stats', COUNT(*) FROM team_stats
UNION ALL
SELECT 'Tournaments', COUNT(*) FROM tournaments
UNION ALL
SELECT 'Tournament Teams', COUNT(*) FROM tournament_teams
UNION ALL
SELECT 'Matches', COUNT(*) FROM matches
UNION ALL
SELECT 'Venues', COUNT(*) FROM venues
UNION ALL
SELECT 'Wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Reputation Events', COUNT(*) FROM reputation_events
UNION ALL
SELECT 'Reputation Totals', COUNT(*) FROM reputation_totals
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'Tournament Payments', COUNT(*) FROM tournament_payments
ORDER BY table_name;

-- Detailed checks
SELECT 'Teams with NULL owner_id' as check_type, COUNT(*) as count FROM teams WHERE owner_id IS NULL;
SELECT 'Teams with players' as check_type, COUNT(DISTINCT team_id) as count FROM team_players;
SELECT 'Tournaments with teams' as check_type, COUNT(DISTINCT tournament_id) as count FROM tournament_teams;
SELECT 'Matches with venues' as check_type, COUNT(*) as count FROM matches WHERE venue_id IS NOT NULL;

-- Sample data
SELECT 'Sample Teams' as info, name, owner_name, status FROM teams LIMIT 5;
SELECT 'Sample Tournaments' as info, name, creator_name, status FROM tournaments LIMIT 5;
SELECT 'Sample Matches' as info, team1_name, team2_name, scheduled_date, status FROM matches LIMIT 5;

