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
  console.log('🔍 타로 리딩 공유 기능 테스트 시작 (단계별 접근)...\n');
  
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
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '01-homepage');
    
    // 페이지 내용 확인
    const pageTitle = await page.title();
    console.log(`📄 페이지 제목: ${pageTitle}`);
    
    // 2. 네비게이션 메뉴 확인
    console.log('\n2️⃣ 네비게이션 메뉴 확인...');
    
    const navElements = await page.locator('nav, header, [role="navigation"]').all();
    console.log(`🔍 네비게이션 요소 ${navElements.length}개 발견`);
    
    // 타로 관련 링크 찾기
    const tarotSelectors = [
      'a[href*="/tarot"]',
      'a:has-text("타로")',
      'a:has-text("Tarot")',
      'button:has-text("타로")',
      'button:has-text("Tarot")'
    ];
    
    let tarotLink = null;
    for (const selector of tarotSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        tarotLink = element;
        const text = await element.textContent();
        console.log(`✅ 타로 링크 발견: "${text}" (${selector})`);
        break;
      }
    }
    
    if (tarotLink) {
      await takeScreenshot(page, '02-tarot-link-found');
      
      // 3. 타로 페이지로 이동
      console.log('\n3️⃣ 타로 페이지로 이동...');
      await tarotLink.click();
      await page.waitForTimeout(5000);
      await takeScreenshot(page, '03-tarot-page');
      
      const currentUrl = page.url();
      console.log(`📍 현재 URL: ${currentUrl}`);
      
    } else {
      console.log('❌ 타로 링크를 찾을 수 없습니다. 사용 가능한 링크들을 확인합니다...');
      
      // 모든 링크 확인
      const allLinks = await page.locator('a').all();
      console.log('\n🔗 페이지의 모든 링크:');
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const link = allLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        if (href && text) {
          console.log(`  - "${text.trim()}" → ${href}`);
        }
      }
      
      await takeScreenshot(page, '02-no-tarot-link', true);
    }
    
    // 4. 페이지 소스 분석
    console.log('\n4️⃣ 페이지 구조 분석...');
    
    // 버튼들 확인
    const buttons = await page.locator('button').all();
    console.log(`🔘 버튼 ${buttons.length}개 발견:`);
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      if (text && text.trim()) {
        console.log(`  - "${text.trim()}" (${className || 'no class'})`);
      }
    }
    
    // 입력 필드들 확인
    const inputs = await page.locator('input, textarea').all();
    console.log(`📝 입력 필드 ${inputs.length}개 발견:`);
    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
      const input = inputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      console.log(`  - ${type || 'text'}: "${placeholder || 'no placeholder'}"`);
    }
    
    // 5. 특정 경로로 직접 접근 시도
    console.log('\n5️⃣ 타로 리딩 경로로 직접 접근...');
    
    const tarotPaths = [
      '/tarot',
      '/tarot/reading',
      '/reading',
      '/cards'
    ];
    
    for (const path of tarotPaths) {
      try {
        console.log(`🔍 ${path} 경로 시도...`);
        await page.goto(`https://test-studio-firebase.vercel.app${path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        if (!currentUrl.includes('404') && !pageTitle.includes('404')) {
          console.log(`✅ ${path} 페이지 접근 성공!`);
          await takeScreenshot(page, `04-direct-access-${path.replace('/', '')}`);
          
          // 페이지 내용 확인
          const pageContent = await page.locator('body').textContent();
          if (pageContent.includes('타로') || pageContent.includes('카드') || pageContent.includes('리딩')) {
            console.log('🎯 타로 관련 컨텐츠 발견!');
            
            // 공유 기능 찾기
            const shareElements = await page.locator('button:has-text("공유"), button:has-text("Share"), [class*="share"]').all();
            if (shareElements.length > 0) {
              console.log(`📤 공유 요소 ${shareElements.length}개 발견!`);
              await takeScreenshot(page, '05-share-elements-found');
            }
            
            break;
          }
        }
        
      } catch (error) {
        console.log(`❌ ${path} 접근 실패: ${error.message}`);
      }
    }
    
    // 6. 커뮤니티 페이지 확인
    console.log('\n6️⃣ 커뮤니티 페이지 확인...');
    try {
      await page.goto('https://test-studio-firebase.vercel.app/community', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '06-community-page');
      
      const communityContent = await page.locator('body').textContent();
      if (communityContent.includes('공유') || communityContent.includes('리딩')) {
        console.log('✅ 커뮤니티 페이지에서 공유 관련 컨텐츠 발견');
      }
      
    } catch (error) {
      console.log(`❌ 커뮤니티 페이지 접근 실패: ${error.message}`);
    }
    
    // 콘솔 로그 저장
    if (consoleLogs.length > 0) {
      console.log('\n📋 콘솔 로그 분석:');
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