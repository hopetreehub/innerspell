# Firebase Production 설정 가이드

현재 프로젝트는 개발 환경에서 Mock Firebase를 사용하고 있습니다. 
실제 Firebase로 전환하기 위한 단계별 가이드입니다.

## 🚀 1단계: Firebase 프로젝트 설정

### Firebase 콘솔에서 설정
1. **Firebase 콘솔 접속**: https://console.firebase.google.com/
2. **새 프로젝트 생성** 또는 **기존 프로젝트 선택**
3. **Authentication 활성화**:
   - Authentication > Sign-in method
   - Email/Password 활성화
   - Google 로그인 활성화
   - 승인된 도메인에 운영 도메인 추가

4. **Firestore Database 생성**:
   - Firestore Database > 데이터베이스 만들기
   - 보안 규칙 설정 (아래 참조)

5. **Firebase Storage 활성화**:
   - Storage > 시작하기
   - 이미지 업로드를 위한 스토리지 설정

### Firestore 보안 규칙 설정

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 프로필 규칙
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     request.auth.token.role == "admin";
    }
    
    // 블로그 포스트 규칙
    match /blog_posts/{postId} {
      allow read: if true; // 모든 사용자가 읽기 가능
      allow write: if request.auth != null && 
                      request.auth.token.role == "admin";
    }
    
    // 타로 리딩 규칙
    match /userReadings/{readingId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow read: if request.auth != null && 
                     request.auth.token.role == "admin";
    }
    
    // 커뮤니티 포스트 규칙
    match /communityPosts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               (request.auth.uid == resource.data.authorId || 
                                request.auth.token.role == "admin");
      
      // 댓글 규칙
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && 
                                 (request.auth.uid == resource.data.authorId || 
                                  request.auth.token.role == "admin");
      }
    }
  }
}
```

### Storage 보안 규칙 설정

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 블로그 이미지 - 관리자만 업로드 가능, 모든 사용자 읽기 가능
    match /blog-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.role == "admin";
    }
    
    // 사용자 프로필 이미지
    match /profile-images/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == userId;
    }
    
    // 커뮤니티 포스트 이미지
    match /community-images/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == userId;
    }
  }
}
```

## 🔑 2단계: 환경 변수 설정

### .env.local 파일 생성/수정

```bash
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 실제 Firebase 사용 활성화
NEXT_PUBLIC_USE_REAL_AUTH=true

# Firebase Admin SDK (서버사이드)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
# 또는 서비스 계정 키를 환경 변수로 직접 설정
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id

# 이메일 서비스 (실제 이메일 발송용)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Firebase 서비스 계정 키 생성
1. Firebase 콘솔 > 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. 생성된 JSON 파일을 안전한 곳에 저장
4. 환경 변수로 설정 또는 파일 경로 지정

## 📝 3단계: 관리자 계정 설정

### Custom Claims 설정 (Firebase Functions 또는 Admin SDK)

```javascript
// 관리자 권한 부여 스크립트 (한 번만 실행)
const admin = require('firebase-admin');

// 서비스 계정 키로 초기화
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'your-project-id'
});

async function setAdminRole(email) {
  try {
    // 이메일로 사용자 찾기
    const user = await admin.auth().getUserByEmail(email);
    
    // 관리자 권한 부여
    await admin.auth().setCustomUserClaims(user.uid, { 
      role: 'admin' 
    });
    
    console.log(`관리자 권한이 부여되었습니다: ${email}`);
  } catch (error) {
    console.error('관리자 권한 부여 실패:', error);
  }
}

// 실행
setAdminRole('admin@innerspell.com');
```

## 🔄 4단계: 코드 변경사항

### 환경 변수 체크 코드 수정

현재 코드에서 다음 부분들이 자동으로 실제 Firebase로 전환됩니다:

1. **src/lib/firebase/client.ts**:
   ```typescript
   // NEXT_PUBLIC_USE_REAL_AUTH=true로 설정하면 자동 전환
   if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
     // Mock 환경
   } else {
     // 실제 Firebase 환경
   }
   ```

2. **src/lib/firebase/admin.ts**:
   ```typescript
   // GOOGLE_APPLICATION_CREDENTIALS 설정하면 자동 전환
   if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
     // Mock 환경
   } else {
     // 실제 Firebase 환경
   }
   ```

3. **src/context/AuthContext.tsx**:
   ```typescript
   // NEXT_PUBLIC_USE_REAL_AUTH=true로 설정하면 자동 전환
   if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
     // Mock Auth 사용
   } else {
     // 실제 Firebase Auth 사용
   }
   ```

## 🗄️ 5단계: 데이터 마이그레이션

### Mock 데이터를 실제 Firestore로 이전

```javascript
// migrate-data.js
const admin = require('firebase-admin');

// 현재 Mock 데이터
const mockBlogPosts = [
  {
    id: 'tarot-beginner-complete-guide',
    title: '타로 카드 초보자를 위한 완벽 가이드',
    content: '타로 카드를 처음 시작하는 분들을 위한...',
    // ... 기타 필드
  },
  // ... 더 많은 포스트
];

async function migrateBlogPosts() {
  const db = admin.firestore();
  
  for (const post of mockBlogPosts) {
    try {
      await db.collection('blog_posts').doc(post.id).set({
        ...post,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`마이그레이션 완료: ${post.title}`);
    } catch (error) {
      console.error(`마이그레이션 실패: ${post.title}`, error);
    }
  }
}

// 실행
migrateBlogPosts();
```

## 🚀 6단계: 배포 설정

### Vercel 배포 시 환경 변수 설정
1. Vercel 대시보드 > 프로젝트 > Settings > Environment Variables
2. 모든 환경 변수를 Production 환경에 설정
3. Firebase 서비스 계정 키는 JSON 문자열로 설정

### 도메인 인증 설정
1. Firebase 콘솔 > Authentication > Settings > Authorized domains
2. 운영 도메인 추가 (예: yourdomain.com)

## ⚠️ 주의사항

### 보안 체크리스트
- [ ] Firestore 보안 규칙 적용 및 테스트
- [ ] Storage 보안 규칙 적용 및 테스트
- [ ] 환경 변수 보안 (서비스 계정 키 등)
- [ ] CORS 설정 확인
- [ ] SSL/TLS 인증서 설정

### 테스트 체크리스트
- [ ] 로그인/로그아웃 기능
- [ ] 관리자 권한 확인
- [ ] 블로그 CRUD 기능
- [ ] 이미지 업로드 기능
- [ ] 타로 리딩 저장/불러오기
- [ ] 커뮤니티 기능

## 🔧 문제 해결

### 자주 발생하는 오류
1. **인증 오류**: 서비스 계정 키 확인
2. **권한 오류**: Firestore 규칙 및 Custom Claims 확인
3. **이미지 업로드 오류**: Storage 규칙 및 CORS 설정 확인

### 롤백 방법
환경 변수를 다시 Mock 환경으로 변경:
```bash
NEXT_PUBLIC_USE_REAL_AUTH=false
# GOOGLE_APPLICATION_CREDENTIALS 제거 또는 주석 처리
```

---

이 가이드를 따라 단계별로 진행하시면 Mock 환경에서 실제 Firebase 환경으로 안전하게 전환할 수 있습니다.