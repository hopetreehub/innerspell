const { chromium } = require('playwright');

async function checkFirebaseConsole() {
  console.log('🔍 Firebase Console에서 승인된 도메인 확인 중...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Firebase Console 접속 중...');
    await page.goto('https://console.firebase.google.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 초기 페이지 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/firebase_console_1.png',
      fullPage: true 
    });
    
    console.log('🔍 프로젝트 선택 화면 확인...');
    
    // 프로젝트명으로 검색 (innerspell 또는 test-studio)
    const projectNames = ['innerspell', 'test-studio-firebase', 'InnerSpell'];
    
    for (const projectName of projectNames) {
      console.log(`🔎 프로젝트 "${projectName}" 검색 중...`);
      
      // 프로젝트 카드 또는 링크 찾기
      const projectLinks = await page.locator(`text*="${projectName}"`).all();
      if (projectLinks.length > 0) {
        console.log(`✅ 프로젝트 "${projectName}" 발견!`);
        await projectLinks[0].click();
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    // 현재 페이지 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/firebase_console_2.png',
      fullPage: true 
    });
    
    console.log('⚙️  Authentication 설정으로 이동 중...');
    
    // Authentication 메뉴 찾기
    const authMenus = [
      'text=Authentication',
      'text=인증',
      '[aria-label="Authentication"]',
      '[data-analytics-id="sidebar-nav-authentication"]'
    ];
    
    let authClicked = false;
    for (const selector of authMenus) {
      try {
        const authMenu = page.locator(selector).first();
        if (await authMenu.isVisible()) {
          console.log(`✅ Authentication 메뉴 발견: ${selector}`);
          await authMenu.click();
          authClicked = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        console.log(`❌ Authentication 메뉴 찾기 실패: ${selector}`);
      }
    }
    
    if (!authClicked) {
      console.log('⚠️  Authentication 메뉴를 찾을 수 없습니다. 현재 페이지 확인...');
    }
    
    // Authentication 페이지 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/firebase_console_3.png',
      fullPage: true 
    });
    
    console.log('🔧 Sign-in method 탭으로 이동 중...');
    
    // Sign-in method 탭 찾기
    const signinTabs = [
      'text=Sign-in method',
      'text=로그인 방법',
      '[role="tab"]:has-text("Sign-in method")',
      '[role="tab"]:has-text("로그인 방법")'
    ];
    
    for (const selector of signinTabs) {
      try {
        const signinTab = page.locator(selector).first();
        if (await signinTab.isVisible()) {
          console.log(`✅ Sign-in method 탭 발견: ${selector}`);
          await signinTab.click();
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        console.log(`❌ Sign-in method 탭 찾기 실패: ${selector}`);
      }
    }
    
    // Sign-in method 페이지 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/firebase_console_4.png',
      fullPage: true 
    });
    
    console.log('🌐 승인된 도메인 섹션 확인 중...');
    
    // 승인된 도메인 섹션 찾기
    const domainSections = [
      'text=Authorized domains',
      'text=승인된 도메인',
      '[aria-label*="domain"]',
      '[class*="domain"]'
    ];
    
    let domainsFound = false;
    for (const selector of domainSections) {
      try {
        const domainSection = page.locator(selector).first();
        if (await domainSection.isVisible()) {
          console.log(`✅ 승인된 도메인 섹션 발견: ${selector}`);
          
          // 도메인 목록 추출
          const domainList = await page.locator('text*="vercel.app"').allTextContents();
          console.log('📋 발견된 Vercel 도메인들:', domainList);
          
          domainsFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ 승인된 도메인 섹션 찾기 실패: ${selector}`);
      }
    }
    
    if (!domainsFound) {
      console.log('⚠️  승인된 도메인 섹션을 찾을 수 없습니다.');
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/firebase_console_final.png',
      fullPage: true 
    });
    
    console.log('📝 현재 페이지의 모든 텍스트 내용 수집 중...');
    const pageText = await page.textContent('body');
    
    // test-studio-firebase.vercel.app 도메인 검색
    if (pageText.includes('test-studio-firebase.vercel.app')) {
      console.log('✅ test-studio-firebase.vercel.app 도메인이 승인된 도메인 목록에 있습니다.');
    } else {
      console.log('❌ test-studio-firebase.vercel.app 도메인이 승인된 도메인 목록에 없습니다.');
    }
    
    // vercel.app 관련 모든 도메인 찾기
    const vercelDomains = pageText.match(/[a-zA-Z0-9-]+\.vercel\.app/g) || [];
    if (vercelDomains.length > 0) {
      console.log('🔍 발견된 Vercel 도메인들:', [...new Set(vercelDomains)]);
    }
    
  } catch (error) {
    console.error('❌ Firebase Console 확인 중 오류 발생:', error.message);
    
    // 오류 발생 시 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/firebase_console_error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 브라우저 종료됨');
  }
}

checkFirebaseConsole().catch(console.error);