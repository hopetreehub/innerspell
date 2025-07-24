# ✅ Vercel 환경 변수 체크리스트

## 🔥 필수 Firebase 환경 변수 (우선순위 1)

### 1. Firebase Admin SDK 서비스 계정 키
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"innerspell-an7ce",...}
```
⚠️ **중요**: JSON 전체를 한 줄로 압축해서 입력

### 2. 실제 인증 모드 활성화
```bash
NEXT_PUBLIC_USE_REAL_AUTH=true
```

## 📋 기존 환경 변수 확인 (이미 설정됨)

### Firebase 클라이언트 SDK (6개)
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`

### 보안 및 암호화 (2개)
- ✅ `ENCRYPTION_KEY`
- ✅ `BLOG_API_SECRET_KEY`

### 기타 설정
- ✅ `NEXT_PUBLIC_SITE_URL`
- ✅ `ADMIN_EMAILS`

## 🤖 AI API 키 (선택사항)

최소 1개 이상 필요:
- ⬜ `OPENAI_API_KEY`
- ⬜ `GOOGLE_API_KEY` 또는 `GEMINI_API_KEY`
- ⬜ `ANTHROPIC_API_KEY`

## 🚀 Vercel 설정 방법

### 1. Vercel Dashboard 접속
```
https://vercel.com/dashboard
```

### 2. 프로젝트 → Settings → Environment Variables

### 3. 환경 변수 추가
- **Environment**: Production ✅
- **Add plain text** 선택

### 4. 배포 트리거
- Settings → Deployments → Redeploy

## 🧪 설정 검증 방법

### 1. 빌드 로그 확인
```
✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY
🔥 Firebase Admin SDK initialized successfully
```

### 2. API 테스트
```bash
curl https://test-studio-firebase.vercel.app/api/debug/ai-providers
```

응답에서 확인:
```json
{
  "firebaseStatus": {
    "hasServiceAccountKey": true,  // ✅
    "useRealAuth": "true"          // ✅
  }
}
```

### 3. 기능 테스트
1. Google 로그인 → 성공
2. 타로 리딩 저장 → "저장 완료" 메시지

## ❌ 일반적인 오류 및 해결

### "Mock 모드로 운영 중입니다"
→ `FIREBASE_SERVICE_ACCOUNT_KEY` 미설정

### "Google 로그인 중 오류가 발생했습니다"
→ Firebase Console에서 Vercel 도메인 승인 필요

### "AI 제공업체 설정을 불러오는 중 오류"
→ Firebase Admin SDK 초기화 실패

## 📞 추가 지원

문제 지속 시 확인사항:
1. Vercel 빌드 로그
2. 브라우저 개발자 도구 콘솔
3. 네트워크 탭의 API 응답