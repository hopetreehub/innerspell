import { test, expect } from '@playwright/test';

test.describe('관리자 시스템 및 타로 리딩 통합 테스트', () => {
  test('Firebase FieldValue 오류 및 타로리딩 저장 확인', async ({ page }) => {
    // Vercel 배포 URL로 이동
    await page.goto('https://test-studio-firebase.vercel.app');
    
    // 로그인 (관리자 계정)
    await page.click('text=로그인');
    await page.waitForURL('**/sign-in**');
    
    await page.fill('input[type="email"]', 'admin@innerspell.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("로그인")');
    
    // 로그인 성공 대기
    await page.waitForURL('https://test-studio-firebase.vercel.app');
    
    // 콘솔 에러 캡처 설정
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 타로 리딩 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    
    // 타로 리딩 진행
    await page.fill('textarea[placeholder*="질문을 입력"]', 'Firebase 오류 테스트를 위한 질문');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(1000);
    
    // 카드 선택
    const card = page.locator('.cursor-pointer').first();
    await card.click();
    await page.waitForTimeout(500);
    
    // AI 해석 받기
    await page.click('button:has-text("AI 해석 받기")');
    
    // 해석 완료 대기 (최대 30초)
    await page.waitForSelector('text=해석 다시 보기', { timeout: 30000 });
    
    // 해석 결과 스크린샷
    const interpretationDialog = page.locator('[role="dialog"]');
    await interpretationDialog.screenshot({ 
      path: 'tests/screenshots/tarot-interpretation-dialog.png' 
    });
    
    // 저장하기 시도
    const saveButton = page.locator('button:has-text("이 리딩 저장하기")');
    await saveButton.click();
    
    // 저장 결과 대기
    await page.waitForTimeout(3000);
    
    // 에러 확인
    const saveErrors = consoleErrors.filter(err => 
      err.includes('Firebase Admin FieldValue') || 
      err.includes('서버 액션 저장 실패')
    );
    
    console.log('저장 관련 에러:', saveErrors);
    
    // 저장 후 상태 스크린샷
    await page.screenshot({ 
      path: 'tests/screenshots/after-save-status.png',
      fullPage: true 
    });
    
    // 공유하기 테스트
    const shareButton = page.locator('button:has-text("리딩 공유하기")');
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForTimeout(2000);
      
      // 공유 가이드 다이얼로그 확인
      const shareDialog = page.locator('[role="dialog"]').last();
      await shareDialog.screenshot({ 
        path: 'tests/screenshots/share-guide-improved.png' 
      });
      
      // 각 SNS 탭 확인
      const kakaoTab = page.locator('button[value="kakao"]');
      if (await kakaoTab.isVisible()) {
        await kakaoTab.click();
        await page.waitForTimeout(500);
        
        // 붙여넣기 위치 확인
        const pasteLocation = page.locator('text=메시지 입력창에 붙여넣기');
        expect(await pasteLocation.isVisible()).toBeTruthy();
      }
    }
    
    // 관리자 페이지 이동
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    
    // 관리자 대시보드 스크린샷
    await page.screenshot({ 
      path: 'tests/screenshots/admin-dashboard.png',
      fullPage: true 
    });
    
    // 실시간 모니터링 탭 클릭
    const realtimeTab = page.locator('button:has-text("실시간 모니터링")');
    if (await realtimeTab.isVisible()) {
      await realtimeTab.click();
      await page.waitForTimeout(2000);
      
      // 실시간 모니터링 스크린샷
      await page.screenshot({ 
        path: 'tests/screenshots/realtime-monitoring.png',
        fullPage: true 
      });
    }
    
    // 최종 에러 로그
    console.log('전체 콘솔 에러:', consoleErrors);
  });
  
  test('타로 해석 가독성 확인', async ({ page }) => {
    // 타로 리딩 페이지로 바로 이동
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    
    // 간단한 리딩 진행
    await page.fill('textarea[placeholder*="질문을 입력"]', '가독성 테스트');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(1000);
    
    const card = page.locator('.cursor-pointer').first();
    await card.click();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("AI 해석 받기")');
    await page.waitForSelector('text=해석 다시 보기', { timeout: 30000 });
    
    // 해석 다이얼로그 스타일 확인
    const interpretationContent = page.locator('.prose');
    const styles = await interpretationContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        lineHeight: computed.lineHeight,
        fontSize: computed.fontSize,
        color: computed.color,
        headingStyles: Array.from(el.querySelectorAll('h1, h2, h3')).map(h => ({
          tag: h.tagName,
          fontSize: window.getComputedStyle(h).fontSize,
          marginTop: window.getComputedStyle(h).marginTop,
          marginBottom: window.getComputedStyle(h).marginBottom
        }))
      };
    });
    
    console.log('해석 텍스트 스타일:', styles);
    
    // 가독성 개선된 해석 스크린샷
    await page.screenshot({ 
      path: 'tests/screenshots/improved-interpretation-readability.png',
      fullPage: true 
    });
  });
});