const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 Vercel 배포 사이트 캐시 버스팅 테스트...');
  
  try {
    // 캐시 버스팅을 위한 타임스탬프 추가
    const timestamp = Date.now();
    const url = `https://test-studio-firebase.vercel.app/blog?t=${timestamp}`;
    
    console.log(`📍 URL: ${url}`);
    
    // 페이지로 이동
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 강제 새로고침
    await page.reload({ waitUntil: 'networkidle' });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 모든 h3 제목 가져오기
    const allTitles = await page.$$eval('h3', elements => 
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    
    // 블로그 포스트 제목만 필터링 (메뉴 등 제외)
    const blogTitles = allTitles.filter(title => 
      !['주요 포스트', '인기 포스트', 'Menu', 'Legal', 'InnerSpell 소식 받기'].includes(title)
    );
    
    console.log(`\n📝 블로그 포스트 제목들 (${blogTitles.length}개):`);
    blogTitles.forEach((title, index) => {
      console.log(`${index + 1}. ${title}`);
    });
    
    // 새로 추가된 포스트의 정확한 제목 확인
    const expectedNewTitles = [
      '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
      'AI 시대의 타로: 전통과 기술의 만남이 만드는 새로운 점술',
      '꿈 해몽과 무의식: 당신의 내면이 전하는 메시지 해독법',
      '타로와 명상: 카드를 통한 마음챙김과 영적 성장법',
      '현대인을 위한 영성: 바쁜 일상 속 영적 균형 찾기'
    ];
    
    console.log('\n🔍 새 포스트 확인:');
    let foundNewPosts = 0;
    expectedNewTitles.forEach(expectedTitle => {
      const found = blogTitles.includes(expectedTitle);
      console.log(`- ${expectedTitle}: ${found ? '✅' : '❌'}`);
      if (found) foundNewPosts++;
    });
    
    // 기존 포스트 확인
    const expectedOldTitles = [
      '타로카드 기초 가이드 2025',
      '명상 입문 가이드',
      '꿈해몽 기초 해석법',
      '타로 스프레드 완벽 가이드: 켈틱 크로스부터 쓰리카드까지',
      '영성과 생산성의 조화: 2025년 목표 달성 전략',
      'AI 시대의 타로: 직관과 기술의 완벽한 융합',
      '꿈 일기 작성법: 무의식과의 대화'
    ];
    
    console.log('\n📚 기존 포스트 확인:');
    let foundOldPosts = 0;
    expectedOldTitles.forEach(expectedTitle => {
      const found = blogTitles.includes(expectedTitle);
      console.log(`- ${expectedTitle}: ${found ? '✅' : '❌'}`);
      if (found) foundOldPosts++;
    });
    
    // 스크린샷
    const screenshotTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `vercel-cache-bust-test-${screenshotTimestamp}.png`,
      fullPage: true 
    });
    
    // 결과 요약
    console.log('\n📊 최종 결과:');
    console.log(`- 전체 블로그 포스트: ${blogTitles.length}개`);
    console.log(`- 기존 포스트 발견: ${foundOldPosts}/7개`);
    console.log(`- 새 포스트 발견: ${foundNewPosts}/5개`);
    console.log(`- 총 예상: 12개 (7 기존 + 5 새글)`);
    
    if (blogTitles.length === 12 && foundNewPosts === 5) {
      console.log('\n✅ 완벽한 성공! 모든 포스트가 정상적으로 표시됩니다.');
    } else if (foundNewPosts > 0) {
      console.log('\n⚠️ 부분 성공: 일부 새 포스트가 표시됩니다.');
    } else {
      console.log('\n❌ 새 포스트가 아직 반영되지 않았습니다.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
    console.log('\n테스트 완료');
  }
})();