# QUICK DEPLOY - Admin Dashboard

## THE PROBLEM
You're looking at the WRONG Vercel project. The domains you showed are for the **main frontend project**, not the admin project.

## THE SOLUTION
Deploy the admin app as a **NEW, SEPARATE** Vercel project.

---

## Step 1: Login to Vercel CLI
```powershell
cd c:\Users\MohammedEweedan\Downloads\promrkts\admin
vercel login
```
- Browser will open
- Click "Confirm" to authorize
- Come back and press ENTER

---

## Step 2: Deploy Admin App (NEW PROJECT)
```powershell
vercel --prod
```

**IMPORTANT ANSWERS:**
- "Set up and deploy?" → **Yes**
- "Which scope?" → **Select your account**
- "Link to existing project?" → **NO** (this is critical!)
- "What's your project's name?" → **promrkts-admin**
- "In which directory is your code located?" → **.** (just press ENTER)
- "Want to override settings?" → **No**

This creates a **NEW** Vercel project called `promrkts-admin`.

---

## Step 3: Add Domain to NEW Project

1. Go to https://vercel.com/dashboard
2. You should now see **TWO** projects:
   - `promrkts` (your main frontend) ← OLD
   - `promrkts-admin` (your new admin) ← NEW
3. Click on **promrkts-admin** (the NEW one)
4. Go to **Settings** → **Domains**
5. Click **Add**
6. Enter: `admin.promrkts.com`
7. Click **Add**

---

## Step 4: Remove Domain from OLD Project

1. Go back to dashboard
2. Click on **promrkts** (the OLD main frontend project)
3. Go to **Settings** → **Domains**
4. Find `admin.promrkts.com` in the list
5. Click the **⋮** menu → **Remove**
6. Confirm removal

---

## Step 5: Set Environment Variable

1. In **promrkts-admin** project (the NEW one)
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
4. Name: `NEXT_PUBLIC_API_URL`
5. Value: `https://promrkts.com/api`
6. Environments: Check all (Production, Preview, Development)
7. Click **Save**

---

## Step 6: Redeploy

```powershell
vercel --prod
```

---

## Step 7: Wait & Test

Wait 2-5 minutes, then visit:
- https://admin.promrkts.com

You should see the **LOGIN PAGE**, not the main homepage.

---

## If Still Shows Main Page

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Try incognito mode**
3. **Check you're in the right project**: Go to Vercel dashboard, click `promrkts-admin`, verify the domain is there
4. **Check DNS**: Run `nslookup admin.promrkts.com` - should point to Vercel

---

## Create Admin User

Once login page shows, you need an admin user:

```sql
-- In your database
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:
```powershell
cd c:\Users\MohammedEweedan\Downloads\promrkts\backend
npx prisma studio
```
Find your user → Change `role` to `admin` → Save
