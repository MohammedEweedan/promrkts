# Deploy Admin Dashboard to Vercel
Write-Host "Deploying ProMRKTS Admin Dashboard..." -ForegroundColor Cyan

# Check if vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to production
Write-Host "Deploying to production..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Vercel dashboard for this project"
Write-Host "2. Add domain: admin.promrkts.com"
Write-Host "3. Add environment variable: NEXT_PUBLIC_API_URL=https://promrkts.com/api"
Write-Host "4. Update your DNS with the CNAME record Vercel provides"
Write-Host ""
