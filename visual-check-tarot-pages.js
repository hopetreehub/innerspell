const { chromium } = require('playwright');

async function checkTarotPages() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 뷰포트 설정 - 데스크톱 크기로
  await page.setViewportSize({ width: 1280, height: 800 });
  
  const cardsToCheck = [
    { url: 'http://localhost:4000/tarot/major-00-fool', filename: 'visual-check-fool.png' },
    { url: 'http://localhost:4000/tarot/major-01-magician', filename: 'visual-check-magician.png' },
    { url: 'http://localhost:4000/tarot/wands-ace', filename: 'visual-check-wands-ace.png' },
    { url: 'http://localhost:4000/tarot/cups-ace', filename: 'visual-check-cups-ace.png' }
  ];
  
  for (const card of cardsToCheck) {
    console.log(`\n📸 ${card.url} 페이지 확인 중...`);
    
    try {
      await page.goto(card.url, { waitUntil: 'networkidle' });
      
      // 페이지 로드 완료 대기
      await page.waitForTimeout(2000);
      
      // 전체 페이지 스크린샷 (스크롤 포함)
      await page.screenshot({ 
        path: card.filename, 
        fullPage: true 
      });
      
      console.log(`✅ ${card.filename} 저장 완료`);
      
      // 페이지 내용 간단히 확인
      const title = await page.title();
      console.log(`   제목: ${title}`);
      
      // 주요 요소들이 있는지 확인
      const hasImage = await page.locator('img').first().isVisible().catch(() => false);
      const hasContent = await page.locator('.container, main, [role="main"]').first().isVisible().catch(() => false);
      
      console.log(`   이미지 표시: ${hasImage ? '✅' : '❌'}`);
      console.log(`   콘텐츠 표시: ${hasContent ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error(`❌ ${card.url} 페이지 로드 실패:`, error.message);
    }
    
    // 다음 페이지로 넘어가기 전 잠시 대기
    await page.waitForTimeout(1000);
  }
  
  console.log('\n🎯 모든 페이지 확인 완료!');
  console.log('브라우저는 열어둡니다. 직접 확인하시려면 브라우저를 사용하세요.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
  
  // 브라우저 열어두기 (수동으로 확인 가능)
  await page.waitForTimeout(300000); // 5분 대기
}

checkTarotPages().catch(console.error);