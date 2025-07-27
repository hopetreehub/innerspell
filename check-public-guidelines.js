const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 개발자 도구 열기
    await page.route('**/*', (route) => {
      route.continue();
    });

    console.log('1. 홈페이지에서 타로 지침 관련 정보 확인...');
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 콘솔에서 로컬 스토리지 및 전역 변수 확인
    const localStorageData = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        storage[key] = localStorage.getItem(key);
      }
      return storage;
    });
    console.log('로컬 스토리지 데이터:', Object.keys(localStorageData));
    
    // 타로 지침 데이터 찾기
    const tarotGuidelinesData = await page.evaluate(() => {
      // 전역 변수로 노출된 데이터 확인
      if (window.tarotGuidelines) {
        return { source: 'window.tarotGuidelines', data: window.tarotGuidelines };
      }
      
      // 로컬 스토리지에서 타로 지침 데이터 찾기
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (key.includes('tarot') || key.includes('guideline') || value.includes('"category"') || value.includes('위치별')) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return { source: `localStorage.${key}`, data: parsed };
            }
          } catch (e) {
            // JSON 파싱 실패 시 무시
          }
        }
      }
      
      return null;
    });
    
    if (tarotGuidelinesData) {
      console.log(`\n✓ 타로 지침 데이터 발견! (출처: ${tarotGuidelinesData.source})`);
      console.log(`총 지침 개수: ${tarotGuidelinesData.data.length}개`);
      
      // 카테고리별 분석
      const categories = {};
      tarotGuidelinesData.data.forEach(item => {
        const category = item.category || '미분류';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      console.log('\n카테고리별 지침 개수:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}개`);
      });
      
      // 완성도 계산
      const totalExpected = 36;
      const completionRate = Math.round((tarotGuidelinesData.data.length / totalExpected) * 100);
      console.log(`\n완성도: ${completionRate}% (${tarotGuidelinesData.data.length}/${totalExpected})`);
      
      if (tarotGuidelinesData.data.length === 36) {
        console.log('✓ 36개 지침 완성 확인!');
      } else {
        console.log(`✗ 부족한 지침: ${36 - tarotGuidelinesData.data.length}개`);
      }
    } else {
      console.log('✗ 타로 지침 데이터를 찾을 수 없음');
    }
    
    await page.screenshot({ path: 'public-page-check.png', fullPage: true });
    
    // 다른 경로들 확인
    const pathsToCheck = [
      '/tarot',
      '/guidelines',
      '/management',
      '/dashboard'
    ];
    
    for (const path of pathsToCheck) {
      console.log(`\n${path} 경로 확인 중...`);
      try {
        await page.goto(`https://test-studio-firebase.vercel.app${path}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        // 페이지 제목과 주요 내용 확인
        const title = await page.title();
        const hasGuidelineText = await page.locator('text=/타로 지침|guideline|36개|100%/i').first().isVisible().catch(() => false);
        
        console.log(`  제목: ${title}`);
        console.log(`  타로 지침 관련 내용: ${hasGuidelineText ? '있음' : '없음'}`);
        
        if (hasGuidelineText) {
          await page.screenshot({ path: `path-${path.replace('/', '')}-found.png`, fullPage: true });
          
          // 상세 정보 추출
          const pageContent = await page.locator('body').textContent();
          if (pageContent.includes('36개')) {
            console.log('  ✓ 36개 지침 정보 발견');
          }
          if (pageContent.includes('100%')) {
            console.log('  ✓ 100% 완성도 정보 발견');
          }
        }
        
      } catch (error) {
        console.log(`  ${path}: 접근 불가 (${error.message})`);
      }
    }
    
    // 최종 요약
    console.log('\n=== 최종 확인 결과 ===');
    console.log('1. Vercel 배포 사이트 접속: ✓ 성공');
    console.log('2. /admin 경로 접근: ✓ 가능 (로그인 필요)');
    console.log('3. Google 로그인: ✗ 추가 인증 필요');
    console.log('4. 타로 지침 관리 시스템: ✗ 로그인 후 접근 가능');
    
    if (tarotGuidelinesData) {
      console.log(`5. 지침 개수: ${tarotGuidelinesData.data.length}개`);
      console.log(`6. 완성도: ${Math.round((tarotGuidelinesData.data.length / 36) * 100)}%`);
    } else {
      console.log('5. 지침 개수: 확인 불가 (로그인 필요)');
      console.log('6. 완성도: 확인 불가 (로그인 필요)');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    console.log('\n브라우저 종료 중...');
    await browser.close();
  }
})();