-- =====================================================
-- COMPLETE DATA INSERTION FOR ALL TABLES
-- =====================================================
-- This covers ALL functionalities from cric.txt
-- Automatically gets user IDs from auth.users
-- 
-- IMPORTANT: Make sure you have created auth users with these exact emails:
-- john@test.com, mike@test.com, david@test.com, chris@test.com,
-- alex@test.com, sam@test.com, tom@test.com, ryan@test.com,
-- james@test.com, kevin@test.com, mark@test.com, paul@test.com,
-- steve@test.com, luke@test.com, nick@test.com, dan@test.com
-- =====================================================

-- =====================================================
-- PRE-CHECK: Verify auth users exist
-- =====================================================

DO $$
DECLARE
  auth_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_user_count
  FROM auth.users
  WHERE email IN (
    'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
    'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
    'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
    'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
  );
  
  IF auth_user_count = 0 THEN
    RAISE EXCEPTION 'No auth users found! Please create auth users in Supabase Dashboard first. 
    
STEPS TO FIX:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" button
3. Create at least these 4 users (minimum required):
   - Email: john@test.com, Password: Test123!@#, Auto Confirm: ✅
   - Email: mike@test.com, Password: Test123!@#, Auto Confirm: ✅
   - Email: david@test.com, Password: Test123!@#, Auto Confirm: ✅
   - Email: chris@test.com, Password: Test123!@#, Auto Confirm: ✅
   
4. After creating users, run this script again.
   
For full list of 16 users, see: database/CREATE_AUTH_USERS_GUIDE.md
To check which users exist, run: database/CHECK_AUTH_USERS.sql';
  ELSIF auth_user_count < 4 THEN
    RAISE EXCEPTION 'Only % auth users found. Need at least 4 users (john@test.com, mike@test.com, david@test.com, chris@test.com). 

Please create more users in Supabase Dashboard:
1. Go to Authentication → Users → Add User
2. Create missing users with emails: john@test.com, mike@test.com, david@test.com, chris@test.com
3. Password: Test123!@#
4. Check "Auto Confirm User"
5. Run this script again.

To see which users are missing, run: database/CHECK_AUTH_USERS.sql', auth_user_count;
  END IF;
END $$;

-- =====================================================
-- STEP 1: INSERT USER PROFILES
-- =====================================================

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
ON CONFLICT (id) DO UPDATE SET
  runs = EXCLUDED.runs,
  wickets = EXCLUDED.wickets,
  matches_played = EXCLUDED.matches_played,
  batting_average = EXCLUDED.batting_average,
  strike_rate = EXCLUDED.strike_rate,
  economy_rate = EXCLUDED.economy_rate,
  rating = EXCLUDED.rating;

-- =====================================================
-- STEP 2: INSERT VENUES
-- =====================================================

