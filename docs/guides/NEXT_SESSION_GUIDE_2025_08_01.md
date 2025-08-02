# 다음 세션을 위한 지침 - 2025년 8월 1일

## 🎯 현재 프로젝트 상태 (완료된 핵심 기능)

### ✅ 완성된 주요 기능들
1. **타로 카드 펼치기 시스템** - 완벽 구현
   - **카드 오버랩**: 정확히 -125px 간격으로 구현 완료
   - **레이아웃**: flex layout + marginLeft 방식 사용
   - **세로 정렬**: 256px 고정 높이로 완벽한 정렬
   - **애니메이션**: Framer Motion 기반 부드러운 카드 펼치기

2. **타로 해석 시스템** - 완벽 작동
   - 2,737개 타로 지침 완전 구현
   - 42가지 스프레드×스타일 조합별 차별화된 해석
   - Google Gemini + OpenAI 이중 백업 AI 시스템

3. **저장/공유 시스템** - 완벽 작동
   - Firebase Firestore 기반 리딩 저장
   - localStorage 백업 시스템 (비인증 사용자용)
   - 30일 만료 공유 링크 생성
   - 클립보드 자동 복사 기능

4. **리딩 기록 관리** - 완벽 작동
   - "내 리딩" 메인 네비게이션 메뉴
   - "내 리딩 기록" 사용자 드롭다운 메뉴
   - 완전한 CRUD 작업 지원
   - 인증 기반 접근 제어

## 🔧 최근 수정 사항 (2025-08-01)

### 카드 펼치기 레이아웃 최종 완성
```typescript
// 변경 전: absolute positioning with left calculation
style={{ 
  left: `${index * 35}px`
}}

// 변경 후: flex layout with marginLeft
style={{ 
  marginLeft: index === 0 ? '0px' : '-125px'
}}
```

### 핵심 구현 코드 위치
- **파일**: `/src/components/reading/TarotReadingClient.tsx`
- **라인**: 862-891 (카드 펼치기 컨테이너 및 카드 레이아웃)
- **중요**: `marginLeft: index === 0 ? '0px' : '-125px'` 절대 변경 금지

## 🚨 절대 지켜야 할 핵심 규칙들

### 1. 포트 사용 규칙 (절대 준수)
- **반드시 포트 4000번만 사용할 것**
- `package.json`의 dev script: `"dev": "next dev --hostname 0.0.0.0 --port 4000"`
- 다른 포트 사용 절대 금지

### 2. Vercel 배포 우선 원칙 (절대 준수)
- **모든 작업과 확인은 Vercel 배포 기준으로 진행**
- **워크플로우**: 코드 수정 → Git 커밋 → Vercel 자동 배포 → Vercel에서 확인
- **로컬 테스트 금지**: 로컬 개발 서버로 테스트하지 말고 반드시 Vercel에서 확인
- **Vercel URL**: https://test-studio-firebase.vercel.app

### 3. 디자인 수정 금지 원칙 (절대 준수)
- **카드 펼치기 간격**: `marginLeft: '-125px'` 절대 변경 금지
- **컨테이너 높이**: `height: '256px'` 고정값 유지
- **카드 크기 및 비율**: 현재 설정 그대로 유지
- **애니메이션 및 호버 효과**: 기존 스타일 유지

### 4. 절대 추정 금지 원칙
- **Playwright로 실제 확인**: 모든 UI 변경사항은 Playwright(Chromium)로 직접 확인
- **스크린샷 검증**: 변경사항을 스크린샷으로 문서화
- **실제 테스트**: 가정하지 말고 실제 기능 테스트로 확인

## 📁 중요 파일 위치 및 역할

### 핵심 컴포넌트
- **타로 리딩 메인**: `/src/components/reading/TarotReadingClient.tsx`
- **Firebase 클라이언트**: `/src/lib/firebase/client.ts`
- **타로 지침 데이터**: `/src/data/tarot-guidelines.ts`
- **저장/공유 기능**: `/src/lib/firebase/client-save.ts`, `client-share.ts`

### 설정 파일
- **Next.js 설정**: `next.config.ts`
- **Tailwind 설정**: `tailwind.config.ts`
- **패키지 관리**: `package.json`
- **타입 정의**: `/src/types/index.ts`

### 중요 페이지
- **타로 리딩**: `/src/app/reading/page.tsx`
- **리딩 기록**: `/src/app/profile/readings/TarotReadingHistory.tsx`
- **메인 레이아웃**: `/src/app/layout.tsx`

## 🛠️ 다음 세션 권장 작업 우선순위

