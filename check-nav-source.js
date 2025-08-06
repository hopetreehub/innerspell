const { chromium } = require('playwright');

async function checkNavSource() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== 네비게이션 소스 분석 ===\n');
  
  // 메인 페이지 접속
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 타로지침 링크 찾기
  const tarotGuidelineLink = await page.locator('a[href="/tarot-guidelines"]').first();
  
  if (await tarotGuidelineLink.isVisible()) {
    console.log('❌ 타로지침 링크 발견!');
    
    // 부모 요소들 확인
    const parentNav = await tarotGuidelineLink.locator('..').first();
    const navHTML = await parentNav.innerHTML();
    console.log('\n부모 nav 요소 HTML (일부):');
    console.log(navHTML.substring(0, 500) + '...');
    
    // 네비게이션 전체 구조 확인
    const header = await page.locator('header').first();
    const headerClasses = await header.getAttribute('class');
    console.log('\n헤더 클래스:', headerClasses);
  }
  
  // 페이지 소스에서 타로지침 텍스트 검색
  const pageContent = await page.content();
  const tarotGuidelineMatches = (pageContent.match(/타로지침/g) || []).length;
  console.log(`\n페이지에서 "타로지침" 텍스트 발견 횟수: ${tarotGuidelineMatches}`);
  
  // 네비게이션 컴포넌트 확인
  const navElement = await page.locator('nav').first();
  const navChildren = await navElement.locator('> a').all();
  console.log(`\n네비게이션 직접 자식 링크 수: ${navChildren.length}`);
  
  await browser.close();
}

checkNavSource().catch(console.error);