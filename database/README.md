# Database Setup Guide - Complete Reference

## 📚 Quick Navigation

- **`START_HERE.md`** - Quick start guide (read this first!)
- **`CREATE_AUTH_USERS_GUIDE.md`** - How to create auth users
- **`CHECK_AUTH_USERS.sql`** - Verify users exist

## 📁 File Structure

### Essential Files (Run in Order)

1. **`supabase_schema.sql`** - Main database tables
2. **`COMPLETE_SCHEMA.sql`** - Additional tables (challenges, reputation, venue booking, media, admin)
3. **`05_ADMIN_SCHEMA_UPDATES.sql`** - Admin panel tables (audit, reported content)
4. **`06_SUBSCRIPTIONS_SCHEMA.sql`** - Subscriptions & monetization tables
5. **`07_USER_PROFILE_UPDATES.sql`** - User profile enhancements (i18n)
6. **`RLS_POLICIES.sql`** - Row Level Security policies
7. **`storage_buckets.sql`** - Storage bucket setup
8. **`00_CLEAR_ALL_DATA.sql`** - Clear all data (run before fresh insert)
9. **`02_INSERT_ALL_DATA.sql`** - Insert all data (covers ALL functionalities)
10. **`03_DIAGNOSE_AND_FIX.sql`** - Run if you get errors (diagnoses and fixes STEP 1)
11. **`04_VERIFY_DATA.sql`** - Verify data was inserted correctly

### Helper Files

- **`SETUP_GUIDE.md`** - Detailed setup instructions
- **`STORAGE_SETUP.md`** - Storage setup guide
- **`SETUP_ORDER.md`** - Quick reference for file execution order
- **`FILES_SUMMARY.md`** - File summary

## 🚀 Quick Start

### Step 1: Create Database Schema

Run in Supabase SQL Editor (in order):
1. `supabase_schema.sql`
2. `COMPLETE_SCHEMA.sql`
3. `05_ADMIN_SCHEMA_UPDATES.sql`
4. `06_SUBSCRIPTIONS_SCHEMA.sql`
5. `07_USER_PROFILE_UPDATES.sql`
6. `RLS_POLICIES.sql`
7. `storage_buckets.sql`

### Step 2: Create Auth Users

Go to **Supabase Dashboard → Authentication → Users → Add User**

Create 16 users with these exact emails:
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

**Password for all:** `Test123!@#`

### Step 3: Clear Existing Data (Optional)

If you have existing data and want to start fresh:
Run: **`00_CLEAR_ALL_DATA.sql`**

### Step 4: Insert Data

Run: **`02_INSERT_ALL_DATA.sql`**

This automatically creates data for ALL functionalities:
- ✅ User Profiles (16 users)
- ✅ Teams (4 teams with players)
- ✅ Tournaments (1 tournament)
- ✅ Matches (4 matches)
- ✅ Venues (5 venues)
- ✅ Wallets & Transactions
- ✅ Tournament Payments
- ✅ Challenges (Feature 7)
- ✅ Likes (Feature 6 - Social)
- ✅ Comments (Feature 6 - Social)
- ✅ Team Posts (Feature 3 - Team Social)
- ✅ Team Post Likes/Comments
- ✅ Notifications
- ✅ Reputation System (Feature 12)
- ✅ User Roles (Admin/Player)
- ✅ Venue Bookings (Feature 12)
- ✅ Venue Availability
- ✅ Subscriptions (Feature 12)
- ✅ Admin Actions (Feature 11)
- ✅ Disputes (Feature 5)

### Step 5: Verify

Run: **`04_VERIFY_DATA.sql`**

Check that all counts are correct.

## 🐛 Troubleshooting

If you get errors when running `02_INSERT_ALL_DATA.sql`:

1. Run **`03_DIAGNOSE_AND_FIX.sql`** first
   - This will diagnose the problem
   - Automatically fix STEP 1 (user_profiles)

2. Then run **`02_INSERT_ALL_DATA.sql`** again

## 📊 Expected Results

After complete setup:
- **User Profiles:** 16
- **Teams:** 4
- **Team Players:** 44
- **Tournaments:** 1
- **Matches:** 4
- **Venues:** 5
- **Wallets:** 16
- **Transactions:** 16
- **Challenges:** 2
- **Likes:** 13+
- **Comments:** 7+
- **Team Posts:** 3
- **Notifications:** 15+
- **Reputation Events:** 16
- **Subscriptions:** 16
- **All other tables:** Populated

## 📝 Notes

- All SQL files use automated user ID lookup (no manual replacement needed)
- Files are safe to run multiple times (use `ON CONFLICT DO NOTHING`)
- Make sure auth users exist before running data insertion
- The data insertion covers ALL features from `cric.txt`

## 🎯 Features Covered

This database setup covers all features from `cric.txt`:

1. ✅ User Onboarding
2. ✅ User Profiles
3. ✅ Team Management
4. ✅ Tournament Features
5. ✅ Match Management
6. ✅ Social & Interaction Features
7. ✅ Challenges & Competitions
8. ✅ Search, Filters & Discoverability
9. ✅ Player & Team Analytics
10. ✅ Payments & Wallet
11. ✅ Admin Panel
12. ✅ Extra Features (Reputation, Venue Booking, Subscriptions, etc.)
