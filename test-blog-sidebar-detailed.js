const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 브라우저 시작 및 블로그 페이지 접속...');
    
    // 블로그 페이지 접속
    await page.goto('http://localhost:4000/blog');
    console.log('✅ 블로그 페이지 로딩 완료');

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 사이드바 전체 구조 확인
    const sidebar = await page.locator('div').filter({ hasText: '인기 포스트' }).first();
    const popularSection = await page.locator('div').filter({ hasText: '인기 포스트' }).first();
    const keySection = await page.locator('div').filter({ hasText: '주요 포스트' }).first();
    
    console.log('📊 사이드바 요소 카운트:');
    console.log(`- 인기 포스트 섹션: ${await popularSection.count()}개`);
    console.log(`- 주요 포스트 섹션: ${await keySection.count()}개`);

    // 초기 상태 스크린샷
    await page.screenshot({ path: 'test-screenshots/blog-sidebar-detailed-initial.png', fullPage: true });

    // 각 카드의 위치와 스타일 확인
    if (await popularSection.count() > 0) {
      const popularCard = popularSection.locator('..'); // 부모 요소
      const popularBox = await popularCard.boundingBox();
      
      const popularStyles = await popularCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          zIndex: styles.zIndex,
          top: styles.top,
          backgroundColor: styles.backgroundColor,
          className: el.className
        };
      });
      
      console.log('🎨 인기 포스트 카드:');
      console.log(`  - 위치: ${popularBox ? `x=${popularBox.x}, y=${popularBox.y}` : '위치 정보 없음'}`);
      console.log(`  - 스타일:`, popularStyles);
    }

    if (await keySection.count() > 0) {
      const keyCard = keySection.locator('..'); // 부모 요소
      const keyBox = await keyCard.boundingBox();
      
      const keyStyles = await keyCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          zIndex: styles.zIndex,
          top: styles.top,
          backgroundColor: styles.backgroundColor,
          className: el.className
        };
      });
      
      console.log('🎨 주요 포스트 카드:');
      console.log(`  - 위치: ${keyBox ? `x=${keyBox.x}, y=${keyBox.y}` : '위치 정보 없음'}`);
      console.log(`  - 스타일:`, keyStyles);
    }

    // 스크롤 테스트 - 단계별로 확인
    console.log('🔄 단계별 스크롤 테스트 시작...');
    
    const scrollSteps = [300, 600, 900, 1200, 1500];
    
    for (let i = 0; i < scrollSteps.length; i++) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), scrollSteps[i]);
      await page.waitForTimeout(1500);
      
      // 각 스크롤 위치에서 카드들의 상태 확인
      if (await popularSection.count() > 0 && await keySection.count() > 0) {
        const popularCard = popularSection.locator('..');
        const keyCard = keySection.locator('..');
        
        const popularVisible = await popularCard.isVisible();
        const keyVisible = await keyCard.isVisible();
        
        const popularBox = await popularCard.boundingBox();
        const keyBox = await keyCard.boundingBox();
        
        console.log(`📍 스크롤 ${scrollSteps[i]}px에서:`);
        console.log(`  - 인기 포스트 보임: ${popularVisible}, 위치: ${popularBox ? `y=${popularBox.y}` : '없음'}`);
        console.log(`  - 주요 포스트 보임: ${keyVisible}, 위치: ${keyBox ? `y=${keyBox.y}` : '없음'}`);
        
        // 겹침 상태 확인
        if (popularBox && keyBox) {
          const overlap = Math.max(0, Math.min(popularBox.y + popularBox.height, keyBox.y + keyBox.height) - Math.max(popularBox.y, keyBox.y));
          console.log(`  - 카드 겹침 정도: ${overlap}px`);
        }
      }
      
      // 스크린샷 저장
      await page.screenshot({ 
        path: `test-screenshots/blog-sidebar-detailed-scroll-${scrollSteps[i]}.png`, 
        fullPage: true 
      });
    }

    // 최종 분석
    console.log('\n📋 테스트 결과 요약:');
    
    // 맨 위로 스크롤하여 초기 상태 확인
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    if (await popularSection.count() > 0 && await keySection.count() > 0) {
      const popularCard = popularSection.locator('..');
      const keyCard = keySection.locator('..');
      
      const popularBox = await popularCard.boundingBox();
      const keyBox = await keyCard.boundingBox();
      
      if (popularBox && keyBox) {
        console.log('✅ 두 카드 모두 발견됨');
        console.log(`   인기 포스트: y=${popularBox.y}`);
        console.log(`   주요 포스트: y=${keyBox.y}`);
        
        if (popularBox.y < keyBox.y) {
          console.log('✅ 카드 순서 올바름: 인기 포스트가 위, 주요 포스트가 아래');
        } else {
          console.log('❌ 카드 순서 문제: 순서가 잘못됨');
        }
      }
    }

    console.log('\n🎯 sticky 동작 테스트 완료');
    console.log('📂 상세 스크린샷들이 test-screenshots/ 폴더에 저장되었습니다');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }

  // 브라우저는 수동으로 닫을 수 있도록 유지
  console.log('\n🔍 브라우저가 열린 상태로 유지됩니다. 수동으로 레이아웃을 확인해보세요.');
  console.log('   - 스크롤 시 인기 포스트 카드가 sticky로 고정되는지 확인');
  console.log('   - 주요 포스트 카드가 인기 포스트 카드 아래로 자연스럽게 지나가는지 확인'); 
  console.log('   - z-index 수정으로 겹침 문제가 해결되었는지 확인');
  console.log('   - 터미널에서 Ctrl+C로 종료하세요.');
})();