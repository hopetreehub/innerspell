# 🟤 QA 전문가 작업 지시서

## 📋 작업 개요
- **담당자**: QA Specialist
- **우선순위**: 🟡 중간
- **예상 소요시간**: 3일
- **시작일**: 2025년 1월 5일

---

## 🎯 주요 목표
1. 테스트 커버리지 80% 이상 달성
2. E2E 테스트 자동화 구축
3. 성능 및 보안 검증 완료

---

## 📝 상세 작업 내용

### Day 1: 테스트 전략 수립 및 환경 구성

#### 오전 (09:00-12:00)
```typescript
// 1. 테스트 프레임워크 설정
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'https://test-studio-firebase.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
});

// 2. 테스트 카테고리 정의
export const testCategories = {
  critical: ['authentication', 'payment', 'data-integrity'],
  high: ['core-features', 'user-flow'],
  medium: ['ui-consistency', 'performance'],
  low: ['edge-cases', 'browser-compatibility'],
};
```

#### 오후 (13:00-18:00)
```typescript
// 3. E2E 테스트 시나리오 작성
// tests/e2e/tarot-reading.spec.ts
import { test, expect } from '@playwright/test';

test.describe('타로 리딩 E2E 테스트', () => {
  test('전체 타로 리딩 플로우', async ({ page }) => {
    // 1. 메인 페이지 접속
    await page.goto('/');
    await expect(page).toHaveTitle(/InnerSpell/);
    
    // 2. 타로 리딩 시작
    await page.click('text=타로 리딩 시작');
    await expect(page).toHaveURL(/\/tarot/);
    
    // 3. 질문 입력
    await page.fill('textarea[name="question"]', '오늘의 운세는 어떨까요?');
    await page.click('button:has-text("다음")');
    
    // 4. 카드 선택
    await page.waitForSelector('.card-deck');
    const cards = page.locator('.tarot-card');
    await expect(cards).toHaveCount(78);
    
    // 카드 3장 선택
    for (let i = 0; i < 3; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(500); // 애니메이션 대기
    }
    
    // 5. 결과 확인
    await page.click('button:has-text("리딩 보기")');
    await expect(page.locator('.reading-result')).toBeVisible();
    await expect(page.locator('.card-interpretation')).toHaveCount(3);
    
    // 6. 저장 기능 테스트
    await page.click('button:has-text("리딩 저장")');
    await expect(page.locator('.save-success')).toBeVisible();
    
    // 7. 공유 기능 테스트
    await page.click('button:has-text("공유")');
    await expect(page.locator('.share-modal')).toBeVisible();
  });
  
  test('오류 처리 테스트', async ({ page }) => {
    // 네트워크 오류 시뮬레이션
    await page.route('**/api/tarot/**', route => route.abort());
    
    await page.goto('/tarot');
    await page.click('button:has-text("리딩 시작")');
    
    // 에러 메시지 확인
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('일시적인 오류');
  });
});

// 4. 인증 테스트
// tests/e2e/authentication.spec.ts
test.describe('인증 플로우 테스트', () => {
  test('로그인/로그아웃 플로우', async ({ page }) => {
    await page.goto('/');
    
    // 로그인
    await page.click('text=로그인');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 확인
    await expect(page.locator('.user-profile')).toBeVisible();
    
    // 로그아웃
    await page.click('.user-profile');
    await page.click('text=로그아웃');
    
    // 로그아웃 확인
    await expect(page.locator('text=로그인')).toBeVisible();
  });
});
```

### Day 2: 성능 및 통합 테스트

#### 오전 (09:00-12:00)
```javascript
// 5. 성능 테스트 스크립트
// tests/performance/load-test.js
import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // 100명까지 증가
    { duration: '1m', target: 100 },  // 100명 유지
    { duration: '30s', target: 200 }, // 200명까지 증가
    { duration: '1m', target: 200 },  // 200명 유지
    { duration: '30s', target: 0 },   // 0명으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%가 500ms 이내
    errors: ['rate<0.1'], // 에러율 10% 미만
  },
};

export default function () {
  const res = http.get('https://test-studio-firebase.vercel.app');
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
}

// 6. 메모리 누수 테스트
// tests/performance/memory-leak.test.ts
import { test } from '@playwright/test';

test('메모리 누수 검사', async ({ page }) => {
  // 초기 메모리 측정
  const getMemoryUsage = async () => {
    return await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        };
      }
      return null;
    });
  };
  
  const initialMemory = await getMemoryUsage();
  console.log('Initial memory:', initialMemory);
  
  // 반복적인 작업 수행
  for (let i = 0; i < 50; i++) {
    await page.goto('/tarot');
    await page.click('text=리딩 시작');
    await page.goBack();
  }
  
  // 최종 메모리 측정
  const finalMemory = await getMemoryUsage();
  console.log('Final memory:', finalMemory);
  
  // 메모리 증가량 확인
  if (initialMemory && finalMemory) {
    const increase = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
    const percentIncrease = (increase / initialMemory.usedJSHeapSize) * 100;
    
    console.log(`Memory increase: ${percentIncrease.toFixed(2)}%`);
    expect(percentIncrease).toBeLessThan(50); // 50% 미만 증가
  }
});
```

