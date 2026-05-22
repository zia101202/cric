# 🚀 START HERE - Complete Database Setup

## ⚠️ IMPORTANT: Create Auth Users FIRST!

**Before running any SQL files, you MUST create auth users in Supabase Dashboard.**

### Quick Steps:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project

2. **Create Users**
   - Click **"Authentication"** → **"Users"** → **"Add User"**
   - Create at least these 4 users (minimum):
     ```
     Email: john@test.com      Password: Test123!@#    Auto Confirm: ✅
     Email: mike@test.com      Password: Test123!@#    Auto Confirm: ✅
     Email: david@test.com     Password: Test123!@#    Auto Confirm: ✅
     Email: chris@test.com     Password: Test123!@#    Auto Confirm: ✅
     ```
   - For full list of 16 users, see: **`CREATE_AUTH_USERS_GUIDE.md`**

3. **Verify Users**
   - Run: **`CHECK_AUTH_USERS.sql`** to verify users were created

---

## 📋 SQL Files to Run (In Order)

### Step 1: Drop All Tables & Create Schema
**File:** `01_COMPLETE_RESET_AND_SETUP.sql`

**What it does:**
- ✅ Drops ALL existing tables
- ✅ Creates ALL 45 tables with latest schema
- ✅ Creates all indexes
- ✅ Creates all triggers
- ✅ Inserts default subscription plans

---

### Step 2: Insert All Data
**File:** `02_INSERT_ALL_DATA.sql`

**What it does:**
- ✅ Creates 16 user profiles (from auth users)
- ✅ Creates 4 teams with 44 players
- ✅ Creates 1 tournament with 4 matches
- ✅ Creates 5 venues
- ✅ Creates wallets, transactions, payments
- ✅ Creates challenges, likes, comments
- ✅ Creates team posts, notifications
- ✅ Creates reputation data, subscriptions
- ✅ Creates venue bookings, admin actions, disputes

**⚠️ Requires auth users to exist first!**

---

### Step 3: Enable Security
**File:** `RLS_POLICIES.sql`

**What it does:**
- ✅ Enables Row Level Security on all tables
- ✅ Creates security policies

---

### Step 4: Setup Storage
**File:** `storage_buckets.sql`

**What it does:**
- ✅ Provides instructions for creating storage buckets
- ✅ Creates storage policies

---

### Step 5: Verify Setup
**File:** `04_VERIFY_DATA.sql`

**What it does:**
- ✅ Shows counts for all tables
- ✅ Verifies data was inserted correctly

---

## ✅ Expected Results

After complete setup:
- **45 tables** created
- **16 user profiles** with stats
- **4 teams** with 44 players
- **1 tournament** with 4 matches
- **5 venues**
- **All social data** (likes, comments, posts)
- **Challenges, subscriptions, bookings**
- **All features** ready to test

---

## 🐛 Troubleshooting

**Error: "No auth users found"**
→ Create auth users first (see `CREATE_AUTH_USERS_GUIDE.md`)

**Error: "Required users not found"**
→ Run `03_DIAGNOSE_AND_FIX.sql` first, then retry `02_INSERT_ALL_DATA.sql`

**Error: "Table already exists"**
→ `01_COMPLETE_RESET_AND_SETUP.sql` drops all tables first, so it's safe

---

## 📚 Documentation Files

- **`CREATE_AUTH_USERS_GUIDE.md`** - How to create auth users
- **`CHECK_AUTH_USERS.sql`** - Verify users exist
- **`README.md`** - Complete documentation and reference
