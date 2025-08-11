# 📋 블로그 CRUD 기능 완성 작업 지시서

## 🔍 현재 상태 분석

### 시스템 구조
1. **파일 저장소 모드 활성화됨**
   - `isFileStorageEnabled = true` (개발 환경)
   - 데이터는 `/data/blog-posts.json` 파일에 저장
   - 백업 시스템 구현됨 (`/data/backups/`)

2. **API 라우트 구현 상태**
   - GET `/api/blog/posts` - ✅ 구현됨 (파일 저장소 연동)
   - POST `/api/blog/posts` - ✅ 구현됨 (관리자 전용)
   - PUT/DELETE - ⚠️ 개별 포스트 API 미구현

3. **관리자 대시보드**
   - 블로그 관리 탭 - ✅ UI 존재
   - 새 포스트 작성 버튼 - ✅ 표시됨
   - 포스트 목록 - ❌ 비어있음 (0개)
   - CRUD 모달/폼 - ⚠️ 구현 필요

### 문제점
- 파일 저장소는 활성화되었으나 실제 데이터가 없음
- 관리자 대시보드에서 포스트 작성 기능이 미완성
- 기존 mockPosts 데이터가 파일 저장소로 마이그레이션되지 않음

---

## 🎯 작업 목표

### 1단계: 데이터 마이그레이션 (30분)
1. **기존 mockPosts → 파일 저장소 이전**
   - 12개 포스트 데이터를 `/data/blog-posts.json`으로 저장
   - 초기 데이터 설정 스크립트 작성

### 2단계: 관리자 대시보드 CRUD UI 완성 (2시간)
1. **새 포스트 작성 모달**
   - 제목, 요약, 본문, 카테고리, 태그 입력 폼
   - 이미지 업로드 기능
   - 미리보기 기능
   - 저장/게시 버튼

2. **포스트 목록 테이블**
   - 제목, 카테고리, 작성일, 상태(게시/임시) 표시
   - 수정/삭제 버튼
   - 페이지네이션

3. **수정 모달**
   - 기존 데이터 로드
   - 수정 사항 저장

### 3단계: API 엔드포인트 완성 (1시간)
1. **개별 포스트 라우트 생성**
   - GET `/api/blog/posts/[id]`
   - PUT `/api/blog/posts/[id]`
   - DELETE `/api/blog/posts/[id]`

2. **이미지 업로드 API**
   - POST `/api/blog/upload`
   - 로컬 파일 시스템 저장

### 4단계: 프론트엔드 연동 (30분)
1. **블로그 페이지 데이터 연동**
   - 파일 저장소의 실제 데이터 표시
   - 카테고리 필터링
   - 검색 기능

---

## 💻 구현 세부사항

### 파일 구조
```
/data/
  ├── blog-posts.json      # 블로그 포스트 데이터
  ├── blog-categories.json # 카테고리 데이터
  └── backups/            # 자동 백업 파일
      └── blog-posts_*.json

/public/uploads/blog/     # 블로그 이미지 저장
```

### 데이터 스키마
```typescript
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  authorId: string;
  publishedAt: Date;
  updatedAt: Date;
  createdAt: Date;
  readingTime: number;
  image: string;
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
}
```

### 관리자 대시보드 컴포넌트 구조
```
/src/components/admin/blog/
  ├── BlogPostsList.tsx      # 포스트 목록 테이블
  ├── BlogPostForm.tsx       # 작성/수정 폼
  ├── BlogPostModal.tsx      # 모달 래퍼
  └── BlogImageUpload.tsx    # 이미지 업로드 컴포넌트
```

---

## 🚀 작업 순서

### 즉시 실행 작업
1. **데이터 초기화 스크립트 생성 및 실행**
   ```bash
   node scripts/init-blog-data.js
   ```

2. **관리자 대시보드 블로그 탭 UI 구현**
   - 포스트 목록 컴포넌트
   - 새 포스트 작성 모달
   - 폼 유효성 검사

3. **API 엔드포인트 구현**
   - CRUD 작업 완성
   - 에러 처리

4. **Playwright 테스트**
   - 포스트 작성 플로우
   - 수정/삭제 기능
   - 프론트엔드 표시 확인

---

## ✅ 완료 기준

### 기능적 요구사항
- [ ] 관리자가 블로그 포스트를 작성할 수 있음
- [ ] 작성된 포스트가 파일 시스템에 저장됨
- [ ] 포스트 수정/삭제 가능
- [ ] 이미지 업로드 및 저장 가능
- [ ] 프론트엔드에서 실제 데이터 표시

### 기술적 요구사항
- [ ] 모든 CRUD 작업이 파일 저장소와 연동
- [ ] 자동 백업 시스템 작동
- [ ] API 응답 시간 500ms 이내
- [ ] 에러 처리 및 사용자 피드백

### 테스트 요구사항
- [ ] Playwright로 전체 CRUD 플로우 검증
- [ ] 12개 이상의 포스트 생성 테스트
- [ ] 이미지 업로드 테스트
- [ ] 데이터 영속성 확인

---

## ⚠️ 주의사항

1. **파일 시스템 보안**
   - 업로드 파일 타입 검증 (이미지만)
   - 파일 크기 제한 (5MB)
   - 파일명 sanitization

2. **데이터 무결성**
   - 동시 쓰기 방지 (파일 잠금)
   - 자동 백업 유지
   - 트랜잭션 보장

3. **성능 고려사항**
   - 대용량 콘텐츠 처리
   - 이미지 최적화
   - 캐싱 전략

---

## 📊 예상 소요 시간
- **총 소요 시간**: 4시간
- **우선순위**: 
  1. 데이터 초기화 (30분)
  2. 관리자 UI (2시간)
  3. API 완성 (1시간)
  4. 테스트 (30분)

---

**작성일**: 2025-08-08
**PM**: SWARM PM
**목표**: 관리자 대시보드를 통한 실제 블로그 CRUD 기능 완성