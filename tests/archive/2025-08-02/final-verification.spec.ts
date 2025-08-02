import { test, expect } from '@playwright/test';

test.describe('🚨 최종 검증: 포트 4000 상태', () => {
  test('실제 사용자 경험 테스트', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('🔍 포트 4000 최종 검증 시작...');
    
    // 1. 홈페이지 접속
    try {
      await page.goto('http://localhost:4000', { 
        waitUntil: 'domcontentloaded', 
        timeout: 90000 
      });
      
      await page.screenshot({ 
        path: 'final-verification/01-homepage-load.png', 
        fullPage: true 
      });
      
      console.log('✅ 홈페이지 로드 성공');
    } catch (e) {
      console.log('❌ 홈페이지 로드 실패:', e.message);
      await page.screenshot({ 
        path: 'final-verification/01-homepage-ERROR.png', 
        fullPage: true 
      });
    }
    
    // 2. JavaScript 실행 상태 확인
    const jsWorking = await page.evaluate(() => {
      return {
        reactLoaded: typeof window.React !== 'undefined',
        nextLoaded: typeof window.__NEXT_DATA__ !== 'undefined',
        documentReady: document.readyState,
        hasInteractiveElements: document.querySelectorAll('button').length > 0
      };
    });
    
    console.log('🔧 JavaScript 상태:', jsWorking);
    
    // 3. 네비게이션 테스트
    try {
      const readingLink = page.locator('a[href*="/reading"], a[href*="/tarot"]').first();
      if (await readingLink.isVisible({ timeout: 10000 })) {
        await readingLink.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
          path: 'final-verification/02-reading-page.png', 
          fullPage: true 
        });
        
        console.log('✅ 리딩 페이지 네비게이션 성공');
      } else {
        console.log('⚠️ 리딩/타로 링크를 찾을 수 없음');
      }
    } catch (e) {
      console.log('❌ 네비게이션 실패:', e.message);
    }
    
    // 4. 인터랙티브 요소 확인
    const buttons = await page.locator('button').all();
    console.log(`🔘 버튼 개수: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const text = await buttons[i].textContent();
      const isEnabled = await buttons[i].isEnabled();
      console.log(`  - 버튼 ${i + 1}: "${text}" (활성: ${isEnabled})`);
    }
    
    // 5. 로딩 상태 확인
    const loadingElements = await page.locator('[class*="loading"], [class*="skeleton"], [aria-label*="loading"]').count();
    console.log(`⏳ 로딩 요소 개수: ${loadingElements}`);
    
    // 6. 에러 요소 확인
    const errorElements = await page.locator('[class*="error"], [role="alert"]').count();
    console.log(`❌ 에러 요소 개수: ${errorElements}`);
    
    // 7. 최종 상태 스크린샷
    await page.screenshot({ 
      path: 'final-verification/03-final-state.png', 
      fullPage: true 
    });
  });

  test('성능 및 안정성 검증', async ({ page }) => {
    test.setTimeout(120000);
    
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded', 
      timeout: 90000 
    });
    
    // 10초 동안 에러 수집
    await page.waitForTimeout(10000);
    
    console.log('🔍 성능 및 안정성 리포트:');
    console.log(`❌ 에러 개수: ${errors.length}`);
    console.log(`⚠️ 경고 개수: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('❌ 발견된 에러들:');
      errors.slice(0, 5).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // 페이지 로드 시간 측정
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || 0
      };
    });
    
    console.log('⚡ 성능 메트릭:');
    console.log(`  - 전체 로드 시간: ${navigationTiming.loadTime}ms`);
    console.log(`  - DOM 준비 시간: ${navigationTiming.domReady}ms`);
    console.log(`  - 첫 페인트: ${navigationTiming.firstPaint}ms`);
    
    // 최종 판정
    const isWorking = errors.length === 0 && navigationTiming.loadTime < 30000;
    console.log(`🎯 최종 판정: ${isWorking ? '✅ 정상 작동' : '❌ 문제 있음'}`);
  });
});