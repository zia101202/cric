-- =====================================================
-- CHECK AUTH USERS - Run this to verify users exist
-- =====================================================
-- This script will show you:
-- 1. How many auth users exist
-- 2. Which users are missing
-- 3. Which users have profiles
-- =====================================================

-- =====================================================
-- 1. COUNT AUTH USERS
-- =====================================================

SELECT 
  'Auth Users Count' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 16 THEN '✅ All 16 users exist!'
    WHEN COUNT(*) >= 4 THEN '⚠️ Only ' || COUNT(*) || ' users found (need 16, but minimum 4 will work)'
    WHEN COUNT(*) > 0 THEN '⚠️ Only ' || COUNT(*) || ' users found (need at least 4)'
    ELSE '❌ NO USERS FOUND - Create auth users first!'
  END as status
FROM auth.users 
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
);

-- =====================================================
-- 2. LIST EXISTING AUTH USERS
-- =====================================================

SELECT 
  'Existing Auth Users' as info,
  email,
  id,
  created_at,
  '✅ Exists' as status
FROM auth.users 
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
)
ORDER BY email;

-- =====================================================
-- 3. LIST MISSING AUTH USERS
-- =====================================================

SELECT 
  'Missing Auth Users' as info,
  email,
  '❌ NOT FOUND - Create this user!' as status
FROM (
  VALUES 
    ('john@test.com'),
    ('mike@test.com'),
    ('david@test.com'),
    ('chris@test.com'),
    ('alex@test.com'),
    ('sam@test.com'),
    ('tom@test.com'),
    ('ryan@test.com'),
    ('james@test.com'),
    ('kevin@test.com'),
    ('mark@test.com'),
    ('paul@test.com'),
    ('steve@test.com'),
    ('luke@test.com'),
    ('nick@test.com'),
    ('dan@test.com')
) AS required_emails(email)
WHERE email NOT IN (
  SELECT email FROM auth.users
)
ORDER BY email;

-- =====================================================
-- 4. CHECK USER PROFILES
-- =====================================================

SELECT 
  'User Profiles Count' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 16 THEN '✅ All 16 profiles exist!'
    WHEN COUNT(*) > 0 THEN '⚠️ Only ' || COUNT(*) || ' profiles found'
    ELSE '❌ NO PROFILES FOUND - Will be created when you run 02_INSERT_ALL_DATA.sql'
  END as status
FROM user_profiles
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
);

-- =====================================================
-- 5. SUMMARY
-- =====================================================

SELECT 
  'SUMMARY' as section,
  (SELECT COUNT(*) FROM auth.users WHERE email IN (
    'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
    'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
    'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
    'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
  )) as auth_users_count,
  (SELECT COUNT(*) FROM user_profiles WHERE email IN (
    'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
    'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
    'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
    'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
  )) as user_profiles_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email IN (
      'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
      'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
      'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
      'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
    )) >= 4 THEN '✅ Ready to run 02_INSERT_ALL_DATA.sql'
    ELSE '❌ Create at least 4 auth users first (john, mike, david, chris)'
  END as next_step;

