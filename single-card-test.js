const { chromium } = require('playwright');

async function singleCardTest() {
  console.log('🃏 원카드 타로 리딩 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 3000,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 중요한 로그와 오류만 수집
  const criticalLogs = [];
  const apiErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const isCritical = text.includes('NOT_FOUND') || 
                      text.includes('gpt-3.5-turbo') || 
                      text.includes('Model') ||
                      text.includes('OpenAI') ||
                      text.includes('API') ||
                      (text.includes('error') && !text.includes('font')) ||
                      text.includes('failed') ||
                      text.includes('해석');
    
    if (isCritical) {
      criticalLogs.push(`[${msg.type()}] ${text}`);
      console.log(`🔍 중요 로그: [${msg.type()}] ${text}`);
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') && !url.includes('analytics')) {
      const status = response.status();
      console.log(`📡 API 요청: ${status} ${url}`);
      
      if (status >= 400) {
        try {
          const responseText = await response.text();
          apiErrors.push({ url, status, body: responseText });
          console.log(`🚨 API 오류 발견: ${status} ${url}`);
          console.log(`🔍 응답 내용: ${responseText.substring(0, 200)}...`);
        } catch (e) {
          console.log(`응답을 읽을 수 없음: ${e.message}`);
        }
      }
    }
  });
  
  try {
    // 1. 타로 리딩 페이지 접속
    console.log('1️⃣ 타로 리딩 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-screenshots/single-01-page.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ 질문 입력...');
    const questionTextarea = page.locator('textarea');
    await questionTextarea.fill('나의 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'verification-screenshots/single-02-question.png' });
    
    // 3. 원카드 스프레드 선택
    console.log('3️⃣ 원카드 스프레드 선택...');
    
    // 스프레드 드롭다운 클릭
    const spreadDropdown = page.locator('[role="combobox"]').first();
    await spreadDropdown.click();
    await page.waitForTimeout(1000);
    
    // "한 장의 불꽃" 선택
    const singleCardOption = page.locator('text=한 장의 불꽃').first();
    await singleCardOption.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification-screenshots/single-03-spread-selected.png' });
    
    // 4. 카드 섞기 버튼 클릭
    console.log('4️⃣ 카드 섞기...');
    
    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(5000); // 섞기 과정 대기
    await page.screenshot({ path: 'verification-screenshots/single-04-shuffled.png' });
    
    // 5. 카드 선택 (자동으로 진행될 수도 있음)
    console.log('5️⃣ 카드 선택 과정...');
    await page.waitForTimeout(3000);
    
    // 선택 가능한 카드가 있는지 확인
    const selectableCard = page.locator('button:has-text("선택"), .card-selectable, [data-selectable="true"]').first();
    if (await selectableCard.count() > 0) {
      await selectableCard.click();
      console.log('✅ 카드 선택됨');
    } else {
      console.log('⏳ 자동으로 카드가 선택되었거나 진행 중...');
    }
    
    await page.screenshot({ path: 'verification-screenshots/single-05-card-selected.png' });
    
    // 6. AI 해석 대기 및 확인
    console.log('6️⃣ AI 해석 결과 대기...');
    await page.waitForTimeout(15000); // AI 해석 대기
    
    // 페이지 내용 확인
    const pageContent = await page.textContent('body');
    
    // GPT 모델 오류 검색
    const gptErrorFound = pageContent.includes('gpt-3.5-turbo') || 
                         pageContent.includes('NOT_FOUND') ||
                         (pageContent.includes('Model') && pageContent.includes('not found'));
    
    if (gptErrorFound) {
      console.log('🚨 GPT 모델 오류 발견!');
      
      // 구체적인 오류 메시지 찾기
      const errorPatterns = [
        /NOT_FOUND.*gpt-3\.5-turbo/i,
        /Model.*gpt-3\.5-turbo.*not found/i,
        /gpt-3\.5-turbo.*NOT_FOUND/i
      ];
      
      for (const pattern of errorPatterns) {
        const match = pageContent.match(pattern);
        if (match) {
          console.log(`📍 발견된 오류: ${match[0]}`);
        }
      }
      
      // 오류가 표시된 부분의 스크린샷
      await page.screenshot({ path: 'verification-screenshots/single-06-ERROR-FOUND.png' });
      
    } else {
      console.log('✅ GPT 모델 관련 오류가 발견되지 않았습니다.');
      await page.screenshot({ path: 'verification-screenshots/single-06-success.png' });
    }
    
    // 7. 해석 결과 확인
    console.log('7️⃣ 해석 결과 확인...');
    
    // 해석 결과가 있는지 확인
    const interpretationElements = [
      '.interpretation',
      '[class*="result"]',
      'text=/해석/i',
      'text=/의미/i'
    ];
    
    let interpretationFound = false;
    for (const selector of interpretationElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        const text = await element.first().textContent();
        if (text && text.length > 20) {
          console.log(`✅ 해석 결과 발견: ${text.substring(0, 50)}...`);
          interpretationFound = true;
          break;
        }
      }
    }
    
    if (!interpretationFound) {
      console.log('❌ 해석 결과를 찾을 수 없습니다.');
    }
    
    await page.screenshot({ path: 'verification-screenshots/single-07-final.png' });
    
    // 최종 결과 요약
    console.log('\n📊 테스트 결과 요약:');
    console.log(`중요 로그 수: ${criticalLogs.length}`);
    console.log(`API 오류 수: ${apiErrors.length}`);
    console.log(`GPT 오류 발견: ${gptErrorFound ? '❌ 예' : '✅ 아니오'}`);
    console.log(`해석 결과 존재: ${interpretationFound ? '✅ 예' : '❌ 아니오'}`);
    
    if (apiErrors.length > 0) {
      console.log('\n🚨 발견된 API 오류:');
      apiErrors.forEach(error => {
        console.log(`- ${error.status} ${error.url}`);
        if (error.body.length < 200) {
          console.log(`  응답: ${error.body}`);
        }
      });
    }
    
    if (criticalLogs.length > 0) {
      console.log('\n🔍 중요 로그들:');
      criticalLogs.forEach(log => console.log(`- ${log}`));
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    await page.screenshot({ path: 'verification-screenshots/single-error.png' });
  }
  
  // 수동 확인을 위해 30초 대기
  console.log('\n⏰ 수동 확인을 위해 30초 대기 중...');
  console.log('🔍 브라우저에서 직접 확인하여 "AI 해석 오류: NOT_FOUND: Model gpt-3.5-turbo not found" 메시지가 있는지 확인하세요!');
  setTimeout(() => {
    browser.close();
  }, 30000);
}

singleCardTest().catch(console.error);