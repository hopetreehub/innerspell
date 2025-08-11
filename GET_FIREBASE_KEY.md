# 🔑 Firebase 서비스 계정 키 가져오기

## 🚀 빠른 링크
직접 이동: https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk

## 📋 단계별 가이드

### 1️⃣ Firebase Console 접속
1. 위 링크 클릭 또는
2. Firebase Console → innerspell-an7ce 프로젝트 → 설정 → 서비스 계정

### 2️⃣ 새 비공개 키 생성
1. **"새 비공개 키 생성"** 버튼 클릭
2. **"키 생성"** 확인
3. JSON 파일 자동 다운로드 (예: `innerspell-an7ce-xxxxx.json`)

### 3️⃣ JSON을 Vercel 형식으로 변환
```bash
# 프로젝트 루트에서 실행
node scripts/format-service-account-key.js ~/Downloads/innerspell-an7ce-xxxxx.json
```

### 4️⃣ Vercel에 환경 변수 추가
1. https://vercel.com/dashboard
2. `test-studio-firebase` 프로젝트 클릭
3. **Settings** → **Environment Variables**
4. **"Add New"** 클릭
5. 다음 정보 입력:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: 스크립트 출력에서 복사한 JSON
   - **Environment**: Production ✅
6. **"Save"** 클릭

### 5️⃣ 추가 환경 변수 설정
같은 방법으로 추가:
- **Key**: `NEXT_PUBLIC_USE_REAL_AUTH`
- **Value**: `true`
- **Environment**: Production ✅

### 6️⃣ 재배포
1. **Deployments** 탭 클릭
2. 최신 배포 옆 **"..."** → **"Redeploy"**
3. **"Redeploy"** 확인

## ✅ 설정 확인

### 배포 로그에서 확인
```
✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY
🔥 Firebase Admin SDK initialized successfully
```

### API로 확인
```bash
curl https://test-studio-firebase.vercel.app/api/debug/ai-providers | jq .firebaseStatus
```

예상 결과:
```json
{
  "hasServiceAccountKey": true,
  "nodeEnv": "production",
  "useRealAuth": "true"
}
```

## 🎯 최종 테스트
1. https://test-studio-firebase.vercel.app
2. Google 로그인
3. 타로 리딩 진행
4. "리딩 저장하기" → **"저장 완료"** 메시지 확인

## ⚠️ 주의사항
- JSON 파일은 다운로드 후 안전한 곳에 보관
- 절대 GitHub에 커밋하지 말 것
- 환경 변수는 Vercel에만 저장