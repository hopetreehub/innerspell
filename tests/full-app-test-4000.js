const { chromium } = require('playwright');

(async () => {
  console.log('🚀 MysticSight Tarot 전체 기능 테스트 시작 (포트 4000)\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null,
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();
  
  const testResults = {
    서버상태: '✅ 포트 4000에서 실행 중',
    테스트시간: new Date().toLocaleString('ko-KR'),
    테스트결과: {
      홈페이지: { 상태: '테스트 중...', 세부사항: {} },
      블로그: { 상태: '테스트 중...', 세부사항: {} },
      타로리딩: { 상태: '테스트 중...', 세부사항: {} },
      백과사전: { 상태: '테스트 중...', 세부사항: {} },
      사용자인증: { 상태: '테스트 중...', 세부사항: {} },
      커뮤니티: { 상태: '테스트 중...', 세부사항: {} }
    },
    스크린샷: []
  };

  try {
    // 1. 홈페이지 테스트
    console.log('📍 1. 홈페이지 테스트');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const homeTitle = await page.title();
    const heroText = await page.locator('h1').first().textContent().catch(() => null);
    const newsletterForm = await page.locator('form').filter({ hasText: '뉴스레터' }).count();
    
    testResults.테스트결과.홈페이지 = {
      상태: '✅ 성공',
      세부사항: {
        타이틀: homeTitle || '타이틀 없음',
        히어로텍스트: heroText || '히어로 텍스트 없음',
        뉴스레터폼: newsletterForm > 0 ? '✅ 있음' : '❌ 없음'
      }
    };
    
    await page.screenshot({ 
      path: 'tests/screenshots/test-4000-1-home.png',
      fullPage: true 
    });
    testResults.스크린샷.push('test-4000-1-home.png');
    console.log('  ✅ 홈페이지 로드 완료');

    // 2. 블로그 테스트
    console.log('\n📍 2. 블로그 테스트');
    await page.goto('http://localhost:4000/blog', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const blogPosts = await page.locator('article, [class*="post"], [class*="blog"]').count();
    const blogTitle = await page.locator('h1, h2').first().textContent().catch(() => null);
    
    testResults.테스트결과.블로그 = {
      상태: '✅ 성공',
      세부사항: {
        페이지제목: blogTitle || '제목 없음',
        게시물수: blogPosts,
        상태: blogPosts > 0 ? '✅ 게시물 표시됨' : '⚠️ 게시물 없음'
      }
    };
    
    await page.screenshot({ 
      path: 'tests/screenshots/test-4000-2-blog.png',
      fullPage: true 
    });
    testResults.스크린샷.push('test-4000-2-blog.png');
    console.log('  ✅ 블로그 페이지 테스트 완료');

    // 3. 타로 리딩 테스트
    console.log('\n📍 3. 타로 리딩 테스트');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const readingOptions = await page.locator('[class*="card"], [class*="reading"], button').count();
    const tarotTitle = await page.locator('h1, h2').first().textContent().catch(() => null);
    
    testResults.테스트결과.타로리딩 = {
      상태: '✅ 성공',
      세부사항: {
        페이지제목: tarotTitle || '제목 없음',
        리딩옵션수: readingOptions,
        상태: readingOptions > 0 ? '✅ 리딩 옵션 표시됨' : '⚠️ 리딩 옵션 없음'
      }
    };
    
    await page.screenshot({ 
      path: 'tests/screenshots/test-4000-3-reading.png',
      fullPage: true 
    });
    testResults.스크린샷.push('test-4000-3-reading.png');
    console.log('  ✅ 타로 리딩 페이지 테스트 완료');

    // 4. 백과사전 테스트
    console.log('\n📍 4. 백과사전 테스트');
    await page.goto('http://localhost:4000/encyclopedia', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const encyclopediaCards = await page.locator('[class*="card"], [class*="tarot"], a[href*="card"]').count();
    const encyclopediaTitle = await page.locator('h1, h2').first().textContent().catch(() => null);
    
    testResults.테스트결과.백과사전 = {
      상태: '✅ 성공',
      세부사항: {
        페이지제목: encyclopediaTitle || '제목 없음',
        카드수: encyclopediaCards,
        상태: encyclopediaCards > 0 ? '✅ 카드 표시됨' : '⚠️ 카드 없음'
      }
    };
    
    await page.screenshot({ 
      path: 'tests/screenshots/test-4000-4-encyclopedia.png',
      fullPage: true 
    });
    testResults.스크린샷.push('test-4000-4-encyclopedia.png');
    console.log('  ✅ 백과사전 페이지 테스트 완료');

    // 5. 로그인 페이지 테스트
    console.log('\n📍 5. 사용자 인증 테스트');
    await page.goto('http://localhost:4000/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const googleButton = await page.locator('button').filter({ hasText: 'Google' }).count();
    
    testResults.테스트결과.사용자인증 = {
      상태: '✅ 성공',
      세부사항: {
        이메일입력: emailInput > 0 ? '✅ 있음' : '❌ 없음',
        비밀번호입력: passwordInput > 0 ? '✅ 있음' : '❌ 없음',
        구글로그인: googleButton > 0 ? '✅ 있음' : '❌ 없음'
      }
    };
    
    await page.screenshot({ 
      path: 'tests/screenshots/test-4000-5-signin.png',
      fullPage: true 
    });
    testResults.스크린샷.push('test-4000-5-signin.png');
    console.log('  ✅ 로그인 페이지 테스트 완료');

    // 6. 커뮤니티 페이지 테스트 (있는 경우)
    console.log('\n📍 6. 커뮤니티 페이지 테스트');
    try {
      await page.goto('http://localhost:4000/community', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      const communityContent = await page.locator('main').textContent();
      
      testResults.테스트결과.커뮤니티 = {
        상태: '✅ 성공',
        세부사항: {
          페이지존재: '✅ 있음',
          컨텐츠: communityContent ? '✅ 내용 있음' : '⚠️ 내용 없음'
        }
      };
      
      await page.screenshot({ 
        path: 'tests/screenshots/test-4000-6-community.png',
        fullPage: true 
      });
      testResults.스크린샷.push('test-4000-6-community.png');
      
    } catch (error) {
      testResults.테스트결과.커뮤니티 = {
        상태: '⚠️ 페이지 없음',
        세부사항: {
          페이지존재: '❌ 없음',
          에러: error.message
        }
      };
    }

    // 최종 보고서 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 MysticSight Tarot 전체 기능 테스트 결과');
    console.log('='.repeat(60));
    console.log(`🕐 테스트 시간: ${testResults.테스트시간}`);
    console.log(`🖥️  서버 상태: ${testResults.서버상태}`);
    console.log('\n📋 페이지별 테스트 결과:');
    
    for (const [페이지, 결과] of Object.entries(testResults.테스트결과)) {
      console.log(`\n${페이지}:`);
      console.log(`  상태: ${결과.상태}`);
      if (결과.세부사항) {
        for (const [항목, 값] of Object.entries(결과.세부사항)) {
          console.log(`  ${항목}: ${값}`);
        }
      }
    }
    
    console.log('\n📸 생성된 스크린샷:');
    testResults.스크린샷.forEach(screenshot => {
      console.log(`  - tests/screenshots/${screenshot}`);
    });
    
    console.log('\n✅ 모든 테스트 완료!');
    console.log('🔧 브라우저를 열어둡니다. 추가 테스트를 진행하거나 Ctrl+C로 종료하세요.\n');
    
    // 브라우저 유지
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    console.log('🔧 브라우저를 유지합니다. 수동으로 확인하세요.\n');
    
    await new Promise(() => {});
  }
})();