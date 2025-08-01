const { chromium } = require('playwright');

async function quickRotationCheck() {
  console.log('🔍 빠른 뒷면 카드 회전 체크');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    console.log('📍 로컬 4000번 포트 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 페이지 로딩 완료까지 기다림
    await page.waitForTimeout(8000);
    
    console.log('📸 현재 페이지 스크린샷...');
    await page.screenshot({ path: 'rotation-check.png', fullPage: true });
    
    // 모든 이미지의 클래스 확인
    const allImages = await page.locator('img').all();
    console.log(`\n🖼️ 총 ${allImages.length}개 이미지 분석중...`);
    
    let backImagesWithRotation = 0;
    let backImagesNormal = 0;
    
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const src = await img.getAttribute('src');
      const className = await img.getAttribute('class');
      
      if (src && src.includes('back')) {
        const hasRotation = className && className.includes('rotate-180');
        if (hasRotation) {
          backImagesWithRotation++;
          console.log(`🔴 회전된 뒷면 카드: ${src} - class: ${className}`);
        } else {
          backImagesNormal++;
          console.log(`🟢 정상 뒷면 카드: ${src} - class: ${className}`);
        }
      }
    }
    
    console.log('\n📊 결과:');
    console.log(`- 정상 뒷면 카드: ${backImagesNormal}개`);
    console.log(`- 회전된 뒷면 카드: ${backImagesWithRotation}개`);
    
    if (backImagesWithRotation === 0 && backImagesNormal > 0) {
      console.log('✅ 성공: 모든 뒷면 카드가 정상입니다!');
    } else if (backImagesWithRotation > 0) {
      console.log('❌ 실패: 일부 뒷면 카드가 회전되었습니다.');
    } else {
      console.log('❓ 뒷면 카드를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

quickRotationCheck().catch(console.error);