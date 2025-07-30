// Quick rollback verification
const { chromium } = require('playwright');

async function quickCheck() {
  console.log('🚀 빠른 롤백 검증');
  console.log('==================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 에러 감시
  let getActiveAIModelsError = false;
  page.on('console', msg => {
    if (msg.text().includes('getActiveAIModels') && msg.text().includes('not defined')) {
      getActiveAIModelsError = true;
      console.log('❌ getActiveAIModels 에러 여전히 발생:', msg.text());
    }
    if (msg.text().includes('TAROT')) {
      console.log(`[TAROT] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    if (error.message.includes('getActiveAIModels') && error.message.includes('not defined')) {
      getActiveAIModelsError = true;
      console.log('❌ getActiveAIModels 페이지 에러:', error.message);
    }
  });
  
  try {
    console.log('1. 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 타로 읽기 페이지 이동...');
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(2000);
    
    console.log('3. 간단한 상호작용 테스트...');
    await page.fill('textarea[placeholder*="질문"]', '롤백 테스트');
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(1000);
    
    // 5초 동안 에러 모니터링
    console.log('4. 에러 발생 모니터링...');
    await page.waitForTimeout(5000);
    
    if (!getActiveAIModelsError) {
      console.log('✅ getActiveAIModels 에러 해결됨!');
    } else {
      console.log('❌ 여전히 getActiveAIModelsError 발생');
    }
    
    await page.screenshot({ 
      path: `quick-rollback-check-${Date.now()}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
  
  console.log('\n=== 빠른 검증 결과 ===');
  console.log('getActiveAIModels 에러:', getActiveAIModelsError ? '❌ 발생' : '✅ 해결됨');
  
  await browser.close();
}

quickCheck().catch(console.error);