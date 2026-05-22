# Run These Files - Complete Reset (Keep Auth Users)

## 🎯 Goal: Clear Everything Except Auth Users, Then Rebuild

---

## 📋 Files to Run (In This Exact Order)

### 1️⃣ Clear All Data (Keep Auth Users)
**File:** `00_CLEAR_ALL_DATA_KEEP_AUTH.sql`

**Run this FIRST!**

---

### 2️⃣ Recreate All Tables
**File:** `01_COMPLETE_RESET_AND_SETUP.sql`

**Run this SECOND!**

---

### 3️⃣ Insert All Data
**File:** `02_INSERT_ALL_DATA.sql`

**Run this THIRD!**

---

### 4️⃣ Enable Security
**File:** `RLS_POLICIES.sql`

**Run this FOURTH!**

---

### 5️⃣ Setup Storage
**File:** `storage_buckets.sql`

**Run this FIFTH!**

---

### 6️⃣ Verify Everything
**File:** `04_VERIFY_DATA.sql`

**Run this LAST to verify!**

---

## ✅ Quick Copy-Paste List

```
1. 00_CLEAR_ALL_DATA_KEEP_AUTH.sql
2. 01_COMPLETE_RESET_AND_SETUP.sql
3. 02_INSERT_ALL_DATA.sql
4. RLS_POLICIES.sql
5. storage_buckets.sql
6. 04_VERIFY_DATA.sql
```

---

## 📝 What Happens

1. **Step 1** - Clears all data, keeps auth users ✅
2. **Step 2** - Recreates all 45 tables ✅
3. **Step 3** - Inserts all test data ✅
4. **Step 4** - Enables security ✅
5. **Step 5** - Sets up storage ✅
6. **Step 6** - Verifies everything ✅

---

## ⚠️ Important

- Your **auth users are preserved** (they won't be deleted)
- All **other data is cleared** and recreated
- Make sure you have at least 4 auth users created before running Step 3

---

## 🐛 Troubleshooting

If Step 3 fails with "No auth users found":
- Create auth users first (see `CREATE_AUTH_USERS_GUIDE.md`)
- Or run `CHECK_AUTH_USERS.sql` to see which users exist

