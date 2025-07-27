const { chromium } = require('playwright');

async function testSimpleReading() {
  console.log('🎯 간단한 타로리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 2000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 캡처 (타로 지침 관련 로그 추적)
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    
    // 타로 지침 관련 로그 강조 표시
    if (text.includes('guideline') || text.includes('지침') || text.includes('spread') || text.includes('style')) {
      console.log(`🔥 중요 로그: ${msg.type()}: ${text}`);
    } else {
      console.log(`🔍 브라우저 콘솔: ${msg.type()}: ${text}`);
    }
  });
  
  // 에러 캡처
  page.on('pageerror', error => {
    console.error(`❌ 페이지 에러: ${error.message}`);
  });
  
  try {
    console.log('📍 1단계: /reading 페이지 접속');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.screenshot({ path: 'screenshots/simple-01-page-loaded.png', fullPage: true });
    console.log('✅ 페이지 로드 완료');
    
    // 페이지 로딩 완전히 대기
    await page.waitForTimeout(5000);
    
    console.log('📍 2단계: 질문 입력');
    // 질문 입력 필드 찾기
    await page.fill('textarea', '오늘의 운세를 알려주세요');
    console.log('✅ 질문 입력 완료');
    await page.screenshot({ path: 'screenshots/simple-02-question-entered.png', fullPage: true });
    
    console.log('📍 3단계: 타로 스프레드 확인 및 선택');
    // 스프레드 드롭다운 찾기
    const spreadSelect = page.locator('select').first();
    const spreadOptions = await spreadSelect.locator('option').allTextContents();
    console.log('📋 사용 가능한 스프레드:', spreadOptions);
    
    // 삼위일체 선택
    await spreadSelect.selectOption('trinity');
    console.log('✅ 삼위일체 스프레드 선택됨');
    await page.screenshot({ path: 'screenshots/simple-03-spread-selected.png', fullPage: true });
    
    console.log('📍 4단계: 해석 스타일 확인 및 선택');
    // 스타일 드롭다운 찾기
    const styleSelect = page.locator('select').nth(1);
    const styleOptions = await styleSelect.locator('option').allTextContents();
    console.log('🎨 사용 가능한 스타일:', styleOptions);
    
    // 전통 RWS 선택
    await styleSelect.selectOption('traditional_rws');
    console.log('✅ 전통 RWS 스타일 선택됨');
    await page.screenshot({ path: 'screenshots/simple-04-style-selected.png', fullPage: true });
    
    console.log('📍 5단계: 카드 셔플 버튼 클릭');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    console.log('✅ 카드 섞기 완료');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/simple-05-cards-shuffled.png', fullPage: true });
    
    console.log('📍 6단계: 카드 선택 (3장)');
    // 카드들이 로드될 때까지 대기
    await page.waitForSelector('.card', { timeout: 10000 });
    
    // 3장의 카드 클릭
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    console.log(`🎴 총 ${cardCount}장의 카드 발견`);
    
    for (let i = 0; i < Math.min(3, cardCount); i++) {
      await cards.nth(i).click();
      console.log(`✅ ${i + 1}번째 카드 선택됨`);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'screenshots/simple-06-cards-selected.png', fullPage: true });
    
    console.log('📍 7단계: 해석 시작 버튼 클릭');
    const interpretButton = page.locator('button:has-text("해석 시작")');
    if (await interpretButton.count() > 0) {
      await interpretButton.click();
      console.log('✅ 해석 시작 버튼 클릭됨');
    } else {
      console.log('⚠️ 해석 시작 버튼을 찾을 수 없음');
    }
    
    console.log('📍 8단계: 해석 결과 대기 (최대 30초)');
    await page.waitForTimeout(5000);
    
    // 해석 결과 확인
    try {
      await page.waitForSelector('.interpretation, .result, [class*="interpretation"]', { timeout: 25000 });
      console.log('✅ 해석 결과가 생성되었습니다!');
    } catch (error) {
      console.log('⚠️ 해석 결과를 찾을 수 없습니다');
    }
    
    await page.screenshot({ path: 'screenshots/simple-07-interpretation-result.png', fullPage: true });
    
    console.log('📍 9단계: 타로 지침 로그 분석');
    console.log('📊 수집된 콘솔 로그 분석:');
    
    const guidelineRelatedLogs = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('guideline') || 
      log.text.includes('지침') ||
      log.text.toLowerCase().includes('spread') ||
      log.text.toLowerCase().includes('style') ||
      log.text.toLowerCase().includes('interpretation')
    );
    
    console.log(`🔍 타로 지침 관련 로그 ${guidelineRelatedLogs.length}개 발견:`);
    guidelineRelatedLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
    });
    
    // 최종 페이지 상태 확인
    const pageContent = await page.textContent('body');
    const hasInterpretation = pageContent.includes('해석') || pageContent.includes('카드') || pageContent.includes('의미');
    console.log(`📄 해석 결과 포함 여부: ${hasInterpretation ? '✅ 있음' : '❌ 없음'}`);
    
    console.log('📍 10단계: 최종 결과');
    await page.screenshot({ path: 'screenshots/simple-08-final-state.png', fullPage: true });
    
    // 브라우저를 10초 더 열어두어 수동 확인
    console.log('🔍 10초 후 브라우저가 종료됩니다. 수동 확인을 원하면 Ctrl+C로 중단하세요.');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'screenshots/simple-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ 타로리딩 테스트 완료!');
  }
}

testSimpleReading();