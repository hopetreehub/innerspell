#!/bin/bash

# GitHub Secrets Setup Script
# This script helps set up GitHub Secrets for the project

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}GitHub Secrets Setup${NC}"
echo "====================="
echo

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "Repository: ${GREEN}$REPO${NC}"
echo

# Function to set a secret
set_secret() {
    local name=$1
    local description=$2
    local required=${3:-true}
    
    echo -e "${YELLOW}Setting up: $name${NC}"
    echo "Description: $description"
    
    if [ "$required" == "true" ]; then
        echo -n "Enter value for $name: "
        read -s value
        echo
        
        if [ -z "$value" ]; then
            echo -e "${RED}Error: Value cannot be empty for required secret.${NC}"
            return 1
        fi
    else
        echo -n "Enter value for $name (optional, press Enter to skip): "
        read -s value
        echo
        
        if [ -z "$value" ]; then
            echo "Skipping optional secret."
            return 0
        fi
    fi
    
    # Set the secret
    echo "$value" | gh secret set "$name"
    echo -e "${GREEN}✓ $name set successfully${NC}"
    echo
}

# Firebase Client Secrets
echo -e "${GREEN}Firebase Client Configuration${NC}"
echo "============================="
echo "These are public-facing configuration values for Firebase SDK."
echo "While they are exposed in the client code, they should still be managed as secrets."
echo

set_secret "NEXT_PUBLIC_FIREBASE_API_KEY" "Firebase Web API Key"
set_secret "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "Firebase Auth Domain (e.g., your-project.firebaseapp.com)"
set_secret "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "Firebase Project ID"
set_secret "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "Firebase Storage Bucket (e.g., your-project.appspot.com)"
set_secret "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "Firebase Cloud Messaging Sender ID"
set_secret "NEXT_PUBLIC_FIREBASE_APP_ID" "Firebase App ID"

# Firebase Admin Secrets
echo
echo -e "${GREEN}Firebase Admin Configuration${NC}"
echo "============================="
echo "This is the service account key for server-side Firebase Admin SDK."
echo "This should be the entire JSON key file content."
echo

echo -e "${YELLOW}For FIREBASE_SERVICE_ACCOUNT_KEY:${NC}"
echo "1. Go to Firebase Console > Project Settings > Service Accounts"
echo "2. Click 'Generate new private key'"
echo "3. Copy the entire JSON content"
echo
echo -n "Paste the service account JSON (press Enter twice when done): "

# Read multi-line input for service account
service_account=""
while IFS= read -r line; do
    if [ -z "$line" ]; then
        break
    fi
    service_account="${service_account}${line}"
done

if [ -n "$service_account" ]; then
    echo "$service_account" | gh secret set "FIREBASE_SERVICE_ACCOUNT_KEY"
    echo -e "${GREEN}✓ FIREBASE_SERVICE_ACCOUNT_KEY set successfully${NC}"
else
    echo -e "${YELLOW}Skipped FIREBASE_SERVICE_ACCOUNT_KEY${NC}"
fi

# Application Secrets
echo
echo -e "${GREEN}Application Secrets${NC}"
echo "==================="
echo

# Generate a secure session secret if not provided
echo -e "${YELLOW}Setting up: SESSION_SECRET_KEY${NC}"
echo "Description: Session encryption key (will generate a secure random key if not provided)"
echo -n "Enter value for SESSION_SECRET_KEY (press Enter to auto-generate): "
read -s session_secret
echo

if [ -z "$session_secret" ]; then
    session_secret=$(openssl rand -base64 32)
    echo "Generated secure random session secret."
fi

echo "$session_secret" | gh secret set "SESSION_SECRET_KEY"
echo -e "${GREEN}✓ SESSION_SECRET_KEY set successfully${NC}"

# Optional Secrets
echo
echo -e "${GREEN}Optional Secrets${NC}"
echo "================"
echo

set_secret "SENTRY_DSN" "Sentry error monitoring DSN (optional)" false
set_secret "SMTP_HOST" "SMTP server hostname (optional)" false
set_secret "SMTP_PORT" "SMTP server port (optional)" false
set_secret "SMTP_USER" "SMTP username (optional)" false
set_secret "SMTP_PASS" "SMTP password (optional)" false

# Vercel-specific secrets
echo
echo -e "${GREEN}Deployment Secrets${NC}"
echo "=================="
echo

set_secret "VERCEL_TOKEN" "Vercel API token for automated deployments (optional)" false

# Summary
echo
echo -e "${GREEN}Setup Complete!${NC}"
echo "==============="
echo
echo "GitHub Secrets have been configured for your repository."
echo
echo "Next steps:"
echo "1. Verify secrets are set: gh secret list"
echo "2. Update your Vercel environment variables to match"
echo "3. Test your application deployment"
echo
echo -e "${YELLOW}Security Reminder:${NC}"
echo "- Never commit secrets to your repository"
echo "- Rotate secrets regularly using the automated workflow"
echo "- Monitor security alerts in your repository settings"