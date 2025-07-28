# 🔥 Firebase 서비스 계정 키 설정 가이드

## 🚨 중요: admin@innerspell.com 로그인 문제 해결

**문제**: Firebase Admin SDK가 초기화되지 않아 관리자 계정 생성 불가  
**원인**: `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수 누락  
**해결**: 올바른 서비스 계정 키 생성 및 설정

---

## 📋 단계별 해결 방법

### 1️⃣ Firebase Console 접속
```
🔗 https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk
```

### 2️⃣ 서비스 계정 키 생성
1. **"새 비공개 키 생성"** 버튼 클릭
2. **"키 생성"** 확인 클릭
3. **JSON 파일 자동 다운로드**

### 3️⃣ JSON 파일 내용 확인
다운로드된 파일은 다음과 같은 형태입니다:
```json
{
  "type": "service_account",
  "project_id": "innerspell-an7ce",
  "private_key_id": "실제키ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\n실제개인키\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@innerspell-an7ce.iam.gserviceaccount.com",
  "client_id": "실제클라이언트ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "실제인증서URL"
}
```

### 4️⃣ 로컬 환경 설정
```bash
# 1. 다운로드한 파일을 프로젝트 폴더에 복사
cp ~/Downloads/innerspell-an7ce-xxxxx.json ./firebase-service-account-key.json

# 2. 자동 설정 스크립트 실행
node generate-firebase-service-account.js
```

### 5️⃣ Vercel 환경변수 설정
```bash
# JSON을 한 줄로 변환
node -e "console.log(JSON.stringify(require('./firebase-service-account-key.json')))"

# Vercel CLI로 환경변수 추가
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
# 위에서 출력된 JSON 문자열 입력
```

### 6️⃣ 설정 확인
```bash
# 로컬에서 테스트
npm run dev
curl http://localhost:4000/api/create-admin

# Vercel에서 테스트 (배포 후)
curl https://your-vercel-url.vercel.app/api/create-admin
```

---

## 🎯 예상 결과

### ✅ 성공 시 로그
```
🔥 Firebase Admin SDK initialized successfully
✅ 관리자 계정이 성공적으로 생성되었습니다
```

### ✅ 관리자 계정 정보
- **이메일**: admin@innerspell.com
- **비밀번호**: admin123
- **권한**: admin

### ✅ 로그인 테스트
1. `/auth/signin` 페이지 접속
2. admin@innerspell.com / admin123 입력
3. 로그인 성공 후 `/admin` 페이지 접근 가능

---

## 🚨 보안 주의사항

1. **절대 GitHub에 커밋하지 마세요**
   ```bash
   # .gitignore에 자동 추가됨
   firebase-service-account-key.json
   ```

2. **파일 권한 설정**
   ```bash
   chmod 600 firebase-service-account-key.json
   ```

3. **환경변수 보안**
   - Vercel 환경변수는 암호화되어 저장됨
   - 로그나 디버그 출력에서 키 노출 주의

---

## 🔄 트러블슈팅

### 문제 1: "Firebase Admin not initialized"
**해결**: 환경변수가 올바르게 설정되었는지 확인

### 문제 2: "Invalid private key"
**해결**: JSON 형식이 올바른지 확인, 특수문자 이스케이프 확인

### 문제 3: "Permission denied"
**해결**: Firebase 프로젝트 권한 확인, 서비스 계정 활성화 확인

---

## 📞 지원

문제 발생 시 다음 정보와 함께 문의:
1. 에러 메시지
2. 서비스 계정 이메일 (private_key 제외)
3. Firebase 프로젝트 ID

**다음 단계**: 위 가이드대로 실제 서비스 계정 키를 생성하고 설정해주세요.