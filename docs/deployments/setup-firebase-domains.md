# 🔥 Firebase 도메인 설정 가이드

## 📋 빠른 설정 (3분 소요)

### 1️⃣ Firebase Console 접속
[Firebase Authentication 설정 페이지로 바로 가기](https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings)

### 2️⃣ 승인된 도메인 추가

**"승인된 도메인" 섹션에서 다음 도메인들을 추가하세요:**

#### 필수 도메인:
- [ ] `localhost` (이미 있을 수 있음)
- [ ] `innerspell-an7ce.firebaseapp.com` (이미 있을 수 있음) 
- [ ] `innerspell-an7ce.web.app` (이미 있을 수 있음)

#### Vercel 도메인 (실제 배포 URL 확인 후 추가):
- [ ] `test-studio-firebase.vercel.app`
- [ ] `innerspell.vercel.app`
- [ ] `*.vercel.app` (와일드카드 - 선택사항)

### 3️⃣ 도메인 추가 방법

1. **"도메인 추가"** 버튼 클릭
2. 도메인 입력 (예: `test-studio-firebase.vercel.app`)
3. **"추가"** 클릭
4. 각 도메인마다 반복

## 🔍 현재 배포 도메인 확인

터미널에서 다음 명령 실행:

```bash
# 빠른 도메인 확인
./check-vercel-domain.sh

# 또는 수동으로 확인
npx vercel ls
```

## ✅ 설정 확인 방법

### 자동 테스트 (권장)
```bash
# 도메인을 자동으로 찾아서 테스트
./verify-deployment-domain.sh

# 특정 도메인으로 테스트
node test-firebase-auth-complete.js YOUR-DOMAIN.vercel.app
```

### 수동 테스트
1. 배포된 사이트 접속: `https://YOUR-DOMAIN.vercel.app`
2. **"Sign In"** 페이지로 이동
3. **"Continue with Google"** 버튼 클릭
4. Google 로그인 팝업이 나타나는지 확인
5. 로그인 완료 후 리다이렉트 확인

## ⚠️ 일반적인 문제 해결

### "Invalid OAuth redirect URI" 오류
- Firebase Console에서 도메인이 추가되었는지 확인
- 정확한 도메인 이름 확인 (www 유무, 서브도메인 등)

### "This domain is not authorized" 오류  
- 승인된 도메인 목록에 현재 도메인 추가
- 변경사항이 적용되도록 몇 분 대기

### Google 로그인 팝업이 차단됨
- 브라우저 팝업 차단 설정 확인
- 다른 브라우저에서 테스트

## 📊 체크리스트

### Firebase Console
- [ ] 승인된 도메인에 Vercel URL 추가됨
- [ ] OAuth 리다이렉트 URI가 올바름
- [ ] 웹 앱 구성이 정확함

### Vercel 환경 변수
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `innerspell-an7ce.firebaseapp.com`
- [ ] `NEXT_PUBLIC_USE_REAL_AUTH` = `true`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` 설정됨

### 기능 테스트
- [ ] Google 로그인 버튼 표시됨
- [ ] 로그인 팝업 정상 작동
- [ ] 로그인 후 리다이렉트 성공
- [ ] 타로 리딩 저장 기능 작동

## 🚀 다음 단계

1. **도메인 추가 완료** → Firebase Console에서 확인
2. **테스트 실행** → `./verify-deployment-domain.sh`
3. **문제 발생 시** → 위의 문제 해결 가이드 참조

---

**도움이 필요하면** Firebase 설정 페이지의 스크린샷과 함께 오류 메시지를 공유해주세요!