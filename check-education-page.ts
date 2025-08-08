import { chromium } from '@playwright/test';

async function checkEducationPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('교육 페이지로 이동 중...');
    await page.goto('http://localhost:4000/community/tarot-education');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 저장
    await page.screenshot({ path: 'education-page.png', fullPage: true });
    console.log('스크린샷 저장됨: education-page.png');
    
    // 폼 요소들 확인
    const elements = {
      name: await page.locator('input[name="name"]').count(),
      email: await page.locator('input[name="email"]').count(),
      phone: await page.locator('input[name="phone"]').count(),
      course: await page.locator('select[name="course"]').count(),
      experience: await page.locator('select[name="experience"]').count(),
      purpose: await page.locator('textarea[name="purpose"]').count(),
      questions: await page.locator('textarea[name="questions"]').count(),
    };
    
    console.log('\n폼 요소 확인:');
    Object.entries(elements).forEach(([key, count]) => {
      console.log(`- ${key}: ${count > 0 ? '있음' : '없음'}`);
    });
    
    // 대체 선택자 확인
    console.log('\n대체 선택자 확인:');
    console.log('- id="name":', await page.locator('#name').count());
    console.log('- id="email":', await page.locator('#email').count());
    console.log('- id="phone":', await page.locator('#phone').count());
    console.log('- id="course":', await page.locator('#course').count());
    console.log('- id="experience":', await page.locator('#experience').count());
    
    // 폼 구조 확인
    const forms = await page.locator('form').count();
    console.log(`\n폼 개수: ${forms}`);
    
    if (forms > 0) {
      const inputs = await page.locator('form input').count();
      const selects = await page.locator('form select').count();
      const textareas = await page.locator('form textarea').count();
      const buttons = await page.locator('form button').count();
      
      console.log(`- input 개수: ${inputs}`);
      console.log(`- select 개수: ${selects}`);
      console.log(`- textarea 개수: ${textareas}`);
      console.log(`- button 개수: ${buttons}`);
    }
    
    // 5초 대기 (페이지 확인용)
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
}

checkEducationPage();