# Security Improvements Implementation Guide

This guide provides step-by-step instructions for implementing the security improvements identified in the security assessment.

## 1. Remove Sensitive Data from Version Control

### Remove `.env.local` from Git history:
```bash
# Remove the file from the repository
git rm --cached src/.env.local

# Commit the removal
git commit -m "Remove .env.local from version control"

# Force push to remove from history (WARNING: This rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/.env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Alternative using BFG Repo-Cleaner (recommended for large repos)
# Install BFG: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env.local
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

### Rotate Firebase API Keys:
1. Go to Firebase Console > Project Settings
2. Generate new API keys
3. Update all deployment environments with new keys
4. Invalidate old keys

## 2. Update API Routes to Use New Middleware

### Example: Update Admin Routes
```typescript
// Before:
export async function GET(request: NextRequest) {
  // Manual auth check
  const session = request.cookies.get('session');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ... rest of code
}

// After:
import { withAuth } from '@/middleware/auth';

export const GET = withAuth(
  async (request) => {
    // User is already authenticated
    const { user } = request;
    // ... rest of code
  },
  { requireAdmin: true, rateLimit: 'api' }
);
```

## 3. Add Environment Validation

### Add to your app initialization:
```typescript
// In src/app/layout.tsx or src/app/api/[...]/route.ts
import { validateEnvironment, logValidationResult } from '@/lib/env-validation';

// Run validation on startup
if (typeof window === 'undefined') {
  const validation = validateEnvironment();
  logValidationResult(validation);
  
  if (!validation.valid && process.env.NODE_ENV === 'production') {
    throw new Error('Environment validation failed in production');
  }
}
```

## 4. Update next.config.ts with Security Headers

```typescript
import { applySecurityHeaders } from '@/lib/security-headers';

const nextConfig = {
  // ... existing config
};

export default applySecurityHeaders(nextConfig);
```

## 5. Add Input Validation to API Routes

### Example: Blog Post Creation
```typescript
import { createBlogPostSchema, validateRequest, formatValidationErrors } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = validateRequest(createBlogPostSchema)(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: formatValidationErrors(validation.errors) },
      { status: 400 }
    );
  }
  
  // Use validated data
  const { data } = validation;
  // ... create blog post
}
```

## 6. Set Up Production Environment Variables

### Required for Production:
```env
# Security Keys (generate strong random values)
SESSION_SECRET_KEY=<generate-using-openssl-rand-base64-32>
ENCRYPTION_KEY=<generate-using-openssl-rand-hex-32>
BLOG_API_SECRET_KEY=<generate-using-openssl-rand-base64-32>

# Admin Configuration
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json

# Monitoring (optional but recommended)
SENTRY_DSN=your-sentry-dsn
ADMIN_API_KEY=<for-accessing-error-stats>
```

### Generate Secure Keys:
```bash
# Generate SESSION_SECRET_KEY
openssl rand -base64 32

# Generate ENCRYPTION_KEY (hex format)
openssl rand -hex 32

# Generate BLOG_API_SECRET_KEY
openssl rand -base64 32
```

## 7. Implement CSRF Protection

### For forms that modify data:
```typescript
// In your form component
import { generateCSRFToken } from '@/lib/security/encryption';

function MyForm() {
  const [csrfToken] = useState(() => generateCSRFToken());
  
  // Set CSRF token in cookie
  useEffect(() => {
    document.cookie = `csrf-token=${csrfToken}; path=/; samesite=strict`;
  }, [csrfToken]);
  
  // Include in form submission
  const handleSubmit = async (data) => {
    await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(data)
    });
  };
}
```

## 8. Update Firestore Security Rules

Add to `firestore.rules`:
```javascript
// Rate limiting function
function rateLimit(resource, requests, seconds) {
  return request.time > resource.data.lastWrite + duration.value(seconds, 's') ||
         resource.data.writeCount < requests;
}

// Input validation
match /users/{userId} {
  allow write: if request.auth != null 
    && request.auth.uid == userId
    && request.resource.data.email is string
    && request.resource.data.email.matches('^[^@]+@[^@]+\\.[^@]+$')
    && request.resource.data.email.size() < 255
    && request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.name.size() < 100;
}
```

## 9. Set Up Monitoring

### Error Monitoring:
1. Sign up for Sentry (https://sentry.io)
2. Add Sentry DSN to environment variables
3. Initialize Sentry in your app

### Security Monitoring:
1. Set up alerts for:
   - Failed authentication attempts
   - Rate limit violations
   - CSRF token mismatches
   - Invalid API key usage

## 10. Regular Security Tasks

### Daily:
- Monitor error logs for security issues
- Check for unusual authentication patterns

### Weekly:
- Review security alerts
- Update dependencies with security patches

### Monthly:
- Rotate API keys
- Review admin access list
- Audit security headers

### Quarterly:
- Full security audit
- Penetration testing
- Review and update security policies

## Testing Security Improvements

### Test Authentication:
```bash
# Test without authentication
curl -X GET https://your-app.com/api/admin/stats
# Should return 401

# Test with invalid session
curl -X GET https://your-app.com/api/admin/stats \
  -H "Cookie: session=invalid"
# Should return 401
```

### Test Rate Limiting:
```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl -X POST https://your-app.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
done
# Should start returning 429 after limit
```

### Test CSP Headers:
```bash
# Check security headers
curl -I https://your-app.com
# Should show Content-Security-Policy and other security headers
```

## Deployment Checklist

Before deploying to production:
- [ ] All environment variables are set
- [ ] Firebase API keys are rotated
- [ ] Admin emails are configured
- [ ] Security headers are active
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] CSRF protection is active
- [ ] Error monitoring is configured
- [ ] Audit logging is enabled
- [ ] All tests pass