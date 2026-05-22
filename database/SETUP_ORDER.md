# Setup Order - Complete Reset (Keep Auth Users)

## 🎯 Goal: Clear Everything Except Auth Users, Then Rebuild

---

## 📋 Run These Files (In This Exact Order)

### 1️⃣ Clear All Data (Keep Auth Users)
**File:** `00_CLEAR_ALL_DATA_KEEP_AUTH.sql`

**What it does:**
- Clears all data from all tables
- **KEEPS** auth.users (your authenticated users remain)

---

### 2️⃣ Recreate All Tables
**File:** `01_COMPLETE_RESET_AND_SETUP.sql`

**What it does:**
- Drops all tables (if they exist)
- Creates ALL 45 tables
- Creates all indexes and triggers
- Inserts default subscription plans

---

### 3️⃣ Insert All Data
**File:** `02_INSERT_ALL_DATA.sql`

**What it does:**
- Creates user profiles from existing auth users
- Creates teams, tournaments, matches
- Creates all test data

---

### 4️⃣ Enable Security
**File:** `RLS_POLICIES.sql`

**What it does:**
- Enables Row Level Security
- Creates security policies

---

### 5️⃣ Setup Storage
**File:** `storage_buckets.sql`

**What it does:**
- Sets up storage buckets
- Creates storage policies

---

### 6️⃣ Verify Everything
**File:** `04_VERIFY_DATA.sql`

**What it does:**
- Verifies all data was inserted correctly
- Shows counts for all tables

---

## ✅ Quick List (Copy & Paste)

```
1. 00_CLEAR_ALL_DATA_KEEP_AUTH.sql
2. 01_COMPLETE_RESET_AND_SETUP.sql
3. 02_INSERT_ALL_DATA.sql
4. RLS_POLICIES.sql
5. storage_buckets.sql
6. 04_VERIFY_DATA.sql
```

---

## ⚠️ Important

- Your **auth users are preserved** ✅
- All **other data is cleared** and recreated
- Make sure you have at least 4 auth users before running Step 3

---

## 🔧 Helper Files (Keep for Troubleshooting)

- `03_DIAGNOSE_AND_FIX.sql` - Use if you get errors
- `CHECK_AUTH_USERS.sql` - Use to check auth users

---

## 📚 Documentation (Keep for Reference)

- `START_HERE.md` - Quick start guide
- `CREATE_AUTH_USERS_GUIDE.md` - Auth users guide
- `README.md` - Complete documentation
- `RUN_THESE_FILES.md` - Simple file list

