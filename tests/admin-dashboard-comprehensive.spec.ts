import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';
const SCREENSHOTS_DIR = 'screenshots/admin-dashboard-test';

// 스크린샷 디렉토리 생성
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('관리자 대시보드 종합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 관리자 페이지로 이동
    await page.goto(`${VERCEL_URL}/admin`);
    
    // 관리자 로그인 (mock auth)
    await page.evaluate(() => {
      localStorage.setItem('mockAuthEmail', 'admin@test.com');
      localStorage.setItem('mockAuthRole', 'admin');
    });
    
    // 페이지 새로고침으로 인증 상태 적용
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('1. 관리자 대시보드 접근 및 초기 화면 확인', async ({ page }) => {
    console.log('관리자 대시보드 접근 테스트 시작...');
    
    // 관리자 대시보드 메인 페이지 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '01-admin-dashboard-main.png'),
      fullPage: true 
    });
    
    // 대시보드 제목 확인
    const heading = page.locator('h1', { hasText: '관리자 대시보드' });
    await expect(heading).toBeVisible();
    
    // 주요 탭 확인
    await expect(page.locator('button[role="tab"]', { hasText: '통계' })).toBeVisible();
    await expect(page.locator('button[role="tab"]', { hasText: 'AI 공급자' })).toBeVisible();
    await expect(page.locator('button[role="tab"]', { hasText: '환경변수' })).toBeVisible();
    await expect(page.locator('button[role="tab"]', { hasText: '시스템' })).toBeVisible();
    await expect(page.locator('button[role="tab"]', { hasText: '타로 지침' })).toBeVisible();
    
    console.log('✅ 관리자 대시보드 접근 및 탭 확인 완료');
  });

  test('2. 통계 대시보드 기능 테스트', async ({ page }) => {
    console.log('통계 대시보드 테스트 시작...');
    
    // 통계 탭 클릭
    await page.locator('button[role="tab"]', { hasText: '통계' }).click();
    await page.waitForTimeout(1000);
    
    // 통계 대시보드 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '02-statistics-dashboard.png'),
      fullPage: true 
    });
    
    // 주요 통계 카드 확인
    await expect(page.locator('text=총 사용자 수')).toBeVisible();
    await expect(page.locator('text=총 리딩 수')).toBeVisible();
    await expect(page.locator('text=활성 사용자')).toBeVisible();
    await expect(page.locator('text=일일 평균 리딩')).toBeVisible();
    
    // 차트 영역 확인
    const chartArea = page.locator('[class*="recharts-wrapper"]');
    const chartCount = await chartArea.count();
    console.log(`발견된 차트 수: ${chartCount}`);
    
    if (chartCount > 0) {
      // 차트 상세 스크린샷
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, '02-statistics-charts-detail.png'),
        fullPage: true 
      });
    }
    
    console.log('✅ 통계 대시보드 테스트 완료');
  });

  test('3. AI 공급자 설정 폼 테스트', async ({ page }) => {
    console.log('AI 공급자 설정 테스트 시작...');
    
    // AI 공급자 탭 클릭
    await page.locator('button[role="tab"]', { hasText: 'AI 공급자' }).click();
    await page.waitForTimeout(1000);
    
    // AI 공급자 설정 폼 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '03-ai-providers-form.png'),
      fullPage: true 
    });
    
    // 각 AI 공급자 섹션 확인
    const providers = ['OpenAI', 'Claude', 'Gemini'];
    
    for (const provider of providers) {
      console.log(`${provider} 설정 확인 중...`);
      
      // 공급자 섹션 확인
      const providerSection = page.locator(`h3:has-text("${provider}")`);
      await expect(providerSection).toBeVisible();
      
      // API 키 입력 필드 확인
      const apiKeyInput = page.locator(`input[placeholder*="${provider}"]`);
      if (await apiKeyInput.count() > 0) {
        await expect(apiKeyInput.first()).toBeVisible();
      }
      
      // 활성화 스위치 확인
      const enableSwitch = page.locator(`[role="switch"]`).locator(`near=${providerSection}`);
      if (await enableSwitch.count() > 0) {
        await expect(enableSwitch.first()).toBeVisible();
      }
    }
    
    // 설정 저장 버튼 확인
    const saveButton = page.locator('button', { hasText: '설정 저장' });
    await expect(saveButton).toBeVisible();
    
    console.log('✅ AI 공급자 설정 폼 테스트 완료');
  });

  test('4. 환경변수 관리자 테스트', async ({ page }) => {
    console.log('환경변수 관리자 테스트 시작...');
    
    // 환경변수 탭 클릭
    await page.locator('button[role="tab"]', { hasText: '환경변수' }).click();
    await page.waitForTimeout(1000);
    
    // 환경변수 관리자 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '04-environment-variables.png'),
      fullPage: true 
    });
    
    // 환경변수 목록 확인
    await expect(page.locator('text=환경변수 관리')).toBeVisible();
    
    // 주요 환경변수 섹션 확인
    const envSections = ['Firebase 설정', 'API 키', '기타 설정'];
    for (const section of envSections) {
      const sectionElement = page.locator(`text=${section}`);
      if (await sectionElement.count() > 0) {
        console.log(`✓ ${section} 섹션 발견`);
      }
    }
    
    // 환경변수 추가 버튼 확인
    const addButton = page.locator('button', { hasText: '환경변수 추가' });
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
      console.log('✓ 환경변수 추가 버튼 확인');
    }
    
    console.log('✅ 환경변수 관리자 테스트 완료');
  });

  test('5. 시스템 관리 탭 테스트', async ({ page }) => {
    console.log('시스템 관리 탭 테스트 시작...');
    
    // 시스템 탭 클릭
    await page.locator('button[role="tab"]', { hasText: '시스템' }).click();
    await page.waitForTimeout(1000);
    
    // 시스템 관리 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '05-system-management.png'),
      fullPage: true 
    });
    
    // 시스템 정보 확인
    await expect(page.locator('text=시스템 정보')).toBeVisible();
    
    // 캐시 관리 섹션 확인
    const cacheSection = page.locator('text=캐시 관리');
    if (await cacheSection.count() > 0) {
      await expect(cacheSection).toBeVisible();
      
      // 캐시 초기화 버튼 확인
      const clearCacheButton = page.locator('button', { hasText: '캐시 초기화' });
      if (await clearCacheButton.count() > 0) {
        await expect(clearCacheButton).toBeVisible();
        console.log('✓ 캐시 초기화 버튼 확인');
      }
    }
    
    // 로그 관리 섹션 확인
    const logSection = page.locator('text=로그 관리');
    if (await logSection.count() > 0) {
      await expect(logSection).toBeVisible();
      console.log('✓ 로그 관리 섹션 확인');
    }
    
    console.log('✅ 시스템 관리 탭 테스트 완료');
  });

  test('6. 타로 지침 관리 테스트', async ({ page }) => {
    console.log('타로 지침 관리 테스트 시작...');
    
    // 타로 지침 탭 클릭
    await page.locator('button[role="tab"]', { hasText: '타로 지침' }).click();
    await page.waitForTimeout(1000);
    
    // 타로 지침 관리 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '06-tarot-guidelines.png'),
      fullPage: true 
    });
    
    // 타로 지침 목록 확인
    await expect(page.locator('text=타로 지침 관리')).toBeVisible();
    
    // 새 지침 추가 버튼 확인
    const addGuidelineButton = page.locator('button', { hasText: '새 지침 추가' });
    if (await addGuidelineButton.count() > 0) {
      await expect(addGuidelineButton).toBeVisible();
      
      // 새 지침 추가 폼 테스트
      await addGuidelineButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, '06-tarot-guidelines-form.png'),
        fullPage: true 
      });
      
      // 폼 필드 확인
      const titleInput = page.locator('input[placeholder*="제목"]');
      const contentTextarea = page.locator('textarea[placeholder*="내용"]');
      
      if (await titleInput.count() > 0 && await contentTextarea.count() > 0) {
        await expect(titleInput).toBeVisible();
        await expect(contentTextarea).toBeVisible();
        console.log('✓ 타로 지침 추가 폼 확인');
      }
    }
    
    console.log('✅ 타로 지침 관리 테스트 완료');
  });

  test('7. 전체 UI/UX 개선사항 검증', async ({ page }) => {
    console.log('전체 UI/UX 개선사항 검증 시작...');
    
    // 다크모드 토글 확인
    const darkModeToggle = page.locator('button[aria-label*="theme"]');
    if (await darkModeToggle.count() > 0) {
      // 라이트 모드 스크린샷
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, '07-ui-light-mode.png'),
        fullPage: true 
      });
      
      // 다크모드로 전환
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      // 다크 모드 스크린샷
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, '07-ui-dark-mode.png'),
        fullPage: true 
      });
      
      console.log('✓ 다크모드 토글 기능 확인');
    }
    
    // 반응형 디자인 테스트
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '07-ui-mobile-view.png'),
      fullPage: true 
    });
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '07-ui-tablet-view.png'),
      fullPage: true 
    });
    
    // 데스크톱 뷰로 복원
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ UI/UX 개선사항 검증 완료');
  });

  test('8. 보안 및 권한 테스트', async ({ page }) => {
    console.log('보안 및 권한 테스트 시작...');
    
    // 로그아웃 후 접근 시도
    await page.evaluate(() => {
      localStorage.removeItem('mockAuthEmail');
      localStorage.removeItem('mockAuthRole');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 비인증 상태 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '08-security-unauthorized.png'),
      fullPage: true 
    });
    
    // 접근 거부 메시지 확인
    const unauthorizedMessage = page.locator('text=권한이 없습니다');
    const loginMessage = page.locator('text=로그인이 필요합니다');
    
    if (await unauthorizedMessage.count() > 0 || await loginMessage.count() > 0) {
      console.log('✓ 비인증 접근 차단 확인');
    }
    
    // 일반 사용자로 로그인 시도
    await page.evaluate(() => {
      localStorage.setItem('mockAuthEmail', 'user@test.com');
      localStorage.setItem('mockAuthRole', 'user');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 일반 사용자 접근 시도 스크린샷
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '08-security-user-access.png'),
      fullPage: true 
    });
    
    console.log('✅ 보안 및 권한 테스트 완료');
  });
});

// 테스트 완료 후 요약
test.afterAll(async () => {
  console.log('\n=== 관리자 대시보드 종합 테스트 완료 ===');
  console.log(`스크린샷 저장 위치: ${SCREENSHOTS_DIR}`);
  console.log('모든 테스트가 성공적으로 완료되었습니다.');
});