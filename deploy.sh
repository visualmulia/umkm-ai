#!/bin/bash
# Deploy script for UMKM-AI to Vercel
# Usage: ./deploy.sh

echo "🚀 UMKM-AI Deploy Script"
echo "========================"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check env vars
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL not set!"
    echo "Set it first: export DATABASE_URL=mysql://..."
fi

# Build
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Done! Check your Vercel dashboard for the URL."
