# 📋 블로그 시스템 마무리 작업 지시서

## 🔍 현재 상황

### ✅ 완료된 사항
1. **파일 저장소 기반 데이터 시스템** 구축 완료
2. **12개 블로그 포스트** 데이터 마이그레이션 완료
3. **관리자 CRUD UI** 완전 구현
4. **API 엔드포인트** 전체 구현 (GET/POST/PUT/DELETE)

### ❌ 미해결 이슈
1. **Import 오류**: `getAllPosts` 함수가 export되지 않음
2. **프론트엔드 렌더링**: 블로그 페이지에 포스트가 표시되지 않음
3. **이미지 업로드**: 구현되지 않음

---

## 🎯 작업 목표

### 1️⃣ 긴급 - getAllPosts 함수 Export 문제 해결 (30분)

**문제점**:
```
Attempted import error: 'getAllPosts' is not exported from '@/lib/blog/posts'
```

**영향받는 파일들**:
- `/src/app/blog/[slug]/page.tsx`
- `/src/components/blog/BlogPostDetail.tsx`
- `/src/components/blog/RecommendedPostsSidebar.tsx`

**해결 방안**:
1. **옵션 A**: `@/lib/blog/posts.ts`에 `getAllPosts` 함수 추가
2. **옵션 B**: API 호출로 대체 (`fetch('/api/blog/posts')`)
3. **옵션 C**: 서비스 함수 직접 import

**구현 세부사항**:
```typescript
// 옵션 A 예시
export async function getAllPosts(): Promise<BlogPost[]> {
  if (typeof window !== 'undefined') {
    // 클라이언트: API 호출
    const res = await fetch('/api/blog/posts');
    const data = await res.json();
    return data.posts || [];
  } else {
    // 서버: 직접 데이터 접근
    return mockPosts;
  }
}
```

### 2️⃣ 긴급 - 블로그 상세 페이지 수정 (1시간)

**작업 내용**:
1. **동적 라우팅 수정**
   - `/blog/[slug]` → `/blog/[id]` 변경 고려
   - 또는 slug 기반 조회 로직 구현

2. **서버 컴포넌트 최적화**
   - 데이터 fetching 로직 개선
   - 에러 처리 강화

3. **관련 컴포넌트 업데이트**
   - `BlogPostDetail.tsx`
   - `RecommendedPostsSidebar.tsx`
   - SEO 메타데이터 처리

### 3️⃣ 중요 - 이미지 업로드 기능 구현 (1.5시간)

**구현 내용**:
1. **업로드 API 엔드포인트**
   ```typescript
   // /api/blog/upload/route.ts
   - 파일 검증 (타입, 크기)
   - 파일 저장 (/public/uploads/blog/)
   - URL 반환
   ```

2. **ImageUpload 컴포넌트 연동**
   - 드래그 앤 드롭 지원
   - 미리보기 기능
   - 진행률 표시

3. **보안 고려사항**
   - 파일 타입 제한 (jpg, png, webp)
   - 파일 크기 제한 (5MB)
   - 파일명 sanitization

### 4️⃣ 최종 검증 - 전체 시스템 테스트 (30분)

**테스트 시나리오**:
1. **블로그 목록 페이지**
   - 12개 포스트 표시 확인
   - 페이지네이션 작동
   - 카테고리 필터링

2. **블로그 상세 페이지**
   - 각 포스트 접근 가능
   - 콘텐츠 정상 표시
   - 추천 포스트 표시

3. **관리자 CRUD 플로우**
   - 새 포스트 작성 (이미지 포함)
   - 기존 포스트 수정
   - 포스트 삭제
   - 프론트엔드 반영 확인

---

## 💻 기술 구현 가이드

### getAllPosts 함수 구현
```typescript
// src/lib/blog/posts.ts
export async function getAllPosts(): Promise<BlogPost[]> {
  // 개발 환경에서는 파일 시스템 사용
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/api/blog/posts`);
      if (response.ok) {
        const data = await response.json();
        return data.posts || [];
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }
  
  // Fallback to mockPosts
  return mockPosts;
}

// 단일 포스트 조회
export async function getPostById(id: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find(post => post.id === id) || null;
}
```

### 이미지 업로드 API
```typescript
// src/app/api/blog/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }
    
    // 파일 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: '허용되지 않는 파일 형식입니다.' }, { status: 400 });
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json({ error: '파일 크기가 너무 큽니다.' }, { status: 400 });
    }
    
    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filepath = path.join(process.cwd(), 'public/uploads/blog', filename);
    
    await writeFile(filepath, buffer);
    
    return NextResponse.json({ 
      url: `/uploads/blog/${filename}`,
      filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
  }
}
```

---

## ✅ 완료 기준

### 필수 요구사항
- [ ] 블로그 페이지에서 12개 포스트 모두 표시
- [ ] 각 포스트 상세 페이지 정상 접근
- [ ] 관리자 대시보드에서 CRUD 모든 기능 작동
- [ ] 이미지 업로드 및 표시 정상 작동

### 성능 요구사항
- [ ] 페이지 로드 시간 3초 이내
- [ ] 이미지 로드 최적화
- [ ] API 응답 시간 500ms 이내

### 품질 요구사항
- [ ] 모든 TypeScript 타입 오류 해결
- [ ] 콘솔 에러 없음
- [ ] Playwright 테스트 통과

---

## 📊 예상 소요 시간
- **총 소요 시간**: 3.5시간
- **우선순위**:
  1. getAllPosts 문제 해결 (30분) - **필수**
  2. 블로그 상세 페이지 수정 (1시간) - **필수**
  3. 이미지 업로드 구현 (1.5시간) - **중요**
  4. 최종 테스트 (30분) - **필수**

---

## ⚠️ 주의사항

1. **호환성 유지**
   - 기존 mockPosts 구조 유지
   - API 응답 형식 변경 금지
   - 파일 저장소 백업 유지

2. **보안 고려**
   - 파일 업로드 검증 철저히
   - SQL Injection 방지
   - XSS 방지

3. **성능 최적화**
   - 이미지 lazy loading
   - 캐싱 전략 적용
   - 불필요한 re-render 방지

---

**작성일**: 2025-08-08
**PM**: SWARM PM
**목표**: 블로그 시스템 완전 작동 상태 달성