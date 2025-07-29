const { chromium } = require('playwright');

async function checkReadingPage() {
  let browser;
  try {
    console.log('Starting browser...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    console.log('Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 페이지 스크린샷 촬영
    await page.screenshot({ path: 'screenshots/reading-page-check.png', fullPage: true });
    
    // 모든 입력 요소 찾기
    console.log('=== All Input Elements ===');
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input elements`);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}"`);
    }
    
    // 모든 textarea 요소 찾기
    console.log('\n=== All Textarea Elements ===');
    const textareas = await page.locator('textarea').all();
    console.log(`Found ${textareas.length} textarea elements`);
    for (let i = 0; i < textareas.length; i++) {
      const placeholder = await textareas[i].getAttribute('placeholder');
      const name = await textareas[i].getAttribute('name');
      console.log(`Textarea ${i}: placeholder="${placeholder}", name="${name}"`);
    }
    
    // 모든 버튼 찾기
    console.log('\n=== All Button Elements ===');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} button elements`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const className = await buttons[i].getAttribute('class');
      console.log(`Button ${i}: text="${text}", class="${className}"`);
    }
    
    // 페이지 HTML 내용 일부 출력
    console.log('\n=== Page Title ===');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    console.log('\n=== Main Content ===');
    const mainContent = await page.locator('main, .main, [role="main"]').first().textContent().catch(() => 'Not found');
    console.log(`Main content preview: ${mainContent.substring(0, 200)}...`);
    
    // 10초간 대기하여 페이지 확인
    console.log('\nWaiting 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkReadingPage().catch(console.error);