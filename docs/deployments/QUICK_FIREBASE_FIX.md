# 🚀 Firebase 인증 도메인 빠른 해결 가이드

## 🔥 1분 해결법

### 1️⃣ 현재 도메인 확인
```bash
# 빠른 도메인 확인
./check-vercel-domain.sh
```

### 2️⃣ Firebase Console 접속
👉 [Firebase 승인된 도메인 설정](https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings)

### 3️⃣ 도메인 추가
**Authorized domains** 섹션에서 **Add domain** 클릭 후 추가:
- `test-studio-firebase.vercel.app`
- `innerspell-tarot.vercel.app`
- 위 스크립트에서 찾은 다른 도메인들

### 4️⃣ 즉시 테스트
```bash
# 인증 테스트 실행
node test-firebase-auth-complete.js [your-domain]
```

## ✅ 성공 확인
- Google 로그인 팝업이 정상적으로 열림
- 로그인 후 앱으로 리디렉션
- 타로 리딩 저장 기능 작동

## 🆘 문제 해결
```bash
# 전체 검증 실행
./verify-deployment-domain.sh
```

---
💡 **팁**: 도메인 추가 후 새로고침 없이 바로 작동합니다!