# ⚡ 로딩 최적화 작업지시서

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로점 서비스
- **작업일자**: 2025-08-09
- **작업단계**: Loading Optimization Phase
- **포트**: 4000 (필수 고정)
- **PM 지휘**: SWARM PM 승인 후 진행

## 🎯 작업 목표

### ⚡ 로딩 성능 목표
- **First Contentful Paint**: 1.5초 이내
- **Largest Contentful Paint**: 2.5초 이내  
- **Cumulative Layout Shift**: 0.1 이하
- **First Input Delay**: 100ms 이내
- **Time to Interactive**: 3초 이내

## 📊 현재 로딩 성능 분석

### 🐌 확인된 로딩 지연 원인
1. **무거운 초기 번들**
   - 모든 컴포넌트가 한번에 로딩
   - 사용하지 않는 라이브러리 포함

2. **이미지 최적화 부족**
   - 대용량 이미지 파일
   - 지연 로딩 미적용

3. **JavaScript 실행 블로킹**
   - 동기적 스크립트 로딩
   - Critical rendering path 차단

## 🚀 Phase 1: 코드 스플리팅 및 지연 로딩 (1.5시간)

### 1.1 페이지 레벨 코드 스플리팅
**대상 페이지**:
```typescript
// 1. 관리자 페이지 - 가장 무거움
const AdminDashboard = lazy(() => import('@/app/admin/page'));

// 2. 타로 리딩 페이지
const TarotReading = lazy(() => import('@/app/tarot/reading/page'));

// 3. 블로그 상세 페이지
const BlogDetail = lazy(() => import('@/app/blog/[slug]/page'));

// 4. 커뮤니티 페이지
const Community = lazy(() => import('@/app/community/page'));
```

### 1.2 컴포넌트 레벨 지연 로딩
**무거운 컴포넌트들**:
```typescript
// 관리자 컴포넌트들
const BlogManagement = lazy(() => import('@/components/admin/BlogManagement'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const AnalyticsDashboard = lazy(() => import('@/components/admin/AnalyticsDashboard'));

// AI 관련 컴포넌트들
const TarotAI = lazy(() => import('@/components/ai/TarotAI'));
const DreamAI = lazy(() => import('@/components/ai/DreamAI'));
```

### 1.3 라이브러리 동적 로딩
```typescript
// Chart.js - 관리자 페이지에서만 사용
const loadChartJS = () => import('recharts');

// 타로카드 애니메이션 - 타로 페이지에서만 사용
const loadFramerMotion = () => import('framer-motion');

// Markdown 렌더러 - 블로그에서만 사용
const loadMarkdown = () => import('react-markdown');
```

## 🖼️ Phase 2: 이미지 및 리소스 최적화 (1시간)

### 2.1 이미지 최적화 구현
```typescript
// next.config.js 최적화 설정
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1년
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  }
};
```

### 2.2 Critical CSS 인라인화
**작업 내용**:
1. Above-the-fold 스타일 추출
2. CSS 인라인 삽입
3. 나머지 CSS 지연 로딩

### 2.3 폰트 최적화
```css
/* 폰트 최적화 */
@font-face {
  font-family: 'OptimizedFont';
  src: url('/fonts/font.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}
```

## ⚙️ Phase 3: 런타임 성능 최적화 (1시간)

### 3.1 React 컴포넌트 최적화
**최적화 대상 컴포넌트**:
```typescript
// 1. 무거운 렌더링 컴포넌트들
const BlogPostCard = memo(BlogPostCard);
const TarotCard = memo(TarotCard);
const AdminTable = memo(AdminTable);

// 2. 자주 리렌더링되는 컴포넌트들
const UserNav = memo(UserNav);
const Navbar = memo(Navbar);
const Sidebar = memo(Sidebar);
```

### 3.2 상태 관리 최적화
```typescript
// Context 분리로 불필요한 리렌더링 방지
const AuthContext = createContext();
const UIContext = createContext();
const DataContext = createContext();

// useMemo, useCallback 적용
const memoizedData = useMemo(() => processData(data), [data]);
const handleClick = useCallback(() => {}, [dependency]);
```

