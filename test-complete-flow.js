const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'complete-flow-screenshots');

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

async function testCompleteFlow() {
  console.log('🎯 타로 리딩 완전 플로우 및 공유 기능 테스트...\n');
  
  await ensureDir(screenshotDir);
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 홈페이지 접속 및 타로 리딩 시작
    console.log('1️⃣ 홈페이지 접속...');
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
    const questionInput = await page.locator('textarea').first();
    if (await questionInput.isVisible()) {
      await questionInput.fill('오늘의 운세와 앞으로의 방향성에 대해 알려주세요');
      await takeScreenshot(page, '03-question-entered');
      console.log('✅ 질문 입력 완료');
    }
    
    // 3. 카드 섞기 버튼 클릭
    console.log('\n3️⃣ 카드 섞기...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 카드 섞기 완료');
    }
    
    // 4. 카드 펼치기 버튼 클릭
    console.log('\n4️⃣ 카드 펼치기...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '04-cards-spread');
      console.log('✅ 카드 펼치기 완료');
    }
    
    // 5. 카드 선택
    console.log('\n5️⃣ 카드 선택...');
    
    // 선택 가능한 카드들을 찾아서 클릭
    const cards = await page.locator('.card, [class*="card"], img[alt*="card"], div[role="button"]').all();
    console.log(`🃏 ${cards.length}개의 카드 발견`);
    
    if (cards.length > 0) {
      for (let i = 0; i < Math.min(cards.length, 3); i++) {
        try {
          await cards[i].click();
          await page.waitForTimeout(1000);
          console.log(`✅ 카드 ${i + 1} 선택 완료`);
        } catch (error) {
          console.log(`⚠️ 카드 ${i + 1} 선택 실패: ${error.message}`);
        }
      }
      await takeScreenshot(page, '05-cards-selected');
    }
    
    // 6. 카드 뽑기/해석 시작 버튼 클릭
    console.log('\n6️⃣ 해석 시작...');
    const interpretButton = await page.locator('button:has-text("카드 뽑기"), button:has-text("해석 시작"), button:has-text("리딩 시작")').first();
    if (await interpretButton.isVisible()) {
      await interpretButton.click();
      console.log('✅ 해석 시작 버튼 클릭');
      
      // 해석 결과 대기 (최대 60초)
      console.log('\n⏳ AI 해석 결과 대기...');
      
      let interpretationComplete = false;
      for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(2000);
        
        // 해석 텍스트 확인
        const pageContent = await page.textContent('body');
        
        // 해석이 완료되었는지 확인하는 다양한 조건
        const hasInterpretation = 
          pageContent.includes('해석') ||
          pageContent.includes('의미') ||
          pageContent.includes('카드가 말하는') ||
          pageContent.includes('조언') ||
          pageContent.includes('메시지');
        
        const hasLongText = pageContent.length > 2000; // 충분한 내용이 있는지
        
        if (hasInterpretation && hasLongText) {
          interpretationComplete = true;
          console.log('✅ AI 해석 완료');
          break;
        }
        
        console.log(`⏳ 해석 대기 중... (${i + 1}/30)`);
      }
      
      await takeScreenshot(page, '06-interpretation-complete', true);
      
      if (interpretationComplete) {
        // 7. 공유 버튼 찾기
        console.log('\n7️⃣ 공유 버튼 찾기...');
        
        // 페이지를 다시 스크롤해서 모든 요소 확인
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);
        
        // 공유 관련 모든 요소 찾기
        const shareElements = await page.locator('*').evaluateAll(elements => {
          return elements.filter(el => {
            const text = el.textContent || '';
            const className = el.className || '';
            const ariaLabel = el.getAttribute('aria-label') || '';
            
            return (
              text.includes('공유') ||
              text.toLowerCase().includes('share') ||
              className.includes('share') ||
              ariaLabel.includes('공유') ||
              ariaLabel.toLowerCase().includes('share')
            );
          }).map(el => ({
            tagName: el.tagName,
            text: el.textContent?.trim() || '',
            className: el.className || '',
            ariaLabel: el.getAttribute('aria-label') || ''
          }));
        });
        
        console.log(`🔍 공유 관련 요소 ${shareElements.length}개 발견:`);
        shareElements.forEach((el, i) => {
          console.log(`  ${i + 1}. ${el.tagName}: "${el.text}" (class: ${el.className})`);
        });
        
        // 공유 버튼 클릭 시도
        const shareSelectors = [
          'button:has-text("공유")',
          'a:has-text("공유")',
          '[class*="share"]',
          'button[aria-label*="공유"]',
          '*:has-text("Share")',
          'svg[class*="share"]'
        ];
        
        let shareClicked = false;
        for (const selector of shareSelectors) {
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible()) {
              console.log(`✅ 공유 요소 발견: ${selector}`);
              await element.click();
              await page.waitForTimeout(2000);
              shareClicked = true;
              break;
            }
          } catch (error) {
            // 계속 시도
          }
        }
        
        if (shareClicked) {
          await takeScreenshot(page, '07-share-clicked');
          console.log('✅ 공유 기능 실행');
          
          // 공유 모달이나 결과 확인
          await page.waitForTimeout(3000);
          await takeScreenshot(page, '08-share-result', true);
        } else {
          console.log('❌ 공유 버튼을 찾을 수 없습니다');
          
          // 해석 완료 후 나타나는 모든 새로운 버튼들 확인
          const allButtons = await page.locator('button').all();
          console.log(`\n🔍 현재 페이지의 모든 버튼 (${allButtons.length}개):`);
          for (const button of allButtons) {
            const text = await button.textContent();
            const isVisible = await button.isVisible();
            if (text && text.trim() && isVisible) {
              console.log(`  - "${text.trim()}"`);
            }
          }
          
          // 모든 링크도 확인
          const allLinks = await page.locator('a').all();
          console.log(`\n🔗 현재 페이지의 모든 링크 (${allLinks.length}개):`);
          for (const link of allLinks) {
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            const isVisible = await link.isVisible();
            if (text && text.trim() && isVisible && href) {
              console.log(`  - "${text.trim()}" → ${href}`);
            }
          }
        }
      } else {
        console.log('❌ AI 해석이 완료되지 않았습니다');
      }
    } else {
      console.log('❌ 해석 시작 버튼을 찾을 수 없습니다');
    }
    
    // 8. 커뮤니티 공유 페이지 확인
    console.log('\n8️⃣ 커뮤니티 공유 페이지 확인...');
    
    try {
      await page.goto('https://test-studio-firebase.vercel.app/community/reading-share', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '09-community-share-page', true);
      console.log('✅ 커뮤니티 공유 페이지 접속');
      
      const communityContent = await page.textContent('body');
      if (communityContent.includes('공유') || communityContent.includes('리딩')) {
        console.log('✅ 커뮤니티 공유 기능 확인됨');
      }
    } catch (error) {
      console.log(`❌ 커뮤니티 공유 페이지 접속 실패: ${error.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await takeScreenshot(page, 'final-error', true);
  } finally {
    await browser.close();
    console.log('\n🎯 타로 리딩 완전 플로우 테스트 완료!');
    console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  }
}

// 테스트 실행
testCompleteFlow().catch(console.error);