# 🔥 Firebase 연동 준비 완료 체크리스트

## ✅ 완료된 작업들

### 1. 타입 정의 (Types) ✓
- `ReadingExperience` 인터페이스
- `ReadingComment` 인터페이스
- `ReadingLike`, `CommentLike` 인터페이스
- `UserProfile`, `Bookmark` 인터페이스
- `ReadingExperienceFormSchema` (Zod 검증)
- `CommentFormSchema` (Zod 검증)

### 2. Firestore 스키마 설계 ✓
- **컬렉션 구조**: `reading-experiences`, `reading-comments`, `reading-likes`, `comment-likes`, `bookmarks`, `users`
- **인덱스 설계**: 성능 최적화를 위한 복합 인덱스
- **보안 규칙**: 사용자별 권한 관리
- **쿼리 패턴**: 효율적인 데이터 조회 방법

### 3. Server Actions ✓
- `createReadingExperience()`: 새 리딩 경험 생성
- `getReadingExperiences()`: 경험 목록 조회 (페이지네이션)
- `getReadingExperience()`: 특정 경험 상세 조회
- `toggleLike()`: 좋아요 토글 (트랜잭션)
- `toggleBookmark()`: 북마크 토글
- `createComment()`: 댓글 작성
- `getComments()`: 댓글 목록 조회
- `deleteReadingExperience()`: 경험 삭제

### 4. 서비스 파일 ✓
- `ReadingExperienceService`: 클라이언트 사이드 데이터 조회
- `ReadingCommentService`: 댓글 관련 클라이언트 서비스
- 검색, 관련 게시글, 태그 통계 등 고급 기능 포함

### 5. 페이지 컴포넌트 Firebase 연동 ✓
- `/new` 페이지: `createReadingExperience` 액션 연결
- 폼 검증 (`ReadingExperienceFormSchema`) 적용
- 사용자 인증 체크 추가
- 오류 처리 및 토스트 알림

## 🚀 Firebase 연동을 위해 필요한 다음 단계

### 1. Firebase 설정 확인
```bash
# Firebase 프로젝트 설정 확인
firebase projects:list
firebase use --add  # 프로젝트 선택
```

### 2. Firestore 보안 규칙 배포
```javascript
// firestore.rules 파일에 다음 규칙 추가:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 프로필
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 리딩 경험
    match /reading-experiences/{experienceId} {
      allow read: if resource.data.isPublished == true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // 댓글
    match /reading-comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // 좋아요, 북마크
    match /reading-likes/{likeId} {
      allow read: if true;
      allow create, delete: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /comment-likes/{likeId} {
      allow read: if true;
      allow create, delete: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Firestore 인덱스 설정
Firebase 콘솔에서 다음 인덱스들을 생성:
- `reading-experiences`: `isPublished (asc), createdAt (desc)`
- `reading-experiences`: `isPublished (asc), views (desc)`
- `reading-experiences`: `isPublished (asc), likes (desc)`
- `reading-experiences`: `tags (arrays), createdAt (desc)`
- `reading-comments`: `postId (asc), createdAt (asc)`

### 4. 환경 변수 설정
`.env.local` 파일에 Firebase 설정 추가:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. 사용자 프로필 초기 설정
사용자가 처음 가입할 때 `users` 컬렉션에 프로필 생성 필요

## 🧪 테스트 계획

### 1. 기본 CRUD 테스트
- [ ] 새 리딩 경험 작성
- [ ] 경험 목록 조회
- [ ] 상세 페이지 보기
- [ ] 좋아요/북마크 기능
- [ ] 댓글 작성/조회

### 2. 권한 테스트
- [ ] 비로그인 사용자 제한
- [ ] 작성자만 수정/삭제 가능
- [ ] 다른 사용자 데이터 보호

### 3. 성능 테스트
- [ ] 페이지네이션 동작
- [ ] 대량 데이터 처리
- [ ] 실시간 업데이트

## 📋 주요 파일 목록

### Types & Schemas
- `/src/types/index.ts` - 전체 타입 정의
- `/FIRESTORE_SCHEMA.md` - DB 스키마 문서

### Server Actions
- `/src/actions/readingExperienceActions.ts` - 서버 액션

### Services
- `/src/services/reading-experience-service.ts` - 클라이언트 서비스
- `/src/services/reading-comment-service.ts` - 댓글 서비스

### Pages
- `/src/app/community/reading-share/page.tsx` - 목록 페이지
- `/src/app/community/reading-share/new/page.tsx` - 작성 페이지 (Firebase 연동 완료)
- `/src/app/community/reading-share/[id]/page.tsx` - 상세 페이지

## 🎯 Firebase 배포 명령어

```bash
# Firestore 규칙 배포
firebase deploy --only firestore:rules

# 인덱스 배포
firebase deploy --only firestore:indexes

# 전체 배포
firebase deploy
```

**모든 준비가 완료되었습니다! 이제 Firebase 콘솔에서 설정을 완료하고 테스트를 시작할 수 있습니다.** 🚀