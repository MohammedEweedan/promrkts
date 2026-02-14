# Admin Dashboard Deployment Guide

## Quick Fix: Deploy admin.promrkts.com

### Problem
Currently `admin.promrkts.com` is pointing to the main frontend instead of the admin dashboard.

### Solution
Deploy the admin app as a **separate Vercel project**.

---

## Step-by-Step Deployment

### 1. Install Vercel CLI (if not installed)
```powershell
npm install -g vercel
```

### 2. Navigate to Admin Directory
```powershell
cd c:\Users\MohammedEweedan\Downloads\promrkts\admin
```

### 3. Deploy to Vercel
```powershell
vercel --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → `promrkts-admin` (or any name)
- **Directory?** → `.` (current directory)
- **Override settings?** → No

### 4. Configure Domain in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your new `promrkts-admin` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `admin.promrkts.com`
6. Vercel will show you DNS records to add

### 5. Update DNS Records

**If using Namecheap:**
1. Go to Namecheap Dashboard → Domain List
2. Click **Manage** next to promrkts.com
3. Go to **Advanced DNS**
4. Add/Update CNAME record:
   ```
   Type: CNAME Record
   Host: admin
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

**If using Cloudflare:**
1. Go to Cloudflare Dashboard
2. Select promrkts.com domain
3. Go to **DNS** → **Records**
4. Add CNAME record:
   ```
   Type: CNAME
   Name: admin
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)
   ```

### 6. Set Environment Variables in Vercel

1. In Vercel dashboard, go to your `promrkts-admin` project
2. Go to **Settings** → **Environment Variables**
3. Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://promrkts.com/api
   Environment: Production, Preview, Development
   ```

### 7. Redeploy
```powershell
vercel --prod
```

### 8. Wait for DNS Propagation
DNS changes can take 5-60 minutes. Check status:
```powershell
nslookup admin.promrkts.com
```

---

## Verification

1. Visit https://admin.promrkts.com
2. You should see the **login page** (not the main frontend)
3. Login with admin credentials
4. Verify you can access the dashboard

---

## Admin User Setup

### Create Admin User (if needed)

Run this in your backend console or database:

```sql
-- PostgreSQL/Prisma
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-admin-email@promrkts.com';
```

Or via Prisma Studio:
```powershell
cd c:\Users\MohammedEweedan\Downloads\promrkts\backend
npx prisma studio
```
Then edit the user's `role` field to `admin`.

---

## Troubleshooting

### Issue: Still seeing main frontend
- **Cause:** DNS not updated or cached
- **Fix:** 
  1. Clear browser cache (Ctrl+Shift+Delete)
  2. Try incognito mode
  3. Wait for DNS propagation (up to 1 hour)
  4. Check DNS: `nslookup admin.promrkts.com`

### Issue: Login fails with "Access denied"
- **Cause:** User doesn't have admin role
- **Fix:** Update user role in database to `admin`

### Issue: API calls fail with CORS errors
- **Cause:** Backend not allowing admin subdomain
- **Fix:** Update backend CORS config to allow `admin.promrkts.com`

### Issue: 404 on all pages
- **Cause:** Vercel routing issue
- **Fix:** Check `vercel.json` exists in admin folder

---

## Local Development

```powershell
cd c:\Users\MohammedEweedan\Downloads\promrkts\admin
npm run dev
```

Access at: http://localhost:3001

Set local env:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Architecture

```
promrkts.com          → Frontend (CRA) - Vercel Project 1
admin.promrkts.com    → Admin (Next.js) - Vercel Project 2
api.promrkts.com      → Backend (Express) - Vercel Serverless
```

Both frontend and admin call the same backend API with JWT tokens.
Admin routes require `role: 'admin'` in JWT payload.
