# 🔥 Firebase 서비스 계정 키 생성 가이드

## 📋 단계별 진행

### 1️⃣ Firebase Console 접속
```
https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk
```

### 2️⃣ 서비스 계정 키 생성
1. **"새 비공개 키 생성"** 버튼 클릭
2. **"키 생성"** 확인
3. JSON 파일 자동 다운로드

### 3️⃣ JSON 파일 내용 확인
다운로드한 파일을 텍스트 에디터로 열면 다음과 같은 형태:
```json
{
  "type": "service_account",
  "project_id": "innerspell-an7ce",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@innerspell-an7ce.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 4️⃣ JSON을 한 줄로 변환
**중요**: Vercel 환경 변수는 한 줄로 입력해야 함

#### 온라인 도구 사용:
1. https://www.text-utils.com/json-formatter/ 접속
2. JSON 붙여넣기
3. "Minify" 또는 "Compact" 클릭

#### 또는 로컬에서 변환:
```bash
# Node.js 사용
node -e "console.log(JSON.stringify(require('./path-to-downloaded-key.json')))"
```

### 5️⃣ Vercel 환경 변수 설정
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택: `test-studio-firebase`
3. **Settings → Environment Variables**
4. 다음 변수 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | `{minified JSON}` | Production |
| `NEXT_PUBLIC_USE_REAL_AUTH` | `true` | Production |

### 6️⃣ 배포 트리거
- **옵션 1**: Redeploy 버튼 클릭
- **옵션 2**: 새 커밋 푸시 (자동 배포)

## ⚠️ 주의사항
1. JSON 파일은 절대 GitHub에 커밋하지 마세요
2. 파일은 안전한 곳에 백업하세요
3. 환경 변수 입력 시 따옴표 처리 주의

## 🧪 설정 확인
```bash
# Vercel 빌드 로그에서 확인
✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY
🔥 Firebase Admin SDK initialized successfully
```