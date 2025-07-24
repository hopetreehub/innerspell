# 🔧 Vercel CLI 환경 변수 설정 가이드

웹 UI에서 Secret 참조 문제가 계속 발생한다면, CLI를 사용하여 환경 변수를 설정하세요.

## 📋 CLI 설정 단계

### 1. Vercel 로그인
```bash
npx vercel login
```
브라우저가 열리고 Vercel 계정으로 로그인하세요.

### 2. 프로젝트 연결
```bash
npx vercel link
```
- 기존 프로젝트 선택: Yes
- 프로젝트 이름 입력: 생성한 프로젝트 이름

### 3. 환경 변수 설정

#### Firebase 설정 (6개)
```bash
# Firebase API Key
echo "AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg" | npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production

# Firebase Auth Domain  
echo "innerspell-an7ce.firebaseapp.com" | npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production

# Firebase Project ID
echo "innerspell-an7ce" | npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production

# Firebase Storage Bucket
echo "innerspell-an7ce.firebasestorage.app" | npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production

# Firebase Messaging Sender ID
echo "944680989471" | npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production

# Firebase App ID
echo "1:944680989471:web:bc817b811a6033017f362a" | npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

#### 보안 키 (2개)
```bash
# Encryption Key
echo "imYNbSV++Pcv5Hrybj4HDt0xkEL4ojD6/xF2O+SrJLk=" | npx vercel env add ENCRYPTION_KEY production

# Blog API Secret Key
echo "c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=" | npx vercel env add BLOG_API_SECRET_KEY production
```

#### 기본 설정 (3개)
```bash
# Node Environment
echo "production" | npx vercel env add NODE_ENV production

# Real Auth Flag
echo "true" | npx vercel env add NEXT_PUBLIC_USE_REAL_AUTH production

# Admin Emails
echo "admin@innerspell.com" | npx vercel env add ADMIN_EMAILS production
```

#### AI API 키 (최소 1개 필요)
```bash
# Google AI (무료 - 권장)
npx vercel env add GOOGLE_API_KEY production
# 프롬프트에서 당신의 Google AI API 키 입력

npx vercel env add GEMINI_API_KEY production  
# 프롬프트에서 같은 Google AI API 키 입력

# 또는 OpenAI
npx vercel env add OPENAI_API_KEY production
# 프롬프트에서 당신의 OpenAI API 키 입력
```

### 4. 설정 확인
```bash
npx vercel env ls
```

### 5. 재배포
```bash
npx vercel --prod
```

## 🎯 간편 스크립트

모든 명령을 한 번에 실행하려면:
```bash
./vercel-env-setup.sh
```

## 💡 AI API 키 발급

### Google AI (무료)
1. https://makersuite.google.com/app/apikey
2. "Create API Key" 클릭
3. 생성된 키 복사 (AIza로 시작)

### OpenAI (유료)
1. https://platform.openai.com/api-keys
2. "Create new secret key" 클릭
3. 생성된 키 복사 (sk-로 시작)

## 🔧 문제 해결

### "No credentials found" 오류
```bash
npx vercel login
```

### "Project not found" 오류
```bash
npx vercel link
```

### 환경 변수 삭제 (잘못 설정한 경우)
```bash
npx vercel env rm VARIABLE_NAME production
```

이렇게 CLI로 설정하면 Secret 참조 문제가 완전히 해결됩니다! 🎉