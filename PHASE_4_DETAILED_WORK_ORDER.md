# Phase 4: 블로그 시스템 최종 완성 - 상세 작업지시서

## 🎯 작업 목표
블로그 시스템의 SEO, 성능, 사용자 경험을 개선하여 프로덕션 레벨로 완성

## 📋 구체적 작업 내용

### 1. SEO 및 메타데이터 관리 (우선순위: 높음)

#### 1.1 동적 메타태그 구현
```typescript
// src/app/blog/[slug]/page.tsx에 추가
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  return {
    title: `${post.title} | InnerSpell Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
```

#### 1.2 구조화된 데이터 추가
- BlogPosting 스키마 구현
- BreadcrumbList 스키마 추가
- Organization 스키마 설정

#### 1.3 사이트맵 생성
```typescript
// src/app/sitemap.ts
export default async function sitemap() {
  const posts = await getAllPosts();
  const postUrls = posts.map(post => ({
    url: `https://innerspell.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  return [
    {
      url: 'https://innerspell.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://innerspell.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postUrls,
  ];
}
```

### 2. 이미지 최적화 (우선순위: 높음)

#### 2.1 Next.js Image 컴포넌트 적용
```typescript
// 변경 전
<img src={post.image} alt={post.title} />

// 변경 후
<Image
  src={post.image}
  alt={post.title}
  width={800}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL={post.blurDataURL}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### 2.2 이미지 최적화 유틸리티
```typescript
// src/utils/image-optimization.ts
import { getPlaiceholder } from 'plaiceholder';

export async function getBlurDataURL(src: string) {
  try {
    const { base64 } = await getPlaiceholder(src);
    return base64;
  } catch (error) {
    return null;
  }
}
```

#### 2.3 이미지 업로드 시 자동 최적화
- Sharp 라이브러리로 리사이징
- WebP 포맷 자동 변환
- 여러 크기 버전 생성 (thumbnail, medium, large)

### 3. 성능 최적화 (우선순위: 높음)

#### 3.1 번들 분석
```bash
# package.json에 추가
"analyze": "ANALYZE=true next build"

# next.config.js에 추가
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

#### 3.2 동적 임포트 적용
```typescript
// 무거운 컴포넌트 지연 로딩
const BlogEditor = dynamic(() => import('@/components/blog/BlogEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});
```

#### 3.3 API 응답 캐싱
```typescript
// src/app/api/blog/posts/route.ts
export async function GET(request: Request) {
  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

### 4. 댓글 시스템 구현 (우선순위: 중간)

#### 4.1 댓글 컴포넌트
```typescript
// src/components/blog/CommentSection.tsx
- 댓글 목록 표시
- 댓글 작성 폼
- 답글 기능
- 좋아요/싫어요
- 신고 기능
```

#### 4.2 댓글 API
```typescript
// src/app/api/blog/posts/[postId]/comments/route.ts
- GET: 댓글 목록 조회
- POST: 댓글 작성
- PUT: 댓글 수정
- DELETE: 댓글 삭제
```

### 5. 좋아요 및 조회수 기능 (우선순위: 중간)

#### 5.1 좋아요 기능
```typescript
// src/components/blog/LikeButton.tsx
- 로컬 스토리지로 중복 방지
- 낙관적 업데이트
- 애니메이션 효과
```

#### 5.2 조회수 추적
```typescript
// src/hooks/useViewTracking.ts
- 페이지 진입 시 조회수 증가
- 중복 조회 방지 (세션 기반)
- 실시간 조회수 표시
```

### 6. 관련 포스트 추천 (우선순위: 중간)

#### 6.1 추천 알고리즘
```typescript
// src/utils/post-recommendation.ts
export function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[]) {
  // 1. 같은 카테고리 우선
  // 2. 태그 일치도 계산
  // 3. 최신 포스트 우선
  // 4. 인기도 가중치
  return recommendedPosts.slice(0, 4);
}
```

### 7. 모바일 최적화 (우선순위: 낮음)

#### 7.1 터치 제스처
- 스와이프로 다음/이전 포스트
- 풀다운 새로고침
- 핀치 줌 이미지

#### 7.2 모바일 특화 UI
- 하단 네비게이션 바
- 플로팅 액션 버튼
- 간소화된 댓글 UI

### 8. 보안 강화 (우선순위: 중간)

#### 8.1 입력 검증
```typescript
// src/utils/validation.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().transform(val => DOMPurify.sanitize(val)),
  tags: z.array(z.string()).max(10),
  category: z.enum(['타로', '영성', '꿈해몽', '라이프스타일', '명상', 'general']),
});
```

#### 8.2 Rate Limiting
```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## 📝 테스트 체크리스트

### SEO 테스트
- [ ] Google PageSpeed Insights 점수 90+ 달성
- [ ] 메타태그 검증 (Facebook Debugger, Twitter Card Validator)
- [ ] 구조화된 데이터 테스트 (Google Rich Results Test)
- [ ] 사이트맵 접근성 확인

### 성능 테스트
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Bundle Size < 200KB (gzipped)
- [ ] 이미지 로딩 시간 측정

### 기능 테스트
- [ ] 댓글 CRUD 작동 확인
- [ ] 좋아요 중복 방지 확인
- [ ] 조회수 정확성 검증
- [ ] 추천 포스트 관련성 확인

### 접근성 테스트
- [ ] 키보드만으로 전체 네비게이션 가능
- [ ] 스크린 리더 테스트
- [ ] 색상 대비 4.5:1 이상
- [ ] 포커스 인디케이터 명확

### 보안 테스트
- [ ] XSS 공격 시도
- [ ] SQL Injection 테스트
- [ ] Rate Limiting 작동 확인
- [ ] 권한 우회 시도

## 🚀 구현 순서

1. **1주차**: SEO 메타데이터 + 이미지 최적화
2. **2주차**: 성능 최적화 + 댓글 시스템
3. **3주차**: 좋아요/조회수 + 관련 포스트
4. **4주차**: 모바일 최적화 + 보안 강화

## ⚠️ 주의사항

1. **백워드 호환성**: 기존 데이터 구조 유지
2. **점진적 개선**: 한 번에 하나씩 구현
3. **테스트 우선**: 각 기능 구현 후 즉시 테스트
4. **성능 모니터링**: 각 변경 후 성능 측정
5. **다크모드 지원**: 모든 새 컴포넌트는 다크모드 스타일 포함

## 📊 성공 지표

- PageSpeed 점수: 90+ (모바일/데스크톱)
- 첫 로딩 시간: 3초 이내
- SEO 점수: 95+
- 접근성 점수: 100
- 사용자 참여도: 댓글/좋아요 10% 증가

---
작성일: 2025-01-09
작성자: SWARM PM
상태: 검토 완료, 실행 대기