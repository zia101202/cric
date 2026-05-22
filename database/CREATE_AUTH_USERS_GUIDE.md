# How to Create Auth Users in Supabase

## 🚀 Quick Steps

### Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Open your project: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Click **"Authentication"** in the left sidebar
   - Click **"Users"** tab

3. **Add Users**
   - Click **"Add User"** button (top right)
   - For each user:
     - **Email:** Enter the email (e.g., `john@test.com`)
     - **Password:** Enter `Test123!@#`
     - **Auto Confirm User:** ✅ Check this box (important!)
     - Click **"Create User"**

4. **Repeat for all 16 users:**
   ```
   john@test.com
   mike@test.com
   david@test.com
   chris@test.com
   alex@test.com
   sam@test.com
   tom@test.com
   ryan@test.com
   james@test.com
   kevin@test.com
   mark@test.com
   paul@test.com
   steve@test.com
   luke@test.com
   nick@test.com
   dan@test.com
   ```

---

### Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create users via SQL (using Supabase Management API)
# Note: This requires service_role key
```

---

### Method 3: Bulk Import (Using Supabase API)

You can use the Supabase Management API or create a simple script. However, the Dashboard method is the easiest.

---

## ✅ Verify Users Were Created

Run this query in Supabase SQL Editor:

```sql
SELECT email, id, created_at 
FROM auth.users 
WHERE email IN (
  'john@test.com', 'mike@test.com', 'david@test.com', 'chris@test.com',
  'alex@test.com', 'sam@test.com', 'tom@test.com', 'ryan@test.com',
  'james@test.com', 'kevin@test.com', 'mark@test.com', 'paul@test.com',
  'steve@test.com', 'luke@test.com', 'nick@test.com', 'dan@test.com'
)
ORDER BY email;
```

You should see 16 rows.

---

## ⚠️ Important Notes

1. **Auto Confirm User:** Make sure to check this box when creating users, otherwise they won't be able to login
2. **Password:** Use `Test123!@#` for all users (or any password you prefer)
3. **Email Format:** Must match exactly: `john@test.com` (not `John@test.com`)

---

## 🐛 Troubleshooting

**"User already exists"**
- That's okay! The user is already created. Continue with the next one.

**"Invalid email format"**
- Make sure the email is in the format: `name@test.com`

**"Password too weak"**
- Use a stronger password like `Test123!@#` or `Password123!`

---

## 📝 Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Went to Authentication → Users
- [ ] Created 16 users with correct emails
- [ ] Checked "Auto Confirm User" for each
- [ ] Verified users exist (using the SQL query above)
- [ ] Ready to run `02_INSERT_ALL_DATA.sql`

---

## 🎯 After Creating Users

Once all 16 users are created, run:

```sql
02_INSERT_ALL_DATA.sql
```

The script will automatically:
- Create user profiles
- Create teams
- Create tournaments
- Insert all data

