# Firebase 프로덕션 체크리스트

## 🔥 Firebase Console 설정 사항

### 1. Authentication 설정
1. [Firebase Console](https://console.firebase.google.com) → innerspell-an7ce 프로젝트
2. Authentication → Sign-in method
3. 다음 인증 방법 활성화:
   - ✅ 이메일/비밀번호
   - ✅ 이메일 링크 (비밀번호 없이 로그인)

### 2. Authorized Domains 설정
1. Authentication → Settings → Authorized domains
2. 다음 도메인 추가:
   - `localhost` (이미 있음)
   - `innerspell-an7ce.firebaseapp.com` (이미 있음)
   - `innerspell.vercel.app` (Vercel 프리뷰 도메인)
   - `당신의-커스텀-도메인.com` (커스텀 도메인 사용 시)

### 3. Firestore Database 설정
1. Firestore Database → Rules
2. 프로덕션용 보안 규칙 설정:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 관리자만 관리자 컬렉션에 접근 가능
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 인증된 사용자만 자신의 데이터에 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 사용 통계는 인증된 사용자만 쓰기, 관리자는 읽기 가능
    match /userUsageStats/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // 블로그 포스트는 모두 읽기 가능, 관리자만 쓰기 가능
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

### 4. Storage 설정
1. Storage → Rules
2. 프로덕션용 보안 규칙:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 블로그 이미지는 모두 읽기 가능, 관리자만 쓰기 가능
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }
    
    // 타로 카드 이미지는 모두 읽기 가능
    match /tarot-cards/{allPaths=**} {
      allow read: if true;
      allow write: if false; // 콘솔에서만 업로드
    }
  }
}
```

### 5. 서비스 계정 키 생성
1. 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. Vercel 환경 변수로 설정 (위 가이드 참조)

## 📱 초기 관리자 계정 생성

### 방법 1: Firebase Console에서 직접 생성
1. Authentication → Users
2. "Add user" 클릭
3. 이메일: `admin@innerspell.com`
4. 비밀번호 설정

### 방법 2: Firestore에서 관리자 권한 부여
1. Firestore Database → Data
2. `admins` 컬렉션 생성
3. 문서 ID: 위에서 생성한 사용자의 UID
4. 필드 추가:
   ```json
   {
     "email": "admin@innerspell.com",
     "createdAt": [타임스탬프],
     "role": "admin"
   }
   ```

## ✅ 배포 전 최종 체크리스트

- [ ] Authentication에서 이메일/비밀번호 인증 활성화
- [ ] Authorized domains에 Vercel 도메인 추가
- [ ] Firestore 보안 규칙 업데이트
- [ ] Storage 보안 규칙 업데이트
- [ ] 서비스 계정 키 생성 및 Vercel 환경 변수 설정
- [ ] 초기 관리자 계정 생성
- [ ] Firestore에 admins 컬렉션 및 관리자 문서 추가

## 🚀 배포 후 확인 사항

1. 프로덕션 URL에서 홈페이지 정상 로드 확인
2. `/admin` 페이지에서 관리자 로그인 테스트
3. 블로그 포스트 작성/수정/삭제 테스트
4. 타로 리딩 기능 테스트
5. 사용 통계 수집 확인