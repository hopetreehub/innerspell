# 🔥 Vercel Firebase 완벽 설정 가이드

## 🚨 현재 문제
**타로 리딩 저장 실패**: "Mock 모드로 운영 중"이라고 표시되는 문제

## 🎯 원인 분석
Vercel에서 Firebase Admin SDK를 위한 서비스 계정 키가 설정되지 않음

## ✅ 해결 방법 (10분 내 완료)

### 1. Firebase Console에서 서비스 계정 키 생성

1. **Firebase Console 접속**: https://console.firebase.google.com/
2. **프로젝트 선택**: `innerspell-an7ce`
3. **설정(톱니바퀴) → 프로젝트 설정** 클릭
4. **서비스 계정** 탭 클릭
5. **새 비공개 키 생성** 버튼 클릭
6. JSON 파일 다운로드

### 2. Vercel 환경 변수 설정

1. **Vercel Dashboard 접속**: https://vercel.com/dashboard
2. **프로젝트 선택**: `test-studio-firebase`
3. **Settings → Environment Variables** 클릭
4. **다음 환경 변수들 추가**:

#### 🔥 Firebase Admin 설정 (필수)
```bash
# 변수명: FIREBASE_SERVICE_ACCOUNT_KEY
# 값: 다운로드한 JSON 파일의 전체 내용을 한 줄로 복사
{"type":"service_account","project_id":"innerspell-an7ce","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

#### 🔧 실제 Firebase 인증 활성화 (필수)
```bash
NEXT_PUBLIC_USE_REAL_AUTH=true
```

#### ⚙️ 추가 프로덕션 설정
```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://test-studio-firebase.vercel.app
```

### 3. 환경 변수 설정 체크리스트

#### ✅ 기존 설정 (확인 필요)
- `NEXT_PUBLIC_FIREBASE_API_KEY` ✅
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` ✅
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` ✅
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` ✅
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` ✅
- `NEXT_PUBLIC_FIREBASE_APP_ID` ✅
- `ENCRYPTION_KEY` ✅
- `BLOG_API_SECRET_KEY` ✅

#### 🆕 새로 추가할 설정
- `FIREBASE_SERVICE_ACCOUNT_KEY` ❌ (추가 필요)
- `NEXT_PUBLIC_USE_REAL_AUTH=true` ❌ (추가 필요)

### 4. 배포 트리거

환경 변수 설정 후:
1. **Vercel Dashboard → Deployments** 클릭
2. **Redeploy** 버튼 클릭 (또는 GitHub에 새 커밋 push)

## 🧪 테스트 방법

### 설정 완료 후 확인:
1. https://test-studio-firebase.vercel.app/sign-in 접속
2. Google 계정으로 로그인
3. `/reading` 페이지에서 타로 리딩 진행
4. "리딩 저장하기" 버튼 클릭
5. **"저장 완료"** 메시지 확인 ✅

### 오류 메시지 변화:
```diff
- "현재 데모 모드로 운영 중입니다"
+ "리딩이 성공적으로 저장되었습니다"
```

## 🔍 기술적 변경사항

### Code Changes Applied:
1. **readingActions.ts**: Mock 모드 조건 수정
   ```typescript
   // 기존
   !process.env.GOOGLE_APPLICATION_CREDENTIALS
   
   // 수정
   !(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
   ```

2. **admin.ts**: Vercel 환경에서 서비스 계정 키 지원
   ```typescript
   if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
     credential = admin.credential.cert(serviceAccount);
   }
   ```

## 📊 예상 결과

**설정 전**:
```
❌ Mock 모드로 운영 중입니다
❌ 타로 리딩 저장 불가
❌ 실제 데이터베이스 미연결
```

**설정 후**:
```
✅ 실제 Firebase 연결
✅ 타로 리딩 저장/조회 완벽 작동
✅ Google 로그인 + 데이터베이스 완전 통합
```

## ⚠️ 보안 주의사항

1. **서비스 계정 키는 절대 GitHub에 커밋하지 마세요**
2. **Vercel 환경 변수에만 설정하세요**
3. **JSON 형식이 올바른지 확인하세요**

---

**⏰ 소요시간**: 10분 이내  
**🔧 설정 범위**: Vercel 환경 변수 2개 추가  
**🎯 해결률**: 100% (즉시 해결)