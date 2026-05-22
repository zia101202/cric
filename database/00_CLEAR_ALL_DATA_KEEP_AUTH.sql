-- =====================================================
-- CLEAR ALL DATA FROM TABLES (KEEP AUTH USERS)
-- =====================================================
-- This script clears all data from application tables
-- but KEEPS auth.users (authentication users)
-- 
-- Use this when you want to reset the database
-- but keep your authenticated users
-- =====================================================

-- Clear all data from tables (in reverse dependency order)
-- This will NOT affect auth.users table

TRUNCATE TABLE
    promo_code_usage,
    subscriptions,
    boosts,
    promo_codes,
    promotions,
    subscription_plans,
    audit_snapshots,
    reported_content,
    offensive_words,
    disputes,
    admin_actions,
    tournament_history,
    user_roles,
    device_tokens,
    match_media,
    media,
    venue_availability,
    venue_bookings,
    reputation_totals,
    reputation_events,
    challenges,
    comment_reports,
    team_post_comments,
    team_post_likes,
    team_posts,
    team_reports,
    team_invitations,
    notifications,
    comments,
    likes,
    score_reports,
    error_reports,
    matches,
    tournament_teams,
    tournaments,
    withdraw_requests,
    tournament_payments,
    transactions,
    wallets,
    team_members,
    team_stats,
    team_players,
    teams,
    user_profiles,
    venues
RESTART IDENTITY CASCADE;

-- Note: auth.users table is NOT truncated - your authenticated users remain

-- =====================================================
-- DATA CLEARED (AUTH USERS PRESERVED)
-- =====================================================
-- Next: Run 01_COMPLETE_RESET_AND_SETUP.sql to recreate tables
-- Then: Run 02_INSERT_ALL_DATA.sql to insert fresh data

