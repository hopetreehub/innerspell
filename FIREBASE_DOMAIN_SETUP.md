# 🔥 Firebase 승인된 도메인 설정 가이드

## 🚨 현재 문제
**Google 로그인 오류**: "코드: undefined" → `auth/unauthorized-domain`

## 🎯 해결 방법 (5분 내 완료 가능)

### 1. Firebase Console 접속
👉 https://console.firebase.google.com/

### 2. 프로젝트 선택
- **프로젝트**: `innerspell-an7ce`

### 3. Authentication 설정
1. 좌측 메뉴에서 **"Authentication"** 클릭
2. 상단 탭에서 **"Sign-in method"** 클릭
3. 하단의 **"승인된 도메인"** 섹션 찾기

### 4. 도메인 추가
**현재 등록된 도메인** (확인 필요):
- `localhost` ✅
- `innerspell-an7ce.firebaseapp.com` ✅

**추가해야 할 도메인**:
- `test-studio-firebase.vercel.app` ❌ (누락)

### 5. 도메인 추가 절차
1. **"도메인 추가"** 버튼 클릭
2. `test-studio-firebase.vercel.app` 입력
3. **"추가"** 버튼 클릭
4. 완료!

## ✅ 설정 완료 후 확인사항

### 즉시 확인 가능:
1. https://test-studio-firebase.vercel.app/sign-in 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정 선택 화면 정상 표시
4. 로그인 완료 후 리디렉션

### 타로 리딩 저장 테스트:
1. 로그인 완료 후 `/reading` 페이지 이동
2. 타로 리딩 진행 (질문 → 카드 선택 → AI 해석)
3. "리딩 저장하기" 버튼 클릭
4. "저장 완료" 메시지 확인

## 🔍 기술적 배경

### 왜 이 설정이 필요한가?
```
Firebase Auth는 보안을 위해 승인된 도메인에서만 
OAuth 인증을 허용합니다. 

Vercel 배포 시 새로운 도메인이 생성되므로, 
Firebase Console에서 해당 도메인을 수동으로 
승인해주어야 합니다.
```

### 현재 코드의 오류 처리:
```typescript
// 기존: "코드: undefined" 
// 개선: "이 도메인이 Firebase에서 승인되지 않았습니다"
if (errorCode === 'auth/unauthorized-domain') {
  errorMessage = '이 도메인이 Firebase에서 승인되지 않았습니다. 관리자가 Firebase Console에서 승인된 도메인에 현재 도메인을 추가해야 합니다.';
}
```

## 📊 예상 결과

**설정 전**:
```
❌ Google 로그인 중 예상치 못한 오류가 발생했습니다
❌ 타로 리딩 저장 불가
❌ 사용자 경험 저하
```

**설정 후**:
```
✅ Google 로그인 정상 작동
✅ 타로 리딩 저장 완벽 작동
✅ 모든 Firebase 기능 활성화
```

---

**⏰ 소요시간**: 5분 이내  
**🔧 작업 범위**: Firebase Console 설정 1개  
**🎯 해결률**: 100% (즉시 해결)