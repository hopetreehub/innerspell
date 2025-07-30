// Simple getActiveAIModels Error Check
const { chromium } = require('playwright');

async function simpleErrorCheck() {
  console.log('🔍 간단한 getActiveAIModels 에러 확인');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let getActiveAIModelsErrorFound = false;
  const allErrors = [];
  
  // 모든 콘솔 메시지 추적
  page.on('console', msg => {
    if (msg.text().includes('getActiveAIModels')) {
      getActiveAIModelsErrorFound = true;
      console.log('❌ getActiveAIModels 에러 발견:', msg.text());
    }
    if (msg.type() === 'error') {
      allErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    if (error.message.includes('getActiveAIModels')) {
      getActiveAIModelsErrorFound = true;
      console.log('❌ getActiveAIModels 페이지 에러:', error.message);
    }
    allErrors.push(error.message);
  });
  
  try {
    console.log('사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('10초 동안 에러 모니터링...');
    await page.waitForTimeout(10000);
    
    // 페이지 간단한 상호작용 시도
    try {
      await page.evaluate(() => {
        // 간단한 JavaScript 실행으로 추가 에러 유발 가능성 확인
        console.log('Test JavaScript execution');
      });
    } catch (e) {}
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log('페이지 로드 실패:', error.message);
  }
  
  console.log('\n=== 에러 체크 결과 ===');
  console.log('getActiveAIModels 에러 발견:', getActiveAIModelsErrorFound ? '❌ YES' : '✅ NO');
  console.log('총 에러 수:', allErrors.length);
  
  if (getActiveAIModelsErrorFound) {
    console.log('\n❌ 여전히 getActiveAIModels 에러가 발생하고 있습니다.');
    console.log('추가적인 롤백이나 다른 접근이 필요할 수 있습니다.');
  } else {
    console.log('\n✅ getActiveAIModels 에러가 해결되었습니다!');
  }
  
  await page.screenshot({ path: `simple-error-check-${Date.now()}.png` });
  await browser.close();
}

simpleErrorCheck().catch(console.error);