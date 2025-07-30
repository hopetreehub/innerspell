const { chromium } = require('playwright');

async function manualTarotTest() {
  console.log('🔮 수동 타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 오류 감지를 위한 로그 수집
  const errorLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`콘솔: [${msg.type()}] ${text}`);
    if (text.includes('error') || text.includes('Error') || text.includes('NOT_FOUND') || text.includes('gpt-3.5-turbo')) {
      errorLogs.push(text);
    }
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      const logEntry = `HTTP 오류: ${response.status()} ${response.url()}`;
      console.log(logEntry);
      errorLogs.push(logEntry);
    }
  });
  
  try {
    // 1. 페이지 접속
    console.log('1️⃣ 타로 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-screenshots/manual-01-initial.png' });
    
    // 2. 페이지 구조 분석
    console.log('2️⃣ 페이지 구조 분석...');
    
    // 입력 필드가 검색용인지 확인
    const inputPlaceholder = await page.locator('input').first().getAttribute('placeholder');
    console.log(`입력 필드 placeholder: "${inputPlaceholder}"`);
    
    // 모든 탭 확인
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    console.log(`탭 개수: ${tabCount}`);
    for (let i = 0; i < tabCount; i++) {
      const tabText = await tabs.nth(i).textContent();
      console.log(`  탭 ${i}: "${tabText}"`);
    }
    
    // 3. 검색어 제거하고 카드 보기
    console.log('3️⃣ 검색어 제거...');
    const searchInput = page.locator('input').first();
    await searchInput.clear();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification-screenshots/manual-02-search-cleared.png' });
    
    // 4. 메이저 아르카나 탭이 활성화되어 있는지 확인하고 클릭
    console.log('4️⃣ 메이저 아르카나 탭 활성화...');
    const majorTab = page.getByRole('tab', { name: '메이저 아르카나' });
    await majorTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification-screenshots/manual-03-major-tab.png' });
    
    // 5. 카드 확인
    console.log('5️⃣ 카드 로딩 확인...');
    const cardImages = page.locator('img[alt*="카드"], img[src*="tarot"], img[src*="card"]');
    const cardCount = await cardImages.count();
    console.log(`발견된 카드 개수: ${cardCount}`);
    
    if (cardCount > 0) {
      console.log('✅ 카드가 발견되었습니다!');
      await page.screenshot({ path: 'verification-screenshots/manual-04-cards-found.png' });
      
      // 첫 번째 카드 클릭
      console.log('6️⃣ 첫 번째 카드 클릭...');
      await cardImages.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'verification-screenshots/manual-05-card-clicked.png' });
      
      // 7. AI 해석 버튼 찾기
      console.log('7️⃣ AI 해석 버튼 찾기...');
      const interpretButtons = [
        'button:has-text("AI 해석")',
        'button:has-text("해석 요청")',
        'button:has-text("해석")',
        'button:has-text("AI로 해석하기")',
        'button:has-text("리딩")',
        'button:has-text("분석")',
        'button[class*="interpret"]',
        'button[id*="interpret"]'
      ];
      
      let interpretButton = null;
      for (const selector of interpretButtons) {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          interpretButton = button.first();
          console.log(`✅ AI 해석 버튼 발견: ${selector}`);
          break;
        }
      }
      
      if (interpretButton) {
        console.log('8️⃣ AI 해석 요청...');
        await interpretButton.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'verification-screenshots/manual-06-interpretation-requested.png' });
        
        // 9. 오류 확인
        console.log('9️⃣ 오류 확인...');
        await page.waitForTimeout(10000); // 응답 대기
        
        const pageContent = await page.textContent('body');
        const errorKeywords = ['NOT_FOUND', 'gpt-3.5-turbo', 'Model', 'not found', 'error', 'Error', '오류'];
        
        let errorFound = false;
        for (const keyword of errorKeywords) {
          if (pageContent.includes(keyword)) {
            console.log(`❌ 오류 키워드 발견: "${keyword}"`);
            errorFound = true;
            
            // 오류가 포함된 텍스트 찾기
            const lines = pageContent.split('\n');
            const errorLines = lines.filter(line => line.includes(keyword) && line.trim().length > 0);
            errorLines.forEach(line => console.log(`  📍 ${line.trim()}`));
          }
        }
        
        if (!errorFound) {
          console.log('✅ 명시적인 오류 메시지가 발견되지 않았습니다.');
        }
        
        await page.screenshot({ path: 'verification-screenshots/manual-07-final-result.png' });
        
      } else {
        console.log('❌ AI 해석 버튼을 찾을 수 없습니다.');
        
        // 모든 버튼 나열
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`페이지의 모든 버튼 (${buttonCount}개):`);
        for (let i = 0; i < buttonCount; i++) {
          const buttonText = await allButtons.nth(i).textContent();
          const buttonId = await allButtons.nth(i).getAttribute('id');
          const buttonClass = await allButtons.nth(i).getAttribute('class');
          console.log(`  ${i}: "${buttonText}" (id: ${buttonId}, class: ${buttonClass})`);
        }
      }
      
    } else {
      console.log('❌ 카드가 발견되지 않았습니다.');
      await page.screenshot({ path: 'verification-screenshots/manual-04-no-cards.png' });
    }
    
    console.log('\n📊 수집된 오류 로그:');
    errorLogs.forEach((log, index) => console.log(`${index + 1}. ${log}`));
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    await page.screenshot({ path: 'verification-screenshots/manual-error.png' });
  }
  
  // 수동 확인을 위해 15초 대기
  console.log('\n⏰ 수동 확인을 위해 15초 대기 중... (브라우저에서 직접 확인해주세요)');
  setTimeout(() => {
    browser.close();
  }, 15000);
}

manualTarotTest().catch(console.error);