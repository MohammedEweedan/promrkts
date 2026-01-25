# Git Commit Signing Setup

Your deployment failed because GitHub requires verified commits. Here's how to fix it:

## Quick Fix: Configure Git to Sign Commits

### Option 1: SSH Commit Signing (Easiest - macOS 13+)

```bash
# 1. Check if you have an SSH key
ls -la ~/.ssh

# 2. If you don't have one, generate it
ssh-keygen -t ed25519 -C "your_email@example.com"

# 3. Configure Git to use SSH signing
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# 4. Enable automatic signing
git config --global commit.gpgsign true

# 5. Add your SSH key to GitHub
# Copy your public key:
cat ~/.ssh/id_ed25519.pub

# Go to: https://github.com/settings/keys
# Click "New SSH key" → Choose "Signing Key" → Paste and save
```

### Option 2: GPG Commit Signing (Traditional)

```bash
# 1. Install GPG (if not installed)
brew install gnupg

# 2. Generate GPG key
gpg --full-generate-key
# Choose: RSA and RSA, 4096 bits, no expiration
# Enter your name and email (must match GitHub)

# 3. List your GPG keys
gpg --list-secret-keys --keyid-format=long

# 4. Copy your GPG key ID (after sec rsa4096/)
# Example: sec rsa4096/ABC123DEF456 → copy ABC123DEF456

# 5. Configure Git
git config --global user.signingkey ABC123DEF456
git config --global commit.gpgsign true

# 6. Export your GPG public key
gpg --armor --export ABC123DEF456

# 7. Add to GitHub
# Go to: https://github.com/settings/keys
# Click "New GPG key" → Paste the key → Save
```

## Fix Your Existing Commits

After setting up signing, you need to re-sign your recent commits:

```bash
cd /Users/moeawidan/Downloads/promrkts

# Option A: Amend and force push (if you just pushed)
git commit --amend --no-edit -S
git push -f origin main

# Option B: Rebase and sign all recent commits
git rebase --exec 'git commit --amend --no-edit -n -S' -i HEAD~3
git push -f origin main
```

## Verify It's Working

```bash
# Check if signing is enabled
git config --global commit.gpgsign

# Make a test commit
echo "test" >> test.txt
git add test.txt
git commit -m "test: verify signing"

# Check if commit is signed
git log --show-signature -1

# You should see "Good signature" or "Signature made"
```

## Troubleshooting

### Error: "gpg failed to sign the data"
```bash
# Set GPG TTY
echo 'export GPG_TTY=$(tty)' >> ~/.zshrc
source ~/.zshrc

# Test GPG
echo "test" | gpg --clearsign
```

### Error: "No secret key"
```bash
# List keys again
gpg --list-secret-keys --keyid-format=long

# Make sure the key ID matches
git config --global user.signingkey YOUR_KEY_ID
```

### SSH Signing Not Working
```bash
# Make sure you're using the public key (.pub)
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# Verify format
git config --global gpg.format ssh
```

## Quick Commands for Your Repo

```bash
cd /Users/moeawidan/Downloads/promrkts

# 1. Set up SSH signing (recommended)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# 2. Add SSH key to GitHub as "Signing Key"
cat ~/.ssh/id_ed25519.pub
# Copy output and add at: https://github.com/settings/keys

# 3. Re-sign last 3 commits
git rebase --exec 'git commit --amend --no-edit -n -S' -i HEAD~3

# 4. Force push
git push -f origin main
```

## Verification

After setup, every commit will be signed automatically. GitHub will show a "Verified" badge next to your commits.

Visit your repo to confirm: https://github.com/MohammedEweedan/promrkts/commits/main