### 3.3 가상화 적용
```typescript
// 긴 목록에 가상화 적용
import { FixedSizeList as List } from 'react-window';

// 블로그 포스트 목록
const VirtualizedBlogList = ({ posts }) => (
  <List
    height={600}
    itemCount={posts.length}
    itemSize={120}
    itemData={posts}
  >
    {BlogPostItem}
  </List>
);
```

## 🔄 Phase 4: 캐싱 전략 구현 (30분)

### 4.1 서비스 워커 구현
```javascript
// public/sw.js
const CACHE_NAME = 'innerspell-v1';
const urlsToCache = [
  '/',
  '/blog',
  '/tarot/reading',
  '/static/css/main.css',
  '/static/js/main.js'
];
```

### 4.2 API 응답 캐싱
```typescript
// SWR 또는 React Query 적용
import useSWR from 'swr';

const { data: posts } = useSWR('/api/blog/posts', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000, // 5분
});
```

### 4.3 브라우저 캐싱 최적화
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};
```

## 📱 Phase 5: 모바일 최적화 (30분)

### 5.1 반응형 이미지
```typescript
<Image
  src="/hero-image.jpg"
  alt="Hero"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>
```

### 5.2 터치 최적화
```css
/* 터치 인터랙션 최적화 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}
```

## 📊 Phase 6: 성능 측정 및 모니터링 (30분)

### 6.1 성능 측정 스크립트
```typescript
// 성능 측정 Playwright 스크립트
const measurePerformance = async (page) => {
  await page.goto('http://localhost:4000');
  
  const metrics = await page.evaluate(() => {
    return {
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
      cls: performance.getEntriesByName('layout-shift')[0]?.value,
    };
  });
  
  return metrics;
};
```

### 6.2 번들 분석
```bash
# 번들 크기 분석
npm run analyze

# Lighthouse 자동 측정
npx lighthouse http://localhost:4000 --output=json
```

## 🎯 작업 체크리스트

### ✅ Phase 1: 코드 스플리팅
- [ ] 페이지 레벨 lazy loading 적용
- [ ] 컴포넌트 레벨 lazy loading 적용
- [ ] 라이브러리 동적 로딩 적용
- [ ] Suspense 및 fallback UI 구현

### ✅ Phase 2: 이미지 최적화
- [ ] next/image 전면 적용
- [ ] WebP/AVIF 형식 지원
- [ ] 지연 로딩 구현
- [ ] Critical CSS 인라인화

### ✅ Phase 3: 런타임 최적화
- [ ] React.memo 적용
- [ ] useMemo, useCallback 최적화
- [ ] 불필요한 리렌더링 제거
- [ ] 가상화 적용

### ✅ Phase 4: 캐싱 전략
- [ ] 서비스 워커 구현
- [ ] API 캐싱 적용
- [ ] 브라우저 캐싱 최적화

### ✅ Phase 5: 모바일 최적화
- [ ] 반응형 이미지 적용
- [ ] 터치 최적화
- [ ] 뷰포트 최적화

### ✅ Phase 6: 성능 측정
- [ ] Playwright 성능 측정 스크립트
- [ ] Lighthouse 점수 측정
- [ ] 번들 크기 분석

## 🎲 성공 지표

### Core Web Vitals 목표
- **LCP**: 2.5초 이내 ✅
- **FID**: 100ms 이내 ✅
- **CLS**: 0.1 이하 ✅

### 추가 성능 지표
- **TTI**: 3초 이내 ✅
- **Bundle Size**: 1MB 이하 ✅
- **Image Load Time**: 1초 이내 ✅

## ⚠️ 주의사항

1. **Playwright로 모든 변경사항 검증 필수**
2. **포트 4000 고정 유지**
3. **기능 동작 확인 후 최적화 적용**
4. **성능 측정 데이터 백업**
5. **SWARM PM 승인 하에 진행**

---
**📅 예상 작업 시간**: 4시간  
**👥 담당**: SuperClaude Performance Team  
**🎯 목표**: 세계적 수준의 로딩 성능 달성