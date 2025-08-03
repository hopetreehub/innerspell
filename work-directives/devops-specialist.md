# 🟣 DevOps 전문가 작업 지시서

## 📋 작업 개요
- **담당자**: DevOps Specialist
- **우선순위**: 🔴 높음
- **예상 소요시간**: 2일
- **시작일**: 2025년 1월 3일

---

## 🎯 주요 목표
1. CI/CD 파이프라인 완전 자동화
2. 실시간 모니터링 시스템 구축
3. 인프라 최적화 및 비용 절감

---

## 📝 상세 작업 내용

### Day 1: CI/CD 파이프라인 구축

#### 오전 (09:00-12:00)
```yaml
# 1. GitHub Actions 워크플로우 최적화
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 코드 품질 검사
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript check
        run: npm run typecheck
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier check
        run: npm run format:check

  # 테스트 실행
  test:
    runs-on: ubuntu-latest
    needs: quality-check
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ${{ matrix.test-type }} tests
        run: npm run test:${{ matrix.test-type }}
      
      - name: Upload coverage
        if: matrix.test-type == 'unit'
        uses: codecov/codecov-action@v3

  # 빌드 및 배포
  build-deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          
      - name: Deploy to Vercel
        uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### 오후 (13:00-18:00)
```yaml
# 2. 스테이징 환경 구성
# .github/workflows/staging.yml
name: Staging Deployment

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel-args: '--env=preview'
          
      - name: Run E2E tests on staging
        run: |
          npm ci
          STAGING_URL=${{ steps.deploy.outputs.url }} npm run test:e2e:staging
          
      - name: Notify deployment
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Deployed to staging: ${{ steps.deploy.outputs.url }}`
            })

# 3. 자동 롤백 시스템
# scripts/rollback.sh
#!/bin/bash
set -e

DEPLOYMENT_ID=$1
REASON=$2

echo "🔄 Rolling back deployment: $DEPLOYMENT_ID"
echo "📝 Reason: $REASON"

# Vercel 롤백
vercel rollback $DEPLOYMENT_ID --token=$VERCEL_TOKEN

# Sentry에 롤백 이벤트 기록
curl -X POST "https://sentry.io/api/0/organizations/${SENTRY_ORG}/releases/${DEPLOYMENT_ID}/deploys/" \
  -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"environment\": \"production\", \"status\": \"rolled_back\"}"

echo "✅ Rollback completed"
```

### Day 2: 모니터링 및 인프라 최적화

#### 오전 (09:00-12:00)
```typescript
// 4. Sentry 에러 추적 설정
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // 성능 모니터링
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // 에러 필터링
  beforeSend(event, hint) {
    // 특정 에러 무시
    if (event.exception?.values?.[0]?.type === 'NetworkError') {
      return null;
    }
    
    // 민감 정보 제거
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    return event;
  },
  
  // 통합 설정
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["localhost", /^https:\/\/test-studio-firebase\.vercel\.app/],
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // 릴리즈 추적
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});

// 5. Google Analytics 4 설정
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// 커스텀 이벤트 추적
export const trackReading = (type: 'tarot' | 'dream', result: string) => {
  event({
    action: 'complete_reading',
    category: 'engagement',
    label: type,
    value: 1,
  });
};
```

