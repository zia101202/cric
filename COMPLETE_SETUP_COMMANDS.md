# Complete Setup Commands - Step by Step

## 📋 Prerequisites

1. Supabase project created
2. Supabase URL and ANON_KEY configured in `config/supabase.ts`
3. Node.js and npm installed

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd E:\cric
npm install
```

### Step 2: Database Setup

#### 2.1 Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor

#### 2.2 Create All Tables
Run these SQL files in order (copy-paste entire content):

**File 1: `database/supabase_schema.sql`**
- Creates base tables (user_profiles, teams, tournaments, matches, etc.)
- Run entire file

**File 2: `database/COMPLETE_SCHEMA.sql`**
- Creates additional tables (challenges, reputation, venue booking, media, etc.)
- Run entire file

**File 3: `database/RLS_POLICIES.sql`**
- Sets up Row Level Security policies
- Run entire file

#### 2.3 Create Storage Buckets

Go to **Storage** → **New Bucket**:

1. **avatars** (Public, 5MB limit)
2. **team-assets** (Public, 5MB limit)
3. **tournament-assets** (Public, 5MB limit)
4. **match-images** (Public, 10MB limit)
5. **venues** (Public, 5MB limit)

### Step 3: Create Auth Users

#### Option A: Via Dashboard (Recommended)
1. Go to **Authentication** → **Users** → **Add User**
2. Create users with these emails:
   - john@test.com (password: Test123!@#)
   - mike@test.com (password: Test123!@#)
   - david@test.com (password: Test123!@#)
   - chris@test.com (password: Test123!@#)
   - alex@test.com (password: Test123!@#)
   - sam@test.com (password: Test123!@#)
   - tom@test.com (password: Test123!@#)
   - ryan@test.com (password: Test123!@#)
   - james@test.com (password: Test123!@#)
   - kevin@test.com (password: Test123!@#)
   - mark@test.com (password: Test123!@#)
   - paul@test.com (password: Test123!@#)
   - steve@test.com (password: Test123!@#)
   - luke@test.com (password: Test123!@#)
   - nick@test.com (password: Test123!@#)
   - dan@test.com (password: Test123!@#)

3. **Copy all user UUIDs** (you'll need them)

#### Option B: Get User IDs via SQL
```sql
SELECT id, email FROM auth.users ORDER BY created_at;
```

### Step 4: Insert Seed Data

#### 4.1 Get User IDs
Run in SQL Editor:
```sql
SELECT id, email FROM auth.users ORDER BY created_at LIMIT 16;
```

#### 4.2 Update Seed Data File
1. Open `database/SEED_DATA_MANUAL.sql`
2. Find all `USER_ID_1`, `USER_ID_2`, etc.
3. Replace with actual UUIDs from Step 4.1
4. Save the file

#### 4.3 Run Seed Data
Run `database/SEED_DATA_MANUAL.sql` in SQL Editor section by section:

**Section 1: User Profiles**
- Uncomment the INSERT statement
- Replace USER_ID_X with actual UUIDs
- Run

**Section 2: Teams**
- Uncomment the DO block
- Replace USER_ID_X with actual UUIDs
- Run

**Section 3: Tournament**
- Uncomment the DO block
- Replace USER_ID_X with actual UUIDs
- Run

**Section 4: Wallets**
- Uncomment the INSERT statement
- Run

**Section 5: Transactions**
- Uncomment the INSERT statement
- Run

**Section 6: Notifications**
- Uncomment the INSERT statement
- Run

### Step 5: Verify Database

Run `database/VERIFICATION_QUERIES.sql` in SQL Editor to verify all data.

### Step 6: Run the App

```bash
npm start
# Press 'w' for web browser
# Or: npm run web
```

### Step 7: Test Features

1. **Login** with: john@test.com / Test123!@#
2. **Navigate** through all tabs
3. **Check** if data appears:
   - Home screen shows stats
   - Teams tab shows teams
   - Tournaments tab shows tournaments
   - Matches tab shows matches
   - Profile shows user data

## ✅ Verification Checklist

### Database
- [ ] All tables created (check with: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`)
- [ ] RLS enabled on all tables
- [ ] Storage buckets created
- [ ] 16+ user profiles inserted
- [ ] 4+ teams created
- [ ] 1+ tournament created
- [ ] 4+ matches scheduled
- [ ] Team stats populated
- [ ] Wallets created

### App
- [ ] App starts without errors
- [ ] Login works
- [ ] Navigation works
- [ ] All tabs accessible
- [ ] Data displays in screens
- [ ] No console errors

## 🐛 Common Issues

### Issue: "relation does not exist"
**Fix:** Run `supabase_schema.sql` first, then `COMPLETE_SCHEMA.sql`

### Issue: "permission denied"
**Fix:** Run `RLS_POLICIES.sql` to set up policies

### Issue: "foreign key constraint"
**Fix:** Make sure auth users exist before inserting user_profiles

### Issue: "No data showing"
**Fix:** 
1. Check RLS policies
2. Verify user is authenticated
3. Check if seed data was inserted
4. Verify user IDs match

## 📊 Expected Data Counts

After complete setup:
- **User Profiles:** 16+
- **Teams:** 4
- **Team Players:** 44+ (11 per team)
- **Tournaments:** 1
- **Tournament Teams:** 4
- **Matches:** 4+
- **Team Stats:** 4
- **Venues:** 5
- **Wallets:** 16+
- **Transactions:** 16+

## 🎯 Quick Test Commands

### Test Database Connection
```sql
SELECT COUNT(*) FROM user_profiles;
```

### Test Teams
```sql
SELECT name, status, accepted_players FROM teams;
```

### Test Tournaments
```sql
SELECT name, status, current_teams FROM tournaments;
```

### Test Matches
```sql
SELECT team1_name, team2_name, scheduled_date, status FROM matches;
```

## 📝 Next Steps After Setup

1. Test all navigation flows
2. Test data fetching
3. Test form submissions
4. Test image uploads
5. Test real-time updates
6. Test payment flows (mock)

