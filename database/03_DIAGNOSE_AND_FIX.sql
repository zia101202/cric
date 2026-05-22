-- =====================================================
-- DIAGNOSE AND FIX SCRIPT
-- =====================================================
-- Run this if you get errors when running 02_INSERT_DATA.sql
-- This will diagnose the problem and fix STEP 1 automatically
-- =====================================================

-- =====================================================
-- DIAGNOSIS: Check what's wrong
-- =====================================================

-- 1. Check if auth users exist
SELECT 
  '1. Auth Users Check' as check_step,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 16 THEN '✅ All users exist'
    WHEN COUNT(*) > 0 THEN '⚠️ Only ' || COUNT(*) || ' users found'
    ELSE '❌ NO USERS FOUND - Create auth users first!'
  END as status
FROM auth.users 
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
);

-- 2. List which auth users exist
SELECT 
  '2. Existing Auth Users' as info,
  id,
  email,
  created_at
FROM auth.users 
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
)
ORDER BY email;

-- 3. Check if user_profiles exist
SELECT 
  '3. User Profiles Check' as check_step,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 16 THEN '✅ All profiles exist'
    WHEN COUNT(*) > 0 THEN '⚠️ Only ' || COUNT(*) || ' profiles found'
    ELSE '❌ NO PROFILES FOUND - Need to run STEP 1'
  END as status
FROM user_profiles
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
);

-- 4. Find auth users that don't have profiles
SELECT 
  '4. Missing Profiles' as info,
  u.id as auth_user_id,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
)
AND u.id NOT IN (SELECT id FROM user_profiles)
ORDER BY u.email;

-- =====================================================
-- FIX: Create user profiles for existing auth users
-- =====================================================
-- This will create profiles for ANY auth users that exist
-- Even if you don't have all 16, it will work with what you have

