# Render Deployment Guide for Promrkts Backend

This guide will help you deploy your backend to Render with a PostgreSQL database.

## Prerequisites

1. **Create a Render Account**
   - Go to https://render.com and sign up
   - Connect your GitHub/GitLab account (recommended for auto-deploys)

2. **Push Your Code to Git**
   ```bash
   cd /Users/moeawidan/Downloads/promrkts
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

## Deployment Methods

### Method 1: Blueprint (Recommended - One-Click Deploy)

This method uses the `render.yaml` file to deploy everything at once.

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Select the repository containing your backend
   - Render will detect the `render.yaml` file

3. **Configure Environment Variables**
   
   During setup, you'll need to provide values for these variables:
   
   - **FRONTEND_URL**: Your frontend URL (e.g., `https://your-frontend.com`)
   - **BACKEND_URL**: Will be `https://promrkts-backend.onrender.com` (or your custom domain)
   - **SMTP_HOST**: Your email provider's SMTP host (e.g., `smtp.gmail.com`)
   - **SMTP_PORT**: Usually `587` or `465`
   - **SMTP_USER**: Your email username
   - **SMTP_PASS**: Your email password or app-specific password
   - **EMAIL_FROM**: Sender email address
   - **AWS_ACCESS_KEY_ID**: (Optional) For S3 file uploads
   - **AWS_SECRET_ACCESS_KEY**: (Optional) For S3 file uploads
   - **AWS_REGION**: (Optional) e.g., `us-east-1`
   - **S3_BUCKET_NAME**: (Optional) Your S3 bucket name
   - **USDT_WALLET_ADDRESS**: (Optional) For crypto payments
   - **GOOGLE_MAPS_API_KEY**: (Optional) If using Google Maps

4. **Deploy**
   - Click "Apply" to create all services
   - Render will:
     - Create a PostgreSQL database
     - Deploy your backend
     - Run Prisma migrations automatically
     - Connect everything together

### Method 2: Manual Setup (Step-by-Step)

If you prefer manual control:

#### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Click "New +" → "PostgreSQL"

2. **Configure Database**
   - **Name**: `promrkts-db`
   - **Database**: `promrkts`
   - **User**: `promrkts`
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Plan**: Start with "Starter" ($7/month) or "Free" (expires after 90 days)

3. **Create Database**
   - Click "Create Database"
   - Wait for provisioning (1-2 minutes)

4. **Get Connection Strings**
   - Once created, you'll see:
     - **Internal Database URL**: Use this for DATABASE_URL
     - **External Database URL**: Use this for local development
   - Copy the **Internal Database URL** - it looks like:
     ```
     postgresql://promrkts:password@dpg-xxxxx-a/promrkts
     ```

#### Step 2: Create Web Service

1. **Go to Render Dashboard**
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your Git repository
   - Select the repository
   - **Root Directory**: `backend` (if your backend is in a subdirectory)

3. **Configure Service**
   - **Name**: `promrkts-backend`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npx prisma migrate deploy && npm start
     ```
   - **Plan**: Start with "Starter" ($7/month) or "Free" (limited)

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable" for each:

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste-internal-database-url-from-step-1>
   DIRECT_URL=<paste-internal-database-url-from-step-1>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRES_IN=30d
   FRONTEND_URL=https://your-frontend.com
   BACKEND_URL=https://promrkts-backend.onrender.com
   ```

   **Optional variables** (add if needed):
   ```
   SENTRY_DSN=https://your-sentry-dsn
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@promrkts.com
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket
   USDT_WALLET_ADDRESS=your-wallet-address
   GOOGLE_MAPS_API_KEY=your-google-api-key
   ```

5. **Add Persistent Disk (for file uploads)**
   - Scroll to "Disk"
   - Click "Add Disk"
   - **Name**: `promrkts-uploads`
   - **Mount Path**: `/app/uploads`
   - **Size**: 1 GB (can increase later)

6. **Create Web Service**
   - Click "Create Web Service"
   - Render will build and deploy your app (5-10 minutes)

## Verify Deployment

### Check Service Status

1. **View Logs**
   - Go to your service dashboard
   - Click "Logs" tab
   - Look for "Server is running on port 10000"

2. **Test Health Endpoint**
   ```bash
   curl https://promrkts-backend.onrender.com/health
   ```
   
   Should return:
   ```json
   {"status":"ok"}
   ```

3. **Test Database Connection**
   ```bash
   curl https://promrkts-backend.onrender.com/db-check
   ```

### Check Database

1. **Connect to Database**
   - Go to your PostgreSQL service
   - Click "Connect" → "External Connection"
   - Use the provided connection string with a PostgreSQL client

2. **Verify Tables**
   ```bash
   # Using psql
   psql <external-database-url>
   \dt
   ```

## Database Management

### Run Migrations

Migrations run automatically on deployment. To run manually:

1. **Using Render Shell**
   - Go to your web service
   - Click "Shell" tab
   - Run:
     ```bash
     npx prisma migrate deploy
     ```

2. **From Local Machine**
   ```bash
   # Set DATABASE_URL to external connection string
   export DATABASE_URL="<external-database-url>"
   npx prisma migrate deploy
   ```

### Seed Database

If you need to seed your database:

```bash
# In Render Shell
npm run seed:courses
# or other seed commands from package.json
```

### Database Backups

