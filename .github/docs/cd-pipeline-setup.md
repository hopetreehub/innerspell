# CD Pipeline Setup Guide

## Overview

This guide covers the setup and configuration of the Continuous Deployment (CD) pipeline for the InnerSpell project using GitHub Actions and Vercel.

## Pipeline Features

### 1. **Automated Deployments**
- **Staging**: Auto-deploys on push to `develop` branch
- **Production**: Requires manual approval on push to `main` branch
- **Manual Deployment**: Can trigger deployment to any environment

### 2. **Post-Deployment Validation**
- Automated smoke tests using Playwright
- Health check monitoring
- Performance validation
- Rollback capabilities

### 3. **Notifications**
- Slack integration for deployment status
- Discord webhook support
- GitHub deployment status updates

## Setup Instructions

### Step 1: Vercel Configuration

1. **Create Vercel Account & Project**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Note your project name

2. **Generate Access Token**
   - Go to [Account Settings → Tokens](https://vercel.com/account/tokens)
   - Create new token with appropriate scope
   - Copy the token (you won't see it again!)

3. **Get Organization and Project IDs**
   - Organization ID: [Account Settings](https://vercel.com/account) → General → Team ID
   - Project ID: Project Settings → General → Project ID

### Step 2: GitHub Secrets Configuration

Add the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets
```yaml
VERCEL_TOKEN: your-vercel-personal-access-token
VERCEL_ORG_ID: team_xxxxxxxxxxxxx
VERCEL_PROJECT_ID: prj_xxxxxxxxxxxxx
```

#### Optional Secrets (for notifications)
```yaml
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/xxx/xxx/xxx
DISCORD_WEBHOOK_URL: https://discord.com/api/webhooks/xxx/xxx
```

### Step 3: GitHub Environments Setup

1. Go to Settings → Environments
2. Create the following environments:

#### Staging Environment
- Name: `staging`
- No protection rules (auto-deploy)
- Add environment URL: `https://staging-your-project.vercel.app`

#### Production Environment
- Name: `production`
- Protection rules:
  - Required reviewers: 1-2 team members
  - Restrict deployment branches: `main` only
- Add environment URL: `https://your-project.vercel.app`

#### Production Approval Environment
- Name: `production-approval`
- Protection rules:
  - Required reviewers: Team leads/managers
  - Wait timer: 5 minutes (optional)

#### Production Rollback Environment
- Name: `production-rollback`
- Protection rules:
  - Required reviewers: 1 team member
  - For emergency use only

### Step 4: Branch Protection Rules

Configure branch protection for safe deployments:

#### Main Branch Protection
- Require pull request reviews: 2
- Dismiss stale reviews
- Require status checks:
  - `CI Pipeline / CI Status Check`
  - `Deploy to Production / Production Smoke Tests`
- Require branches to be up to date
- Include administrators

#### Develop Branch Protection
- Require pull request reviews: 1
- Require status checks:
  - `CI Pipeline / CI Status Check`
- Require branches to be up to date

## Usage Guide

### Automatic Deployments

1. **Staging Deployment**
   ```bash
   git checkout develop
   git merge feature/your-feature
   git push origin develop
   # Automatically deploys to staging
   ```

2. **Production Deployment**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # Requires manual approval in GitHub Actions
   ```

### Manual Deployments

1. Go to Actions → Deploy to Production
2. Click "Run workflow"
3. Select options:
   - Skip tests (not recommended)
   - Emergency deployment (skips approval)
4. Click "Run workflow"

### Emergency Rollback

1. Go to Actions → Emergency Rollback
2. Click "Run workflow"
3. Select environment and provide reason
4. Optionally specify exact deployment URL
5. Click "Run workflow"

## Monitoring & Debugging

### Health Check Endpoint
The pipeline uses `/api/health` to validate deployments:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-03T12:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "ai": "available"
  }
}
```

### Smoke Tests
Located in the workflow, tests include:
- Homepage accessibility
- Critical page routes
- API endpoint validation
- Console error checking
- Performance metrics

### Deployment Logs
- Vercel Dashboard: Real-time logs
- GitHub Actions: Workflow run logs
- Notifications: Slack/Discord alerts

## Troubleshooting

### Common Issues

1. **"Missing required secrets" error**
   - Verify all Vercel secrets are set correctly
   - Run the Vercel Integration Setup workflow

2. **Deployment fails with "command not found"**
   - Ensure `vercel` is in package.json dependencies
   - Check NODE_VERSION in workflow matches project

3. **Smoke tests fail**
   - Check deployment URL is accessible
   - Verify health endpoint returns 200
   - Review Playwright test logs

4. **Rollback fails**
   - Ensure previous deployment exists
   - Check Vercel API permissions
   - Verify deployment URL format

### Debug Commands

Test Vercel connection:
```bash
vercel whoami
vercel list
```

Check deployment status:
```bash
vercel inspect [deployment-url]
```

## Best Practices

1. **Always test in staging first**
   - Merge to develop before main
   - Verify staging deployment
   - Run manual tests if needed

2. **Use semantic commit messages**
   - feat: New features
   - fix: Bug fixes
   - perf: Performance improvements
   - docs: Documentation updates

3. **Monitor post-deployment**
   - Check health endpoint
   - Review error logs
   - Monitor performance metrics

4. **Emergency procedures**
   - Keep rollback workflow ready
   - Document incident in issues
   - Notify team via Slack/Discord

## Workflow Files

- `.github/workflows/cd.yml` - Main CD pipeline
- `.github/workflows/deploy-production.yml` - Production deployment with approval
- `.github/workflows/rollback.yml` - Emergency rollback mechanism
- `.github/workflows/vercel-integration.yml` - Setup and testing helper

## Security Considerations

1. **Secret Management**
   - Rotate Vercel tokens regularly
   - Use environment-specific secrets
   - Limit token permissions

2. **Approval Requirements**
   - Production requires manual approval
   - Emergency deployments logged
   - Rollbacks create incident issues

3. **Monitoring**
   - All deployments are logged
   - Failed deployments trigger alerts
   - Health checks prevent bad deployments

## Next Steps

1. Run the Vercel Integration Setup workflow to verify configuration
2. Test staging deployment with a small change
3. Configure notification webhooks
4. Train team on deployment procedures
5. Document environment-specific configurations