INSERT INTO user_profiles (
  id, email, full_name, display_name, player_role, 
  runs, wickets, matches_played, batting_average, 
  strike_rate, economy_rate, rating, location, phone_number, bio
)
SELECT 
  u.id,
  u.email,
  CASE u.email
    WHEN 'john@test.com' THEN 'John Smith'
    WHEN 'mike@test.com' THEN 'Mike Johnson'
    WHEN 'david@test.com' THEN 'David Williams'
    WHEN 'chris@test.com' THEN 'Chris Brown'
    WHEN 'alex@test.com' THEN 'Alex Davis'
    WHEN 'sam@test.com' THEN 'Sam Wilson'
    WHEN 'tom@test.com' THEN 'Tom Anderson'
    WHEN 'ryan@test.com' THEN 'Ryan Taylor'
    WHEN 'james@test.com' THEN 'James Martinez'
    WHEN 'kevin@test.com' THEN 'Kevin Lee'
    WHEN 'mark@test.com' THEN 'Mark Thompson'
    WHEN 'paul@test.com' THEN 'Paul White'
    WHEN 'steve@test.com' THEN 'Steve Harris'
    WHEN 'luke@test.com' THEN 'Luke Clark'
    WHEN 'nick@test.com' THEN 'Nick Lewis'
    WHEN 'dan@test.com' THEN 'Dan Walker'
    ELSE 'Player ' || SUBSTRING(u.email FROM 1 FOR POSITION('@' IN u.email) - 1)
  END as full_name,
  CASE u.email
    WHEN 'john@test.com' THEN 'John S'
    WHEN 'mike@test.com' THEN 'Mike J'
    WHEN 'david@test.com' THEN 'David W'
    WHEN 'chris@test.com' THEN 'Chris B'
    WHEN 'alex@test.com' THEN 'Alex D'
    WHEN 'sam@test.com' THEN 'Sam W'
    WHEN 'tom@test.com' THEN 'Tom A'
    WHEN 'ryan@test.com' THEN 'Ryan T'
    WHEN 'james@test.com' THEN 'James M'
    WHEN 'kevin@test.com' THEN 'Kevin L'
    WHEN 'mark@test.com' THEN 'Mark T'
    WHEN 'paul@test.com' THEN 'Paul W'
    WHEN 'steve@test.com' THEN 'Steve H'
    WHEN 'luke@test.com' THEN 'Luke C'
    WHEN 'nick@test.com' THEN 'Nick L'
    WHEN 'dan@test.com' THEN 'Dan W'
    ELSE SUBSTRING(u.email FROM 1 FOR POSITION('@' IN u.email) - 1)
  END as display_name,
  CASE u.email
    WHEN 'john@test.com' THEN 'Batsman'
    WHEN 'mike@test.com' THEN 'Bowler'
    WHEN 'david@test.com' THEN 'All-rounder'
    WHEN 'chris@test.com' THEN 'Wicketkeeper'
    WHEN 'alex@test.com' THEN 'Batsman'
    WHEN 'sam@test.com' THEN 'Bowler'
    WHEN 'tom@test.com' THEN 'All-rounder'
    WHEN 'ryan@test.com' THEN 'Batsman'
    WHEN 'james@test.com' THEN 'Bowler'
    WHEN 'kevin@test.com' THEN 'All-rounder'
    WHEN 'mark@test.com' THEN 'Wicketkeeper'
    WHEN 'paul@test.com' THEN 'Batsman'
    WHEN 'steve@test.com' THEN 'Bowler'
    WHEN 'luke@test.com' THEN 'All-rounder'
    WHEN 'nick@test.com' THEN 'Batsman'
    WHEN 'dan@test.com' THEN 'Bowler'
    ELSE 'Batsman'
  END as player_role,
  CASE u.email
    WHEN 'john@test.com' THEN 1250
    WHEN 'mike@test.com' THEN 150
    WHEN 'david@test.com' THEN 850
    WHEN 'chris@test.com' THEN 680
    WHEN 'alex@test.com' THEN 980
    WHEN 'sam@test.com' THEN 200
    WHEN 'tom@test.com' THEN 720
    WHEN 'ryan@test.com' THEN 1100
    WHEN 'james@test.com' THEN 180
    WHEN 'kevin@test.com' THEN 890
    WHEN 'mark@test.com' THEN 750
    WHEN 'paul@test.com' THEN 1050
    WHEN 'steve@test.com' THEN 220
    WHEN 'luke@test.com' THEN 800
    WHEN 'nick@test.com' THEN 920
    WHEN 'dan@test.com' THEN 190
    ELSE 500
  END as runs,
  CASE u.email
    WHEN 'john@test.com' THEN 0
    WHEN 'mike@test.com' THEN 45
    WHEN 'david@test.com' THEN 30
    WHEN 'chris@test.com' THEN 5
    WHEN 'alex@test.com' THEN 0
    WHEN 'sam@test.com' THEN 52
    WHEN 'tom@test.com' THEN 28
    WHEN 'ryan@test.com' THEN 0
    WHEN 'james@test.com' THEN 48
    WHEN 'kevin@test.com' THEN 35
    WHEN 'mark@test.com' THEN 8
    WHEN 'paul@test.com' THEN 0
    WHEN 'steve@test.com' THEN 55
    WHEN 'luke@test.com' THEN 32
    WHEN 'nick@test.com' THEN 0
    WHEN 'dan@test.com' THEN 50
    ELSE 0
  END as wickets,
  25 as matches_played,
  CASE u.email
    WHEN 'john@test.com' THEN 45.50
    WHEN 'mike@test.com' THEN 12.50
    WHEN 'david@test.com' THEN 35.20
    WHEN 'chris@test.com' THEN 28.30
    WHEN 'alex@test.com' THEN 42.60
    WHEN 'sam@test.com' THEN 15.40
    WHEN 'tom@test.com' THEN 32.70
    WHEN 'ryan@test.com' THEN 48.70
    WHEN 'james@test.com' THEN 13.80
    WHEN 'kevin@test.com' THEN 37.10
    WHEN 'mark@test.com' THEN 31.20
    WHEN 'paul@test.com' THEN 46.30
    WHEN 'steve@test.com' THEN 16.90
    WHEN 'luke@test.com' THEN 34.80
    WHEN 'nick@test.com' THEN 40.00
    WHEN 'dan@test.com' THEN 14.60
    ELSE 30.00
  END as batting_average,
  CASE u.email
    WHEN 'john@test.com' THEN 125.30
    WHEN 'mike@test.com' THEN 85.20
    WHEN 'david@test.com' THEN 110.50
    WHEN 'chris@test.com' THEN 95.40
    WHEN 'alex@test.com' THEN 118.70
    WHEN 'sam@test.com' THEN 78.90
    WHEN 'tom@test.com' THEN 105.30
    WHEN 'ryan@test.com' THEN 122.10
    WHEN 'james@test.com' THEN 82.40
    WHEN 'kevin@test.com' THEN 112.80
    WHEN 'mark@test.com' THEN 98.60
    WHEN 'paul@test.com' THEN 120.50
    WHEN 'steve@test.com' THEN 80.10
    WHEN 'luke@test.com' THEN 108.20
    WHEN 'nick@test.com' THEN 115.90
    WHEN 'dan@test.com' THEN 79.30
    ELSE 100.00
  END as strike_rate,
  CASE u.email
    WHEN 'mike@test.com' THEN 5.80
    WHEN 'david@test.com' THEN 6.20
    WHEN 'sam@test.com' THEN 5.50
    WHEN 'tom@test.com' THEN 6.50
    WHEN 'james@test.com' THEN 5.90
    WHEN 'kevin@test.com' THEN 6.10
    WHEN 'steve@test.com' THEN 5.40
    WHEN 'luke@test.com' THEN 6.30
    WHEN 'dan@test.com' THEN 5.70
    ELSE NULL
  END as economy_rate,
  CASE u.email
    WHEN 'john@test.com' THEN 75.5
    WHEN 'mike@test.com' THEN 72.3
    WHEN 'david@test.com' THEN 78.9
    WHEN 'chris@test.com' THEN 68.2
    WHEN 'alex@test.com' THEN 71.8
    WHEN 'sam@test.com' THEN 74.1
    WHEN 'tom@test.com' THEN 70.5
    WHEN 'ryan@test.com' THEN 76.4
    WHEN 'james@test.com' THEN 73.6
    WHEN 'kevin@test.com' THEN 77.2
    WHEN 'mark@test.com' THEN 69.8
    WHEN 'paul@test.com' THEN 75.1
    WHEN 'steve@test.com' THEN 75.8
    WHEN 'luke@test.com' THEN 72.7
    WHEN 'nick@test.com' THEN 70.9
    WHEN 'dan@test.com' THEN 74.5
    ELSE 70.0
  END as rating,
  CASE u.email
    WHEN 'john@test.com' THEN 'Karachi'
    WHEN 'mike@test.com' THEN 'Lahore'
    WHEN 'david@test.com' THEN 'Islamabad'
    WHEN 'chris@test.com' THEN 'Multan'
    WHEN 'alex@test.com' THEN 'Karachi'
    WHEN 'sam@test.com' THEN 'Lahore'
    WHEN 'tom@test.com' THEN 'Islamabad'
    WHEN 'ryan@test.com' THEN 'Multan'
    WHEN 'james@test.com' THEN 'Karachi'
    WHEN 'kevin@test.com' THEN 'Lahore'
    WHEN 'mark@test.com' THEN 'Islamabad'
    WHEN 'paul@test.com' THEN 'Multan'
    WHEN 'steve@test.com' THEN 'Karachi'
    WHEN 'luke@test.com' THEN 'Lahore'
    WHEN 'nick@test.com' THEN 'Islamabad'
    WHEN 'dan@test.com' THEN 'Multan'
    ELSE 'Karachi'
  END as location,
  '+92300' || LPAD(ROW_NUMBER() OVER (ORDER BY u.created_at)::text, 7, '0') as phone_number,
  'Cricket player' as bio
FROM auth.users u
WHERE u.email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
)
AND u.id NOT IN (SELECT id FROM user_profiles)  -- Only insert if profile doesn't exist
ON CONFLICT (id) DO UPDATE SET
  runs = EXCLUDED.runs,
  wickets = EXCLUDED.wickets,
  matches_played = EXCLUDED.matches_played,
  batting_average = EXCLUDED.batting_average,
  strike_rate = EXCLUDED.strike_rate,
  economy_rate = EXCLUDED.economy_rate,
  rating = EXCLUDED.rating;

-- =====================================================
-- VERIFY FIX
-- =====================================================

SELECT 
  'After Fix - User Profiles' as check_step,
  COUNT(*) as profiles_created,
  STRING_AGG(email, ', ') as created_emails
FROM user_profiles
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
);

