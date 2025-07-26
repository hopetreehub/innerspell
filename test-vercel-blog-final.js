const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 Vercel 배포 사이트 최종 확인 시작...');
  
  try {
    // Vercel 배포 사이트로 이동
    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 블로그 포스트 카드 찾기
    const postCards = await page.$$('article');
    console.log(`\n📊 발견된 블로그 포스트 수: ${postCards.length}개`);
    
    // 각 포스트의 제목 가져오기
    console.log('\n📝 블로그 포스트 목록:');
    for (let i = 0; i < postCards.length; i++) {
      const titleElement = await postCards[i].$('h3');
      if (titleElement) {
        const title = await titleElement.textContent();
        console.log(`${i + 1}. ${title}`);
      }
    }
    
    // 새로 추가된 포스트 확인
    const newPosts = [
      '2025년 타로 운세: 별자리별 신년 운세 가이드',
      'AI 시대의 타로: 인공지능이 보는 미래 예측',
      '꿈 해몽과 무의식: 심리학이 밝히는 꿈의 비밀',
      '타로와 명상: 내면의 평화를 찾는 영적 수행법',
      '현대인을 위한 영성: 디지털 시대의 마음 챙김'
    ];
    
    console.log('\n🔍 새로 추가된 포스트 확인:');
    for (const postTitle of newPosts) {
      const found = await page.locator(`text="${postTitle}"`).count() > 0;
      console.log(`- ${postTitle}: ${found ? '✅ 발견됨' : '❌ 없음'}`);
    }
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `vercel-blog-final-verification-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log(`\n📸 스크린샷 저장됨: vercel-blog-final-verification-${timestamp}.png`);
    
    // 결과 요약
    if (postCards.length >= 11) {
      console.log('\n✅ 성공: 모든 11개의 블로그 포스트가 표시되고 있습니다!');
    } else {
      console.log(`\n⚠️ 경고: ${postCards.length}개의 포스트만 표시됨 (예상: 11개)`);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
    console.log('\n테스트 완료');
  }
})();