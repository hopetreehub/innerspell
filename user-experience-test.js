const { chromium } = require('playwright');

async function userExperienceTest() {
  console.log('👤 USER EXPERIENCE TEST: 실제 사용자 경험 재현');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 15000,
    slowMo: 1000 // 실제 사용자 속도로 시뮬레이션
  });
  
  try {
    const context = await browser.newContext({
      // 실제 사용자 환경 시뮬레이션
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    const errors = [];
    const consoleErrors = [];
    
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`🚨 PAGE ERROR: ${error.message}`);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      }
    });
    
    console.log('🌐 1. 브라우저에서 직접 접근 (사용자 시나리오)...');
    
    await page.goto('http://localhost:4000/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('⏳ 페이지 완전 로딩 대기 (10초)...');
    await page.waitForTimeout(10000);
    
    const timestamp = Date.now();
    await page.screenshot({ 
      path: `user-experience-01-homepage-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('🔮 2. 타로 리딩 페이지로 이동...');
    
    // 실제 적클릭으로 이동 (사용자와 동일)
    try {
      const readingLink = await page.getByRole('link', { name: /타로|reading/i }).first();
      if (await readingLink.count() > 0) {
        await readingLink.click();
        console.log('✅ 타로 리딩 링크 클릭 성공');
      } else {
        // 직접 URL 접근
        await page.goto('http://localhost:4000/reading');
        console.log('✅ 직접 URL 접근');
      }
    } catch (error) {
      console.log('⚠️ 링크 클릭 실패, 직접 접근 시도');
      await page.goto('http://localhost:4000/reading');
    }
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: `user-experience-02-reading-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('✍️ 3. 실제 사용자처럼 질문 입력...');
    
    const textarea = await page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.click();
      await textarea.fill('인증 오류가 발생했습니다. 예기치 않은 오류가 발생했습니다.');
      console.log('✅ 질문 입력 완료');
      
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: `user-experience-03-question-${timestamp}.png`,
        fullPage: true 
      });
    }
    
    console.log('🎴 4. 카드 기능 테스트...');
    
    // 카드 섞기
    const shuffleBtn = await page.getByRole('button', { name: /섞기|shuffle/i }).first();
    if (await shuffleBtn.count() > 0) {
      await shuffleBtn.click();
      console.log('✅ 카드 섞기 클릭');
      await page.waitForTimeout(3000);
    }
    
    // 카드 펼치기
    const spreadBtn = await page.getByRole('button', { name: /펼치기|spread/i }).first();
    if (await spreadBtn.count() > 0) {
      await spreadBtn.click();
      console.log('✅ 카드 펼치기 클릭');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `user-experience-04-spread-${timestamp}.png`,
        fullPage: true 
      });
    }
    
    // 카드 선택
    const cards = await page.locator('.card, [data-card], .tarot-card, button:has-text("카드")').all();
    console.log(`🎴 발견된 카드 수: ${cards.length}`);
    
    if (cards.length >= 3) {
      for (let i = 0; i < 3; i++) {
        try {
          await cards[i].click();
          console.log(`✅ 카드 ${i+1} 선택`);
          await page.waitForTimeout(1000);
        } catch (error) {
          console.log(`⚠️ 카드 ${i+1} 선택 실패: ${error.message}`);
        }
      }
      
      await page.screenshot({ 
        path: `user-experience-05-cards-selected-${timestamp}.png`,
        fullPage: true 
      });
    }
    
    // AI 해석 시도
    console.log('🤖 5. AI 해석 시도...');
    const interpretBtn = await page.getByRole('button', { name: /해석|interpret|AI/i }).first();
    if (await interpretBtn.count() > 0) {
      await interpretBtn.click();
      console.log('✅ AI 해석 버튼 클릭');
      
      // 해석 대기 (에러 발생 가능 구간)
      await page.waitForTimeout(10000);
      
      await page.screenshot({ 
        path: `user-experience-06-final-${timestamp}.png`,
        fullPage: true 
      });
    }
    
    // 최종 분석
    console.log('\\n🔍 USER EXPERIENCE ANALYSIS:');
    
    const webpackErrors = errors.filter(error => 
      error.message.includes("Cannot read properties of undefined (reading 'call')") ||
      error.message.includes("webpack")
    );
    
    const authErrors = errors.filter(error => 
      error.message.includes('auth') ||
      error.message.includes('인증') ||
      error.message.includes('예기치 않은')
    );
    
    console.log(`❌ Webpack Errors: ${webpackErrors.length}`);
    console.log(`🔐 Auth Errors: ${authErrors.length}`);
    console.log(`📝 Total Runtime Errors: ${errors.length}`);
    console.log(`⚠️ Console Errors: ${consoleErrors.length}`);
    
    if (webpackErrors.length > 0) {
      console.log('\\n🚨 WEBPACK ERRORS FOUND:');
      webpackErrors.forEach(error => console.log(`  - ${error.message}`));
    }
    
    if (authErrors.length > 0) {
      console.log('\\n🔐 AUTH ERRORS FOUND:');
      authErrors.forEach(error => console.log(`  - ${error.message}`));
    }
    
    if (errors.length > 0) {
      console.log('\\n📋 ALL ERRORS:');
      errors.forEach((error, i) => {
        console.log(`  ${i+1}. ${error.message}`);
      });
    }
    
    // 상세 보고서 저장
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'User Experience Simulation',
      errors: errors,
      consoleErrors: consoleErrors,
      summary: {
        webpackErrors: webpackErrors.length,
        authErrors: authErrors.length,
        totalErrors: errors.length,
        hasErrors: errors.length > 0
      }
    };
    
    require('fs').writeFileSync(
      `user-experience-report-${timestamp}.json`, 
      JSON.stringify(report, null, 2)
    );
    
    return report.summary;
    
  } catch (error) {
    console.error('❌ 사용자 경험 테스트 실패:', error.message);
    return { webpackErrors: 999, authErrors: 999, totalErrors: 999, hasErrors: true };
  } finally {
    await browser.close();
  }
}

userExperienceTest()
  .then(result => {
    console.log('\\n🎯 FINAL USER EXPERIENCE VERDICT:');
    if (result.hasErrors) {
      console.log('🔥 CONFIRMED: 사용자가 경험하는 에러가 실재함');
      console.log('💡 ACTION REQUIRED: Vercel에서 정상 작동하는 코드 가져오기 필요');
    } else {
      console.log('✅ SUCCESS: 사용자 경험상 문제없음');
    }
  })
  .catch(console.error);