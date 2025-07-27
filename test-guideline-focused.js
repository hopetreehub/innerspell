const { chromium } = require('playwright');

async function testGuidelineFocused() {
  console.log('🎯 타로 지침 중심 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 2000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 타로 지침과 AI 해석 관련 로그 캡처
  const guidelineMessages = [];
  const aiMessages = [];
  const allRequests = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    // 타로 지침 관련 로그
    if (
      text.includes('guideline') || text.includes('지침') ||
      text.includes('instruction') || text.includes('tarot') ||
      text.includes('interpretation') || text.includes('해석') ||
      text.includes('generateTarotInterpretation') ||
      text.includes('TarotCardInstruction')
    ) {
      guidelineMessages.push({ type, text, timestamp: new Date().toISOString() });
      console.log(`🔥 타로 지침 로그: [${type}] ${text}`);
    }
    
    // AI 요청 관련 로그
    if (
      text.includes('AI') || text.includes('generate') ||
      text.includes('model') || text.includes('prompt') ||
      text.includes('completion') || text.includes('response')
    ) {
      aiMessages.push({ type, text, timestamp: new Date().toISOString() });
      console.log(`🤖 AI 관련 로그: [${type}] ${text}`);
    }
    
    console.log(`📝 일반 로그: [${type}] ${text}`);
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    const url = request.url();
    allRequests.push({
      url,
      method: request.method(),
      timestamp: new Date().toISOString()
    });
    
    if (url.includes('/api/') || url.includes('generate') || url.includes('interpretation')) {
      console.log(`🌐 중요 요청: ${request.method()} ${url}`);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('generate') || url.includes('interpretation')) {
      console.log(`📨 중요 응답: ${response.status()} ${url}`);
    }
  });
  
  try {
    console.log('📍 1단계: /reading 페이지 접속');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.screenshot({ path: 'screenshots/guideline-01-loaded.png', fullPage: true });
    
    // 충분한 로딩 대기
    await page.waitForTimeout(3000);
    
    console.log('📍 2단계: 질문 입력');
    await page.fill('textarea', '타로 지침이 제대로 적용되는지 테스트해주세요');
    
    console.log('📍 3단계: 해석 스타일을 "심리학적 원형 탐구"로 변경');
    await page.click('[id="interpretation-method"]');
    await page.waitForTimeout(1000);
    
    // 정확한 옵션 텍스트 사용
    await page.click('text=심리학적 원형 탐구');
    console.log('✅ "심리학적 원형 탐구" 스타일 선택됨');
    await page.screenshot({ path: 'screenshots/guideline-02-style-selected.png', fullPage: true });
    
    console.log('📍 4단계: 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(6000); // 섞기 애니메이션 대기
    
    console.log('📍 5단계: 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/guideline-03-cards-revealed.png', fullPage: true });
    
    console.log('📍 6단계: 3장의 카드 선택 (삼위일체)');
    const cards = page.locator('[role="button"]').filter({ hasText: /펼쳐진.*카드 선택/ });
    const cardCount = await cards.count();
    console.log(`🎴 사용 가능한 카드: ${cardCount}장`);
    
    // 삼위일체는 3장 필요
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      await cards.nth(i).click();
      console.log(`✅ ${i + 1}번째 카드 선택됨`);
      await page.waitForTimeout(800);
    }
    
    await page.screenshot({ path: 'screenshots/guideline-04-cards-selected.png', fullPage: true });
    
    console.log('📍 7단계: AI 해석 요청 (지침 활용 모니터링)');
    
    // 해석 요청 전 현재까지의 로그 정리
    console.log(`\n📊 해석 요청 전 상태:`);
    console.log(`- 타로 지침 관련 로그: ${guidelineMessages.length}개`);
    console.log(`- AI 관련 로그: ${aiMessages.length}개`);
    console.log(`- 네트워크 요청: ${allRequests.length}개`);
    
    await page.click('button:has-text("AI 해석 받기")');
    console.log('✅ AI 해석 요청 시작됨');
    
    console.log('📍 8단계: 해석 생성 과정 모니터링 (60초)');
    await page.waitForTimeout(5000); // 초기 대기
    
    // 해석 다이얼로그 대기
    let interpretationGenerated = false;
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 55000 });
      interpretationGenerated = true;
      console.log('✅ 해석 다이얼로그 생성됨');
      
      // 해석 완료까지 추가 대기
      await page.waitForTimeout(10000);
      
      // 해석 내용 확인
      const interpretationText = await page.locator('[role="dialog"] .prose').textContent();
      if (interpretationText) {
        console.log(`📖 생성된 해석 길이: ${interpretationText.length} 자`);
        console.log(`📖 해석 시작 부분: ${interpretationText.substring(0, 150)}...`);
      }
      
    } catch (error) {
      console.log('⚠️ 해석 다이얼로그 생성 실패 또는 시간 초과');
    }
    
    await page.screenshot({ path: 'screenshots/guideline-05-interpretation.png', fullPage: true });
    
    console.log('📍 9단계: 타로 지침 로그 상세 분석');
    
    console.log(`\n🔥 타로 지침 관련 로그 분석 (총 ${guidelineMessages.length}개):`);
    if (guidelineMessages.length > 0) {
      guidelineMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    } else {
      console.log('  ❌ 타로 지침 관련 로그가 발견되지 않았습니다.');
    }
    
    console.log(`\n🤖 AI 관련 로그 분석 (총 ${aiMessages.length}개):`);
    if (aiMessages.length > 0) {
      aiMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    } else {
      console.log('  ❌ AI 관련 로그가 발견되지 않았습니다.');
    }
    
    // 중요한 API 요청 필터링
    const importantRequests = allRequests.filter(req => 
      req.url.includes('/api/') || 
      req.url.includes('generate') || 
      req.url.includes('interpretation') ||
      req.method === 'POST'
    );
    
    console.log(`\n🌐 중요 네트워크 요청 (총 ${importantRequests.length}개):`);
    importantRequests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.method} ${req.url}`);
    });
    
    console.log('📍 10단계: 데이터 파일에 타로 지침 검증');
    
    // 타로 지침 데이터 파일 확인
    await page.evaluate(() => {
      console.log('🔍 클라이언트에서 타로 지침 확인 시작...');
      
      // 현재 페이지에서 타로 관련 전역 변수나 모듈 확인
      if (typeof window !== 'undefined') {
        console.log('🌐 윈도우 객체에서 타로 관련 데이터 검색...');
        
        // React 개발자 도구나 Next.js 관련 객체 확인
        const keys = Object.keys(window);
        const tarotKeys = keys.filter(key => 
          key.toLowerCase().includes('tarot') || 
          key.toLowerCase().includes('card') ||
          key.toLowerCase().includes('guideline')
        );
        
        console.log('🎯 타로 관련 윈도우 키:', tarotKeys);
      }
    });
    
    await page.screenshot({ path: 'screenshots/guideline-06-final.png', fullPage: true });
    
    console.log('\n📊 최종 결과 요약:');
    console.log(`- 해석 생성 성공: ${interpretationGenerated ? '✅' : '❌'}`);
    console.log(`- 타로 지침 로그: ${guidelineMessages.length}개`);
    console.log(`- AI 처리 로그: ${aiMessages.length}개`);
    console.log(`- 중요 네트워크 요청: ${importantRequests.length}개`);
    
    // 지침 활용 여부 판단
    const hasGuidelineActivity = guidelineMessages.length > 0 || 
                                aiMessages.some(msg => msg.text.includes('instruction') || msg.text.includes('guideline'));
    
    console.log(`- 타로 지침 활용 추정: ${hasGuidelineActivity ? '✅ 활용됨' : '❌ 활용 안됨'}`);
    
    // 15초 추가 대기로 수동 확인 가능
    console.log('\n🔍 15초 후 브라우저가 종료됩니다...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ path: 'screenshots/guideline-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ 타로 지침 중심 테스트 완료!');
  }
}

testGuidelineFocused();