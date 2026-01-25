#!/bin/bash

# Promrkts Backend - Fly.io Deployment Script
# This script helps you deploy your backend to Fly.io

set -e

echo "🚀 Promrkts Backend Deployment to Fly.io"
echo "========================================"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Fly.io CLI (flyctl) is not installed."
    echo "Install it with: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

echo "✅ Fly.io CLI is installed"
echo ""

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 You need to login to Fly.io first"
    flyctl auth login
fi

echo "✅ Logged in to Fly.io"
echo ""

# Check if app exists
if ! flyctl status &> /dev/null; then
    echo "📦 Creating new Fly.io app..."
    echo ""
    echo "⚠️  IMPORTANT: After running 'flyctl launch', DO NOT deploy yet!"
    echo "We need to set environment variables first."
    echo ""
    read -p "Press Enter to continue..."
    
    flyctl launch --no-deploy
    
    echo ""
    echo "✅ App created!"
    echo ""
    
    # Create volume
    echo "💾 Creating volume for file uploads..."
    read -p "Enter your preferred region (e.g., iad, lhr, syd): " REGION
    flyctl volumes create promrkts_uploads --region "$REGION" --size 1
    
    echo ""
    echo "⚙️  Now you need to set environment variables."
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (from Supabase - with pgbouncer)"
    echo "  - DIRECT_URL (from Supabase - direct connection)"
    echo "  - JWT_SECRET"
    echo "  - FRONTEND_URL"
    echo "  - BACKEND_URL"
    echo ""
    echo "Run these commands:"
    echo ""
    echo "  flyctl secrets set DATABASE_URL='your-supabase-pooled-url'"
    echo "  flyctl secrets set DIRECT_URL='your-supabase-direct-url'"
    echo "  flyctl secrets set JWT_SECRET='your-secret-key'"
    echo "  flyctl secrets set FRONTEND_URL='https://your-frontend.com'"
    echo "  flyctl secrets set BACKEND_URL='https://your-app.fly.dev'"
    echo ""
    echo "See FLY_DEPLOYMENT_GUIDE.md for complete setup instructions."
    echo ""
    read -p "Press Enter after you've set all environment variables..."
fi

echo "🚀 Deploying to Fly.io..."
flyctl deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Checking app status..."
flyctl status

echo ""
echo "📊 View logs with: flyctl logs"
echo "🌐 Open app with: flyctl open"
echo "🔧 SSH into app with: flyctl ssh console"
echo ""
echo "🎉 Your backend is now live!"
