#!/bin/bash

API_URL="http://localhost:3003"
ADMIN_EMAIL="123@test.com"  # Replace with your admin email
ADMIN_PASSWORD="11223344"  # Replace with your admin password
TOTAL_USERS=75000
BATCH_SIZE=200

# Login and get token
echo "Logging in as admin..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to login"
  exit 1
fi

echo "✓ Logged in successfully"
echo ""

# Calculate batches
BATCHES=$(( ($TOTAL_USERS + $BATCH_SIZE - 1) / $BATCH_SIZE ))
echo "Creating $TOTAL_USERS fake users in $BATCHES batches..."
echo ""

TOTAL_CREATED=0

# Create users in batches
for ((i=1; i<=BATCHES; i++)); do
  REMAINING=$(($TOTAL_USERS - $TOTAL_CREATED))
  COUNT=$(($REMAINING < $BATCH_SIZE ? $REMAINING : $BATCH_SIZE))
  
  echo "Batch $i/$BATCHES: Creating $COUNT users..."
  
  RESPONSE=$(curl -s -X POST "$API_URL/admin/fakes/users" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"locale\":\"ar\",\"count\":$COUNT,\"domain\":\"example.com\"}")
  
  CREATED=$(echo $RESPONSE | jq -r '.data | length')
  TOTAL_CREATED=$(($TOTAL_CREATED + $CREATED))
  
  echo "✓ Created $CREATED users (Total: $TOTAL_CREATED/$TOTAL_USERS)"
  echo ""
  
  # Small delay
  sleep 0.1
done

echo "✅ Successfully created $TOTAL_CREATED fake users!"