#### 오후 (13:00-18:00)
```typescript
// 7. API 통합 테스트
// tests/integration/api.test.ts
import { test, expect } from '@playwright/test';

test.describe('API 통합 테스트', () => {
  test('타로 리딩 API', async ({ request }) => {
    // POST /api/tarot/reading
    const response = await request.post('/api/tarot/reading', {
      data: {
        question: '테스트 질문',
        cards: ['fool', 'magician', 'high_priestess'],
        spread: 'three_card',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('reading');
    expect(data.reading).toHaveProperty('interpretation');
    expect(data.reading.cards).toHaveLength(3);
  });
  
  test('사용자 데이터 API', async ({ request }) => {
    // GET /api/user/profile
    const response = await request.get('/api/user/profile', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('email');
  });
});

// 8. 접근성 테스트
// tests/accessibility/a11y.test.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('접근성 테스트', () => {
  test('메인 페이지 접근성', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    const violations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
    
    expect(violations).toBeNull();
  });
  
  test('키보드 네비게이션', async ({ page }) => {
    await page.goto('/');
    
    // Tab 키로 모든 인터랙티브 요소 접근 가능
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
    
    // Enter 키로 버튼 클릭
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/tarot|\/dream/);
  });
});
```

### Day 3: 보안 테스트 및 최종 검증

#### 오전 (09:00-12:00)
```javascript
// 9. 보안 테스트
// tests/security/security.test.ts
test.describe('보안 테스트', () => {
  test('XSS 공격 방어', async ({ page }) => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    ];
    
    for (const payload of xssPayloads) {
      await page.goto('/tarot');
      await page.fill('textarea[name="question"]', payload);
      await page.click('button:has-text("다음")');
      
      // XSS 공격이 실행되지 않음을 확인
      const alertDialog = page.locator('dialog');
      await expect(alertDialog).not.toBeVisible();
      
      // 입력값이 이스케이프됨을 확인
      const displayedText = await page.locator('.question-display').textContent();
      expect(displayedText).not.toContain('<script>');
    }
  });
  
  test('인증/인가 테스트', async ({ request }) => {
    // 인증 없이 보호된 리소스 접근 시도
    const response = await request.get('/api/admin/users');
    expect(response.status()).toBe(401);
    
    // 일반 사용자로 관리자 리소스 접근 시도
    const userResponse = await request.get('/api/admin/users', {
      headers: {
        'Authorization': 'Bearer user-token',
      },
    });
    expect(userResponse.status()).toBe(403);
  });
  
  test('CSRF 보호', async ({ page, request }) => {
    await page.goto('/');
    
    // CSRF 토큰 없이 요청
    const response = await request.post('/api/user/delete', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });
    
    expect(response.status()).toBe(403);
  });
});

// 10. 데이터 검증 테스트
// tests/validation/data-validation.test.ts
test.describe('데이터 검증', () => {
  test('입력값 검증', async ({ request }) => {
    const invalidData = [
      { question: '' }, // 빈 질문
      { question: 'a'.repeat(1001) }, // 너무 긴 질문
      { cards: [] }, // 빈 카드 배열
      { cards: ['invalid_card'] }, // 잘못된 카드
      { spread: 'invalid_spread' }, // 잘못된 스프레드
    ];
    
    for (const data of invalidData) {
      const response = await request.post('/api/tarot/reading', {
        data,
      });
      
      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty('error');
    }
  });
});
```

