const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 Vercel 배포 사이트 종합 확인 시작...');
  
  try {
    // Vercel 배포 사이트로 이동
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(5000);
    
    // 콘솔 로그 캡처
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        console.log('Browser console:', msg.text());
      }
    });
    
    // 블로그 포스트 카드 찾기 - 다양한 셀렉터 시도
    let postCards = await page.$$('article');
    if (postCards.length === 0) {
      console.log('article 요소를 찾지 못함, card 클래스로 시도...');
      postCards = await page.$$('.card, [class*="card"]');
    }
    
    console.log(`\n📊 발견된 카드 요소 수: ${postCards.length}개`);
    
    // h3 태그로 제목 찾기
    const titles = await page.$$eval('h3', elements => 
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    
    console.log(`\n📝 발견된 h3 제목들 (${titles.length}개):`);
    titles.forEach((title, index) => {
      console.log(`${index + 1}. ${title}`);
    });
    
    // 새로 추가된 포스트 확인
    const newPosts = [
      '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
      'AI 시대의 타로: 전통과 기술의 만남이 만드는 새로운 점술',
      '꿈 해몽과 무의식: 당신의 내면이 전하는 메시지 해독법',
      '타로와 명상: 카드를 통한 마음챙김과 영적 성장법',
      '현대인을 위한 영성: 바쁜 일상 속 영적 균형 찾기'
    ];
    
    console.log('\n🔍 새로 추가된 포스트 확인:');
    let foundCount = 0;
    for (const postTitle of newPosts) {
      const found = titles.some(title => title?.includes(postTitle.split(':')[0]));
      console.log(`- ${postTitle.split(':')[0]}: ${found ? '✅ 발견됨' : '❌ 없음'}`);
      if (found) foundCount++;
    }
    
    // 페이지 HTML 일부 확인
    const pageContent = await page.content();
    const hasMockPosts = pageContent.includes('타로카드 기초 가이드');
    const hasNewPosts = pageContent.includes('2025년 타로 신년 운세');
    
    console.log(`\n📄 페이지 내용 확인:`);
    console.log(`- 기본 포스트 존재: ${hasMockPosts ? '✅' : '❌'}`);
    console.log(`- 새 포스트 존재: ${hasNewPosts ? '✅' : '❌'}`);
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `vercel-blog-comprehensive-check-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`\n📸 스크린샷 저장됨: vercel-blog-comprehensive-check-${timestamp}.png`);
    
    // 결과 요약
    const expectedTotal = 12; // 7 original + 5 new
    console.log(`\n📊 최종 결과:`);
    console.log(`- 기대값: ${expectedTotal}개 포스트`);
    console.log(`- 실제 발견: ${titles.length}개 제목`);
    console.log(`- 새 포스트 발견: ${foundCount}/5개`);
    
    if (titles.length >= expectedTotal) {
      console.log('\n✅ 성공: 모든 포스트가 표시되고 있습니다!');
    } else if (titles.length > 6) {
      console.log('\n⚠️ 부분 성공: 일부 새 포스트가 표시되고 있습니다.');
    } else {
      console.log('\n❌ 실패: 새 포스트가 아직 표시되지 않습니다.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
    console.log('\n테스트 완료');
  }
})();