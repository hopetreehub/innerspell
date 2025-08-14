# 긴급 환경변수 설정

Vercel Dashboard에서 다음 환경변수를 추가하세요:

```bash
# 보안 키 (필수)
ENCRYPTION_KEY=temporary-encryption-key-32chars-12345
BLOG_API_SECRET_KEY=temporary-blog-api-secret-32chars-678

# Firebase Client SDK (임시값)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDummyKeyForTesting123456789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# AI Provider (임시값)
OPENAI_API_KEY=sk-dummy-key-for-testing-only

# Admin Email
ADMIN_EMAILS=admin@innerspell.com
```

⚠️ 주의: 이는 임시 해결책입니다. 실제 값으로 교체해야 합니다.