#### 오후 (13:00-18:00)
```typescript
// 11. 회귀 테스트 스위트
// tests/regression/regression.test.ts
import { test, expect } from '@playwright/test';
import regressionTests from './regression-tests.json';

test.describe('회귀 테스트', () => {
  regressionTests.forEach((testCase) => {
    test(testCase.name, async ({ page }) => {
      // 각 테스트 케이스 실행
      for (const step of testCase.steps) {
        switch (step.action) {
          case 'goto':
            await page.goto(step.url);
            break;
          case 'click':
            await page.click(step.selector);
            break;
          case 'fill':
            await page.fill(step.selector, step.value);
            break;
          case 'expect':
            await expect(page.locator(step.selector)).toBeVisible();
            break;
        }
      }
    });
  });
});

// 12. 테스트 리포트 생성
// scripts/generate-test-report.js
const fs = require('fs');
const path = require('path');

async function generateTestReport() {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    },
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
    categories: {},
  };
  
  // Playwright 결과 수집
  const playwrightResults = JSON.parse(
    fs.readFileSync('./test-results/results.json', 'utf8')
  );
  
  // Jest 커버리지 수집
  const coverage = JSON.parse(
    fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
  );
  
  // 결과 통합
  results.summary.total = playwrightResults.tests.length;
  results.summary.passed = playwrightResults.passed;
  results.summary.failed = playwrightResults.failed;
  results.coverage = coverage.total;
  
  // HTML 리포트 생성
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>테스트 리포트 - ${results.timestamp}</title>
      <style>
        /* 스타일 정의 */
      </style>
    </head>
    <body>
      <h1>InnerSpell 테스트 리포트</h1>
      <div class="summary">
        <h2>요약</h2>
        <p>총 테스트: ${results.summary.total}</p>
        <p>성공: ${results.summary.passed}</p>
        <p>실패: ${results.summary.failed}</p>
      </div>
      <div class="coverage">
        <h2>코드 커버리지</h2>
        <p>구문: ${results.coverage.statements.pct}%</p>
        <p>분기: ${results.coverage.branches.pct}%</p>
        <p>함수: ${results.coverage.functions.pct}%</p>
        <p>라인: ${results.coverage.lines.pct}%</p>
      </div>
    </body>
    </html>
  `;
  
  fs.writeFileSync('./test-report.html', html);
  console.log('테스트 리포트 생성 완료: test-report.html');
}

generateTestReport();
```

---

## 🔍 중점 확인 사항

### 1. 테스트 커버리지 체크리스트
- [ ] Unit 테스트: 80% 이상
- [ ] Integration 테스트: 주요 API 100%
- [ ] E2E 테스트: 핵심 사용자 플로우 100%
- [ ] 접근성 테스트: WCAG 2.1 AA 준수
- [ ] 보안 테스트: OWASP Top 10 검증

### 2. 성능 기준
- [ ] 페이지 로드 시간 < 2초
- [ ] API 응답 시간 < 200ms
- [ ] 동시 사용자 200명 처리
- [ ] 메모리 누수 없음
- [ ] CPU 사용률 < 70%

### 3. 브라우저 호환성
- [ ] Chrome (최신 2개 버전)
- [ ] Firefox (최신 2개 버전)
- [ ] Safari (최신 2개 버전)
- [ ] Edge (최신 2개 버전)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android 10+)

---

## 📊 체크리스트

### 필수 완료 항목
- [ ] E2E 테스트 시나리오 100% 작성
- [ ] 자동화된 테스트 파이프라인
- [ ] 성능 테스트 및 최적화
- [ ] 보안 취약점 스캔
- [ ] 접근성 검증
- [ ] 크로스 브라우저 테스트
- [ ] 회귀 테스트 스위트
- [ ] 테스트 리포트 자동 생성

### 품질 목표
- [ ] 코드 커버리지 80% 이상
- [ ] 0 Critical 버그
- [ ] 0 보안 취약점
- [ ] 모든 테스트 통과
- [ ] 성능 기준 충족

---

## 🚨 주의사항

1. **테스트 데이터 관리**
   - 실제 사용자 데이터 사용 금지
   - 테스트 데이터 격리
   - 테스트 후 정리 필수

2. **CI/CD 통합**
   - 모든 PR에서 자동 테스트
   - 테스트 실패 시 머지 차단
   - 코드 커버리지 체크

3. **테스트 환경**
   - 프로덕션과 동일한 환경
   - 독립된 테스트 데이터베이스
   - 실제 API 엔드포인트 사용

---

## 📁 주요 작업 파일

### 테스트 코드
- `/tests/e2e/*` - E2E 테스트
- `/tests/integration/*` - 통합 테스트
- `/tests/performance/*` - 성능 테스트
- `/tests/security/*` - 보안 테스트

### 설정 파일
- `/playwright.config.ts` - Playwright 설정
- `/jest.config.js` - Jest 설정
- `/k6.config.js` - K6 부하 테스트

### 리포트
- `/test-results/*` - 테스트 결과
- `/coverage/*` - 커버리지 리포트
- `/test-report.html` - 종합 리포트

---

## 🎯 최종 목표

### 완료 기준
1. 테스트 커버리지 80% 이상
2. 모든 핵심 기능 E2E 테스트
3. 성능 기준 100% 충족
4. 보안 취약점 0개
5. 접근성 WCAG 2.1 AA 준수

### 산출물
1. 테스트 전략 문서
2. E2E 테스트 시나리오
3. 성능 테스트 보고서
4. 보안 감사 결과
5. 테스트 자동화 가이드

---

## 💡 참고 자료
- [Playwright 문서](https://playwright.dev/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [K6 Performance Testing](https://k6.io/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**작성자**: PM Claude  
**최종 수정**: 2025년 1월 3일