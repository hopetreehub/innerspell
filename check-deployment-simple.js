const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('\\n=== Vercel 배포 사이트 확인 시작 ===\\n');
    
    // 1. 메인 페이지 접속
    console.log('1. 메인 페이지 접속 중...');
    const response = await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('   - 상태 코드:', response.status());
    console.log('   - URL:', page.url());
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'vercel-main.png', fullPage: false });
    console.log('   - 스크린샷 저장: vercel-main.png');
    
    // 2. API 헬스체크
    console.log('\\n2. API 헬스체크...');
    const apiResponse = await fetch('https://test-studio-firebase.vercel.app/api/health');
    console.log('   - API 상태:', apiResponse.status);
    const apiData = await apiResponse.json().catch(() => ({}));
    console.log('   - API 응답:', JSON.stringify(apiData, null, 2));
    
    // 3. 주요 페이지 요소 확인
    console.log('\\n3. 페이지 요소 확인...');
    
    // 타이틀
    const title = await page.title();
    console.log('   - 페이지 타이틀:', title);
    
    // 주요 텍스트 확인
    const bodyText = await page.textContent('body');
    const hasInnerSpell = bodyText.includes('InnerSpell') || bodyText.includes('이너스펠');
    const hasTarot = bodyText.includes('타로') || bodyText.includes('Tarot');
    const hasAI = bodyText.includes('AI') || bodyText.includes('인공지능');
    
    console.log('   - InnerSpell 텍스트:', hasInnerSpell ? '있음' : '없음');
    console.log('   - 타로 관련 텍스트:', hasTarot ? '있음' : '없음');
    console.log('   - AI 관련 텍스트:', hasAI ? '있음' : '없음');
    
    // 4. 네비게이션 링크 확인
    console.log('\\n4. 네비게이션 확인...');
    const navLinks = await page.$$eval('nav a, header a', links => 
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      })).filter(link => link.text)
    );
    
    if (navLinks.length > 0) {
      console.log('   - 네비게이션 링크:');
      navLinks.forEach(link => {
        console.log(`     * ${link.text}: ${link.href}`);
      });
    } else {
      console.log('   - 네비게이션 링크를 찾을 수 없음');
    }
    
    // 5. 버튼 확인
    console.log('\\n5. 버튼 요소 확인...');
    const buttons = await page.$$eval('button', btns => 
      btns.map(btn => btn.textContent.trim()).filter(text => text)
    );
    
    if (buttons.length > 0) {
      console.log('   - 버튼들:', buttons.slice(0, 10).join(', '));
    }
    
    console.log('\\n=== 확인 완료 ===\\n');
    
  } catch (error) {
    console.error('\\n에러 발생:', error.message);
    console.error('에러 타입:', error.name);
  } finally {
    await browser.close();
  }
})();