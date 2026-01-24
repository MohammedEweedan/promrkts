#!/bin/bash

echo "🔄 Resetting and seeding fake users..."
echo ""

# Step 1: Cleanup existing fake users
echo "Step 1: Cleaning up existing fake users..."
npx ts-node scripts/cleanup-fake-users.ts

if [ $? -ne 0 ]; then
  echo "❌ Cleanup failed"
  exit 1
fi

echo ""
echo "Step 2: Seeding new realistic users..."
npm run seed:fast

if [ $? -ne 0 ]; then
  echo "❌ Seeding failed"
  exit 1
fi

echo ""
echo "✅ All done! Fake users have been reset with realistic data."
