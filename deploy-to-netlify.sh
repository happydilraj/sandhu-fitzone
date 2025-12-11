#!/bin/bash

echo "🚀 Sandhu Fitzone - Netlify Deployment Helper"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized!"
    echo "Run: git init"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo "📝 No GitHub remote found."
    echo ""
    echo "Please follow these steps:"
    echo "1. Create a new repository on GitHub: https://github.com/new"
    echo "2. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    exit 0
else
    echo "✅ GitHub remote configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote: $REMOTE_URL"
    echo ""
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "   You'll need to add environment variables in Netlify dashboard"
else
    echo "✅ Environment variables file found (.env.local)"
    echo ""
    echo "📋 Remember to add these to Netlify:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - NODE_VERSION=18"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub (if not done already)"
echo "2. Go to https://app.netlify.com/"
echo "3. Click 'Add new site' → 'Import an existing project'"
echo "4. Select your GitHub repository"
echo "5. Add environment variables"
echo "6. Click 'Deploy site'"
echo ""
echo "📖 Full guide: See DEPLOYMENT_GUIDE.md"
echo ""
