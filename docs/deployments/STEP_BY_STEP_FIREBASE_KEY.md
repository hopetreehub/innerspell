# 🔥 Firebase 서비스 계정 키 설정 - 실시간 가이드

## 현재 상태
- ❌ Firebase Admin SDK가 Mock 모드로 실행 중
- ❌ 타로 리딩 저장 시 "데모 모드" 메시지 표시
- ❌ 실제 데이터베이스 연결 안 됨

## 해결 방법

### 🌐 1단계: Firebase Console 열기
```
https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk
```
👆 이 링크를 클릭하세요

### 📥 2단계: 키 다운로드
1. **"새 비공개 키 생성"** 파란색 버튼 클릭
2. 팝업에서 **"키 생성"** 클릭
3. JSON 파일이 자동으로 다운로드됨 (예: `innerspell-an7ce-abc123.json`)

### 🔧 3단계: JSON 내용 확인
다운로드한 파일을 텍스트 에디터로 열면:
```json
{
  "type": "service_account",
  "project_id": "innerspell-an7ce",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  ...
}
```

### 📋 4단계: JSON을 한 줄로 만들기

#### 방법 1: 온라인 도구
1. https://www.text-utils.com/json-minifier/ 접속
2. JSON 내용 전체 복사 → 붙여넣기
3. "Minify" 클릭
4. 결과 복사

#### 방법 2: 우리 스크립트 사용
```bash
cd /mnt/e/project/test-studio-firebase
node scripts/format-service-account-key.js ~/Downloads/innerspell-an7ce-*.json
```

### 🚀 5단계: Vercel에 추가
1. https://vercel.com/dashboard
2. **test-studio-firebase** 프로젝트 클릭
3. **Settings** (상단 메뉴)
4. **Environment Variables** (왼쪽 메뉴)
5. **"Add New"** 버튼 클릭

### ⌨️ 6단계: 환경 변수 입력
첫 번째 변수:
- **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
- **Value**: [한 줄로 변환된 JSON 전체]
- **Environment**: Production ✅ (체크)
- **"Save"** 클릭

두 번째 변수:
- **Key**: `NEXT_PUBLIC_USE_REAL_AUTH`
- **Value**: `true`
- **Environment**: Production ✅ (체크)
- **"Save"** 클릭

### 🔄 7단계: 재배포
1. **Deployments** 탭 클릭
2. 최신 배포 항목의 **"..."** 메뉴 클릭
3. **"Redeploy"** 선택
4. **"Redeploy"** 버튼 클릭

### ⏱️ 8단계: 배포 완료 대기 (약 2-3분)

### ✅ 9단계: 작동 확인
1. https://test-studio-firebase.vercel.app
2. Google 로그인
3. 타로 리딩 진행
4. "리딩 저장하기" 클릭
5. **"저장 완료"** 메시지가 나오면 성공! 🎉

## 🆘 문제 해결

### "여전히 Mock 모드라고 나와요"
→ 환경 변수가 제대로 저장되었는지 확인
→ Vercel에서 재배포가 완료되었는지 확인

### "JSON 파싱 오류"
→ JSON이 올바른 형식인지 확인
→ 따옴표나 줄바꿈이 깨지지 않았는지 확인

### "권한 오류"
→ Firebase Console에서 올바른 프로젝트인지 확인
→ 서비스 계정에 필요한 권한이 있는지 확인