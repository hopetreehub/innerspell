# Google 로그인 오류 해결 방안

## 🎉 성공적으로 해결된 문제들

### ✅ 1. URL 인코딩 오류 해결
**문제**: Firebase AuthDomain에 `%0A` (개행문자) 포함으로 인한 "Illegal url for new iframe" 오류
**해결**: `src/lib/firebase/client.ts`에서 환경 변수 값 정리 추가
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim().replace(/\n/g, ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim().replace(/\n/g, ''),
  // ... 기타 설정
};
```

### ✅ 2. Firebase 설정 정상 로드 확인
**결과**: 콘솔 로그에서 올바른 설정 확인됨
```
Firebase config validation: {
  hasApiKey: true, 
  authDomain: innerspell-an7ce.firebaseapp.com, 
  projectId: innerspell-an7ce, 
  storageBucket: innerspell-an7ce.firebasestorage.app
}
```

### ✅ 3. Google 로그인 버튼 정상 작동
**결과**: 버튼 클릭 시 Google OAuth 팝업이 정상적으로 열림

## ❌ 남은 문제: 승인되지 않은 도메인

### 현재 오류
```
Firebase: Error (auth/unauthorized-domain)
```

### 🔧 필요한 조치: Firebase Console 설정

#### 1단계: Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. `innerspell-an7ce` 프로젝트 선택

#### 2단계: Authentication 설정
1. 좌측 메뉴에서 "Authentication" 클릭
2. "Sign-in method" 탭 클릭
3. 페이지 하단의 "승인된 도메인" 섹션 찾기

#### 3단계: 도메인 추가
**추가해야 할 도메인들:**
- `test-studio-firebase.vercel.app` (현재 프로덕션 도메인)
- `*.vercel.app` (모든 Vercel 배포 도메인 허용)

#### 4단계: Google 제공업체 확인
1. Google 제공업체가 활성화되어 있는지 확인
2. 설정에서 다음 항목들이 올바른지 확인:
   - 클라이언트 ID
   - 클라이언트 보안 비밀번호

## 🚀 추가 권장사항

### 1. CSP 헤더 확인
현재 CSP에 `frame-src 'self' https://innerspell-an7ce.firebaseapp.com;`가 포함되어 있어 양호함

### 2. 환경 변수 검증
- Vercel 환경 변수에 개행문자나 불필요한 공백이 포함되지 않도록 주의
- 필요시 환경 변수 재설정

### 3. 테스트 방법
Firebase Console 설정 변경 후:
1. 브라우저에서 강제 새로고침 (Ctrl+F5)
2. Google 로그인 버튼 클릭 테스트
3. 팝업에서 Google 계정 선택 과정 진행

## 📊 현재 상태 요약
- **환경 변수 정리**: ✅ 완료
- **Firebase 초기화**: ✅ 정상
- **Google 버튼 클릭**: ✅ 정상
- **OAuth 팝업 열기**: ✅ 정상  
- **도메인 승인**: ❌ 필요 (Firebase Console에서 수동 설정 필요)

## ⚡ 즉시 해결 방법
**Firebase Console에서 승인된 도메인에 `test-studio-firebase.vercel.app` 추가**만 하면 Google 로그인이 완전히 작동할 것입니다!