INSERT INTO venues (id, name, location, latitude, longitude, address, capacity, images)
VALUES
  (gen_random_uuid(), 'National Cricket Stadium', 'Karachi', 24.8607, 67.0011, 'Stadium Road, Karachi', 34000, '[]'::jsonb),
  (gen_random_uuid(), 'Gaddafi Stadium', 'Lahore', 31.5204, 74.3587, 'Ferozepur Road, Lahore', 27000, '[]'::jsonb),
  (gen_random_uuid(), 'Rawalpindi Cricket Stadium', 'Rawalpindi', 33.5651, 73.0169, 'Shahrah-e-Iqbal, Rawalpindi', 15000, '[]'::jsonb),
  (gen_random_uuid(), 'Multan Cricket Stadium', 'Multan', 30.1575, 71.5249, 'Qasim Bagh, Multan', 18000, '[]'::jsonb),
  (gen_random_uuid(), 'Pindi Club Ground', 'Islamabad', 33.6844, 73.0479, 'Club Road, Islamabad', 5000, '[]'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 3: CREATE TEAMS
-- =====================================================

DO $$
DECLARE
  team1_id UUID := gen_random_uuid();
  team2_id UUID := gen_random_uuid();
  team3_id UUID := gen_random_uuid();
  team4_id UUID := gen_random_uuid();
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  user4_id UUID;
  user5_id UUID;
  user6_id UUID;
  user7_id UUID;
  user8_id UUID;
  user9_id UUID;
  user10_id UUID;
  user11_id UUID;
  user12_id UUID;
  user13_id UUID;
  user14_id UUID;
  user15_id UUID;
  user16_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john@test.com' LIMIT 1;
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'mike@test.com' LIMIT 1;
  SELECT id INTO user3_id FROM user_profiles WHERE email = 'david@test.com' LIMIT 1;
  SELECT id INTO user4_id FROM user_profiles WHERE email = 'chris@test.com' LIMIT 1;
  SELECT id INTO user5_id FROM user_profiles WHERE email = 'alex@test.com' LIMIT 1;
  SELECT id INTO user6_id FROM user_profiles WHERE email = 'sam@test.com' LIMIT 1;
  SELECT id INTO user7_id FROM user_profiles WHERE email = 'tom@test.com' LIMIT 1;
  SELECT id INTO user8_id FROM user_profiles WHERE email = 'ryan@test.com' LIMIT 1;
  SELECT id INTO user9_id FROM user_profiles WHERE email = 'james@test.com' LIMIT 1;
  SELECT id INTO user10_id FROM user_profiles WHERE email = 'kevin@test.com' LIMIT 1;
  SELECT id INTO user11_id FROM user_profiles WHERE email = 'mark@test.com' LIMIT 1;
  SELECT id INTO user12_id FROM user_profiles WHERE email = 'paul@test.com' LIMIT 1;
  SELECT id INTO user13_id FROM user_profiles WHERE email = 'steve@test.com' LIMIT 1;
  SELECT id INTO user14_id FROM user_profiles WHERE email = 'luke@test.com' LIMIT 1;
  SELECT id INTO user15_id FROM user_profiles WHERE email = 'nick@test.com' LIMIT 1;
  SELECT id INTO user16_id FROM user_profiles WHERE email = 'dan@test.com' LIMIT 1;
  
  -- Check if user profiles exist, if not create them
  IF user1_id IS NULL THEN
    -- Try to create user profile from auth user
    INSERT INTO user_profiles (id, email, full_name, display_name, player_role, runs, wickets, matches_played, batting_average, strike_rate, rating, location, bio)
    SELECT 
      u.id, u.email, 'John Smith', 'John S', 'Batsman', 1250, 0, 25, 45.50, 125.30, 75.5, 'Karachi', 'Cricket player'
    FROM auth.users u WHERE u.email = 'john@test.com' LIMIT 1
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO user1_id;
  END IF;
  
  IF user2_id IS NULL THEN
    INSERT INTO user_profiles (id, email, full_name, display_name, player_role, runs, wickets, matches_played, batting_average, strike_rate, economy_rate, rating, location, bio)
    SELECT 
      u.id, u.email, 'Mike Johnson', 'Mike J', 'Bowler', 150, 45, 25, 12.50, 85.20, 5.80, 72.3, 'Lahore', 'Cricket player'
    FROM auth.users u WHERE u.email = 'mike@test.com' LIMIT 1
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO user2_id;
  END IF;
  
  IF user3_id IS NULL THEN
    INSERT INTO user_profiles (id, email, full_name, display_name, player_role, runs, wickets, matches_played, batting_average, strike_rate, economy_rate, rating, location, bio)
    SELECT 
      u.id, u.email, 'David Williams', 'David W', 'All-rounder', 850, 30, 25, 35.20, 110.50, 6.20, 78.9, 'Islamabad', 'Cricket player'
    FROM auth.users u WHERE u.email = 'david@test.com' LIMIT 1
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO user3_id;
  END IF;
  
  IF user4_id IS NULL THEN
    INSERT INTO user_profiles (id, email, full_name, display_name, player_role, runs, wickets, matches_played, batting_average, strike_rate, rating, location, bio)
    SELECT 
      u.id, u.email, 'Chris Brown', 'Chris B', 'Wicketkeeper', 680, 5, 25, 28.30, 95.40, 68.2, 'Multan', 'Cricket player'
    FROM auth.users u WHERE u.email = 'chris@test.com' LIMIT 1
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO user4_id;
  END IF;
  
  -- Final check - if still NULL after auto-creation, raise error
  IF user1_id IS NULL OR user2_id IS NULL OR user3_id IS NULL OR user4_id IS NULL THEN
    RAISE EXCEPTION 'Required users not found. Please create auth users first in Supabase Dashboard (Authentication → Users → Add User). Required emails: john@test.com, mike@test.com, david@test.com, chris@test.com. Or run database/03_DIAGNOSE_AND_FIX.sql to auto-fix.';
  END IF;
  
  INSERT INTO teams (id, owner_id, owner_name, name, description, status, min_players, total_players, accepted_players, captain_id, captain_name)
  VALUES 
    (team1_id, user1_id, 'John Smith', 'Karachi Kings', 'Championship winning team', 'official', 11, 11, 11, user1_id, 'John Smith'),
    (team2_id, user2_id, 'Mike Johnson', 'Lahore Lions', 'Strong batting lineup', 'official', 11, 11, 11, user2_id, 'Mike Johnson'),
    (team3_id, user3_id, 'David Williams', 'Islamabad Eagles', 'Balanced team', 'official', 11, 11, 11, user3_id, 'David Williams'),
    (team4_id, user4_id, 'Chris Brown', 'Multan Tigers', 'Aggressive playing style', 'official', 11, 11, 11, user4_id, 'Chris Brown')
  ON CONFLICT DO NOTHING;
  
  -- Add players to teams
  IF user1_id IS NOT NULL AND user2_id IS NOT NULL AND user3_id IS NOT NULL AND user4_id IS NOT NULL AND user5_id IS NOT NULL AND user6_id IS NOT NULL AND user7_id IS NOT NULL AND user8_id IS NOT NULL AND user9_id IS NOT NULL AND user12_id IS NOT NULL AND user13_id IS NOT NULL THEN
    INSERT INTO team_players (team_id, player_id, role, status, is_captain, is_vice_captain, joined_at)
    VALUES
      (team1_id, user1_id, 'Batsman', 'accepted', TRUE, FALSE, NOW()),
      (team1_id, user5_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user8_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user12_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user2_id, 'Bowler', 'accepted', FALSE, TRUE, NOW()),
      (team1_id, user6_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user9_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user13_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user3_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user7_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team1_id, user4_id, 'Wicketkeeper', 'accepted', FALSE, FALSE, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF user2_id IS NOT NULL AND user5_id IS NOT NULL AND user8_id IS NOT NULL AND user12_id IS NOT NULL AND user15_id IS NOT NULL AND user6_id IS NOT NULL AND user9_id IS NOT NULL AND user13_id IS NOT NULL AND user10_id IS NOT NULL AND user14_id IS NOT NULL AND user11_id IS NOT NULL THEN
    INSERT INTO team_players (team_id, player_id, role, status, is_captain, is_vice_captain, joined_at)
    VALUES
      (team2_id, user2_id, 'Bowler', 'accepted', TRUE, FALSE, NOW()),
      (team2_id, user5_id, 'Batsman', 'accepted', FALSE, TRUE, NOW()),
      (team2_id, user8_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user12_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user15_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user6_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user9_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user13_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user10_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user14_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team2_id, user11_id, 'Wicketkeeper', 'accepted', FALSE, FALSE, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF user3_id IS NOT NULL AND user5_id IS NOT NULL AND user8_id IS NOT NULL AND user12_id IS NOT NULL AND user15_id IS NOT NULL AND user6_id IS NOT NULL AND user9_id IS NOT NULL AND user13_id IS NOT NULL AND user7_id IS NOT NULL AND user14_id IS NOT NULL AND user4_id IS NOT NULL THEN
    INSERT INTO team_players (team_id, player_id, role, status, is_captain, is_vice_captain, joined_at)
    VALUES
      (team3_id, user3_id, 'All-rounder', 'accepted', TRUE, FALSE, NOW()),
      (team3_id, user5_id, 'Batsman', 'accepted', FALSE, TRUE, NOW()),
      (team3_id, user8_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user12_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user15_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user6_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user9_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user13_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user7_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user14_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team3_id, user4_id, 'Wicketkeeper', 'accepted', FALSE, FALSE, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF user4_id IS NOT NULL AND user5_id IS NOT NULL AND user8_id IS NOT NULL AND user12_id IS NOT NULL AND user15_id IS NOT NULL AND user6_id IS NOT NULL AND user9_id IS NOT NULL AND user13_id IS NOT NULL AND user10_id IS NOT NULL AND user14_id IS NOT NULL AND user11_id IS NOT NULL THEN
    INSERT INTO team_players (team_id, player_id, role, status, is_captain, is_vice_captain, joined_at)
    VALUES
      (team4_id, user4_id, 'Wicketkeeper', 'accepted', TRUE, FALSE, NOW()),
      (team4_id, user5_id, 'Batsman', 'accepted', FALSE, TRUE, NOW()),
      (team4_id, user8_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user12_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user15_id, 'Batsman', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user6_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user9_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user13_id, 'Bowler', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user10_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user14_id, 'All-rounder', 'accepted', FALSE, FALSE, NOW()),
      (team4_id, user11_id, 'Wicketkeeper', 'accepted', FALSE, FALSE, NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  
  INSERT INTO team_stats (team_id, matches_played, wins, losses, ties, win_rate, strength_score, net_run_rate, total_runs_scored, total_runs_conceded, total_overs_faced, total_overs_bowled)
  VALUES
    (team1_id, 10, 7, 3, 0, 70.00, 78.5, 0.85, 1850, 1720, 200.0, 198.5),
    (team2_id, 10, 6, 4, 0, 60.00, 72.3, 0.45, 1780, 1750, 200.0, 199.0),
    (team3_id, 10, 5, 5, 0, 50.00, 68.2, -0.15, 1700, 1715, 200.0, 200.0),
    (team4_id, 10, 4, 6, 0, 40.00, 65.8, -0.35, 1650, 1680, 200.0, 200.5)
  ON CONFLICT (team_id) DO NOTHING;
END $$;

-- =====================================================
-- STEP 4: CREATE TOURNAMENT
-- =====================================================

DO $$
DECLARE
  tournament_id UUID := gen_random_uuid();
  user1_id UUID;
  team1_id UUID;
  team2_id UUID;
  team3_id UUID;
  team4_id UUID;
BEGIN
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john@test.com' LIMIT 1;
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  SELECT id INTO team2_id FROM teams WHERE name = 'Lahore Lions' LIMIT 1;
  SELECT id INTO team3_id FROM teams WHERE name = 'Islamabad Eagles' LIMIT 1;
  SELECT id INTO team4_id FROM teams WHERE name = 'Multan Tigers' LIMIT 1;
  
  IF team1_id IS NULL OR team2_id IS NULL OR team3_id IS NULL OR team4_id IS NULL THEN
    RAISE EXCEPTION 'Teams not found. Make sure STEP 3 completed successfully.';
  END IF;
  
  INSERT INTO tournaments (
    id, creator_id, creator_name, name, description, format, type, 
    entry_fee, prize_distribution, status, min_teams, current_teams, 
    total_matches, completed_matches, start_date, end_date
  )
  VALUES (
    tournament_id,
    user1_id,
    'John Smith',
    'Summer Cricket Championship 2024',
    'Premier cricket tournament featuring top teams from across the region',
    'T20',
    'league',
    5000.00,
    '[{"position": 1, "amount": 100000, "percentage": 50}, {"position": 2, "amount": 50000, "percentage": 25}, {"position": 3, "amount": 30000, "percentage": 15}]'::jsonb,
    'official',
    8,
    4,
    12,
    0,
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '30 days'
  )
  ON CONFLICT DO NOTHING;
  
  INSERT INTO tournament_teams (tournament_id, team_id, team_name, status, requested_at, responded_at)
  VALUES
    (tournament_id, team1_id, 'Karachi Kings', 'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
    (tournament_id, team2_id, 'Lahore Lions', 'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
    (tournament_id, team3_id, 'Islamabad Eagles', 'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
    (tournament_id, team4_id, 'Multan Tigers', 'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days')
  ON CONFLICT DO NOTHING;
  
  INSERT INTO matches (
    id, tournament_id, match_number, team1_id, team1_name, team2_id, team2_name,
    scheduled_date, scheduled_time, venue_id, venue_name, format, overs, status, is_verified
  )
  SELECT
    gen_random_uuid(),
    tournament_id,
    1,
    team1_id,
    'Karachi Kings',
    team2_id,
    'Lahore Lions',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00'::TIME,
    (SELECT id FROM venues WHERE name = 'National Cricket Stadium' LIMIT 1),
    'National Cricket Stadium',
    'T20',
    20,
    'scheduled',
    FALSE
  UNION ALL
  SELECT
    gen_random_uuid(),
    tournament_id,
    2,
    team3_id,
    'Islamabad Eagles',
    team4_id,
    'Multan Tigers',
    CURRENT_DATE + INTERVAL '3 days',
    '14:00:00'::TIME,
    (SELECT id FROM venues WHERE name = 'National Cricket Stadium' LIMIT 1),
    'National Cricket Stadium',
    'T20',
    20,
    'scheduled',
    FALSE
  UNION ALL
  SELECT
    gen_random_uuid(),
    tournament_id,
    3,
    team1_id,
    'Karachi Kings',
    team3_id,
    'Islamabad Eagles',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00:00'::TIME,
    (SELECT id FROM venues WHERE name = 'Gaddafi Stadium' LIMIT 1),
    'Gaddafi Stadium',
    'T20',
    20,
    'scheduled',
    FALSE
  UNION ALL
  SELECT
    gen_random_uuid(),
    tournament_id,
    4,
    team2_id,
    'Lahore Lions',
    team4_id,
    'Multan Tigers',
    CURRENT_DATE + INTERVAL '6 days',
    '14:00:00'::TIME,
    (SELECT id FROM venues WHERE name = 'Gaddafi Stadium' LIMIT 1),
    'Gaddafi Stadium',
    'T20',
    20,
    'scheduled',
    FALSE
  ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- STEP 5: CREATE WALLETS & TRANSACTIONS
-- =====================================================

INSERT INTO wallets (user_id, balance)
SELECT id, 10000.00 FROM user_profiles
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO transactions (user_id, type, amount, status, meta, created_at)
SELECT 
  id,
  'add',
  10000.00,
  'success',
  '{"method": "initial_deposit", "description": "Initial wallet balance"}'::jsonb,
  NOW() - INTERVAL '30 days'
FROM user_profiles
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 6: CREATE TOURNAMENT PAYMENTS
-- =====================================================

DO $$
DECLARE
  tournament_id UUID;
BEGIN
  SELECT id INTO tournament_id FROM tournaments WHERE name = 'Summer Cricket Championship 2024' LIMIT 1;
  
  IF tournament_id IS NOT NULL THEN
    INSERT INTO tournament_payments (user_id, tournament_id, amount, status, payment_method, created_at)
    SELECT 
      owner_id,
      tournament_id,
      5000.00,
      'success',
      'wallet',
      NOW() - INTERVAL '3 days'
    FROM teams
    WHERE name IN ('Karachi Kings', 'Lahore Lions', 'Islamabad Eagles', 'Multan Tigers')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 7: CREATE CHALLENGES (Feature 7)
-- =====================================================

DO $$
DECLARE
  team1_id UUID;
  team2_id UUID;
  user1_id UUID;
  user2_id UUID;
BEGIN
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  SELECT id INTO team2_id FROM teams WHERE name = 'Lahore Lions' LIMIT 1;
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john@test.com' LIMIT 1;
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'mike@test.com' LIMIT 1;
  
  IF team1_id IS NOT NULL AND team2_id IS NOT NULL THEN
    INSERT INTO challenges (creator_id, challenger_type, challenger_id, opponent_type, opponent_id, entry_fee, prize_amount, status)
    VALUES
      (user1_id, 'team', team1_id, 'team', team2_id, 2000.00, 5000.00, 'accepted'),
      (user2_id, 'team', team2_id, 'team', team1_id, 1500.00, 4000.00, 'pending')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 8: CREATE LIKES (Feature 6 - Social)
-- =====================================================

DO $$
DECLARE
  match1_id UUID;
  tournament_id UUID;
  team1_id UUID;
BEGIN
  SELECT id INTO match1_id FROM matches LIMIT 1;
  SELECT id INTO tournament_id FROM tournaments WHERE name = 'Summer Cricket Championship 2024' LIMIT 1;
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  
  IF match1_id IS NOT NULL THEN
    INSERT INTO likes (user_id, entity_type, entity_id)
    SELECT id, 'match', match1_id FROM user_profiles LIMIT 5
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF tournament_id IS NOT NULL THEN
    INSERT INTO likes (user_id, entity_type, entity_id)
    SELECT id, 'tournament', tournament_id FROM user_profiles LIMIT 8
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 9: CREATE COMMENTS (Feature 6 - Social)
-- =====================================================

DO $$
DECLARE
  match1_id UUID;
  tournament_id UUID;
BEGIN
  SELECT id INTO match1_id FROM matches LIMIT 1;
  SELECT id INTO tournament_id FROM tournaments WHERE name = 'Summer Cricket Championship 2024' LIMIT 1;
  
  IF match1_id IS NOT NULL THEN
    INSERT INTO comments (user_id, entity_type, entity_id, content)
    SELECT 
      id,
      'match',
      match1_id,
      CASE (ROW_NUMBER() OVER ())
        WHEN 1 THEN 'Great match!'
        WHEN 2 THEN 'Amazing performance by both teams'
        WHEN 3 THEN 'Looking forward to the next match'
        ELSE 'Exciting game!'
      END
    FROM user_profiles
    LIMIT 4
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF tournament_id IS NOT NULL THEN
    INSERT INTO comments (user_id, entity_type, entity_id, content)
    SELECT 
      id,
      'tournament_post',
      tournament_id,
      'This tournament looks promising!'
    FROM user_profiles
    LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 10: CREATE TEAM POSTS (Feature 3 - Team Social)
-- =====================================================

DO $$
DECLARE
  team1_id UUID;
  team2_id UUID;
  user1_id UUID;
  user2_id UUID;
BEGIN
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  SELECT id INTO team2_id FROM teams WHERE name = 'Lahore Lions' LIMIT 1;
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john@test.com' LIMIT 1;
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'mike@test.com' LIMIT 1;
  
  IF team1_id IS NOT NULL AND user1_id IS NOT NULL THEN
    INSERT INTO team_posts (team_id, user_id, text, images)
    VALUES
      (team1_id, user1_id, 'Great practice session today! Ready for the tournament.', '[]'::jsonb),
      (team1_id, user1_id, 'Team photo from last match victory!', '[]'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF team2_id IS NOT NULL AND user2_id IS NOT NULL THEN
    INSERT INTO team_posts (team_id, user_id, text, images)
    VALUES
      (team2_id, user2_id, 'Preparing for the big match tomorrow!', '[]'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 11: CREATE TEAM POST LIKES & COMMENTS
-- =====================================================

DO $$
DECLARE
  post1_id UUID;
BEGIN
  SELECT id INTO post1_id FROM team_posts LIMIT 1;
  
  IF post1_id IS NOT NULL THEN
    INSERT INTO team_post_likes (post_id, user_id)
    SELECT post1_id, id FROM user_profiles LIMIT 3
    ON CONFLICT DO NOTHING;
    
    INSERT INTO team_post_comments (post_id, user_id, content)
    SELECT 
      post1_id,
      id,
      'Great post!'
    FROM user_profiles
    LIMIT 2
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 12: CREATE NOTIFICATIONS
-- =====================================================

DO $$
DECLARE
  team1_id UUID;
  tournament_id UUID;
  match1_id UUID;
BEGIN
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  SELECT id INTO tournament_id FROM tournaments WHERE name = 'Summer Cricket Championship 2024' LIMIT 1;
  SELECT id INTO match1_id FROM matches LIMIT 1;
  
  IF team1_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read, created_at)
    SELECT 
      id,
      'team_invite',
      'Team Invitation',
      'You have been invited to join Karachi Kings',
      'team',
      team1_id,
      FALSE,
      NOW() - INTERVAL '1 day'
    FROM user_profiles
    WHERE id NOT IN (SELECT owner_id FROM teams)
    LIMIT 5
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF tournament_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read, created_at)
    SELECT 
      id,
      'tournament_invite',
      'Tournament Invitation',
      'Your team has been invited to Summer Cricket Championship 2024',
      'tournament',
      tournament_id,
      FALSE,
      NOW() - INTERVAL '2 days'
    FROM user_profiles
    WHERE id IN (SELECT owner_id FROM teams)
    LIMIT 4
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF match1_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read, created_at)
    SELECT 
      id,
      'match_update',
      'Match Update',
      'New match scheduled',
      'match',
      match1_id,
      FALSE,
      NOW() - INTERVAL '3 days'
    FROM user_profiles
    LIMIT 6
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 13: CREATE REPUTATION DATA
-- =====================================================

INSERT INTO reputation_events (user_id, event_type, points, meta, created_at)
SELECT 
  id,
  'match_participation',
  10,
  '{"reason": "Participated in match"}'::jsonb,
  NOW() - INTERVAL '10 days'
FROM user_profiles
LIMIT 16
ON CONFLICT DO NOTHING;

INSERT INTO reputation_totals (user_id, total_points, level, badges)
SELECT 
  id,
  100,
  'Silver',
  '[]'::jsonb
FROM user_profiles
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- STEP 14: CREATE USER ROLES
-- =====================================================

INSERT INTO user_roles (user_id, role, permissions, assigned_at)
SELECT 
  id,
  'admin',
  '{"can_edit_scores": true, "can_approve_withdrawals": true, "can_manage_users": true}'::jsonb,
  NOW()
FROM user_profiles
WHERE email = 'john@test.com'
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, permissions, assigned_at)
SELECT 
  id,
  'player',
  '{}'::jsonb,
  NOW()
FROM user_profiles
WHERE email != 'john@test.com'
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- STEP 15: CREATE VENUE BOOKINGS (Feature 12)
-- =====================================================

DO $$
DECLARE
  venue1_id UUID;
  user1_id UUID;
  team1_id UUID;
BEGIN
  SELECT id INTO venue1_id FROM venues WHERE name = 'National Cricket Stadium' LIMIT 1;
  SELECT id INTO user1_id FROM user_profiles WHERE email = 'john@test.com' LIMIT 1;
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  
  IF venue1_id IS NOT NULL AND user1_id IS NOT NULL THEN
    INSERT INTO venue_bookings (venue_id, requester_id, team_id, booking_date, timeslot_start, timeslot_end, amount, status, payment_status)
    VALUES
      (venue1_id, user1_id, team1_id, CURRENT_DATE + INTERVAL '7 days', '09:00:00'::TIME, '12:00:00'::TIME, 5000.00, 'approved', 'paid'),
      (venue1_id, user1_id, team1_id, CURRENT_DATE + INTERVAL '10 days', '14:00:00'::TIME, '17:00:00'::TIME, 5000.00, 'pending', 'pending')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 16: CREATE VENUE AVAILABILITY
-- =====================================================

DO $$
DECLARE
  venue1_id UUID;
BEGIN
  SELECT id INTO venue1_id FROM venues WHERE name = 'National Cricket Stadium' LIMIT 1;
  
  IF venue1_id IS NOT NULL THEN
    INSERT INTO venue_availability (venue_id, date, timeslot_start, timeslot_end, status, price)
    VALUES
      (venue1_id, CURRENT_DATE + INTERVAL '7 days', '09:00:00'::TIME, '12:00:00'::TIME, 'booked', 5000.00),
      (venue1_id, CURRENT_DATE + INTERVAL '8 days', '09:00:00'::TIME, '12:00:00'::TIME, 'available', 5000.00),
      (venue1_id, CURRENT_DATE + INTERVAL '9 days', '14:00:00'::TIME, '17:00:00'::TIME, 'available', 5000.00)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 17: CREATE SUBSCRIPTIONS (Feature 12)
-- =====================================================

DO $$
DECLARE
  free_plan_id UUID;
  premium_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' LIMIT 1;
  SELECT id INTO premium_plan_id FROM subscription_plans WHERE name = 'Premium Monthly' LIMIT 1;
  
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
    SELECT 
      id,
      free_plan_id,
      'active',
      NOW() - INTERVAL '30 days',
      NOW() + INTERVAL '365 days'
    FROM user_profiles
    LIMIT 10
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF premium_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
    SELECT 
      id,
      premium_plan_id,
      'active',
      NOW() - INTERVAL '10 days',
      NOW() + INTERVAL '20 days'
    FROM user_profiles
    WHERE email IN ('john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com', 'alex@test.com', 'sam@test.com')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 18: CREATE ADMIN ACTIONS (Feature 11)
-- =====================================================

DO $$
DECLARE
  admin_id UUID;
  team1_id UUID;
BEGIN
  SELECT id INTO admin_id FROM user_profiles WHERE email = 'john@test.com' LIMIT 1;
  SELECT id INTO team1_id FROM teams WHERE name = 'Karachi Kings' LIMIT 1;
  
  IF admin_id IS NOT NULL AND team1_id IS NOT NULL THEN
    INSERT INTO admin_actions (actor_id, action_type, target_type, target_id, reason, meta)
    VALUES
      (admin_id, 'verify_team', 'team', team1_id, 'Team verified after review', '{"verified_by": "admin"}'::jsonb),
      (admin_id, 'approve_tournament', 'tournament', (SELECT id FROM tournaments LIMIT 1), 'Tournament approved', '{}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 19: CREATE DISPUTES (Feature 5 - Match Management)
-- =====================================================

DO $$
DECLARE
  match1_id UUID;
  user2_id UUID;
BEGIN
  SELECT id INTO match1_id FROM matches LIMIT 1;
  SELECT id INTO user2_id FROM user_profiles WHERE email = 'mike@test.com' LIMIT 1;
  
  IF match1_id IS NOT NULL AND user2_id IS NOT NULL THEN
    INSERT INTO disputes (match_id, reported_by, status, evidence)
    VALUES
      (match1_id, user2_id, 'pending', '{"correction": "Score should be 150/5 instead of 140/6", "reason": "Incorrect wicket count"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

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
SELECT 'Tournament Payments', COUNT(*) FROM tournament_payments
UNION ALL
SELECT 'Challenges', COUNT(*) FROM challenges
UNION ALL
SELECT 'Likes', COUNT(*) FROM likes
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments
UNION ALL
SELECT 'Team Posts', COUNT(*) FROM team_posts
UNION ALL
SELECT 'Team Post Likes', COUNT(*) FROM team_post_likes
UNION ALL
SELECT 'Team Post Comments', COUNT(*) FROM team_post_comments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Reputation Events', COUNT(*) FROM reputation_events
UNION ALL
SELECT 'Reputation Totals', COUNT(*) FROM reputation_totals
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'Venue Bookings', COUNT(*) FROM venue_bookings
UNION ALL
SELECT 'Venue Availability', COUNT(*) FROM venue_availability
UNION ALL
SELECT 'Subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'Admin Actions', COUNT(*) FROM admin_actions
UNION ALL
SELECT 'Disputes', COUNT(*) FROM disputes
ORDER BY table_name;

