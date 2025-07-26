# 🚨 관리자 권한 수동 테스트 가이드

## 문제 상황
- admin@innerspell.com으로 로그인해도 "관리자 설정" 메뉴가 보이지 않음
- 원인: getUserProfile이 null을 반환하여 fallback 프로필이 생성되는데, 이때 role이 'user'로 설정됨

## 해결된 내용
1. **AuthContext.tsx 수정**
   - Fallback 프로필 생성 시 admin@innerspell.com은 자동으로 'admin' 권한 부여
   - 코드 위치: line 112, 149

2. **Navbar.tsx 디버깅 추가**
   - 사용자 상태 변경 시 콘솔 로그 출력
   - 관리자 메뉴 렌더링 조건 확인 로그

## 수동 테스트 단계

### 1. 캐시 완전 제거
```bash
# Chrome/Edge에서
1. F12로 개발자 도구 열기
2. Network 탭에서 "Disable cache" 체크
3. Ctrl + Shift + R로 강제 새로고침
```

### 2. 시크릿 창에서 테스트
1. 시크릿/프라이빗 창 열기
2. https://test-studio-firebase.vercel.app 접속
3. 우측 상단 "로그인" 클릭
4. "Google로 로그인" 클릭
5. admin@innerspell.com 계정으로 로그인

### 3. 콘솔 로그 확인 (F12)
다음 로그들이 표시되어야 함:
```
🔥 AuthContext: getUserProfile result: null
🔥 AuthContext: Created fallback profile for admin@innerspell.com with role: admin
🔍 Navbar: User state changed: {email: "admin@innerspell.com", role: "admin", isAdmin: true}
🔍 Navbar: Rendering admin menu for user: admin@innerspell.com role: admin
```

### 4. UI 확인
- 상단 네비게이션 바에 "관리자 설정" 메뉴가 표시되어야 함
- Shield 아이콘과 함께 표시됨

## 문제가 지속될 경우

### A. 캐시 문제인 경우
1. 다른 브라우저에서 테스트
2. 모바일에서 테스트
3. 5-10분 후 재시도 (Vercel CDN 캐시 만료 대기)

### B. 코드가 아직 배포되지 않은 경우
1. https://github.com/hopetreehub/innerspell/actions 에서 배포 상태 확인
2. Vercel 대시보드에서 최신 배포 확인

### C. 콘솔에서 직접 확인
```javascript
// 개발자 도구 콘솔에서 실행
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 예상 결과
1. 로그인 즉시 "관리자 설정" 메뉴 표시
2. /admin 페이지 접근 가능
3. 로그인 로딩 시간 5초 이내

## 배포 커밋 정보
- 커밋 해시: ac3eb6c
- 메시지: "fix: 관리자 권한 캐시 문제 해결을 위한 재배포"
- 수정 파일: AuthContext.tsx, Navbar.tsx