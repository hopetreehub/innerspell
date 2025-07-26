const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 최종 Vercel 블로그 검증...');
  console.log('📅 시간:', new Date().toLocaleString('ko-KR'));
  
  try {
    // 캐시 무효화를 위한 타임스탬프
    const timestamp = Date.now();
    const url = `https://test-studio-firebase.vercel.app/blog?v=${timestamp}`;
    
    console.log(`\n📍 접속 URL: ${url}`);
    
    // 페이지 접속
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 컨텐츠 로드 대기
    await page.waitForTimeout(5000);
    
    // 모든 블로그 카드 찾기
    const cards = await page.$$('[class*="card"]');
    console.log(`\n📦 발견된 카드 요소: ${cards.length}개`);
    
    // h3 제목 추출 (메뉴 제목 제외)
    const allH3 = await page.$$eval('h3', elements => 
      elements.map(el => el.textContent?.trim())
    );
    
    const blogTitles = allH3.filter(title => 
      title && !['주요 포스트', '인기 포스트', 'Menu', 'Legal', 'InnerSpell 소식 받기'].includes(title)
    );
    
    console.log(`\n📝 블로그 포스트 (${blogTitles.length}개):`);
    blogTitles.forEach((title, i) => {
      console.log(`${i + 1}. ${title}`);
    });
    
    // 기대하는 모든 포스트 제목
    const expectedPosts = [
      // 기존 7개
      '타로카드 기초 가이드 2025',
      '명상 입문 가이드',
      '꿈해몽 기초 해석법',
      '타로 스프레드 완벽 가이드: 켈틱 크로스부터 쓰리카드까지',
      '영성과 생산성의 조화: 2025년 목표 달성 전략',
      'AI 시대의 타로: 직관과 기술의 완벽한 융합',
      '꿈 일기 작성법: 무의식과의 대화',
      // 새로 추가된 5개
      '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
      'AI 시대의 타로: 전통과 기술의 만남이 만드는 새로운 점술',
      '꿈 해몽과 무의식: 당신의 내면이 전하는 메시지 해독법',
      '타로와 명상: 카드를 통한 마음챙김과 영적 성장법',
      '현대인을 위한 영성: 바쁜 일상 속 영적 균형 찾기'
    ];
    
    console.log('\n✅ 포스트 존재 확인:');
    let foundCount = 0;
    expectedPosts.forEach((expectedTitle, index) => {
      const found = blogTitles.some(title => 
        title === expectedTitle || 
        (title && expectedTitle && title.includes(expectedTitle.split(':')[0].trim()))
      );
      
      const postType = index < 7 ? '기존' : '신규';
      console.log(`[${postType}] ${expectedTitle}: ${found ? '✅' : '❌'}`);
      if (found) foundCount++;
    });
    
    // 스크린샷
    const screenshotName = `final-blog-verification-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    await page.screenshot({ 
      path: screenshotName,
      fullPage: true 
    });
    
    // 최종 결과
    console.log('\n' + '='.repeat(50));
    console.log('📊 최종 검증 결과:');
    console.log(`- 전체 블로그 포스트: ${blogTitles.length}개`);
    console.log(`- 확인된 포스트: ${foundCount}/${expectedPosts.length}개`);
    console.log(`- 스크린샷: ${screenshotName}`);
    
    if (blogTitles.length >= 12 && foundCount >= 12) {
      console.log('\n🎉 완벽한 성공! 모든 12개 포스트가 정상 표시됩니다.');
      console.log('✨ 새로 추가된 5개 SEO 블로그 포스트가 모두 반영되었습니다!');
    } else if (foundCount > 7) {
      console.log('\n⚠️ 부분 성공: 일부 새 포스트가 표시되고 있습니다.');
    } else {
      console.log('\n❌ 아직 새 포스트가 반영되지 않았습니다.');
      console.log('💡 Vercel 배포가 진행 중일 수 있습니다.');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();