const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'tarot-reading-flow-screenshots');

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

async function testTarotReadingFlow() {
  console.log('🔮 타로 리딩 플로우 완전 테스트 시작...\n');
  
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
    // 1. 홈페이지 접속
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '01-homepage');
    
    // 2. "타로 리딩 시작" 버튼 클릭
    console.log('\n2️⃣ 타로 리딩 시작 버튼 찾기...');
    
    const startButtons = [
      'button:has-text("타로 리딩 시작")',
      'a:has-text("타로 리딩 시작")',
      'button:has-text("시작하기")',
      'a:has-text("시작하기")',
      '.cta-button',
      '[href*="/reading"]'
    ];
    
    let startButton = null;
    for (const selector of startButtons) {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        startButton = element;
        const text = await element.textContent();
        console.log(`✅ 시작 버튼 발견: "${text.trim()}"`);
        break;
      }
    }
    
    if (startButton) {
      await takeScreenshot(page, '02-start-button-found');
      await startButton.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '03-after-start-click');
      console.log('✅ 시작 버튼 클릭 완료');
    } else {
      // 네비게이션에서 "타로카드" 링크 시도
      console.log('⚡ 네비게이션에서 타로카드 링크 시도...');
      const tarotNav = await page.locator('a:has-text("타로카드")').first();
      if (await tarotNav.isVisible()) {
        await tarotNav.click();
        await page.waitForTimeout(3000);
        console.log('✅ 타로카드 페이지로 이동');
      }
    }
    
    // 3. 현재 URL 확인 및 리딩 페이지 이동
    const currentUrl = page.url();
    console.log(`\n📍 현재 URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/reading') && !currentUrl.includes('/tarot')) {
      console.log('🔄 리딩 페이지로 직접 이동...');
      await page.goto('https://test-studio-firebase.vercel.app/tarot/reading', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await page.waitForTimeout(3000);
    }
    
    await takeScreenshot(page, '04-reading-page');
    
    // 4. 질문 입력 필드 찾기
    console.log('\n4️⃣ 질문 입력 필드 찾기...');
    
    const questionSelectors = [
      'input[placeholder*="질문"]',
      'textarea[placeholder*="질문"]',
      'input[type="text"]',
      'textarea',
      '[data-testid="question-input"]',
      '.question-input'
    ];
    
    let questionInput = null;
    for (const selector of questionSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        questionInput = element;
        const placeholder = await element.getAttribute('placeholder');
        console.log(`✅ 질문 입력 필드 발견: "${placeholder || 'no placeholder'}"`);
        break;
      }
    }
    
    if (questionInput) {
      await questionInput.fill('오늘의 운세와 조언을 알려주세요');
      await takeScreenshot(page, '05-question-entered');
      console.log('✅ 질문 입력 완료');
    }
    
    // 5. 카드 뽑기/시작 버튼 찾기
    console.log('\n5️⃣ 카드 뽑기 버튼 찾기...');
    
    const drawButtons = [
      'button:has-text("카드 뽑기")',
      'button:has-text("리딩 시작")',
      'button:has-text("시작")',
      'button:has-text("Draw")',
      'button[type="submit"]',
      '.draw-button',
      '.start-reading'
    ];
    
    let drawButton = null;
    for (const selector of drawButtons) {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        drawButton = element;
        const text = await element.textContent();
        console.log(`✅ 뽑기 버튼 발견: "${text.trim()}"`);
        break;
      }
    }
    
    if (drawButton) {
      await drawButton.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '06-draw-button-clicked');
      console.log('✅ 카드 뽑기 시작');
      
      // 6. 카드 선택 또는 결과 대기
      console.log('\n6️⃣ 카드 선택 또는 결과 대기...');
      
      // 카드가 나타날 때까지 대기
      await page.waitForTimeout(5000);
      
      // 선택 가능한 카드 찾기
      const cardSelectors = [
        '.card',
        '[class*="card"]',
        'img[alt*="card"]',
        'div[role="button"]',
        '.tarot-card',
        '[data-card]'
      ];
      
      let cards = [];
      for (const selector of cardSelectors) {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          cards = elements;
          console.log(`✅ 카드 ${elements.length}개 발견: ${selector}`);
          break;
        }
      }
      
      if (cards.length > 0) {
        // 첫 번째 카드 클릭
        await cards[0].click();
        await page.waitForTimeout(3000);
        await takeScreenshot(page, '07-card-selected');
        console.log('✅ 카드 선택 완료');
        
        // 결과 대기
        console.log('\n⏳ 리딩 결과 생성 대기...');
        await page.waitForTimeout(8000);
        await takeScreenshot(page, '08-reading-result', true);
        
        // 7. 공유 버튼 찾기
        console.log('\n7️⃣ 공유 버튼 찾기...');
        
        const shareSelectors = [
          'button:has-text("공유")',
          'button:has-text("Share")',
          'button[aria-label*="공유"]',
          'button[aria-label*="share"]',
          '.share-button',
          '[class*="share"]',
          'svg[class*="share"]',
          'button:has(svg)'
        ];
        
        let shareButton = null;
        for (const selector of shareSelectors) {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            shareButton = element;
            console.log(`✅ 공유 버튼 발견: ${selector}`);
            break;
          }
        }
        
        if (shareButton) {
          await takeScreenshot(page, '09-share-button-found');
          
          // 공유 버튼 클릭
          await shareButton.click();
          await page.waitForTimeout(2000);
          await takeScreenshot(page, '10-share-clicked');
          console.log('✅ 공유 버튼 클릭');
          
          // 공유 모달이나 링크 확인
          const shareModal = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="share-dialog"]').first();
          if (await shareModal.isVisible()) {
            await takeScreenshot(page, '11-share-modal');
            console.log('✅ 공유 모달 표시');
            
            // 공유 링크 찾기
            const linkInput = await page.locator('input[value*="http"], input[readonly]').first();
            if (await linkInput.isVisible()) {
              const shareUrl = await linkInput.inputValue();
              console.log(`📎 공유 URL: ${shareUrl}`);
              
              // 새 탭에서 공유 링크 테스트
              console.log('\n8️⃣ 공유 링크 테스트...');
              const newPage = await context.newPage();
              await newPage.goto(shareUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
              });
              await newPage.waitForTimeout(3000);
              await takeScreenshot(newPage, '12-shared-reading');
              console.log('✅ 공유된 리딩 페이지 접속 성공');
              await newPage.close();
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
      } else {
        console.log('❌ 카드를 찾을 수 없습니다');
      }
    } else {
      console.log('❌ 카드 뽑기 버튼을 찾을 수 없습니다');
    }
    
    // 9. 커뮤니티 공유 기능 테스트
    console.log('\n9️⃣ 커뮤니티 공유 기능 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app/community', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '13-community-page');
    
    const communityShareButton = await page.locator('button:has-text("공유하기"), button:has-text("리딩 경험 공유")').first();
    if (await communityShareButton.isVisible()) {
      await communityShareButton.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '14-community-share-clicked');
      console.log('✅ 커뮤니티 공유 버튼 클릭');
    }
    
    // 콘솔 로그 저장
    if (consoleLogs.length > 0) {
      const errorLogs = consoleLogs.filter(log => log.type === 'error');
      const warningLogs = consoleLogs.filter(log => log.type === 'warning');
      
      console.log('\n📋 콘솔 로그 요약:');
      console.log(`  - 총 로그: ${consoleLogs.length}개`);
      console.log(`  - 에러: ${errorLogs.length}개`);
      console.log(`  - 경고: ${warningLogs.length}개`);
      
      if (errorLogs.length > 0) {
        console.log('\n❌ 주요 에러:');
        errorLogs.slice(0, 3).forEach(log => console.log(`  ${log.text}`));
      }
      
      await fs.writeFile(
        path.join(screenshotDir, 'console-logs.json'),
        JSON.stringify(consoleLogs, null, 2)
      );
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await takeScreenshot(page, 'final-error-state', true);
  } finally {
    await browser.close();
    console.log('\n✅ 타로 리딩 플로우 테스트 완료!');
    console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  }
}

// 테스트 실행
testTarotReadingFlow().catch(console.error);