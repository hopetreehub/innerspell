const { chromium } = require('playwright');

async function debugPage() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🔍 페이지 구조 분석 중...\n');
    
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForTimeout(3000);
    
    // 모든 input 요소 찾기
    const inputs = await page.locator('input').all();
    console.log(`✓ Input 요소 개수: ${inputs.length}`);
    
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const value = await inputs[i].inputValue();
      console.log(`  ${i+1}. type="${type}", placeholder="${placeholder}", value="${value}"`);
    }
    
    // 모든 버튼 찾기
    console.log('\n✓ 버튼 목록:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length && i < 10; i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i+1}. "${text}"`);
    }
    
    // 실제 워크플로우 테스트
    console.log('\n📝 실제 워크플로우 시작...\n');
    
    // 1. 질문 입력
    if (inputs.length > 0) {
      console.log('1️⃣ 첫 번째 input에 질문 입력...');
      await inputs[0].fill('테스트 질문입니다');
      console.log('✅ 입력 완료\n');
    }
    
    // 2. 카드 섞기
    console.log('2️⃣ 카드 섞기 버튼 클릭...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    console.log('✅ 섞기 완료\n');
    
    // 3. 카드 펼치기
    console.log('3️⃣ 카드 펼치기 버튼 클릭...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    console.log('✅ 펼치기 완료\n');
    
    // 페이지 상태 확인
    const pageText = await page.locator('body').textContent();
    if (pageText.includes('선택됨')) {
      const match = pageText.match(/\((\d+)\/3 선택됨\)/);
      if (match) {
        console.log(`📊 현재 선택된 카드: ${match[1]}/3`);
      }
    }
    
    console.log('\n✅ 분석 완료!');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
}

debugPage().catch(console.error);