Render automatically backs up your database:
- **Starter Plan**: Daily backups, 7-day retention
- **Pro Plan**: Daily backups, 30-day retention

To restore:
1. Go to PostgreSQL service
2. Click "Backups" tab
3. Select backup and click "Restore"

## Custom Domain Setup

1. **Go to Web Service Settings**
   - Click "Settings" tab
   - Scroll to "Custom Domain"

2. **Add Domain**
   - Click "Add Custom Domain"
   - Enter your domain (e.g., `api.promrkts.com`)

3. **Configure DNS**
   - Add CNAME record in your DNS provider:
     ```
     CNAME api promrkts-backend.onrender.com
     ```

4. **Enable HTTPS**
   - Render automatically provisions SSL certificate
   - Wait 5-10 minutes for DNS propagation

## Scaling

### Vertical Scaling (More Resources)

1. Go to service settings
2. Change plan:
   - **Starter**: 512 MB RAM, 0.5 CPU
   - **Standard**: 2 GB RAM, 1 CPU
   - **Pro**: 4 GB RAM, 2 CPU

### Horizontal Scaling (Multiple Instances)

Available on Pro plans and above:
1. Go to "Settings" → "Scaling"
2. Increase instance count
3. Render handles load balancing automatically

### Disk Scaling

1. Go to service settings
2. Find "Disk" section
3. Increase size as needed

## Monitoring

### View Metrics

1. **Dashboard Metrics**
   - CPU usage
   - Memory usage
   - Request count
   - Response times

2. **Logs**
   - Real-time logs in dashboard
   - Filter by severity
   - Search logs

3. **Alerts**
   - Set up email alerts for:
     - Service down
     - High CPU/memory
     - Failed deployments

### Health Checks

Render automatically monitors `/health` endpoint:
- Checks every 30 seconds
- Restarts service if unhealthy
- Sends alerts on failures

## Auto-Deploy

### Enable Auto-Deploy

1. Go to service settings
2. Enable "Auto-Deploy"
3. Select branch (e.g., `main`)

Now every push to that branch automatically deploys!

### Deploy Hooks

Get a webhook URL to trigger deploys:
1. Settings → "Deploy Hook"
2. Copy webhook URL
3. Use in CI/CD or manually:
   ```bash
   curl -X POST https://api.render.com/deploy/srv-xxxxx
   ```

## Environment Variables Management

### Update Variables

1. Go to "Environment" tab
2. Click "Edit" on any variable
3. Save changes
4. Service automatically redeploys

### Environment Groups

For multiple services sharing variables:
1. Create "Environment Group"
2. Add shared variables
3. Link to multiple services

## Troubleshooting

### Build Fails

**Check build logs** for errors:
- Missing dependencies: Add to `package.json`
- Prisma errors: Ensure `prisma generate` runs in build command
- TypeScript errors: Fix compilation errors

### Service Won't Start

1. **Check start command**: Ensure it's correct
2. **Check PORT**: Must use `process.env.PORT` (Render assigns port 10000)
3. **Check logs**: Look for startup errors

### Database Connection Fails

1. **Verify DATABASE_URL**: Must be internal URL
2. **Check database status**: Ensure database is running
3. **Connection pooling**: Render handles this automatically

### Out of Memory

1. **Check memory usage** in metrics
2. **Upgrade plan** if consistently high
3. **Optimize code**: Look for memory leaks

### Slow Performance

1. **Check metrics**: Identify bottlenecks
2. **Database queries**: Optimize slow queries
3. **Add indexes**: Use Prisma to add database indexes
4. **Upgrade plan**: More CPU/RAM
5. **Enable caching**: Add Redis (separate service)

## Cost Optimization

### Free Tier Limitations

- Web service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Database expires after 90 days

### Starter Plan ($7/month each)

- Always-on service
- 512 MB RAM
- Persistent database
- Good for production

### Tips to Save Money

1. **Start small**: Use Starter plans initially
2. **Monitor usage**: Check metrics to right-size
3. **Combine services**: Use one database for multiple apps
4. **Use disk wisely**: Start with 1 GB, increase as needed

## Important Notes

1. **Port Configuration**: Render assigns port 10000, your app must use `process.env.PORT`
2. **Build Time**: First deploy takes 5-10 minutes
3. **Zero Downtime**: Render handles rolling deploys automatically
4. **HTTPS**: Automatic and free
5. **Logs Retention**: 7 days on free/starter, 30 days on pro
6. **Database Backups**: Automatic daily backups

## Migrating from Supabase

If you're migrating from Supabase to Render PostgreSQL:

1. **Export Supabase Data**
   ```bash
   pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
   ```

2. **Import to Render**
   ```bash
   psql <render-external-database-url> < backup.sql
   ```

3. **Update Environment Variables**
   - Change DATABASE_URL to Render's URL
   - Redeploy

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com
- **Support**: support@render.com (paid plans)

## Quick Reference Commands

```bash
# View logs (in Render Shell)
npm start

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed:courses

# Check database
npx prisma studio

# Generate Prisma client
npx prisma generate

# View environment
env | grep DATABASE_URL
```

## Next Steps

1. ✅ Deploy your backend to Render
2. ✅ Verify health and database endpoints
3. ✅ Update frontend to use new backend URL
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring and alerts
6. ✅ Set up auto-deploy from Git

Your backend should now be running smoothly on Render! 🚀
