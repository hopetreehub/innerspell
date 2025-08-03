# GitHub Actions Workflows

This directory contains all CI/CD workflows for the InnerSpell project.

## Continuous Integration (CI)

### `ci.yml`
- **Trigger**: Push to main/develop, Pull Requests
- **Purpose**: Quality gates for code changes
- **Jobs**: Lint, TypeCheck, Build, Unit Tests, E2E Tests
- **Status**: ✅ Implemented

### `pr-checks.yml`
- **Trigger**: Pull Request events
- **Purpose**: Additional PR-specific validations
- **Status**: ✅ Implemented

## Continuous Deployment (CD)

### `cd.yml`
- **Trigger**: Push to develop/main, Manual dispatch
- **Purpose**: Main deployment pipeline
- **Features**:
  - Auto-deploy to staging (develop branch)
  - Manual approval for production (main branch)
  - Smoke tests after deployment
  - Automatic rollback on failure
  - Slack/Discord notifications
- **Status**: ✅ Implemented

### `deploy-production.yml`
- **Trigger**: Manual workflow dispatch
- **Purpose**: Production deployment with enhanced checks
- **Features**:
  - Pre-deployment validation
  - Manual approval gate (can be bypassed for emergencies)
  - Production-specific smoke tests
  - Post-deployment monitoring (5 minutes)
  - Comprehensive notifications
- **Status**: ✅ Implemented

### `rollback.yml`
- **Trigger**: Manual workflow dispatch
- **Purpose**: Emergency rollback procedure
- **Features**:
  - Rollback to previous deployment
  - Creates incident issue for tracking
  - Validates rollback target
  - Notifies team of rollback
- **Status**: ✅ Implemented

## Security & Maintenance

### `secret-rotation.yml`
- **Purpose**: Automated secret rotation
- **Status**: ✅ Implemented

### `security-monitoring.yml`
- **Purpose**: Security scanning and monitoring
- **Status**: ✅ Implemented

## Helper Workflows

### `vercel-integration.yml`
- **Trigger**: Manual workflow dispatch
- **Purpose**: Setup and test Vercel integration
- **Actions**:
  - `setup`: Check configuration
  - `test`: Test Vercel connection
  - `list-secrets`: Show required secrets
- **Status**: ✅ Implemented

## Required Secrets

### Vercel (Required)
- `VERCEL_TOKEN`: Personal access token
- `VERCEL_ORG_ID`: Organization/Team ID
- `VERCEL_PROJECT_ID`: Project ID

### Notifications (Optional)
- `SLACK_WEBHOOK_URL`: Slack incoming webhook
- `DISCORD_WEBHOOK_URL`: Discord webhook

### Security
- `SNYK_TOKEN`: For vulnerability scanning
- Other Firebase/API secrets as needed

## GitHub Environments

Configure these in Settings → Environments:

1. **staging**
   - No protection rules
   - Auto-deploy enabled

2. **production**
   - Required reviewers: 1-2
   - Restrict to main branch

3. **production-approval**
   - Manual approval gate
   - Required reviewers

4. **production-rollback**
   - Emergency rollback approval
   - 1 reviewer minimum

## Quick Commands

### Deploy to Staging
```bash
git checkout develop
git merge feature/your-feature
git push origin develop
```

### Deploy to Production
```bash
git checkout main
git merge develop
git push origin main
# Then approve in GitHub Actions
```

### Emergency Rollback
1. Go to Actions → Emergency Rollback
2. Run workflow with environment and reason
3. Approve the rollback

### Test Vercel Setup
```bash
gh workflow run vercel-integration.yml -f action=test
```

## Monitoring

- **Vercel Dashboard**: Real-time logs and metrics
- **GitHub Actions**: Workflow run history
- **Health Endpoint**: `/api/health` for deployment validation
- **Notifications**: Slack/Discord for deployment events

## Troubleshooting

See `.github/docs/cd-pipeline-setup.md` for detailed troubleshooting guide.