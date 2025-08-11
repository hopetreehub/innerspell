# 🔐 Firebase 승인된 도메인 설정 가이드

## 🚨 현재 오류
```
Error (auth/unauthorized-domain)
The current domain is not authorized for OAuth operations
```

## 🎯 해결 방법 (2분 소요)

### 1️⃣ Firebase Console 접속
```
https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings
```

### 2️⃣ 승인된 도메인 섹션 찾기
1. **Authentication** 메뉴 클릭
2. **Settings** 탭 클릭
3. **Authorized domains** 섹션으로 스크롤

### 3️⃣ 도메인 추가
현재 등록된 도메인:
- ✅ `localhost`
- ✅ `innerspell-an7ce.firebaseapp.com`
- ✅ `innerspell-an7ce.web.app`

**추가해야 할 도메인들**:
1. `test-studio-firebase.vercel.app` ← 메인 도메인
2. `innerspell-tarot.vercel.app` ← 오류에 표시된 도메인
3. `*.vercel.app` ← 미리보기 배포용 (선택사항)

### 4️⃣ 추가 방법
1. **"Add domain"** 버튼 클릭
2. 도메인 입력 (https:// 제외)
3. **"Add"** 클릭
4. 각 도메인에 대해 반복

## ✅ 추가 후 확인

### 즉시 테스트
- 새로고침 없이 바로 작동
- Google 로그인 재시도
- 팝업이 정상적으로 열림

### 성공 시나리오
1. Google 로그인 버튼 클릭
2. Google 계정 선택 팝업 표시
3. 계정 선택
4. 앱으로 리디렉션
5. 로그인 완료!

## 🔍 문제 해결

### "여전히 같은 오류가 나와요"
1. 브라우저 캐시 삭제
2. 시크릿/프라이빗 모드로 테스트
3. 도메인이 정확히 입력되었는지 확인

### "다른 도메인에서 접속 중이에요"
1. 브라우저 주소창의 정확한 도메인 확인
2. 해당 도메인을 Firebase에 추가

## 📋 Vercel 프로젝트별 도메인

여러 Vercel 프로젝트가 있는 경우:
- `test-studio-firebase.vercel.app`
- `innerspell.vercel.app`
- `innerspell-tarot.vercel.app`
- 기타 커스텀 도메인

모두 Firebase에 추가해야 각 배포에서 로그인이 작동합니다.

## 🎉 완료!
도메인 추가 후 Google OAuth가 정상 작동합니다.