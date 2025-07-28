const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'full-tarot-share-screenshots');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('디렉토리 생성 실패:', error);
  }
}

async function takeScreenshot(page, name, fullPage = false) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  await page.screenshot({ 
    path: path.join(screenshotDir, filename),
    fullPage: fullPage
  });
  console.log(`📸 스크린샷 저장: ${filename}`);
}

async function testFullTarotShare() {
  console.log('🎯 완전한 타로 리딩 공유 기능 테스트 시작...\n');
  
  await ensureDir(screenshotDir);
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  context.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    });
  });

  const page = await context.newPage();

  try {
    // 1. 홈페이지 접속 및 타로 리딩 시작
    console.log('1️⃣ 홈페이지 접속 및 타로 리딩 시작...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '01-homepage');
    
    // 타로리딩 버튼 클릭
    const tarotButton = await page.locator('button:has-text("타로리딩"), a:has-text("타로리딩")').first();
    if (await tarotButton.isVisible()) {
      await tarotButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 타로리딩 페이지로 이동');
    }
    
    await takeScreenshot(page, '02-reading-page');
    
    // 2. 질문 입력
    console.log('\n2️⃣ 질문 입력...');
    const questionInput = await page.locator('textarea, input[type="text"]').first();
    if (await questionInput.isVisible()) {
      await questionInput.fill('오늘의 운세와 앞으로의 방향성에 대해 알려주세요');
      await takeScreenshot(page, '03-question-entered');
      console.log('✅ 질문 입력 완료');
    }
    
    // 3. 카드 뽑기 버튼 클릭 (실제 리딩 시작)
    console.log('\n3️⃣ 실제 리딩 시작...');
    
    // 리딩 시작 버튼을 찾아서 클릭
    const readingButtons = [
      'button:has-text("카드 뽑기")',
      'button:has-text("리딩 시작")',
      'button:has-text("시작")',
      'button:has-text("구독하기")', // 이전 테스트에서 이 버튼이 작동했음
      'button[type="submit"]'
    ];
    
    let readingStarted = false;
    for (const selector of readingButtons) {
      const button = await page.locator(selector).first();
      if (await button.isVisible()) {
        console.log(`🎯 "${await button.textContent()}" 버튼 클릭`);
        await button.click();
        await page.waitForTimeout(5000);
        readingStarted = true;
        break;
      }
    }
    
    if (!readingStarted) {
      console.log('❌ 리딩 시작 버튼을 찾을 수 없습니다');
      return;
    }
    
    await takeScreenshot(page, '04-reading-started');
    
    // 4. 카드 선택 대기 및 클릭
    console.log('\n4️⃣ 카드 선택...');
    await page.waitForTimeout(3000);
    
    // 카드 찾기
    const cardSelectors = [
      '.card',
      '[class*="card"]',
      'img[alt*="card"]',
      'div[role="button"]',
      '.tarot-card'
    ];
    
    let cardSelected = false;
    for (const selector of cardSelectors) {
      const cards = await page.locator(selector).all();
      if (cards.length > 0) {
        console.log(`🃏 카드 ${cards.length}개 발견, 첫 번째 카드 클릭`);
        await cards[0].click();
        await page.waitForTimeout(3000);
        cardSelected = true;
        break;
      }
    }
    
    if (cardSelected) {
      await takeScreenshot(page, '05-card-selected');
      console.log('✅ 카드 선택 완료');
    }
    
    // 5. AI 해석 결과 대기
    console.log('\n5️⃣ AI 해석 결과 대기...');
    
    // 해석이 생성될 때까지 대기 (최대 30초)
    let interpretationVisible = false;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(2000);
      
      // 해석 텍스트나 결과가 나타났는지 확인
      const interpretationElements = await page.locator('div:has-text("해석"), div:has-text("의미"), p, div').all();
      let hasInterpretation = false;
      
      for (const element of interpretationElements) {
        const text = await element.textContent();
        if (text && text.length > 100 && (text.includes('카드') || text.includes('의미') || text.includes('해석'))) {
          hasInterpretation = true;
          break;
        }
      }
      
      if (hasInterpretation) {
        interpretationVisible = true;
        console.log('✅ AI 해석 결과 생성됨');
        break;
      }
      
      console.log(`⏳ 해석 대기 중... (${i + 1}/15)`);
    }
    
    await takeScreenshot(page, '06-interpretation-result', true);
    
    if (!interpretationVisible) {
      console.log('⚠️ AI 해석이 아직 완료되지 않았지만 공유 기능 테스트 진행');
    }
    
    // 6. 공유 버튼 찾기 및 클릭
    console.log('\n6️⃣ 공유 버튼 테스트...');
    
    const shareSelectors = [
      'button:has-text("공유")',
      'button:has-text("Share")',
      'button[aria-label*="공유"]',
      '[class*="share"]',
      'button:has(svg)',
      'svg[class*="share"]'
    ];
    
    let shareButton = null;
    for (const selector of shareSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        if (await element.isVisible()) {
          const text = await element.textContent();
          const ariaLabel = await element.getAttribute('aria-label');
          console.log(`🔍 공유 가능 요소 발견: "${text}" / aria-label: "${ariaLabel}"`);
          
          // 공유와 관련된 요소인지 확인
          if ((text && text.includes('공유')) || 
              (ariaLabel && ariaLabel.includes('공유')) ||
              (text && text.toLowerCase().includes('share'))) {
            shareButton = element;
            break;
          }
        }
      }
      if (shareButton) break;
    }
    
    if (shareButton) {
      await takeScreenshot(page, '07-share-button-found');
      console.log('✅ 공유 버튼 발견');
      
      // 공유 버튼 클릭
      await shareButton.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '08-share-clicked');
      console.log('✅ 공유 버튼 클릭');
      
      // 7. 공유 모달 또는 링크 확인
      console.log('\n7️⃣ 공유 결과 확인...');
      
      // 공유 모달 찾기
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '[class*="modal"]',
        '[class*="share"]',
        '.popup',
        '[class*="popup"]'
      ];
      
      let shareModal = null;
      for (const selector of modalSelectors) {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          shareModal = element;
          console.log(`✅ 공유 모달 발견: ${selector}`);
          break;
        }
      }
      
      if (shareModal) {
        await takeScreenshot(page, '09-share-modal');
        
        // 공유 링크 찾기
        const linkSelectors = [
          'input[value*="http"]',
          'input[readonly]',
          'input[type="text"]',
          'textarea[readonly]',
          '[class*="link"]',
          'code'
        ];
        
        let shareUrl = null;
        for (const selector of linkSelectors) {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const value = await element.inputValue() || await element.textContent();
            if (value && value.includes('http')) {
              shareUrl = value;
              console.log(`📎 공유 URL 발견: ${shareUrl}`);
              break;
            }
          }
        }
        
        // 8. 공유 링크 테스트
        if (shareUrl) {
          console.log('\n8️⃣ 공유 링크 접속 테스트...');
          const newPage = await context.newPage();
          
          try {
            await newPage.goto(shareUrl, {
              waitUntil: 'domcontentloaded',
              timeout: 20000
            });
            await newPage.waitForTimeout(5000);
            await takeScreenshot(newPage, '10-shared-reading-page', true);
            console.log('✅ 공유된 리딩 페이지 접속 성공!');
            
            // 공유된 페이지 내용 검증
            const sharedContent = await newPage.textContent('body');
            if (sharedContent.includes('타로') || sharedContent.includes('카드') || sharedContent.includes('리딩')) {
              console.log('✅ 공유된 페이지에 타로 리딩 내용 확인됨');
            } else {
              console.log('⚠️ 공유된 페이지에 타로 리딩 내용이 명확하지 않음');
            }
            
          } catch (error) {
            console.log(`❌ 공유 링크 접속 실패: ${error.message}`);
            await takeScreenshot(newPage, '10-shared-link-error');
          } finally {
            await newPage.close();
          }
        } else {
          console.log('❌ 공유 URL을 찾을 수 없습니다');
        }
      } else {
        console.log('❌ 공유 모달을 찾을 수 없습니다');
        
        // 페이지가 변경되었는지 확인
        const currentUrl = page.url();
        console.log(`📍 현재 URL: ${currentUrl}`);
        
        if (currentUrl.includes('share') || currentUrl.includes('shared')) {
          console.log('✅ 공유 페이지로 이동됨');
          await takeScreenshot(page, '09-share-page-redirect');
        }
      }
    } else {
      console.log('❌ 공유 버튼을 찾을 수 없습니다');
      
      // 페이지의 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      console.log(`\n🔍 페이지의 모든 버튼 (${allButtons.length}개):`);
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        if (text && text.trim()) {
          console.log(`  - "${text.trim()}" (${className || 'no class'})`);
        }
      }
    }
    
    // 콘솔 로그 분석
    if (consoleLogs.length > 0) {
      const errors = consoleLogs.filter(log => log.type === 'error');
      const warnings = consoleLogs.filter(log => log.type === 'warning');
      
      console.log('\n📋 콘솔 로그 요약:');
      console.log(`  - 총 로그: ${consoleLogs.length}개`);
      console.log(`  - 에러: ${errors.length}개`);
      console.log(`  - 경고: ${warnings.length}개`);
      
      if (errors.length > 0) {
        console.log('\n❌ 주요 에러:');
        errors.slice(0, 3).forEach(log => console.log(`  ${log.text}`));
      }
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await takeScreenshot(page, 'final-error', true);
  } finally {
    await browser.close();
    console.log('\n🎯 완전한 타로 리딩 공유 기능 테스트 완료!');
    console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  }
}

// 테스트 실행
testFullTarotShare().catch(console.error);