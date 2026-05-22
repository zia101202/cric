# 🚀 Complete Run Commands

## Quick Start Commands

### 1. Install Dependencies
```bash
cd E:\cric
npm install
```

### 2. Database Setup (Supabase Dashboard)

#### Step 1: Create Tables
1. Open Supabase Dashboard → SQL Editor
2. Run: `database/supabase_schema.sql`
3. Run: `database/COMPLETE_SCHEMA.sql`
4. Run: `database/RLS_POLICIES.sql`

#### Step 2: Create Storage Buckets
Go to Storage → Create:
- `avatars` (Public)
- `team-assets` (Public)
- `tournament-assets` (Public)
- `match-images` (Public)
- `venues` (Public)

#### Step 3: Create Auth Users
1. Authentication → Users → Add User
2. Create 16 users (see COMPLETE_SETUP_COMMANDS.md)
3. Copy their UUIDs

#### Step 4: Insert Seed Data
1. Get user IDs: `SELECT id, email FROM auth.users LIMIT 16;`
2. Update `database/SEED_DATA_MANUAL.sql` with actual UUIDs
3. Run seed data SQL

#### Step 5: Verify Data
Run: `database/VERIFICATION_QUERIES.sql`

### 3. Run App
```bash
npm start
# Press 'w' for web browser
```

### 4. Test Login
- Email: `john@test.com`
- Password: `Test123!@#`

## 📋 Complete Command Sequence

```bash
# 1. Install
npm install

# 2. Start app
npm start
# Then press 'w' for web

# 3. In another terminal, check for errors
npm run web
```

## 🔍 Verification Commands

### Check Database (Supabase SQL Editor)
```sql
-- Quick check
SELECT 
  (SELECT COUNT(*) FROM user_profiles) as users,
  (SELECT COUNT(*) FROM teams) as teams,
  (SELECT COUNT(*) FROM tournaments) as tournaments,
  (SELECT COUNT(*) FROM matches) as matches;
```

### Check App Console
Open browser console (F12) and check for:
- ✅ No errors
- ✅ Supabase connection successful
- ✅ Navigation working

## 🎯 Testing Commands

### Test Navigation
1. Login
2. Click each tab
3. Verify screens load

### Test Data Fetching
1. Check Teams tab → Should show teams
2. Check Tournaments tab → Should show tournaments
3. Check Matches tab → Should show matches
4. Check Profile tab → Should show user data

### Test Features
1. Home → Check stats display
2. Teams → Click team → Check details
3. Tournaments → Click tournament → Check details
4. Matches → Click match → Check details
5. Profile → Check profile data

## ✅ Success Indicators

- ✅ App starts without errors
- ✅ Login works
- ✅ All tabs accessible
- ✅ Data displays in screens
- ✅ Navigation works
- ✅ No console errors

## 🐛 Troubleshooting Commands

### Clear Cache
```bash
npm start -- --clear
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Check Linter
```bash
npm run lint  # if configured
```

