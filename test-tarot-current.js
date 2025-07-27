const { chromium } = require('playwright');

async function testCurrentTarotPages() {
  console.log('현재 배포된 타로 페이지 확인 테스트...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 메인 페이지 접속
    console.log('1. 메인 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(2000);
    
    // 2. 타로카드 메뉴 클릭
    console.log('\n2. 타로카드 메뉴 클릭...');
    await page.click('nav a:has-text("타로카드")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    // 스크린샷: 타로카드 페이지
    await page.screenshot({ 
      path: 'screenshots/tarot-cards-page.png',
      fullPage: true 
    });
    console.log('✓ 타로카드 페이지 스크린샷 저장');
    
    // 페이지 제목 확인
    const pageTitle = await page.textContent('h1');
    console.log('페이지 제목:', pageTitle);
    
    // 3. 타로 관련 링크나 섹션 찾기
    console.log('\n3. 타로 관련 링크 검색 중...');
    const tarotLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      })).filter(link => link.text.includes('타로') || link.href.includes('tarot'))
    );
    
    console.log('찾은 타로 관련 링크들:');
    tarotLinks.forEach(link => {
      console.log(`- ${link.text}: ${link.href}`);
    });
    
    // 4. /tarot-guidelines URL 직접 확인
    console.log('\n4. /tarot-guidelines 페이지 직접 접속 시도...');
    const response = await page.goto('https://test-studio-firebase.vercel.app/tarot-guidelines', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('응답 상태:', response.status());
    
    await page.screenshot({ 
      path: 'screenshots/tarot-guidelines-attempt.png',
      fullPage: true 
    });
    
    // 5. /admin/tarot-guidelines 확인
    console.log('\n5. /admin/tarot-guidelines 페이지 확인...');
    await page.goto('https://test-studio-firebase.vercel.app/admin/tarot-guidelines', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.screenshot({ 
      path: 'screenshots/admin-tarot-guidelines.png',
      fullPage: true 
    });
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    
    await page.screenshot({ 
      path: 'screenshots/error-current-state.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testCurrentTarotPages().catch(console.error);