### 🔴 High Priority (즉시 작업 필요)
1. **성능 최적화**
   - 이미지 로딩 최적화 (lazy loading, WebP 변환)
   - 번들 크기 최소화 분석
   - Core Web Vitals 성능 측정
   - 초기 로딩 시간 개선

2. **SEO 강화**
   - 메타 태그 최적화 (Open Graph, Twitter Cards)
   - 구조화된 데이터 구현 (JSON-LD)
   - 사이트맵 개선
   - robots.txt 최적화

3. **사용자 경험 개선**
   - 로딩 스켈레톤 UI 추가
   - 에러 상태 개선
   - 접근성(a11y) 향상
   - 모바일 최적화 검증

### 🟡 Medium Priority (다음 주 내 작업)
1. **기능 확장**
   - PDF 내보내기 기능
   - 소셜 미디어 공유 버튼
   - 리딩 통계 대시보드
   - 즐겨찾기 기능

2. **모니터링 시스템**
   - 에러 추적 시스템 (Sentry 등)
   - 사용자 행동 분석 (Google Analytics 4)
   - 성능 모니터링 대시보드
   - 실시간 알림 시스템

3. **테스트 자동화**
   - E2E 테스트 스위트 구축
   - 단위 테스트 커버리지 향상
   - CI/CD 파이프라인 강화
   - 자동화된 성능 테스트

### 🟢 Low Priority (장기 계획)
1. **고급 기능**
   - 다국어 지원 (i18n)
   - 다크 모드 완성
   - PWA 기능 강화
   - 오프라인 지원

2. **커뮤니티 기능**
   - 사용자 프로필 확장
   - 리딩 댓글 시스템
   - 평점 및 리뷰 시스템
   - 커뮤니티 피드

## 🔍 문제 해결 가이드

### 개발 서버 문제 시
```bash
# 포트 확인 및 정리
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
npm run dev
```

### 빌드 문제 시
```bash
# 캐시 정리 후 빌드
rm -rf .next node_modules/.cache
npm install
npm run build
```

### Git 문제 시
```bash
# 변경사항 커밋
git add .
git commit -m "describe changes"
git push origin main
```

### Vercel 배포 확인
- 자동 배포: Git push 시 자동 배포됨
- 배포 상태: Vercel 대시보드에서 확인
- 테스트 URL: https://test-studio-firebase.vercel.app

## 📝 중요 주의사항

### ⚠️ 절대 하지 말 것
1. **카드 펼치기 로직 수정 금지** - 현재 완벽하게 작동 중
2. **포트 번호 변경 금지** - 반드시 4000번 사용
3. **로컬 테스트 의존 금지** - Vercel 환경에서만 최종 확인
4. **디자인 임의 변경 금지** - 특히 카드 간격 및 레이아웃

### ✅ 반드시 할 것
1. **변경사항은 반드시 Git 커밋** - Vercel 자동 배포를 위해
2. **Playwright로 실제 테스트** - 가정하지 말고 실제 확인
3. **스크린샷으로 검증** - 모든 변경사항 문서화
4. **Todo 리스트 활용** - 작업 진행 상황 체계적 관리

## 🎯 프로젝트 목표 및 비전

### 현재 달성 상태: 95% 완성
- ✅ 핵심 기능 완전 구현
- ✅ 안정적인 배포 환경 구축
- ✅ 사용자 인증 및 데이터 관리
- ✅ AI 기반 해석 시스템
- ✅ 완벽한 카드 펼치기 UX

### 다음 단계: 최적화 및 확장
- 성능 최적화로 사용자 경험 극대화
- SEO 최적화로 검색 노출 향상
- 모니터링 시스템으로 서비스 품질 관리
- 고급 기능으로 차별화된 서비스 구현

---

## 🔄 세션 시작 시 체크리스트

### 1. 환경 확인
- [ ] Git 상태 확인: `git status`
- [ ] 최신 코드 동기화: `git pull origin main`
- [ ] 의존성 설치: `npm install`
- [ ] 개발 서버 실행: `npm run dev` (포트 4000)

### 2. 기능 검증
- [ ] Vercel 배포 상태 확인
- [ ] 카드 펼치기 기능 테스트
- [ ] 타로 해석 기능 테스트
- [ ] 저장/공유 기능 테스트

### 3. 작업 계획
- [ ] Todo 리스트 확인: `TodoRead`
- [ ] 우선순위 설정
- [ ] 목표 설정 및 계획 수립

---

*이 가이드는 2025년 8월 1일에 작성되었으며, 프로젝트의 현재 상태와 다음 세션을 위한 완전한 지침을 포함합니다.*