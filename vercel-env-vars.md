# Vercel 환경 변수 설정 가이드

## 🚀 Vercel 프로젝트에 추가해야 할 환경 변수

다음 환경 변수들을 Vercel 프로젝트 설정에서 추가해주세요.

### 1. Firebase 클라이언트 설정 (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=944680989471
NEXT_PUBLIC_FIREBASE_APP_ID=1:944680989471:web:bc817b811a6033017f362a
```

### 2. Firebase Admin SDK 설정 (Secret)
```
FIREBASE_SERVICE_ACCOUNT_KEY=[Firebase Console에서 다운로드한 서비스 계정 키 JSON을 한 줄로 변환]
```

### 3. API 키 (Secret)
```
OPENAI_API_KEY=[OpenAI API 키]
GEMINI_API_KEY=AIzaSyCEYBrskvxVcI7oANkKWn__AxeDWSFQ3Yc
GOOGLE_API_KEY=AIzaSyDKqXrsTTtBEFpQC-ndtTtGIXw5_KedxCU
```

### 4. 보안 키 (Secret)
```
ENCRYPTION_KEY=imYNbSV++Pcv5Hrybj4HDt0xkEL4ojD6/xF2O+SrJLk=
BLOG_API_SECRET_KEY=c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=
NEXT_PUBLIC_BLOG_API_SECRET=c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=
```

### 5. 앱 설정
```
NEXT_PUBLIC_USE_REAL_AUTH=true
ADMIN_EMAILS=admin@innerspell.com
NODE_ENV=production
```

## 📝 Vercel에서 환경 변수 추가하는 방법

1. [Vercel Dashboard](https://vercel.com)에 로그인
2. 프로젝트 선택
3. "Settings" 탭 클릭
4. "Environment Variables" 섹션으로 이동
5. 각 환경 변수를 추가:
   - Key: 환경 변수 이름
   - Value: 환경 변수 값
   - Environment: Production, Preview, Development 모두 선택
   - Sensitive: API 키와 Secret은 체크

## ⚠️ 중요 사항

### Firebase 서비스 계정 키 변환 방법
1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭하여 JSON 다운로드
3. JSON 파일 내용을 한 줄로 변환:
   ```javascript
   // Node.js에서 실행
   const fs = require('fs');
   const json = JSON.parse(fs.readFileSync('serviceAccountKey.json'));
   console.log(JSON.stringify(json));
   ```
4. 출력된 한 줄 JSON을 `FIREBASE_SERVICE_ACCOUNT_KEY` 값으로 사용

### 배포 전 체크리스트
- [ ] 모든 환경 변수가 Vercel에 추가되었는지 확인
- [ ] Firebase Console에서 Authentication 활성화 확인
- [ ] Firebase Authorized domains에 Vercel 도메인 추가
- [ ] 서비스 계정 키가 올바르게 설정되었는지 확인