#### 오후 (13:00-18:00)
```javascript
// 6. 성능 모니터링 대시보드
// monitoring/dashboard.js
const { NextRequest, NextResponse } = require('next/server');

// Web Vitals 수집
export async function POST(request) {
  const { metrics } = await request.json();
  
  // Datadog으로 메트릭 전송
  await fetch('https://api.datadoghq.com/api/v2/series', {
    method: 'POST',
    headers: {
      'DD-API-KEY': process.env.DATADOG_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      series: metrics.map(metric => ({
        metric: `web.vitals.${metric.name}`,
        points: [[Date.now() / 1000, metric.value]],
        tags: [
          `page:${metric.page}`,
          `device:${metric.device}`,
        ],
      })),
    }),
  });
  
  return NextResponse.json({ success: true });
}

// 7. 인프라 최적화
// vercel.json
{
  "functions": {
    "src/app/api/admin/*": {
      "maxDuration": 30
    },
    "src/app/api/*": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/:path*",
      "has": [
        {
          "type": "query",
          "key": "v"
        }
      ],
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "regions": ["icn1"], // 서울 리전
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 3 * * *" // 매일 새벽 3시
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 4 * * 0" // 매주 일요일 새벽 4시
    }
  ]
}

// 8. 환경변수 관리
// scripts/env-setup.sh
#!/bin/bash

# Vercel 환경변수 설정
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production < .env.production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production < .env.production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production < .env.production
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production < .env.production

# 환경변수 검증
vercel env ls production

# 시크릿 로테이션
echo "⚠️  Remember to rotate secrets every 90 days!"
echo "Next rotation date: $(date -d '+90 days' '+%Y-%m-%d')"
```

---

## 🔍 중점 확인 사항

### 1. CI/CD 체크리스트
- [ ] 모든 브랜치에 대한 자동 테스트
- [ ] 코드 품질 게이트 설정
- [ ] 자동 배포 및 롤백
- [ ] 환경별 설정 분리
- [ ] 시크릿 관리 보안

### 2. 모니터링 체크리스트
- [ ] 실시간 에러 추적 (Sentry)
- [ ] 성능 메트릭 수집 (Web Vitals)
- [ ] 사용자 행동 분석 (GA4)
- [ ] 인프라 모니터링 (Datadog)
- [ ] 알림 시스템 구성

### 3. 인프라 체크리스트
- [ ] CDN 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 정적 자산 캐싱
- [ ] 서버리스 함수 최적화
- [ ] 비용 모니터링

---

## 📊 체크리스트

### 필수 완료 항목
- [ ] GitHub Actions 워크플로우 완성
- [ ] 스테이징 환경 구축
- [ ] 자동 롤백 시스템
- [ ] Sentry 통합
- [ ] GA4 설정
- [ ] 성능 모니터링 대시보드
- [ ] Vercel 최적화
- [ ] 환경변수 관리 시스템

### 성능 목표
- [ ] 빌드 시간 < 5분
- [ ] 배포 시간 < 2분
- [ ] 다운타임 0
- [ ] 에러율 < 0.1%
- [ ] 가동률 99.9%

---

## 🚨 주의사항

1. **보안 우선**
   - 모든 시크릿은 암호화
   - 최소 권한 원칙
   - 정기적인 키 로테이션

2. **무중단 배포**
   - Blue-Green 배포 전략
   - 점진적 롤아웃
   - 헬스체크 필수

3. **비용 관리**
   - 리소스 사용량 모니터링
   - 불필요한 서비스 정리
   - 예산 알림 설정

---

## 📁 주요 작업 파일

### CI/CD
- `/.github/workflows/*` - GitHub Actions
- `/scripts/deploy.sh` - 배포 스크립트
- `/scripts/rollback.sh` - 롤백 스크립트

### 모니터링
- `/lib/monitoring/*` - 모니터링 설정
- `/sentry.*.config.ts` - Sentry 설정
- `/lib/gtag.ts` - Google Analytics

### 인프라
- `/vercel.json` - Vercel 설정
- `/next.config.js` - Next.js 설정
- `/.env.*` - 환경변수

---

## 🎯 최종 목표

### 완료 기준
1. 완전 자동화된 CI/CD 파이프라인
2. 실시간 모니터링 및 알림
3. 99.9% 가동률 달성
4. 배포 시간 2분 이내
5. 롤백 시간 30초 이내

### 산출물
1. CI/CD 파이프라인 문서
2. 모니터링 대시보드 URL
3. 인프라 아키텍처 다이어그램
4. 운영 가이드 문서

---

## 💡 참고 자료
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Vercel 문서](https://vercel.com/docs)
- [Sentry Next.js 가이드](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals](https://web.dev/vitals/)

---

**작성자**: PM Claude  
**최종 수정**: 2025년 1월 3일