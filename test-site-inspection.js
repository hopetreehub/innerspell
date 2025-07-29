const { chromium } = require('playwright');

async function inspectSite() {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1920, height: 1080 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const baseUrl = 'https://test-studio-tarot.vercel.app';
  
  try {
    console.log('🔍 사이트 구조 분석 시작...\n');
    
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: `screenshots/site-inspection-${Date.now()}.png`,
      fullPage: true 
    });
    
    // 모든 버튼 텍스트 찾기
    const buttons = await page.locator('button').all();
    console.log('\n발견된 버튼들:');
    for (let i = 0; i < buttons.length; i++) {
      try {
        const text = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        console.log(`  ${i + 1}. "${text}" (visible: ${isVisible})`);
      } catch (e) {
        console.log(`  ${i + 1}. [텍스트 읽기 실패]`);
      }
    }
    
    // 모든 링크 찾기
    const links = await page.locator('a').all();
    console.log('\n발견된 링크들:');
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      try {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        console.log(`  ${i + 1}. "${text}" -> ${href}`);
      } catch (e) {
        console.log(`  ${i + 1}. [링크 정보 읽기 실패]`);
      }
    }
    
    // 입력 필드 찾기
    const inputs = await page.locator('input, textarea').all();
    console.log('\n발견된 입력 필드들:');
    for (let i = 0; i < inputs.length; i++) {
      try {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const isVisible = await inputs[i].isVisible();
        console.log(`  ${i + 1}. type: ${type}, placeholder: "${placeholder}" (visible: ${isVisible})`);
      } catch (e) {
        console.log(`  ${i + 1}. [입력 필드 정보 읽기 실패]`);
      }
    }
    
    // 주요 텍스트 내용 찾기
    const headings = await page.locator('h1, h2, h3').all();
    console.log('\n발견된 제목들:');
    for (let i = 0; i < headings.length; i++) {
      try {
        const text = await headings[i].textContent();
        const tagName = await headings[i].evaluate(el => el.tagName);
        console.log(`  ${tagName}: "${text}"`);
      } catch (e) {
        console.log(`  제목 ${i + 1}. [텍스트 읽기 실패]`);
      }
    }
    
    // 페이지의 모든 텍스트 내용 일부 출력
    const bodyText = await page.locator('body').textContent();
    console.log('\n페이지 내용 (처음 500자):');
    console.log(bodyText.substring(0, 500) + '...');
    
    // 다른 주요 페이지들도 확인
    const pagesToCheck = ['/reading', '/dashboard', '/admin'];
    
    for (const path of pagesToCheck) {
      console.log(`\n--- ${path} 페이지 확인 ---`);
      try {
        await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const pageTitle = await page.title();
        const pageText = await page.locator('body').textContent();
        
        console.log(`제목: ${pageTitle}`);
        console.log(`내용 (처음 200자): ${pageText.substring(0, 200)}...`);
        
        await page.screenshot({ 
          path: `screenshots/page-${path.replace('/', '')}-${Date.now()}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`${path} 페이지 접근 실패: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('사이트 분석 중 오류:', error);
  } finally {
    await browser.close();
  }
}

inspectSite();