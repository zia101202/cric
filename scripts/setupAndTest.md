# Complete Setup and Testing Guide

## 🚀 Complete Setup Commands

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Database Setup

#### 2.1 Create All Tables
1. Open Supabase Dashboard → SQL Editor
2. Run in order:
   - `database/supabase_schema.sql`
   - `database/COMPLETE_SCHEMA.sql`
   - `database/RLS_POLICIES.sql`

#### 2.2 Create Storage Buckets
Go to Supabase Dashboard → Storage → Create these buckets:

```bash
# Bucket names (all Public):
- avatars
- team-assets
- tournament-assets
- match-images
- venues
```

#### 2.3 Create Auth Users
1. Go to Authentication → Users → Add User
2. Create at least 16 users with emails:
   - john@test.com
   - mike@test.com
   - david@test.com
   - chris@test.com
   - alex@test.com
   - sam@test.com
   - tom@test.com
   - ryan@test.com
   - james@test.com
   - kevin@test.com
   - mark@test.com
   - paul@test.com
   - steve@test.com
   - luke@test.com
   - nick@test.com
   - dan@test.com

3. Note down their UUIDs

#### 2.4 Insert Seed Data
1. Get user IDs: Run in SQL Editor:
```sql
SELECT id, email FROM auth.users ORDER BY created_at LIMIT 16;
```

2. Copy the UUIDs and update `database/SEED_DATA_MANUAL.sql`
3. Run `database/SEED_DATA_MANUAL.sql` section by section

### Step 3: Run the App
```bash
npm start
# Press 'w' for web
# Or: npm run web
```

## ✅ Verification Commands

### Database Verification Queries

Run these in Supabase SQL Editor to verify data:

```sql
-- 1. Check User Profiles
SELECT 
  id, 
  email, 
  display_name, 
  player_role, 
  rating,
  matches_played,
  runs,
  wickets
FROM user_profiles 
ORDER BY rating DESC 
LIMIT 10;

-- 2. Check Teams
SELECT 
  id, 
  name, 
  status, 
  accepted_players,
  min_players,
  owner_name
FROM teams;

-- 3. Check Team Players
SELECT 
  tp.team_id,
  t.name as team_name,
  tp.player_id,
  up.display_name as player_name,
  tp.role,
  tp.status,
  tp.is_captain
FROM team_players tp
JOIN teams t ON tp.team_id = t.id
JOIN user_profiles up ON tp.player_id = up.id
ORDER BY t.name, tp.is_captain DESC;

-- 4. Check Tournaments
SELECT 
  id,
  name,
  status,
  current_teams,
  min_teams,
  format,
  type,
  entry_fee
FROM tournaments;

-- 5. Check Tournament Teams
SELECT 
  tt.tournament_id,
  t.name as tournament_name,
  tt.team_id,
  tm.name as team_name,
  tt.status
FROM tournament_teams tt
JOIN tournaments t ON tt.tournament_id = t.id
JOIN teams tm ON tt.team_id = tm.id;

-- 6. Check Matches
SELECT 
  id,
  tournament_id,
  match_number,
  team1_name,
  team2_name,
  scheduled_date,
  scheduled_time,
  status,
  format
FROM matches
ORDER BY scheduled_date;

-- 7. Check Team Stats
SELECT 
  ts.team_id,
  t.name as team_name,
  ts.matches_played,
  ts.wins,
  ts.losses,
  ts.win_rate,
  ts.strength_score,
  ts.net_run_rate
FROM team_stats ts
JOIN teams t ON ts.team_id = t.id
ORDER BY ts.strength_score DESC;

-- 8. Check Wallets
SELECT 
  w.user_id,
  up.display_name,
  w.balance
FROM wallets w
JOIN user_profiles up ON w.user_id = up.id;

-- 9. Check Venues
SELECT 
  id,
  name,
  location,
  capacity
FROM venues;
```

### App Feature Testing Checklist

#### ✅ User Onboarding
- [ ] Register new user
- [ ] Verify OTP
- [ ] Login
- [ ] Forgot password
- [ ] Logout

#### ✅ User Profile
- [ ] View profile
- [ ] Edit profile
- [ ] Upload profile picture
- [ ] View stats
- [ ] Select player role

#### ✅ Teams
- [ ] View teams list
- [ ] View team details
- [ ] Create team (if implemented)
- [ ] View team players
- [ ] View team stats

#### ✅ Tournaments
- [ ] View tournaments list
- [ ] View tournament details
- [ ] Create tournament (if implemented)
- [ ] View tournament teams
- [ ] View tournament matches

#### ✅ Matches
- [ ] View matches list
- [ ] View match details
- [ ] View match schedule
- [ ] View match history

#### ✅ Analytics
- [ ] View player analytics
- [ ] View team analytics
- [ ] Compare players
- [ ] View leaderboards

#### ✅ Wallet
- [ ] View wallet balance
- [ ] View transactions
- [ ] Add money (mock)
- [ ] Withdraw request

#### ✅ Social Features
- [ ] View notifications
- [ ] View chat list
- [ ] Like matches
- [ ] Comment on matches

#### ✅ Search
- [ ] Search tournaments
- [ ] Search players
- [ ] Search teams
- [ ] Filter results

#### ✅ Admin
- [ ] Access admin panel
- [ ] View admin dashboard
- [ ] Manage users (if implemented)

## 🐛 Troubleshooting

### Issue: No data showing
**Solution:**
1. Check if RLS policies are set up
2. Verify user is authenticated
3. Check if seed data was inserted
4. Verify user IDs match auth.users

### Issue: Navigation errors
**Solution:**
1. Check if React Navigation is installed
2. Verify navigation structure in AppNavigator.tsx
3. Check screen imports

### Issue: Database connection errors
**Solution:**
1. Verify Supabase URL and key in `config/supabase.ts`
2. Check network connection
3. Verify RLS policies allow access

## 📊 Expected Results

After setup, you should have:
- ✅ 16+ user profiles
- ✅ 4 teams (each with 11 players)
- ✅ 1 tournament (with 4 teams)
- ✅ 4+ scheduled matches
- ✅ Team stats for all teams
- ✅ Wallets for all users
- ✅ 5 venues

## 🎯 Next Steps

1. Test all navigation flows
2. Test data fetching from Supabase
3. Test real-time updates
4. Test form submissions
5. Test image uploads
6. Test payment flows (mock)

