// Final AI Model Fix Test
const { chromium } = require('playwright');

async function testAIFix() {
  console.log('🎯 최종 AI 모델 수정 테스트');
  console.log('==============================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 응답 모니터링
  let apiError = null;
  page.on('response', async response => {
    if (response.url().includes('/api/') && response.url().includes('tarot')) {
      try {
        const body = await response.text();
        console.log(`[API] ${response.status()} ${response.url()}`);
        
        if (body.includes('NOT_FOUND') || body.includes('gpt-3.5-turbo')) {
          apiError = body;
          console.log('[API ERROR FOUND]', body);
        } else if (response.status() === 200) {
          console.log('[API SUCCESS] Response received');
        }
      } catch (e) {}
    }
  });
  
  try {
    console.log('1. 올바른 Vercel URL로 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('2. 타로 카드 뽑기 시작...');
    
    // 타로 읽기 버튼 클릭
    await page.click('text="무료 타로 카드 뽑기"');
    await page.waitForTimeout(3000);
    
    // 질문 입력
    await page.fill('textarea[placeholder*="질문"]', '오늘의 운세를 알려주세요.');
    
    // 1장 뽑기 선택
    await page.click('text="1장 뽑기"');
    await page.waitForTimeout(2000);
    
    // 카드 선택
    const cardBacks = await page.locator('.card-back').all();
    if (cardBacks.length > 0) {
      await cardBacks[0].click();
      await page.waitForTimeout(2000);
    }
    
    console.log('3. AI 해석 요청 중...');
    await page.click('text="AI 해석 요청"');
    
    // 30초 동안 응답 대기
    let success = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      // 성공 확인 (해석 내용 존재)
      const interpretation = await page.locator('text=/서론|본론|해석/').first();
      if (await interpretation.isVisible({ timeout: 100 }).catch(() => false)) {
        success = true;
        console.log('✅ AI 해석 성공!');
        break;
      }
      
      // 에러 확인
      const errorText = await page.locator('text=/NOT_FOUND|Model.*not found|AI 해석 오류/i').first();
      if (await errorText.isVisible({ timeout: 100 }).catch(() => false)) {
        const errorMsg = await errorText.textContent();
        console.log('❌ 에러 발견:', errorMsg);
        break;
      }
    }
    
    // 결과 스크린샷
    await page.screenshot({ 
      path: `ai-fix-final-test-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('\n===== 최종 테스트 결과 =====');
    console.log(`성공: ${success}`);
    console.log(`API 에러: ${apiError ? 'YES' : 'NO'}`);
    
    if (success && !apiError) {
      console.log('\n🎉 AI 모델 오류 완전히 해결됨!');
      console.log('gpt-3.5-turbo not found 에러가 더 이상 발생하지 않습니다.');
    } else {
      console.log('\n⚠️ 추가 수정이 필요할 수 있습니다.');
    }
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
  
  console.log('\n브라우저를 열어두고 수동 확인 가능합니다.');
  await new Promise(() => {});
}

testAIFix().catch(console.error);