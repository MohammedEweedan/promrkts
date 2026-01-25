# Allow Unsigned Commits in Vercel Deployments

The "unverified commit" error comes from GitHub branch protection rules, not Vercel itself.

## Quick Fix: Disable GitHub Branch Protection

### Option 1: Via GitHub Web UI (Easiest)

1. **Go to your repository settings:**
   https://github.com/MohammedEweedan/promrkts/settings/branches

2. **Find "Branch protection rules"**

3. **If you see a rule for `main` branch:**
   - Click "Edit" on the rule
   - **Uncheck:** "Require signed commits"
   - Click "Save changes"

4. **If no rules exist:**
   - You're good! The issue might be from Vercel's Git integration settings

### Option 2: Disable via GitHub CLI

```bash
# Remove branch protection entirely
gh api -X DELETE /repos/MohammedEweedan/promrkts/branches/main/protection

# Or just disable signed commits requirement
gh api -X PUT /repos/MohammedEweedan/promrkts/branches/main/protection \
  -f required_signatures=false
```

## Alternative: Configure Vercel to Ignore Commit Verification

### Via Vercel Dashboard

1. **Go to your Vercel project:**
   https://vercel.com/dashboard

2. **Select your project:** `promrkts`

3. **Go to:** Settings → Git

4. **Look for:** "Ignored Build Step" or "Git Configuration"

5. **If you see commit verification options:**
   - Disable "Require verified commits"
   - Or set "Deploy on all commits" regardless of verification

### Via vercel.json

Add this to your `vercel.json` file:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "github": {
    "silent": true,
    "autoAlias": false
  }
}
```

## Simplest Solution: Just Push Without Signing

If you want to stop signing commits entirely:

```bash
# Disable commit signing globally
git config --global commit.gpgsign false

# Amend last commit without signature
git commit --amend --no-edit --no-gpg-sign

# Force push
git push -f origin main
```

## Check Current Settings

```bash
# Check if you have branch protection
gh api /repos/MohammedEweedan/promrkts/branches/main/protection

# Check your Git signing config
git config --global commit.gpgsign

# Check Vercel deployment status
vercel ls
```

## Most Likely Issue

The error is probably from:
1. **GitHub branch protection** requiring signed commits
2. **Vercel's Git integration** respecting GitHub's branch protection rules

**Solution:** Just disable the branch protection rule for now, or keep signing enabled (which you already set up).

## Quick Commands

```bash
# Option A: Disable signing and re-push
git config --global commit.gpgsign false
git commit --amend --no-edit --no-gpg-sign
git push -f origin main

# Option B: Keep signing enabled (already done)
# Just make sure the SSH key is added to GitHub as a SIGNING KEY
# Then deployments will work automatically
```

Your commits are already signed now, so Vercel should accept them. If it still fails, the issue is likely GitHub branch protection.
