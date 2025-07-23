# Firestore 데이터베이스 스키마 설계

## 컬렉션 구조

### 1. users (사용자 정보)
```
users/{userId}
{
  id: string,
  email: string,
  name: string,
  avatar?: string,
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  bio?: string,
  followersCount: number,
  followingCount: number,
  postsCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. reading-experiences (리딩 경험)
```
reading-experiences/{experienceId}
{
  id: string,
  title: string,
  content: string,
  authorId: string,
  spreadType: string,
  cards: string[],
  tags: string[],
  likes: number,
  commentsCount: number,
  views: number,
  isPublished: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. reading-comments (리딩 경험 댓글)
```
reading-comments/{commentId}
{
  id: string,
  postId: string,
  authorId: string,
  content: string,
  parentId?: string, // 대댓글용
  likes: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. reading-likes (리딩 경험 좋아요)
```
reading-likes/{likeId}
{
  id: string,
  postId: string,
  userId: string,
  createdAt: timestamp
}
```

### 5. comment-likes (댓글 좋아요)
```
comment-likes/{likeId}
{
  id: string,
  commentId: string,
  userId: string,
  createdAt: timestamp
}
```

### 6. bookmarks (북마크)
```
bookmarks/{bookmarkId}
{
  id: string,
  userId: string,
  postId: string,
  createdAt: timestamp
}
```

### 7. user-follows (팔로우 관계)
```
user-follows/{followId}
{
  id: string,
  followerId: string,
  followingId: string,
  createdAt: timestamp
}
```

## 인덱스 설계

### reading-experiences 인덱스
- `authorId` (단일 필드)
- `createdAt` (단일 필드, 내림차순)
- `likes` (단일 필드, 내림차순)
- `views` (단일 필드, 내림차순)
- `isPublished, createdAt` (복합 인덱스, 내림차순)
- `tags` (배열 멤버십)
- `spreadType, createdAt` (복합 인덱스)

### reading-comments 인덱스
- `postId, createdAt` (복합 인덱스)
- `authorId` (단일 필드)
- `parentId` (단일 필드)

### reading-likes 인덱스
- `postId` (단일 필드)
- `userId, postId` (복합 인덱스)

### comment-likes 인덱스
- `commentId` (단일 필드)
- `userId, commentId` (복합 인덱스)

### bookmarks 인덱스
- `userId, createdAt` (복합 인덱스, 내림차순)
- `postId` (단일 필드)

### user-follows 인덱스
- `followerId` (단일 필드)
- `followingId` (단일 필드)
- `followerId, createdAt` (복합 인덱스)

## 보안 규칙

### users 컬렉션
```javascript
// 사용자는 자신의 프로필만 수정 가능
allow read: if true; // 모든 사용자 프로필은 읽기 가능
allow write: if request.auth != null && request.auth.uid == resource.id;
```

### reading-experiences 컬렉션
```javascript
// 게시된 글만 읽기 가능, 작성자만 수정 가능
allow read: if resource.data.isPublished == true;
allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
allow update: if request.auth != null && request.auth.uid == resource.data.authorId;
allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
```

### reading-comments 컬렉션
```javascript
// 모든 사람이 댓글 읽기 가능, 작성자만 수정/삭제 가능
allow read: if true;
allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
```

### reading-likes, comment-likes, bookmarks 컬렉션
```javascript
// 인증된 사용자만 생성/삭제 가능
allow read: if true;
allow create, delete: if request.auth != null && request.auth.uid == request.resource.data.userId;
```

## 쿼리 패턴

### 1. 최신 리딩 경험 가져오기
```javascript
db.collection('reading-experiences')
  .where('isPublished', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)
```

### 2. 인기 리딩 경험 가져오기
```javascript
db.collection('reading-experiences')
  .where('isPublished', '==', true)
  .orderBy('views', 'desc')
  .limit(20)
```

### 3. 특정 태그의 리딩 경험 가져오기
```javascript
db.collection('reading-experiences')
  .where('isPublished', '==', true)
  .where('tags', 'array-contains', '켈틱크로스')
  .orderBy('createdAt', 'desc')
```

### 4. 특정 게시글의 댓글 가져오기
```javascript
db.collection('reading-comments')
  .where('postId', '==', experienceId)
  .orderBy('createdAt', 'asc')
```

### 5. 사용자의 북마크 목록
```javascript
db.collection('bookmarks')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
```

## 데이터 일관성 관리

### 카운터 업데이트
- 좋아요 추가/삭제 시 `reading-experiences.likes` 업데이트
- 댓글 추가/삭제 시 `reading-experiences.commentsCount` 업데이트
- 게시글 작성 시 `users.postsCount` 업데이트
- 팔로우 시 `users.followersCount`, `users.followingCount` 업데이트

### 트랜잭션 사용
- 좋아요/북마크 토글 시 트랜잭션 사용
- 댓글 작성/삭제 시 카운터 업데이트와 함께 트랜잭션 사용
- 사용자 통계 업데이트 시 트랜잭션 사용

## 성능 최적화

### 페이지네이션
- `startAfter()` 사용하여 커서 기반 페이지네이션 구현
- 각 페이지당 20개 항목으로 제한

### 캐싱 전략
- 인기 게시글은 클라이언트 사이드 캐싱 (1시간)
- 사용자 프로필 정보는 세션 스토리지에 캐싱
- 태그 목록은 로컬 스토리지에 캐싱

### 실시간 업데이트
- 댓글 작성 시 실시간 업데이트
- 좋아요 수 실시간 반영
- 새 게시글 알림 (선택적)