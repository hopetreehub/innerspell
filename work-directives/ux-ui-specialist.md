# 🟢 UX/UI 전문가 작업 지시서

## 📋 작업 개요
- **담당자**: UX/UI Specialist
- **우선순위**: 🟡 중간
- **예상 소요시간**: 2일
- **시작일**: 2025년 1월 4일

---

## 🎯 주요 목표
1. 모바일 반응형 완벽 검증 및 개선
2. 접근성 WCAG 2.1 AA 준수
3. 사용자 경험 일관성 확보

---

## 📝 상세 작업 내용

### Day 1: UX 감사 및 개선

#### 오전 (09:00-12:00)
```css
/* 1. 반응형 브레이크포인트 검증 */
/* tailwind.config.js 기준 */
@media (max-width: 640px) { /* sm */ }
@media (max-width: 768px) { /* md */ }
@media (max-width: 1024px) { /* lg */ }
@media (max-width: 1280px) { /* xl */ }

/* 2. 터치 타겟 크기 확인 */
.touch-target {
  min-width: 44px;
  min-height: 44px; /* WCAG 기준 */
  touch-action: manipulation;
}

/* 3. 모바일 제스처 지원 */
.swipeable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
```

#### 오후 (13:00-18:00)
```typescript
// 4. 접근성 개선
// 키보드 네비게이션
const handleKeyDown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'Tab':
      // 포커스 트랩 구현
      break;
    case 'Escape':
      // 모달/다이얼로그 닫기
      break;
    case 'Enter':
    case ' ':
      // 버튼 활성화
      break;
  }
};

// 5. 스크린 리더 지원
<button
  aria-label="타로 카드 선택"
  aria-pressed={isSelected}
  aria-describedby="card-description"
  role="button"
  tabIndex={0}
>
  {/* 콘텐츠 */}
</button>

// 6. 색상 대비 검증
const colors = {
  // 최소 4.5:1 대비율 (AA 기준)
  text: '#1a1a1a',
  background: '#ffffff',
  // 3:1 대비율 (대형 텍스트)
  heading: '#333333',
  surface: '#f5f5f5',
};
```

### Day 2: 인터랙션 및 시스템 완성

#### 오전 (09:00-12:00)
```typescript
// 7. 로딩 상태 최적화
const LoadingStates = {
  // 스켈레톤 스크린
  skeleton: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ),
  
  // 프로그레스 인디케이터
  progress: ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-width"
        style={{ width: `${value}%` }}
      />
    </div>
  ),
  
  // 스피너
  spinner: () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  )
};

// 8. 애니메이션 성능 최적화
const optimizedAnimation = {
  // GPU 가속 활용
  transform: 'translateZ(0)',
  willChange: 'transform',
  // 60fps 유지
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// 9. 에러 처리 UX
const ErrorBoundary = ({ error, reset }: ErrorBoundaryProps) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Icon name="alert-circle" className="w-16 h-16 text-red-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">문제가 발생했습니다</h2>
    <p className="text-gray-600 mb-4 text-center">
      {error.message || '일시적인 오류가 발생했습니다.'}
    </p>
    <Button onClick={reset} variant="primary">
      다시 시도
    </Button>
  </div>
);
```

