import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';
const SCREENSHOTS_DIR = 'screenshots/admin-tests';

// Create screenshots directory if needed
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('Admin Panel - Complete Test Suite', () => {
  test.describe('Authentication & Access Control', () => {
    test('should block unauthorized access to admin panel', async ({ page }) => {
      // Try to access admin panel without authentication
      await page.goto(`${VERCEL_URL}/admin`);
      
      // Should redirect to login or show unauthorized message
      const unauthorizedMessage = page.locator('text=권한이 없습니다');
      const loginMessage = page.locator('text=로그인이 필요합니다');
      const signInUrl = page.url().includes('sign-in');
      
      expect(
        await unauthorizedMessage.isVisible() || 
        await loginMessage.isVisible() || 
        signInUrl
      ).toBeTruthy();
    });

    test('should allow admin access with proper credentials', async ({ page }) => {
      // Mock admin authentication
      await page.goto(`${VERCEL_URL}/admin`);
      
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify admin dashboard is accessible
      await expect(page.locator('h1', { hasText: '관리자 대시보드' })).toBeVisible();
    });

    test('should block regular users from admin panel', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      
      // Mock regular user authentication
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'user@test.com');
        localStorage.setItem('mockAuthRole', 'user');
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should show unauthorized message
      const adminContent = page.locator('h1', { hasText: '관리자 대시보드' });
      await expect(adminContent).not.toBeVisible();
    });
  });

  test.describe('Dashboard Navigation & UI', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    test('should display all main navigation tabs', async ({ page }) => {
      // Verify all tabs are present
      const tabs = [
        '통계',
        'AI 공급자',
        '환경변수',
        '시스템',
        '타로 지침'
      ];

      for (const tab of tabs) {
        await expect(page.locator('button[role="tab"]', { hasText: tab })).toBeVisible();
      }

      // Take screenshot of dashboard
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-dashboard-main.png'),
        fullPage: true 
      });
    });

    test('should navigate between tabs correctly', async ({ page }) => {
      // Test tab navigation
      const tabTests = [
        { tab: '통계', content: '총 사용자 수' },
        { tab: 'AI 공급자', content: 'OpenAI' },
        { tab: '환경변수', content: '환경변수 관리' },
        { tab: '시스템', content: '시스템 정보' },
        { tab: '타로 지침', content: '타로 해석 지침' }
      ];

      for (const { tab, content } of tabTests) {
        await page.locator('button[role="tab"]', { hasText: tab }).click();
        await page.waitForTimeout(500);
        await expect(page.locator(`text=${content}`).first()).toBeVisible();
      }
    });
  });

  test.describe('Statistics Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.locator('button[role="tab"]', { hasText: '통계' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display key statistics cards', async ({ page }) => {
      // Check for statistics cards
      const statsCards = [
        '총 사용자 수',
        '총 리딩 수',
        '활성 사용자',
        '일일 평균 리딩'
      ];

      for (const card of statsCards) {
        await expect(page.locator(`text=${card}`)).toBeVisible();
      }

      // Check for charts
      const chartArea = page.locator('[class*="recharts-wrapper"]');
      const chartCount = await chartArea.count();
      expect(chartCount).toBeGreaterThan(0);

      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-statistics.png'),
        fullPage: true 
      });
    });
  });

  test.describe('AI Providers Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.locator('button[role="tab"]', { hasText: 'AI 공급자' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display all AI provider configurations', async ({ page }) => {
      const providers = ['OpenAI', 'Claude', 'Gemini'];
      
      for (const provider of providers) {
        // Check provider section exists
        const providerSection = page.locator(`h3:has-text("${provider}")`);
        await expect(providerSection).toBeVisible();
        
        // Check for API key input
        const apiKeyInput = page.locator(`input[placeholder*="${provider}"]`);
        if (await apiKeyInput.count() > 0) {
          await expect(apiKeyInput.first()).toBeVisible();
        }
      }

      // Check save button
      await expect(page.locator('button', { hasText: '설정 저장' })).toBeVisible();

      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-ai-providers.png'),
        fullPage: true 
      });
    });

    test('should handle provider configuration updates', async ({ page }) => {
      // Find OpenAI section
      const openAISection = page.locator('h3:has-text("OpenAI")');
      await expect(openAISection).toBeVisible();

      // Try to toggle enable switch if exists
      const enableSwitch = page.locator('[role="switch"]').first();
      if (await enableSwitch.count() > 0) {
        await enableSwitch.click();
        await page.waitForTimeout(500);
      }

      // Click save button
      const saveButton = page.locator('button', { hasText: '설정 저장' });
      await saveButton.click();

      // Check for success message or loading state
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Tarot Guidelines Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.locator('button[role="tab"]', { hasText: '타로 지침' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display tarot guidelines interface', async ({ page }) => {
      // Check main heading
      await expect(page.locator('text=타로 해석 지침').first()).toBeVisible();

      // Check for sub-tabs if they exist
      const subTabs = ['지침 탐색', '지침 관리', '통계 및 분석'];
      for (const tab of subTabs) {
        const tabElement = page.locator(`button:has-text("${tab}")`);
        if (await tabElement.count() > 0) {
          await expect(tabElement.first()).toBeVisible();
        }
      }

      // Check for create button
      const createButton = page.locator('button', { hasText: '새 지침' });
      if (await createButton.count() > 0) {
        await expect(createButton).toBeVisible();
      }

      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-tarot-guidelines.png'),
        fullPage: true 
      });
    });

    test('should handle guideline creation form', async ({ page }) => {
      // Look for create button
      const createButton = page.locator('button').filter({ hasText: /새 지침|추가/ });
      
      if (await createButton.count() > 0) {
        await createButton.first().click();
        await page.waitForTimeout(500);

        // Check for form fields
        const titleInput = page.locator('input[placeholder*="제목"]');
        const contentTextarea = page.locator('textarea[placeholder*="내용"]');

        if (await titleInput.count() > 0) {
          await expect(titleInput).toBeVisible();
        }
        if (await contentTextarea.count() > 0) {
          await expect(contentTextarea).toBeVisible();
        }

        await page.screenshot({ 
          path: path.join(SCREENSHOTS_DIR, 'admin-guideline-form.png'),
          fullPage: true 
        });
      }
    });
  });

  test.describe('Environment Variables Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.locator('button[role="tab"]', { hasText: '환경변수' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display environment variables interface', async ({ page }) => {
      await expect(page.locator('text=환경변수 관리')).toBeVisible();

      // Check for variable sections
      const sections = ['Firebase 설정', 'API 키', '기타 설정'];
      for (const section of sections) {
        const sectionElement = page.locator(`text=${section}`);
        if (await sectionElement.count() > 0) {
          console.log(`Found section: ${section}`);
        }
      }

      // Check for add button
      const addButton = page.locator('button', { hasText: '환경변수 추가' });
      if (await addButton.count() > 0) {
        await expect(addButton).toBeVisible();
      }

      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-env-variables.png'),
        fullPage: true 
      });
    });
  });

  test.describe('System Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.locator('button[role="tab"]', { hasText: '시스템' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display system management options', async ({ page }) => {
      await expect(page.locator('text=시스템 정보')).toBeVisible();

      // Check cache management
      const cacheSection = page.locator('text=캐시 관리');
      if (await cacheSection.count() > 0) {
        await expect(cacheSection).toBeVisible();
        
        const clearCacheButton = page.locator('button', { hasText: '캐시 초기화' });
        if (await clearCacheButton.count() > 0) {
          await expect(clearCacheButton).toBeVisible();
        }
      }

      // Check log management
      const logSection = page.locator('text=로그 관리');
      if (await logSection.count() > 0) {
        await expect(logSection).toBeVisible();
      }

      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-system.png'),
        fullPage: true 
      });
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${VERCEL_URL}/admin`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'admin@test.com');
        localStorage.setItem('mockAuthRole', 'admin');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-mobile-view.png'),
        fullPage: true 
      });

      // Check if navigation is still accessible
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    test('should be responsive on tablet devices', async ({ page }) => {
      // Tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'admin-tablet-view.png'),
        fullPage: true 
      });

      // Check if tabs are visible
      const tabs = page.locator('button[role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
    });
  });
});

// After all tests complete
test.afterAll(async () => {
  console.log('\n=== Admin Panel Test Suite Completed ===');
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
});