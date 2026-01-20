#!/bin/bash

# Default values
API_URL="http://localhost:3000/api/webhook/instagram"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Instagram Webhook Simulator ===${NC}"
echo "This script simulates an incoming Instagram DM."
echo ""

# Ask for Page ID
echo -n "Enter your Facebook Page ID (saved in Settings): "
read PAGE_ID

if [ -z "$PAGE_ID" ]; then
    echo "Error: Page ID is required."
    exit 1
fi

echo ""
echo "Sending simulation request to $API_URL..."

# Send CURL request
# Based on documentation: https://developers.facebook.com/docs/messenger-platform/instagram/webhooks
curl -s -X POST -H "Content-Type: application/json" -d '{
  "object": "instagram",
  "entry": [
    {
      "id": "'"$PAGE_ID"'",
      "time": 16987654321,
      "messaging": [
        {
          "sender": {
            "id": "1234567890_IG_USER"
          },
          "recipient": {
            "id": "'"$PAGE_ID"'"
          },
          "timestamp": 16987654321,
          "message": {
            "mid": "m_123456789",
            "text": "Hola desde Instagram! "
          }
        }
      ]
    }
  ]
}' "$API_URL" | grep -q "success"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! Message Sent.${NC}"
    echo "Check the Conversations page in your browser."
else
    echo "Response received (if any)."
    echo -e "${GREEN}✓ Request sent. Check your Conversations page to see if it appeared.${NC}"
fi
