# Firebase Console 승인된 도메인 설정 가이드

## 🔧 해결해야 할 문제
Google 로그인 시 "Illegal url for new iframe" 오류가 발생하는 이유는 Firebase AuthDomain 설정 문제입니다.

## 📝 필요한 조치

### 1. Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. `innerspell-an7ce` 프로젝트 선택

### 2. Authentication 설정으로 이동
1. 좌측 메뉴에서 "Authentication" 클릭
2. "Sign-in method" 탭 클릭

### 3. 승인된 도메인 확인 및 추가
**현재 문제**: `test-studio-firebase.vercel.app`이 승인된 도메인 목록에 없을 가능성

**추가해야 할 도메인들**:
- `test-studio-firebase.vercel.app`
- `*.vercel.app` (와일드카드로 모든 Vercel 도메인 허용)

### 4. Google Sign-in 제공업체 설정 확인
1. Google 제공업체가 활성화되어 있는지 확인
2. 승인된 도메인 목록에 다음이 포함되어 있는지 확인:
   - `localhost` (개발용)
   - `test-studio-firebase.vercel.app` (프로덕션용)

## 🚨 중요한 점
- 도메인 추가 후 변경사항이 적용되는데 몇 분 정도 소요될 수 있습니다.
- HTTPS 도메인만 추가 가능합니다.
- 와일드카드 도메인 (*.vercel.app)을 사용하면 모든 Vercel 배포에서 인증이 가능합니다.

## 🔍 확인 방법
1. Firebase Console에서 설정 변경 후
2. Vercel에서 새로 배포하거나 기존 배포를 새로고침
3. 브라우저에서 강제 새로고침 (Ctrl+F5)으로 테스트