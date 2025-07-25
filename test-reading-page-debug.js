const { chromium } = require('playwright');
const path = require('path');

async function debugReadingPage() {
  console.log('🔍 Reading page 상세 디버그 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처
    page.on('console', msg => {
      console.log(`[CONSOLE] ${msg.text()}`);
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[ERROR] ${error.message}`);
    });
    
    console.log('📍 /reading 페이지로 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 헤더 확인
    const header = await page.textContent('h1').catch(() => null);
    console.log(`📋 헤더: ${header}`);
    
    // 질문 입력 필드 찾기
    const questionInputs = await page.locator('textarea, input[type="text"]').count();
    console.log(`🔍 입력 필드 개수: ${questionInputs}`);
    
    if (questionInputs > 0) {
      for (let i = 0; i < questionInputs; i++) {
        const placeholder = await page.locator('textarea, input[type="text"]').nth(i).getAttribute('placeholder').catch(() => null);
        const value = await page.locator('textarea, input[type="text"]').nth(i).inputValue().catch(() => '');
        console.log(`  - 입력 필드 ${i + 1}: placeholder="${placeholder}", value="${value}"`);
      }
    }
    
    // 스프레드 선택 확인
    const selects = await page.locator('select').count();
    console.log(`📋 Select 요소 개수: ${selects}`);
    
    // 버튼 확인
    const buttons = await page.locator('button').count();
    console.log(`🔘 버튼 개수: ${buttons}`);
    
    for (let i = 0; i < Math.min(buttons, 10); i++) {
      const buttonText = await page.locator('button').nth(i).textContent().catch(() => '');
      const isVisible = await page.locator('button').nth(i).isVisible().catch(() => false);
      console.log(`  - 버튼 ${i + 1}: "${buttonText}" (visible: ${isVisible})`);
    }
    
    // 카드 요소 확인
    const cardImages = await page.locator('img').count();
    console.log(`🎴 이미지 개수: ${cardImages}`);
    
    // 타로 관련 요소 확인
    const tarotElements = await page.locator('[class*="card"], [class*="tarot"], [data-testid*="card"]').count();
    console.log(`🔮 타로 관련 요소 개수: ${tarotElements}`);
    
    // 전체 페이지 HTML 구조 확인 (부분)
    const bodyText = await page.locator('body').textContent();
    console.log(`📝 페이지 텍스트 길이: ${bodyText.length} characters`);
    console.log(`📝 페이지에 "질문" 포함: ${bodyText.includes('질문')}`);
    console.log(`📝 페이지에 "타로" 포함: ${bodyText.includes('타로')}`);
    console.log(`📝 페이지에 "카드" 포함: ${bodyText.includes('카드')}`);
    
    // 스크린샷 저장
    const screenshotPath = path.join(__dirname, 'debug-reading-page.png');
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`📸 스크린샷 저장: ${screenshotPath}`);
    
    // 잠시 대기하여 수동 확인 가능
    console.log('⏳ 10초간 페이지 유지 (수동 확인 가능)...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 디버그 중 오류:', error);
  } finally {
    await browser.close();
  }
}

debugReadingPage();