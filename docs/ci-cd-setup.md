# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline ensures code quality, runs tests, and automates deployments to Vercel.

## Pipeline Architecture

### Main CI Pipeline (`ci.yml`)

The main CI pipeline runs on:
- Push to `main` or `develop` branches
- Pull requests

#### Jobs:

1. **Lint & Format Check**
   - Runs ESLint for code quality
   - Checks TypeScript types with `tsc --noEmit`
   - Ensures no type errors in the codebase

2. **Build Validation**
   - Builds the Next.js application
   - Uploads build artifacts for E2E tests
   - Uses increased memory allocation for large builds

3. **Unit Tests**
   - Runs Jest test suite
   - Generates coverage reports
   - Uploads to Codecov for tracking
   - Enforces 80% coverage threshold

4. **E2E Tests**
   - Uses Playwright for browser testing
   - Downloads build artifacts from build job
   - Runs tests against production build
   - Uploads test reports as artifacts

5. **Bundle Analysis** (PR only)
   - Analyzes bundle sizes
   - Helps identify size regressions
   - Provides visibility into build output

### PR Quality Checks (`pr-checks.yml`)

Additional checks for pull requests:

1. **PR Quality Gates**
   - Enforces conventional commit format
   - Checks PR size (warns if >1000 lines)
   - Detects merge conflicts early

2. **Security Checks**
   - Runs `npm audit` for vulnerabilities
   - Uses `audit-ci` for stricter checks
   - Reports security issues

3. **Auto Labeling**
   - Labels PRs based on files changed
   - Helps with PR organization

## Local Development

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint

# Check types
npm run typecheck

# Format code
npm run format

# Check formatting
npm run format:check

# Run all CI checks locally
npm run ci
```

### Pre-commit Checks

Before committing, ensure:
1. All tests pass
2. No linting errors
3. Code is properly formatted
4. TypeScript has no errors

## Deployment Process

1. **Development**
   - Create feature branch
   - Make changes
   - Push branch and create PR
   - CI runs all checks

2. **Review**
   - All checks must pass
   - Code review required
   - Merge to main/develop

3. **Deployment**
   - Push to main triggers deployment
   - Vercel automatically deploys
   - Preview deployments for PRs

## Configuration Files

### Jest Configuration (`jest.config.js`)
- Configured for Next.js
- 80% coverage threshold
- Excludes Playwright tests
- Handles ESM modules

### ESLint Configuration (`.eslintrc.json`)
- Extends Next.js core web vitals
- Custom rules for code quality

### Prettier Configuration (`.prettierrc.json`)
- Consistent code formatting
- No semicolons
- Single quotes
- 80 character line width

## Environment Variables

Required GitHub Secrets:
- `VERCEL_TOKEN` - For deployments
- `VERCEL_ORG_ID` - Vercel organization
- `VERCEL_PROJECT_ID` - Vercel project

## Troubleshooting

### Common Issues

1. **Tests Failing Locally**
   ```bash
   # Clear Jest cache
   npx jest --clearCache
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build Failures**
   ```bash
   # Clear Next.js cache
   npm run clean
   
   # Rebuild
   npm run build
   ```

3. **Type Errors**
   ```bash
   # Check types
   npm run typecheck
   
   # Generate types
   npm run build
   ```

## Best Practices

1. **Keep PRs Small**
   - Easier to review
   - Faster CI runs
   - Less chance of conflicts

2. **Write Tests**
   - Add tests for new features
   - Maintain coverage above 80%
   - Test edge cases

3. **Use Conventional Commits**
   - `feat:` for features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for tests
   - `ci:` for CI changes

4. **Monitor Performance**
   - Check bundle size reports
   - Review build times
   - Optimize when needed

## Maintenance

### Weekly Tasks
- Review and update dependencies
- Check security advisories
- Monitor CI performance
- Clean up old artifacts

### Monthly Tasks
- Review and optimize workflows
- Update documentation
- Audit access permissions
- Review metrics and trends