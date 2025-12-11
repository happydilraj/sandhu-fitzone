#!/bin/bash

echo "🔑 GitHub Authentication Fix"
echo "============================"
echo ""
echo "GitHub no longer supports password authentication."
echo "You need to use a Personal Access Token (PAT)."
echo ""
echo "📋 Steps:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Name it: 'Sandhu Fitzone Deploy'"
echo "4. Select scopes: repo, workflow"
echo "5. Click 'Generate token'"
echo "6. COPY THE TOKEN"
echo ""
read -p "Press Enter after you've created and copied your token..."
echo ""
read -p "Paste your token here: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided!"
    exit 1
fi

echo "🔧 Updating git remote..."
git remote remove origin 2>/dev/null
git remote add origin https://${TOKEN}@github.com/happydilraj/sandhu-fitzone.git

echo "✅ Remote updated!"
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🎉 Your code is now on GitHub!"
    echo ""
    echo "Next step: Deploy to Netlify"
    echo "Go to: https://app.netlify.com/"
else
    echo ""
    echo "❌ Push failed. Please check the error above."
fi