#### 오후 (13:00-18:00)
```css
/* 10. 다크모드 일관성 */
:root {
  /* 라이트 모드 */
  --color-background: 255 255 255;
  --color-foreground: 0 0 0;
  --color-primary: 99 102 241;
  --color-accent: 236 72 153;
}

[data-theme="dark"] {
  /* 다크 모드 */
  --color-background: 17 24 39;
  --color-foreground: 243 244 246;
  --color-primary: 129 140 248;
  --color-accent: 244 114 182;
}

/* 11. 디자인 시스템 토큰 */
.design-tokens {
  /* 간격 */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;
  
  /* 폰트 크기 */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  
  /* 그림자 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* 애니메이션 */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

---

## 🔍 중점 확인 사항

### 1. 모바일 체크리스트
- [ ] 320px ~ 768px 모든 해상도 검증
- [ ] 터치 제스처 지원 (스와이프, 핀치 줌)
- [ ] 가로/세로 모드 전환 대응
- [ ] iOS/Android 네이티브 느낌
- [ ] 소프트 키보드 대응

### 2. 접근성 체크리스트
- [ ] 키보드만으로 전체 네비게이션 가능
- [ ] 스크린 리더 완벽 지원
- [ ] 색상 대비 4.5:1 이상
- [ ] 포커스 인디케이터 명확
- [ ] 에러 메시지 접근성
- [ ] 대체 텍스트 제공

### 3. 성능 체크리스트
- [ ] 첫 화면 로딩 < 3초
- [ ] 인터랙션 응답 < 100ms
- [ ] 애니메이션 60fps 유지
- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] 폰트 최적화 (서브셋, 프리로드)

---

## 📊 디자인 시스템 문서화

### 컴포넌트 라이브러리
```typescript
// Button 컴포넌트 가이드
<Button 
  variant="primary|secondary|outline|ghost"
  size="sm|md|lg"
  disabled={boolean}
  loading={boolean}
  fullWidth={boolean}
  icon={IconComponent}
>
  버튼 텍스트
</Button>

// Card 컴포넌트 가이드
<Card
  variant="default|elevated|outlined"
  padding="none|sm|md|lg"
  interactive={boolean}
>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>콘텐츠</CardContent>
  <CardFooter>액션</CardFooter>
</Card>
```

### 색상 팔레트
```javascript
const palette = {
  primary: {
    50: '#eef2ff',
    500: '#6366f1',
    900: '#312e81',
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};
```

### 타이포그래피
```css
.typography {
  /* Heading */
  --font-heading: 'Noto Serif KR', serif;
  --weight-heading: 700;
  
  /* Body */
  --font-body: 'Noto Sans KR', sans-serif;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

---

## 🎯 최종 체크리스트

### 필수 완료 항목
- [ ] 모든 페이지 반응형 검증
- [ ] WCAG 2.1 AA 준수 확인
- [ ] 다크모드 일관성 검증
- [ ] 로딩/에러 상태 UX 개선
- [ ] 디자인 시스템 문서 완성
- [ ] Storybook 컴포넌트 문서화
- [ ] 사용자 테스트 피드백 반영

### 품질 기준
- [ ] Lighthouse 접근성 점수 95+
- [ ] 모바일 사용성 100%
- [ ] 디자인 일관성 검증 통과
- [ ] 사용자 만족도 4.5/5 이상

---

## 🚨 주의사항

1. **접근성 우선**
   - 모든 인터랙티브 요소에 적절한 ARIA 레이블
   - 키보드 네비게이션 완벽 지원
   - 색맹 사용자 고려

2. **성능 최적화**
   - 불필요한 리렌더링 방지
   - 이미지 최적화 필수
   - CSS-in-JS 최소화

3. **일관성 유지**
   - 디자인 토큰 활용
   - 컴포넌트 재사용
   - 패턴 라이브러리 준수

---

## 📁 주요 작업 파일

### 컴포넌트
- `/src/components/ui/*` - UI 컴포넌트
- `/src/components/layout/*` - 레이아웃
- `/src/components/reading/*` - 타로 리딩 UI
- `/src/components/dream/*` - 꿈해몽 UI

### 스타일
- `/src/styles/globals.css` - 전역 스타일
- `/tailwind.config.js` - Tailwind 설정
- `/src/lib/utils.ts` - 스타일 유틸리티

### 문서
- `/docs/design-system.md` - 디자인 시스템
- `/docs/accessibility.md` - 접근성 가이드
- `/storybook/` - 컴포넌트 문서

---

## 🎯 최종 목표

### 완료 기준
1. 모든 디바이스에서 완벽한 반응형
2. WCAG 2.1 AA 인증 준비
3. 디자인 시스템 100% 문서화
4. 사용자 테스트 통과

### 산출물
1. UX 감사 보고서
2. 접근성 인증 체크리스트
3. 디자인 시스템 문서
4. 컴포넌트 라이브러리 가이드

---

## 💡 참고 자료
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React 접근성 가이드](https://react.dev/reference/react-dom/components/common#accessibility-attributes)

---

**작성자**: PM Claude  
**최종 수정**: 2025년 1월 3일