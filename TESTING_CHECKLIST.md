# Complete Testing Checklist

## 🧪 Feature Testing Checklist

### ✅ 1. User Onboarding
- [ ] Register new user with email/password
- [ ] Verify email format validation
- [ ] Verify password strength validation
- [ ] Receive OTP email
- [ ] Verify OTP code
- [ ] Login with credentials
- [ ] Forgot password flow
- [ ] Password reset email received
- [ ] Logout functionality
- [ ] Session persistence (close/reopen app)

### ✅ 2. User Profile
- [ ] View own profile
- [ ] Edit profile information
- [ ] Upload profile picture
- [ ] Select player role
- [ ] View player stats (runs, wickets, average, etc.)
- [ ] View match history
- [ ] See rating and badges

### ✅ 3. Team Management
- [ ] View teams list
- [ ] View team details
- [ ] View team players
- [ ] View team stats
- [ ] Create team (if implemented)
- [ ] Send player invitations
- [ ] Accept/decline team invitations
- [ ] Remove team members
- [ ] Assign captain/vice-captain
- [ ] View team badges (strong team, etc.)

### ✅ 4. Tournament Features
- [ ] View tournaments list
- [ ] View tournament details
- [ ] View tournament teams
- [ ] View tournament schedule
- [ ] View tournament leaderboard
- [ ] Create tournament (if implemented)
- [ ] Send team invitations
- [ ] Accept/decline tournament invitations
- [ ] View tournament status (draft, official, ongoing)
- [ ] View prize distribution

### ✅ 5. Match Management
- [ ] View matches list
- [ ] View match details
- [ ] View match schedule
- [ ] View match scorecard (if completed)
- [ ] View match history
- [ ] Report match error (if implemented)
- [ ] View winning moments
- [ ] View MVP selection

### ✅ 6. Social & Interaction
- [ ] View notifications list
- [ ] Mark notifications as read
- [ ] View chat conversations
- [ ] Send messages (if implemented)
- [ ] Like matches/tournaments
- [ ] Comment on matches/tournaments
- [ ] Reply to comments

### ✅ 7. Analytics
- [ ] View player analytics
- [ ] View team analytics
- [ ] Compare players
- [ ] View leaderboards
- [ ] Filter by format (T10, T20, ODI)
- [ ] View trends and charts

### ✅ 8. Wallet & Payments
- [ ] View wallet balance
- [ ] View transaction history
- [ ] Add money (mock)
- [ ] Request withdrawal
- [ ] View payment receipts
- [ ] Pay tournament entry fee (if implemented)

### ✅ 9. Search & Discovery
- [ ] Search tournaments
- [ ] Search players
- [ ] Search teams
- [ ] Filter by location
- [ ] Filter by date
- [ ] Filter by format
- [ ] Filter by entry fee

### ✅ 10. Admin Panel
- [ ] Access admin dashboard
- [ ] View all users
- [ ] View all tournaments
- [ ] View all matches
- [ ] View disputes
- [ ] Approve/reject withdrawals
- [ ] Manage reports

## 🔍 Data Verification

### Check Database
Run these queries in Supabase SQL Editor:

```sql
-- 1. User Profiles
SELECT COUNT(*) as total_users FROM user_profiles;
SELECT * FROM user_profiles LIMIT 5;

-- 2. Teams
SELECT COUNT(*) as total_teams FROM teams;
SELECT name, status, accepted_players FROM teams;

-- 3. Team Players
SELECT COUNT(*) as total_team_players FROM team_players;
SELECT team_id, COUNT(*) as players FROM team_players GROUP BY team_id;

-- 4. Tournaments
SELECT COUNT(*) as total_tournaments FROM tournaments;
SELECT name, status, current_teams FROM tournaments;

-- 5. Matches
SELECT COUNT(*) as total_matches FROM matches;
SELECT team1_name, team2_name, scheduled_date, status FROM matches;

-- 6. Team Stats
SELECT COUNT(*) as total_team_stats FROM team_stats;
SELECT * FROM team_stats;

-- 7. Wallets
SELECT COUNT(*) as total_wallets FROM wallets;
SELECT COUNT(*), SUM(balance) FROM wallets;
```

## 🎯 Expected Results

### After Seed Data:
- ✅ 16+ user profiles
- ✅ 4 teams (each official with 11 players)
- ✅ 1 tournament (official with 4 teams)
- ✅ 4+ scheduled matches
- ✅ 4 team stats records
- ✅ 5 venues
- ✅ 16+ wallets
- ✅ 16+ transactions

### App Navigation:
- ✅ All tabs accessible
- ✅ All screens load
- ✅ Navigation between screens works
- ✅ Back button works
- ✅ Detail screens show data

## 🐛 Common Issues & Fixes

### Issue: "No teams found"
**Check:**
1. Teams table has data
2. RLS policies allow read
3. User is authenticated
4. Hook is fetching data

**Fix:**
```sql
-- Check teams
SELECT * FROM teams;

-- Check RLS
SELECT * FROM pg_policies WHERE tablename = 'teams';
```

### Issue: "No tournaments found"
**Check:**
1. Tournaments table has data
2. RLS policies
3. Hook implementation

**Fix:**
```sql
-- Check tournaments
SELECT * FROM tournaments;

-- Verify tournament teams
SELECT * FROM tournament_teams;
```

### Issue: "Navigation error"
**Check:**
1. React Navigation installed
2. Screen components exist
3. Navigation structure correct

**Fix:**
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
```

## 📱 Manual Testing Steps

1. **Start App:**
   ```bash
   npm start
   # Press 'w' for web
   ```

2. **Test Login:**
   - Use: john@test.com / Test123!@#
   - Should navigate to home

3. **Navigate Tabs:**
   - Click each tab
   - Verify screens load
   - Check for data

4. **Test Data Display:**
   - Home: Should show stats
   - Teams: Should show teams list
   - Tournaments: Should show tournaments
   - Matches: Should show matches
   - Profile: Should show user data

5. **Test Navigation:**
   - Click on team → Should open team details
   - Click on tournament → Should open tournament details
   - Click on match → Should open match details

6. **Test Forms:**
   - Try editing profile
   - Try creating team (if implemented)
   - Try creating tournament (if implemented)

## ✅ Success Criteria

App is working correctly if:
- ✅ All screens load without errors
- ✅ Navigation works smoothly
- ✅ Data displays in lists
- ✅ Detail screens show information
- ✅ Forms can be submitted
- ✅ No console errors
- ✅ No crashes

