# Firebase Rules 배포 가이드

## 🚨 중요: 타로리딩 저장 기능 수정 완료

### 문제점
- Firestore Rules에 `userReadings` 컬렉션 권한 설정이 누락되어 있었음
- 로그인 후에도 타로리딩 저장이 실패하는 문제 발생

### 해결책
firestore.rules 파일에 다음 규칙을 추가했습니다:

```javascript
// 타로 리딩 저장 컬렉션 - 중요!
match /userReadings/{readingId} {
  // 본인 리딩만 읽기 가능
  allow read: if request.auth != null 
    && request.auth.uid == resource.data.userId;
  // 인증된 사용자가 본인 userId로 리딩 생성 가능
  allow create: if request.auth != null 
    && request.auth.uid == request.resource.data.userId;
  // 본인 리딩만 수정/삭제 가능
  allow update, delete: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

## 📋 배포 방법

### 1. Firebase CLI 설치 (이미 설치되어 있다면 스킵)
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인
```bash
firebase login
```

### 3. Firestore Rules 배포
```bash
firebase deploy --only firestore:rules
```

### 4. Firebase Console에서 직접 수정 (대안)
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. Firestore Database → Rules 탭
4. 위의 `userReadings` 규칙을 추가
5. "Publish" 버튼 클릭

## ✅ 확인 사항
- 로그인한 사용자만 자신의 리딩을 저장/조회 가능
- 다른 사용자의 리딩은 접근 불가
- 비로그인 사용자는 저장 기능 사용 불가

## 🔍 현재 상태
- ✅ firestore.rules 파일 수정 완료
- ⚠️ Firebase에 배포 필요
- ✅ 클라이언트 코드는 이미 올바르게 구현되어 있음