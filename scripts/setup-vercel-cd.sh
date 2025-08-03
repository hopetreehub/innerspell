#!/bin/bash

# Setup script for Vercel CD Pipeline
# This script helps configure the necessary secrets and settings

echo "🚀 Vercel CD Pipeline Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not logged in to GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is ready${NC}"
echo ""

# Function to set a GitHub secret
set_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  Skipping $secret_name (no value provided)${NC}"
        return
    fi
    
    echo "$secret_value" | gh secret set "$secret_name"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Set $secret_name${NC}"
    else
        echo -e "${RED}❌ Failed to set $secret_name${NC}"
    fi
}

# Check current repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repository: $REPO"
echo ""

# Prompt for Vercel secrets
echo "📝 Please provide your Vercel configuration:"
echo "You can find these at: https://vercel.com/account/tokens"
echo ""

read -p "VERCEL_TOKEN: " VERCEL_TOKEN
read -p "VERCEL_ORG_ID (Team ID): " VERCEL_ORG_ID
read -p "VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID

echo ""
echo "📝 Optional: Notification webhooks (press Enter to skip)"
read -p "SLACK_WEBHOOK_URL: " SLACK_WEBHOOK_URL
read -p "DISCORD_WEBHOOK_URL: " DISCORD_WEBHOOK_URL

echo ""
echo "🔧 Setting GitHub Secrets..."

# Set required secrets
set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
set_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID"
set_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID"

# Set optional secrets
set_secret "SLACK_WEBHOOK_URL" "$SLACK_WEBHOOK_URL"
set_secret "DISCORD_WEBHOOK_URL" "$DISCORD_WEBHOOK_URL"

echo ""
echo "🔧 Creating GitHub Environments..."

# Create environments
create_environment() {
    local env_name=$1
    local protection_rules=$2
    
    echo "Creating environment: $env_name"
    
    # This requires GitHub API calls
    if [ "$protection_rules" = "true" ]; then
        echo "Note: Please manually configure protection rules for $env_name in GitHub Settings"
    fi
}

# Note: Environment creation via CLI is limited, so we'll provide instructions
echo ""
echo -e "${YELLOW}📋 Manual Steps Required:${NC}"
echo ""
echo "1. Go to: https://github.com/$REPO/settings/environments"
echo ""
echo "2. Create these environments:"
echo "   - staging (no protection rules)"
echo "   - production (add required reviewers)"
echo "   - production-approval (add required reviewers)"
echo "   - production-rollback (add 1 reviewer for emergencies)"
echo ""
echo "3. For 'production' environment:"
echo "   - Add required reviewers"
echo "   - Restrict to 'main' branch only"
echo ""

# Test the setup
echo "🧪 Would you like to test the Vercel connection? (y/n)"
read -p "> " test_connection

if [ "$test_connection" = "y" ]; then
    echo ""
    echo "Running Vercel Integration test workflow..."
    gh workflow run vercel-integration.yml -f action=test
    echo ""
    echo "Check the workflow status at: https://github.com/$REPO/actions"
fi

echo ""
echo -e "${GREEN}✅ Setup script completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Complete the manual environment setup in GitHub Settings"
echo "2. Run a test deployment to staging: git push origin develop"
echo "3. Configure branch protection rules for main and develop branches"
echo ""
echo "For more information, see: .github/docs/cd-pipeline-setup.md"