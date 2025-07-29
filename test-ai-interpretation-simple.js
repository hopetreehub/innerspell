const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'screenshots', 'ai-test');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function testAIInterpretation() {
  console.log('🚀 AI 해석 기능 테스트 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--window-size=1400,900']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 및 에러 모니터링
  page.on('console', msg => {
    console.log(`🖥️  콘솔 [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('🔴 페이지 에러:', error.message);
  });
  
  try {
    // 1. 타로 리딩 페이지 접속
    console.log('\n1. 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotDir, `01-reading-page-${Date.now()}.png`),
      fullPage: true 
    });
    
    // 페이지의 기본 요소들 확인
    const title = await page.title();
    console.log(`페이지 타이틀: ${title}`);
    
    // 2. 질문 입력 필드 찾기
    console.log('\n2. 질문 입력 필드 찾기...');
    
    // 다양한 선택자로 질문 입력 필드 찾기
    const inputSelectors = [
      'input[placeholder*="질문"]',
      'input[placeholder*="궁금"]',
      'textarea[placeholder*="질문"]',
      '.question-input',
      '#question',
      'input[type="text"]',
      'textarea'
    ];
    
    let questionInput = null;
    for (const selector of inputSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          questionInput = element;
          console.log(`✅ 질문 입력 필드 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (questionInput) {
      await questionInput.fill('AI 해석 테스트입니다');
      console.log('질문 입력 완료');
      await page.screenshot({ 
        path: path.join(screenshotDir, `02-question-entered-${Date.now()}.png`),
        fullPage: true 
      });
    } else {
      console.log('❌ 질문 입력 필드를 찾을 수 없음');
      
      // 페이지의 모든 input 요소 확인
      const allInputs = await page.locator('input, textarea').all();
      console.log(`페이지의 모든 입력 필드 (${allInputs.length}개):`);
      for (let i = 0; i < allInputs.length; i++) {
        const placeholder = await allInputs[i].getAttribute('placeholder');
        const type = await allInputs[i].getAttribute('type');
        const id = await allInputs[i].getAttribute('id');
        const className = await allInputs[i].getAttribute('class');
        console.log(`  ${i + 1}. type="${type}" placeholder="${placeholder}" id="${id}" class="${className}"`);
      }
    }
    
    // 3. 카드 섞기 버튼 찾기 및 클릭
    console.log('\n3. 카드 섞기...');
    const shuffleSelectors = [
      'button:has-text("카드 섞기")',
      'button:has-text("섞기")',
      'button:has-text("shuffle")',
      '.shuffle-button',
      '#shuffle'
    ];
    
    let shuffleButton = null;
    for (const selector of shuffleSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          shuffleButton = element;
          console.log(`✅ 섞기 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (shuffleButton) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
      console.log('카드 섞기 완료');
      await page.screenshot({ 
        path: path.join(screenshotDir, `03-cards-shuffled-${Date.now()}.png`),
        fullPage: true 
      });
    } else {
      console.log('❌ 섞기 버튼을 찾을 수 없음');
      
      // 페이지의 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      console.log(`페이지의 모든 버튼 (${allButtons.length}개):`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const className = await allButtons[i].getAttribute('class');
        console.log(`  ${i + 1}. "${text?.trim()}" class="${className}"`);
      }
    }
    
    // 4. 카드 선택
    console.log('\n4. 카드 선택...');
    
    // 카드 요소 찾기
    const cardSelectors = [
      '.card-item',
      '.card',
      '[data-card]',
      '.tarot-card',
      '.card-container .card'
    ];
    
    let cards = [];
    for (const selector of cardSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          cards = elements;
          console.log(`✅ ${elements.length}개의 카드 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (cards.length >= 3) {
      // 3장의 카드 선택
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await page.waitForTimeout(1000);
        console.log(`${i + 1}번째 카드 선택됨`);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotDir, `04-three-cards-selected-${Date.now()}.png`),
        fullPage: true 
      });
    } else {
      console.log(`❌ 충분한 카드를 찾을 수 없음 (발견된 카드: ${cards.length}개)`);
    }
    
    // 5. AI 해석 버튼 찾기 및 클릭
    console.log('\n5. AI 해석 요청...');
    
    const aiButtonSelectors = [
      'button:has-text("AI 해석")',
      'button:has-text("AI로 해석")',
      'button:has-text("AI 분석")',
      'button:has-text("해석하기")',
      'button:has-text("분석하기")',
      '.ai-button',
      '.interpret-button',
      '#ai-interpret'
    ];
    
    let aiButton = null;
    for (const selector of aiButtonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          aiButton = element;
          console.log(`✅ AI 해석 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (aiButton) {
      console.log('AI 해석 버튼 클릭...');
      await aiButton.click();
      
      await page.screenshot({ 
        path: path.join(screenshotDir, `05-ai-button-clicked-${Date.now()}.png`),
        fullPage: true 
      });
      
      // AI 응답 대기
      console.log('AI 응답 대기 중... (최대 30초)');
      await page.waitForTimeout(5000);
      
      // 로딩 상태 확인
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '[class*="loading"]',
        '[class*="spinner"]'
      ];
      
      for (const selector of loadingSelectors) {
        try {
          const loading = await page.locator(selector).first();
          if (await loading.isVisible()) {
            console.log(`로딩 중... (${selector})`);
            await page.waitForTimeout(10000);
            break;
          }
        } catch (e) {
          // 다음 선택자 시도
        }
      }
      
      // 6. AI 해석 결과 확인
      console.log('\n6. AI 해석 결과 확인...');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(screenshotDir, `06-ai-result-${Date.now()}.png`),
        fullPage: true 
      });
      
      // AI 해석 결과 텍스트 찾기
      const resultSelectors = [
        '.ai-interpretation',
        '.interpretation-result',
        '.ai-result',
        '.result-text',
        '[class*="interpretation"]',
        '[class*="result"]'
      ];
      
      let resultFound = false;
      for (const selector of resultSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const text = await element.textContent();
            if (text && text.trim().length > 10) {
              console.log(`\n✅ AI 해석 결과 발견 (${selector}):`);
              console.log('='.repeat(50));
              console.log(text.trim());
              console.log('='.repeat(50));
              resultFound = true;
              break;
            }
          }
        } catch (e) {
          // 다음 선택자 시도
        }
      }
      
      // 오류 메시지 확인
      const errorSelectors = [
        '.error',
        '.error-message',
        '[class*="error"]',
        '.alert-danger'
      ];
      
      for (const selector of errorSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const text = await element.textContent();
            console.log(`\n❌ 오류 메시지 발견 (${selector}):`);
            console.log('='.repeat(50));
            console.log(text.trim());
            console.log('='.repeat(50));
          }
        } catch (e) {
          // 다음 선택자 시도
        }
      }
      
      if (!resultFound) {
        console.log('\n❌ AI 해석 결과를 찾을 수 없음');
        
        // 페이지의 모든 텍스트 내용에서 AI 관련 키워드 검색
        const pageText = await page.textContent('body');
        const keywords = ['해석', '분석', '타로', '카드', 'AI', '과거', '현재', '미래'];
        
        console.log('\n페이지 내 키워드 검색 결과:');
        for (const keyword of keywords) {
          if (pageText.includes(keyword)) {
            console.log(`✅ "${keyword}" 키워드 발견`);
          }
        }
      }
      
    } else {
      console.log('❌ AI 해석 버튼을 찾을 수 없음');
      
      // 현재 페이지의 모든 버튼 다시 확인
      const allButtons = await page.locator('button').all();
      console.log(`\n현재 페이지의 모든 버튼 (${allButtons.length}개):`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const className = await allButtons[i].getAttribute('class');
        const isVisible = await allButtons[i].isVisible();
        console.log(`  ${i + 1}. "${text?.trim()}" class="${className}" visible=${isVisible}`);
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, `07-final-state-${Date.now()}.png`),
      fullPage: true 
    });
    
    console.log('\n✅ 테스트 완료!');
    console.log(`📸 스크린샷 저장 위치: ${screenshotDir}`);
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, `error-${Date.now()}.png`),
      fullPage: true 
    });
  }
  
  // 수동 확인을 위해 잠시 대기
  console.log('\n브라우저를 수동으로 확인하세요. 10초 후 자동 종료됩니다...');
  await page.waitForTimeout(10000);
  
  await browser.close();
}

// 테스트 실행
testAIInterpretation().catch(console.error);