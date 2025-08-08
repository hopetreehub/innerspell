const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,  // 화면을 보면서 확인
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('=== 네비게이션 및 페이지 탐색 확인 ===');
  
  try {
    // 메인 페이지 접속
    await page.goto('http://localhost:4000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('\n1. 메인 페이지 로드 완료');
    await page.screenshot({ path: 'main-page.png', fullPage: true });
    
    // 네비게이션 메뉴 확인
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a'));
      return links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        className: link.className
      }));
    });
    
    console.log('\n2. 네비게이션 링크들:');
    navLinks.forEach(link => {
      console.log(`   - ${link.text}: ${link.href}`);
    });
    
    // 주요 페이지들 방문
    const pagesToCheck = [
      { path: '/tarot-reading', name: '타로리딩' },
      { path: '/tarot-cards', name: '타로카드' },
      { path: '/dream', name: '꿈해몽' },
      { path: '/blog', name: '블로그' },
      { path: '/community', name: '커뮤니티' }
    ];
    
    for (const pageInfo of pagesToCheck) {
      try {
        console.log(`\n3. ${pageInfo.name} 페이지 확인 중...`);
        await page.goto(`http://localhost:4000${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });
        
        const title = await page.title();
        const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'H1 없음');
        
        console.log(`   - 타이틀: ${title}`);
        console.log(`   - H1: ${h1Text}`);
        
        await page.screenshot({ 
          path: `${pageInfo.name.replace(/\//g, '-')}-page.png`, 
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`   - 오류: ${error.message}`);
      }
    }
    
    // 관리자 페이지 확인
    console.log('\n4. 관리자 페이지 확인 중...');
    try {
      await page.goto('http://localhost:4000/admin', {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      
      const adminTitle = await page.title();
      console.log(`   - 관리자 페이지 타이틀: ${adminTitle}`);
      
      await page.screenshot({ path: 'admin-page.png', fullPage: true });
      
    } catch (error) {
      console.log(`   - 관리자 페이지 오류: ${error.message}`);
    }
    
  } catch (error) {
    console.error('\n전체 오류:', error.message);
  }
  
  console.log('\n=== 확인 완료 ===');
  console.log('브라우저를 10초 후에 닫습니다...');
  
  // 10초 대기 후 종료
  await page.waitForTimeout(10000);
  await browser.close();
})();