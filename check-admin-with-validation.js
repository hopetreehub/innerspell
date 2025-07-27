const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1. Vercel 배포 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'step1-admin-login.png', fullPage: true });
    
    // 타로 지침 탭이 존재하는지 미리 확인
    const tarotInstructionsTab = await page.locator('[data-value="tarot-instructions"], text="타로 지침"').first();
    const isTabVisible = await tarotInstructionsTab.isVisible().catch(() => false);
    
    if (isTabVisible) {
      console.log('✓ 이미 로그인된 상태 - 타로 지침 탭 발견!');
      await tarotInstructionsTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'step2-tarot-tab-direct.png', fullPage: true });
      
      // 지침 개수와 완성도 정보 추출
      await extractTarotInfo(page);
    } else {
      console.log('2. Google 로그인 버튼 찾기...');
      const googleButton = await page.locator('button:has-text("Google로 로그인")').first();
      
      if (await googleButton.isVisible()) {
        console.log('Google 로그인 버튼 발견 - 클릭 시도...');
        await googleButton.click();
        await page.waitForTimeout(3000);
        
        // 새 탭이나 팝업이 열렸는지 확인
        const pages = context.pages();
        console.log(`현재 페이지 수: ${pages.length}`);
        
        if (pages.length > 1) {
          const newPage = pages[pages.length - 1];
          console.log('새 페이지 URL:', await newPage.url());
          await newPage.screenshot({ path: 'step3-google-auth.png', fullPage: true });
          
          // Google 인증 페이지에서 대기
          await page.waitForTimeout(5000);
          
          // 원래 페이지로 돌아와서 확인
          await page.bringToFront();
        }
      }
      
      // 로그인 후 상태 확인
      await page.waitForTimeout(3000);
      const finalTabCheck = await page.locator('[data-value="tarot-instructions"], text="타로 지침"').first().isVisible().catch(() => false);
      
      if (finalTabCheck) {
        console.log('✓ 로그인 성공 - 타로 지침 탭 접근 가능!');
        await page.locator('[data-value="tarot-instructions"], text="타로 지침"').first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'step4-tarot-tab-after-login.png', fullPage: true });
        
        await extractTarotInfo(page);
      } else {
        console.log('❌ 로그인 실패 또는 권한 없음');
        await page.screenshot({ path: 'step4-login-failed.png', fullPage: true });
      }
    }
    
    // 최종 상태 캡처
    await page.screenshot({ path: 'final-admin-state.png', fullPage: true });
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-admin.png', fullPage: true });
  } finally {
    console.log('\n브라우저 종료 중...');
    await browser.close();
  }

  async function extractTarotInfo(page) {
    console.log('\n=== 타로 지침 정보 추출 시작 ===');
    
    try {
      // 통계 및 분석 탭으로 이동하여 정확한 정보 확인
      const analyticsTab = await page.locator('text="통계 및 분석"').first();
      if (await analyticsTab.isVisible()) {
        console.log('📊 통계 및 분석 탭으로 이동...');
        await analyticsTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'analytics-tab.png', fullPage: true });
      }
      
      // 총 지침 수 확인
      const totalGuidelinesText = await page.locator('text=/총 지침 수|지침 수/').first().locator('..').textContent().catch(() => null);
      if (totalGuidelinesText) {
        const match = totalGuidelinesText.match(/(\d+)/);
        if (match) {
          console.log(`✓ 총 지침 수: ${match[1]}개`);
        }
      }
      
      // 완성도 퍼센트 확인
      const completionPercentages = await page.locator('text=/%/').allTextContents();
      console.log('발견된 퍼센트 표시:', completionPercentages);
      
      // 36개 지침 텍스트 확인
      const page36Text = await page.locator('text=/36/').allTextContents();
      console.log('36 관련 텍스트:', page36Text);
      
      // 100% 텍스트 확인
      const page100Text = await page.locator('text=/100%/').allTextContents();
      console.log('100% 관련 텍스트:', page100Text);
      
      // 완성도 현황 섹션 확인
      const completionSection = await page.locator('text="지침 완성도 현황"').first().locator('..').textContent().catch(() => null);
      if (completionSection) {
        console.log('\n📈 완성도 현황 섹션:');
        console.log(completionSection);
      }
      
      // 페이지의 모든 숫자 텍스트 추출
      const allNumbers = await page.locator('text=/\\d+/').allTextContents();
      console.log('\n🔢 페이지의 모든 숫자:', allNumbers.filter(n => n.match(/^\d+$/)).slice(0, 20));
      
      // 스프레드별 완성도 확인
      const spreadCompletions = await page.locator('.space-y-2 .flex.items-center.gap-3').allTextContents();
      if (spreadCompletions.length > 0) {
        console.log('\n📊 스프레드별 완성도:');
        spreadCompletions.forEach((completion, index) => {
          if (completion.includes('/')) {
            console.log(`  ${index + 1}. ${completion.trim()}`);
          }
        });
      }
      
      // 전체 진행률 바 확인
      const progressBars = await page.locator('.bg-primary.h-3.rounded-full, .bg-primary.h-2.rounded-full').all();
      console.log(`\n📊 진행률 바 개수: ${progressBars.length}개`);
      
      for (let i = 0; i < Math.min(progressBars.length, 5); i++) {
        const width = await progressBars[i].getAttribute('style');
        if (width && width.includes('width:')) {
          const widthMatch = width.match(/width:\s*([^;]+)/);
          if (widthMatch) {
            console.log(`  진행률 바 ${i + 1}: ${widthMatch[1]}`);
          }
        }
      }
      
    } catch (error) {
      console.error('정보 추출 중 오류:', error);
    }
  }
})();