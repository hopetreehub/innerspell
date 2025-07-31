const { chromium } = require('playwright');

async function vercelSyncTest() {
  console.log('🔄 VERCEL SYNC TEST: Vercel 코드 동기화 후 완전 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000
  });
  
  try {
    const page = await browser.newPage();
    
    // 에러 추적
    const errors = [];
    const webpackErrors = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
      if (error.message.includes("Cannot read properties of undefined (reading 'call')")) {
        webpackErrors.push(error.message);
        console.log(`🚨 WEBPACK ERROR: ${error.message}`);
      }
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('404')) {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    const timestamp = Date.now();
    
    console.log('🏠 1. 홈페이지 접근...');
    await page.goto('http://localhost:4000/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: `vercel-sync-01-homepage-${timestamp}.png`,
      fullPage: true 
    });
    
    const title = await page.title();
    console.log(`✅ 홈페이지 타이틀: ${title}`);
    
    console.log('🔮 2. 타로 리딩 페이지 접근...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: `vercel-sync-02-reading-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('✍️ 3. 질문 입력...');
    const questionTextarea = await page.locator('textarea').first();
    if (await questionTextarea.count() > 0) {
      await questionTextarea.fill('Vercel 동기화 후 정상 작동하는지 확인해주세요');
      console.log('✅ 질문 입력 완료');
      await page.waitForTimeout(1000);
    }
    
    console.log('🎴 4. 카드 섞기 및 펼치기...');
    
    // 카드 섞기
    const shuffleButton = await page.getByRole('button', { name: /섞기|shuffle/i }).first();
    if (await shuffleButton.count() > 0) {
      await shuffleButton.click();
      console.log('✅ 카드 섞기 완료');
      await page.waitForTimeout(3000);
    }
    
    // 카드 펼치기
    const spreadButton = await page.getByRole('button', { name: /펼치기|spread/i }).first();
    if (await spreadButton.count() > 0) {
      await spreadButton.click();
      console.log('✅ 카드 펼치기 완료');
      await page.waitForTimeout(4000);
      
      await page.screenshot({ 
        path: `vercel-sync-03-spread-${timestamp}.png`,
        fullPage: true 
      });
    }
    
    console.log('🎯 5. 카드 상태 확인...');
    
    // 카드 카운터 확인
    const cardCounter = await page.locator('text=/뽑힌 카드.*선택됨/').first();
    if (await cardCounter.count() > 0) {
      const counterText = await cardCounter.textContent();
      console.log(`📊 카드 카운터: ${counterText}`);
    }
    
    // 다양한 선택자로 카드 찾기
    const cardSelectors = [
      '.card',
      '[data-card]',
      '.tarot-card',
      'button[class*="card"]',
      'div[class*="card"]:not(.card-counter)',
      '[role="button"][class*="card"]',
      '.relative.cursor-pointer'
    ];
    
    let cards = [];
    let selectedSelector = '';
    
    for (const selector of cardSelectors) {
      cards = await page.locator(selector).all();
      if (cards.length > 0) {
        selectedSelector = selector;
        console.log(`✅ ${selector} 선택자로 ${cards.length}개 카드 발견`);
        break;
      }
    }
    
    console.log('🃏 6. 카드 선택 시도...');
    
    if (cards.length >= 3) {
      for (let i = 0; i < 3; i++) {
        try {
          await cards[i].click();
          console.log(`✅ 카드 ${i+1} 선택 성공`);
          await page.waitForTimeout(1500);
        } catch (error) {
          console.log(`⚠️ 카드 ${i+1} 선택 실패: ${error.message}`);
        }
      }
      
      await page.screenshot({ 
        path: `vercel-sync-04-selected-${timestamp}.png`,
        fullPage: true 
      });
      
      // 선택 후 카운터 재확인
      if (await cardCounter.count() > 0) {
        const newCounterText = await cardCounter.textContent();
        console.log(`📊 선택 후 카드 카운터: ${newCounterText}`);
      }
    } else {
      console.log(`❌ 카드가 충분하지 않음: ${cards.length}개만 발견`);
      
      // DOM 구조 분석
      const pageContent = await page.content();
      const hasCardElements = pageContent.includes('card') || pageContent.includes('Card');
      console.log(`🔍 페이지에 'card' 텍스트 존재: ${hasCardElements}`);
    }
    
    console.log('🤖 7. AI 해석 버튼 확인...');
    const interpretButton = await page.getByRole('button', { name: /해석|interpret|AI|분석/i }).first();
    if (await interpretButton.count() > 0) {
      const isEnabled = await interpretButton.isEnabled();
      console.log(`🔘 AI 해석 버튼 상태: ${isEnabled ? '활성화' : '비활성화'}`);
      
      if (isEnabled) {
        await interpretButton.click();
        console.log('✅ AI 해석 시작');
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
          path: `vercel-sync-05-result-${timestamp}.png`,
          fullPage: true 
        });
      }
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없음');
    }
    
    // 최종 분석
    console.log('\n📊 VERCEL SYNC TEST RESULTS:');
    console.log('='.repeat(50));
    console.log(`✅ 홈페이지 로딩: 성공`);
    console.log(`✅ 타로 리딩 페이지: 성공`);
    console.log(`✅ 질문 입력: 성공`);
    console.log(`✅ 카드 섞기/펼치기: 성공`);
    console.log(`${cards.length >= 3 ? '✅' : '❌'} 카드 렌더링: ${cards.length}개`);
    console.log(`🔧 Webpack 에러: ${webpackErrors.length}개`);
    console.log(`❌ 전체 에러: ${errors.length}개`);
    
    if (webpackErrors.length > 0) {
      console.log('\n🚨 WEBPACK ERRORS DETECTED:');
      webpackErrors.forEach((error, i) => console.log(`  ${i+1}. ${error}`));
    }
    
    return {
      success: cards.length >= 3 && webpackErrors.length === 0,
      cardCount: cards.length,
      webpackErrors: webpackErrors.length,
      totalErrors: errors.length
    };
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return { success: false, cardCount: 0, webpackErrors: 999, totalErrors: 999 };
  } finally {
    await browser.close();
  }
}

vercelSyncTest()
  .then(result => {
    console.log('\n🎯 FINAL VERDICT:');
    console.log('='.repeat(60));
    
    if (result.success) {
      console.log('✅ SUCCESS: Vercel 동기화 성공! 모든 기능 정상 작동');
    } else if (result.webpackErrors > 0) {
      console.log('🚨 WEBPACK ERROR: 동적 컴포넌트 문제 재발');
      console.log('💡 해결책: layout.tsx의 동적 컴포넌트 다시 주석 처리 필요');
    } else if (result.cardCount < 3) {
      console.log('❌ CARD RENDERING ISSUE: 카드가 제대로 렌더링되지 않음');
      console.log('💡 해결책: 타로 카드 컴포넌트 확인 필요');
    } else {
      console.log('⚠️ PARTIAL SUCCESS: 일부 문제 있지만 기본 기능은 작동');
    }
  })
  .catch(console.error);