#!/bin/bash

# Default values
API_URL="http://localhost:3000/api/webhook/whatsapp"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== WhatsApp Webhook Simulator ===${NC}"
echo "This script simulates an incoming message to Create a Conversation in Varylo."
echo ""

# Ask for Phone Number ID
echo -n "Enter your Phone Number ID (saved in Settings): "
read PHONE_ID

if [ -z "$PHONE_ID" ]; then
    echo "Error: Phone Number ID is required."
    exit 1
fi

echo ""
echo "Sending simulation request to $API_URL..."

# Send CURL request
curl -s -X POST -H "Content-Type: application/json" -d '{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15555555555",
              "phone_number_id": "'"$PHONE_ID"'"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Cliente de Prueba"
                },
                "wa_id": "5215551234567"
              }
            ],
            "messages": [
              {
                "from": "5215551234567",
                "id": "wamid.HBgLM...",
                "timestamp": "1705436600",
                "text": {
                  "body": "Hola! Esto es un mensaje de prueba simulado."
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
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
