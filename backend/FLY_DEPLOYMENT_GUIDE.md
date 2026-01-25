# Fly.io Deployment Guide for Promrkts Backend

This guide will help you deploy your backend to Fly.io and connect it to your Supabase database.

## Prerequisites

1. **Install Fly.io CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**
   ```bash
   flyctl auth login
   ```

3. **Get your Supabase Database Connection String**
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **Database**
   - Copy the **Connection String** (URI format)
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Also copy the **Direct Connection String** (for Prisma migrations)

## Deployment Steps

### 1. Navigate to Backend Directory
```bash
cd /Users/moeawidan/Downloads/promrkts/backend
```

### 2. Create Fly.io App (First Time Only)
```bash
flyctl launch --no-deploy
```

When prompted:
- Choose an app name (or use the default: `promrkts-backend`)
- Select a region close to your users (e.g., `iad` for US East)
- **Do NOT deploy yet** - we need to set environment variables first

### 3. Create a Volume for File Uploads
```bash
flyctl volumes create promrkts_uploads --region iad --size 1
```

### 4. Set Environment Variables

Set all required environment variables using Fly.io secrets:

```bash
# Database URLs (from Supabase)
flyctl secrets set DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

flyctl secrets set DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# JWT Configuration
flyctl secrets set JWT_SECRET="your-super-secure-jwt-secret-key-change-this"
flyctl secrets set JWT_EXPIRES_IN="30d"

# Frontend URLs (update with your actual domains)
flyctl secrets set FRONTEND_URL="https://your-frontend-domain.com"
flyctl secrets set BACKEND_URL="https://promrkts-backend.fly.dev"

# Sentry DSN (optional, for error tracking)
flyctl secrets set SENTRY_DSN="https://6930c42c9841e3c477e1a8be0c1b7518@o4510122251517952.ingest.de.sentry.io/4510122267705424"

# Email Configuration (if using email features)
flyctl secrets set SMTP_HOST="smtp.example.com"
flyctl secrets set SMTP_PORT="587"
flyctl secrets set SMTP_USER="your_smtp_username"
flyctl secrets set SMTP_PASS="your_smtp_password"
flyctl secrets set EMAIL_FROM="noreply@promrkts.com"

# AWS S3 (if using file uploads to S3)
flyctl secrets set AWS_ACCESS_KEY_ID="your_aws_access_key"
flyctl secrets set AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
flyctl secrets set AWS_REGION="us-east-1"
flyctl secrets set S3_BUCKET_NAME="your_s3_bucket_name"

# Payment Configuration (if using crypto payments)
flyctl secrets set USDT_WALLET_ADDRESS="YOUR_WALLET_ADDRESS"

# Google Maps API (if needed)
flyctl secrets set GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

### 5. Deploy to Fly.io
```bash
flyctl deploy
```

This will:
- Build your Docker image
- Push it to Fly.io
- Run Prisma migrations on your Supabase database
- Start your application

### 6. Verify Deployment

Check if your app is running:
```bash
flyctl status
```

Check logs:
```bash
flyctl logs
```

Test the health endpoint:
```bash
curl https://promrkts-backend.fly.dev/health
```

Test database connection:
```bash
curl https://promrkts-backend.fly.dev/db-check
```

## Supabase Database Setup

### Initial Database Setup

If you haven't already set up your database schema in Supabase:

1. **Run migrations locally first** (to test):
   ```bash
   # Set your Supabase DATABASE_URL in .env
   npx prisma migrate dev
   ```

2. **Deploy migrations to production**:
   ```bash
   # This happens automatically during Fly.io deployment
   # Or run manually:
   npx prisma migrate deploy
   ```

### Connection Pooling

Supabase uses PgBouncer for connection pooling. Your connection strings should be:

- **DATABASE_URL** (pooled): Use for queries - includes `?pgbouncer=true`
- **DIRECT_URL** (direct): Use for migrations - no pgbouncer parameter

This is already configured in your `schema.prisma` file.

## Scaling and Configuration

### Scale VM Resources
```bash
# Scale to 2 machines for high availability
flyctl scale count 2

# Increase memory if needed
flyctl scale memory 2048
```

### Update Environment Variables
```bash
flyctl secrets set KEY="value"
```

### View Current Secrets
```bash
flyctl secrets list
```

### SSH into Your App
```bash
flyctl ssh console
```

## Monitoring

### View Logs
```bash
# Real-time logs
flyctl logs

# Last 200 lines
flyctl logs --lines 200
```

### Metrics Dashboard
```bash
flyctl dashboard
```

## Troubleshooting

### Database Connection Issues

1. **Check Supabase connection string** - ensure password is correct
2. **Verify Supabase allows connections** - check IP allowlist (Fly.io uses dynamic IPs)
3. **Check Prisma connection** - view logs for connection errors

### Migration Failures

If migrations fail during deployment:
```bash
# SSH into the app
flyctl ssh console

# Run migrations manually
npx prisma migrate deploy
```

### App Won't Start

1. Check logs: `flyctl logs`
2. Verify all required environment variables are set: `flyctl secrets list`
3. Check if port 8080 is correctly exposed in Dockerfile

### Out of Memory

If your app runs out of memory:
```bash
flyctl scale memory 2048
```

## Updating Your App

When you make code changes:

1. Commit your changes
2. Run: `flyctl deploy`
3. Fly.io will rebuild and redeploy automatically

## Custom Domain Setup

To use your own domain:

```bash
# Add certificate
flyctl certs add your-domain.com

# Add DNS records as instructed by Fly.io
# Then verify
flyctl certs check your-domain.com
```

## Cost Optimization

- **Free tier**: 3 shared-cpu-1x VMs with 256MB RAM
- **Your current config**: 1GB RAM, 1 CPU (paid tier)
- **Volume storage**: $0.15/GB per month

To reduce costs, you can scale down:
```bash
flyctl scale memory 256
```

## Important Notes

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Database Backups**: Supabase handles automatic backups
3. **SSL/TLS**: Fly.io provides automatic HTTPS
4. **Health Checks**: The `/health` endpoint is used for monitoring
5. **Graceful Shutdown**: Your app handles SIGTERM/SIGINT for zero-downtime deploys

## Support

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/
- Supabase Docs: https://supabase.com/docs

## Quick Reference Commands

```bash
# Deploy
flyctl deploy

# View logs
flyctl logs

# Check status
flyctl status

# Scale
flyctl scale count 2
flyctl scale memory 1024

# Secrets
flyctl secrets set KEY=value
flyctl secrets list

# SSH
flyctl ssh console

# Restart
flyctl apps restart

# Open in browser
flyctl open
```
