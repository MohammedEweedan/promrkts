# Render Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to Git
```bash
cd /Users/moeawidan/Downloads/promrkts
git add .
git commit -m "Add Render configuration"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to Render**: https://dashboard.render.com
2. **Click "New +"** → **"Blueprint"**
3. **Connect Repository**: Select your `promrkts` repository
4. **Render detects `render.yaml`** and shows preview
5. **Set Required Environment Variables**:
   - `FRONTEND_URL`: Your frontend URL
   - `BACKEND_URL`: `https://promrkts-backend.onrender.com`
   - Other optional variables (see `.env.render.example`)
6. **Click "Apply"** - Render will:
   - ✅ Create PostgreSQL database
   - ✅ Deploy backend service
   - ✅ Run database migrations
   - ✅ Connect everything automatically

### Step 3: Verify

```bash
# Check health
curl https://promrkts-backend.onrender.com/health

# Check database
curl https://promrkts-backend.onrender.com/db-check
```

## 📋 What You Get

- **PostgreSQL Database**: Fully managed, automatic backups
- **Backend API**: Auto-deployed from Git
- **Persistent Storage**: 1GB disk for file uploads
- **HTTPS**: Automatic SSL certificates
- **Auto-Deploy**: Push to Git = automatic deployment
- **Health Monitoring**: Automatic restart if unhealthy

## 🔧 Important Settings

### Database Connection
Render automatically sets `DATABASE_URL` from your PostgreSQL service. No manual configuration needed!

### Port Configuration
Your app **must** use `process.env.PORT` (Render uses port 10000). This is already configured in your `index.ts`.

### File Uploads
Persistent disk mounted at `/app/uploads` - files persist across deploys.

## 📊 Your Services

After deployment, you'll have:

1. **promrkts-db** (PostgreSQL)
   - URL: `https://dashboard.render.com/d/dpg-xxxxx`
   - Connection strings available in dashboard

2. **promrkts-backend** (Web Service)
   - URL: `https://promrkts-backend.onrender.com`
   - Auto-deploys from `main` branch

## 🔐 Security Checklist

- [ ] Set strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] Use environment variables for all secrets
- [ ] Enable 2FA on Render account
- [ ] Review database access logs
- [ ] Set up IP allowlist for database (if needed)

## 💰 Pricing

**Starter Plan** (Recommended for production):
- PostgreSQL: $7/month
- Web Service: $7/month
- Disk (1GB): $0.25/month
- **Total: ~$14.25/month**

**Free Tier** (Testing only):
- Services spin down after 15 minutes
- Database expires after 90 days
- Not recommended for production

## 🆘 Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure `prisma generate` runs in build command

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Review connection logs

### Service Won't Start
- Check start command: `npx prisma migrate deploy && npm start`
- Verify port is `process.env.PORT`
- Review startup logs

## 📚 Next Steps

1. ✅ **Custom Domain**: Add your own domain in service settings
2. ✅ **Monitoring**: Set up alerts for downtime
3. ✅ **Backups**: Configure backup retention
4. ✅ **Scaling**: Upgrade plan as traffic grows
5. ✅ **CI/CD**: Enable auto-deploy from Git

## 🔗 Useful Links

- **Dashboard**: https://dashboard.render.com
- **Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

---

**Need help?** Check `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions.
