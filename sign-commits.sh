#!/bin/bash

echo "🔐 Git Commit Signing Setup"
echo "============================"
echo ""

# Check if signing is configured
if git config --global commit.gpgsign | grep -q "true"; then
    echo "✅ Git commit signing is enabled"
else
    echo "❌ Git commit signing is NOT enabled"
    exit 1
fi

echo ""
echo "📋 Your SSH Public Key (for GitHub):"
echo "------------------------------------"
cat ~/.ssh/id_ed25519_github.pub
echo ""
echo "------------------------------------"
echo ""
echo "⚠️  IMPORTANT: Add this key to GitHub as a SIGNING KEY"
echo "   1. Go to: https://github.com/settings/keys"
echo "   2. Click 'New SSH key'"
echo "   3. Choose 'Signing Key' as the type"
echo "   4. Paste the key above"
echo "   5. Click 'Add SSH key'"
echo ""
read -p "Press ENTER after you've added the key to GitHub..."

echo ""
echo "🔄 Re-signing last 3 commits..."

# Amend the last commit with signature
git commit --amend --no-edit -S

echo ""
echo "✅ Last commit signed!"
echo ""
echo "🚀 Now force push to GitHub:"
echo "   git push -f origin main"
echo ""
