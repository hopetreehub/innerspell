# Vercel Firebase 설정 가이드

## 문제 상황
Vercel 환경에서 타로 리딩 저장이 실패하는 문제가 발생했습니다. 
로컬(포트 4000)에서는 정상 작동하지만, Vercel에서는 Firebase 환경변수가 제대로 설정되지 않아 파일 시스템으로 폴백하려다 실패합니다.

## 해결 방법

### 1. Firebase Service Account Key 준비

1. Firebase Console에 접속
2. 프로젝트 설정 > 서비스 계정 탭
3. "새 비공개 키 생성" 클릭
4. JSON 파일 다운로드

### 2. Service Account Key를 한 줄로 변환

```javascript
// convert-firebase-key.js
const fs = require('fs');
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
console.log(JSON.stringify(serviceAccount));
```

위 스크립트를 실행하여 한 줄로 변환된 JSON을 복사합니다.

### 3. Vercel 환경변수 설정

Vercel Dashboard > Settings > Environment Variables에서 다음 변수들을 설정:

#### 필수 환경변수

```bash
# Firebase Admin SDK (한 줄로 변환된 JSON)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"innerspell-an7ce",...}

# Firebase 프로젝트 ID (공백이나 특수문자 없이)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce

# 기타 Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### 중요 사항
- `FIREBASE_SERVICE_ACCOUNT_KEY`는 반드시 한 줄로 입력
- 모든 환경변수는 Production, Preview, Development 모두에 설정
- 특수문자나 개행문자가 포함되지 않도록 주의

### 4. Firebase 보안 규칙 확인

Firestore 보안 규칙에서 `userReadings` 컬렉션에 대한 쓰기 권한 확인:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userReadings/{document=**} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Vercel 재배포

환경변수 설정 후 반드시 재배포:

```bash
vercel --prod
```

## 디버깅 방법

### 1. Firebase 상태 확인
```
https://your-app.vercel.app/api/debug/firebase-status
```

### 2. Vercel 함수 로그 확인
Vercel Dashboard > Functions 탭에서 실시간 로그 확인

### 3. 환경변수 확인
Vercel Dashboard > Settings > Environment Variables에서 설정 상태 확인

## 임시 해결책

Firebase 설정 전까지는 다음과 같이 임시로 처리됩니다:
- 저장은 성공으로 표시되지만 실제로는 메모리에만 저장
- 서버 재시작 시 데이터 소실
- 경고 메시지: "⚠️ 임시 저장됨 - Firebase 설정이 필요합니다"

## 체크리스트

- [ ] Firebase Service Account Key 다운로드
- [ ] Service Account Key를 한 줄로 변환
- [ ] Vercel 환경변수 설정 (모든 환경)
- [ ] Firebase 보안 규칙 확인
- [ ] Vercel 재배포
- [ ] Firebase 상태 API로 연결 확인
- [ ] 실제 저장 테스트

## 문의

추가 지원이 필요한 경우:
- Firebase 콘솔에서 프로젝트 설정 확인
- Vercel 지원팀 문의
- 프로젝트 관리자에게 환경변수 확인 요청