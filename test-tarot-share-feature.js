const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotDir = path.join(__dirname, 'tarot-share-test-screenshots');

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

async function testTarotShareFeature() {
  console.log('🔍 타로 리딩 공유 기능 테스트 시작...\n');
  
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
    // 1. Vercel 배포 사이트 접속
    console.log('1️⃣ Vercel 배포 사이트 접속...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await takeScreenshot(page, '01-homepage');
    
    // 2. 타로 리딩 페이지로 이동
    console.log('\n2️⃣ 타로 리딩 페이지로 이동...');
    
    // 먼저 타로 리딩 링크 찾기
    const tarotLink = await page.locator('a[href="/tarot/reading"], button:has-text("타로 리딩"), button:has-text("Tarot Reading")').first();
    
    if (await tarotLink.isVisible()) {
      await tarotLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // 직접 URL로 이동
      await page.goto('https://test-studio-firebase.vercel.app/tarot/reading', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
    }
    
    await takeScreenshot(page, '02-tarot-reading-page');
    
    // 3. 타로 리딩 진행
    console.log('\n3️⃣ 타로 리딩 진행...');
    
    // 질문 입력
    const questionInput = await page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"], input[type="text"], textarea').first();
    if (await questionInput.isVisible()) {
      await questionInput.fill('오늘의 운세는 어떤가요?');
      await takeScreenshot(page, '03-question-entered');
      console.log('✅ 질문 입력 완료');
    }
    
    // 카드 선택 버튼 클릭
    const drawButton = await page.locator('button:has-text("카드 뽑기"), button:has-text("Draw Card"), button:has-text("시작")').first();
    if (await drawButton.isVisible()) {
      await drawButton.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '04-card-selection');
      console.log('✅ 카드 선택 시작');
    }
    
    // 카드 선택 (첫 번째 카드 클릭)
    const card = await page.locator('.card, [class*="card"], img[alt*="card"], div[role="button"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(3000); // 애니메이션 대기
      await takeScreenshot(page, '05-card-selected');
      console.log('✅ 카드 선택 완료');
    }
    
    // 해석 생성 대기
    console.log('\n⏳ 해석 생성 대기 중...');
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '06-interpretation-generated', true);
    
    // 4. 공유 버튼 찾기 및 클릭
    console.log('\n4️⃣ 공유 버튼 찾기...');
    
    // 다양한 공유 버튼 셀렉터 시도
    const shareSelectors = [
      'button:has-text("공유")',
      'button:has-text("Share")',
      'button[aria-label*="공유"]',
      'button[aria-label*="share"]',
      '[class*="share"]',
      'svg[class*="share"]',
      'button:has(svg[class*="share"])'
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
      await takeScreenshot(page, '07-share-button-found');
      
      // 공유 버튼 클릭
      console.log('\n5️⃣ 공유 버튼 클릭...');
      await shareButton.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '08-share-clicked');
      
      // 공유 링크 또는 모달 확인
      const shareModal = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="share"]').first();
      if (await shareModal.isVisible()) {
        await takeScreenshot(page, '09-share-modal');
        console.log('✅ 공유 모달 표시됨');
        
        // 공유 링크 찾기
        const shareLink = await page.locator('input[value*="http"], input[readonly], [class*="link"]').first();
        if (await shareLink.isVisible()) {
          const linkValue = await shareLink.inputValue();
          console.log(`📎 공유 링크: ${linkValue}`);
          
          // 6. 새 탭에서 공유 링크 접속
          console.log('\n6️⃣ 공유 링크로 접속 테스트...');
          const newPage = await context.newPage();
          await newPage.goto(linkValue, {
            waitUntil: 'networkidle',
            timeout: 30000
          });
          await newPage.waitForTimeout(3000);
          await takeScreenshot(newPage, '10-shared-reading-page', true);
          console.log('✅ 공유된 리딩 페이지 접속 성공');
          await newPage.close();
        }
      }
    } else {
      console.log('❌ 공유 버튼을 찾을 수 없습니다.');
      await takeScreenshot(page, '07-no-share-button', true);
    }
    
    // 7. 커뮤니티 페이지 확인
    console.log('\n7️⃣ 커뮤니티 페이지 확인...');
    await page.goto('https://test-studio-firebase.vercel.app/community/reading-share', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '11-community-page', true);
    
    // 공유 기능 확인
    const communityShareButton = await page.locator('button:has-text("리딩 공유"), button:has-text("Share Reading")').first();
    if (await communityShareButton.isVisible()) {
      console.log('✅ 커뮤니티 공유 버튼 발견');
      await takeScreenshot(page, '12-community-share-button');
    } else {
      console.log('❌ 커뮤니티 공유 버튼을 찾을 수 없습니다.');
    }
    
    // 콘솔 로그 저장
    if (consoleLogs.length > 0) {
      console.log('\n📋 콘솔 로그:');
      const errorLogs = consoleLogs.filter(log => log.type === 'error');
      const warningLogs = consoleLogs.filter(log => log.type === 'warning');
      
      if (errorLogs.length > 0) {
        console.log('\n❌ 에러 로그:');
        errorLogs.forEach(log => console.log(`  ${log.time}: ${log.text}`));
      }
      
      if (warningLogs.length > 0) {
        console.log('\n⚠️ 경고 로그:');
        warningLogs.forEach(log => console.log(`  ${log.time}: ${log.text}`));
      }
      
      // 로그 파일로 저장
      await fs.writeFile(
        path.join(screenshotDir, 'console-logs.json'),
        JSON.stringify(consoleLogs, null, 2)
      );
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await takeScreenshot(page, 'error-state', true);
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료!');
    console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  }
}

// 테스트 실행
testTarotShareFeature().catch(console.error);