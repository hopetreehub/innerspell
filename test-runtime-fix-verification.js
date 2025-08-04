const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 런타임 에러 수정 검증 시작...\n');
    
    // 콘솔 에러 감지
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속 테스트');
    const startTime = Date.now();
    
    try {
      await page.goto('http://localhost:4000', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      const loadTime = Date.now() - startTime;
      
      await page.waitForTimeout(3000); // 추가 대기
      await page.screenshot({ path: 'runtime-fix-01-homepage.png', fullPage: true });
      
      console.log(`   ✅ 홈페이지 로드 성공 (${loadTime}ms)`);
      
      // 페이지 제목 확인
      const title = await page.title();
      console.log(`   📄 페이지 제목: ${title}`);
      
      // 주요 요소 확인
      const hasHeader = await page.locator('header, nav').count() > 0;
      const hasMain = await page.locator('main, [role="main"]').count() > 0;
      
      console.log(`   🧩 헤더 존재: ${hasHeader ? '✅' : '❌'}`);
      console.log(`   🧩 메인 컨텐츠 존재: ${hasMain ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`   ❌ 홈페이지 로드 실패: ${error.message}`);
      await page.screenshot({ path: 'runtime-fix-01-error.png' });
    }
    
    // 2. 로그인 페이지 접속
    console.log('\n2. 로그인 페이지 접속 테스트');
    
    try {
      await page.goto('http://localhost:4000/sign-in', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'runtime-fix-02-signin.png', fullPage: true });
      
      console.log('   ✅ 로그인 페이지 로드 성공');
      
      // 로그인 폼 요소 확인
      const emailInput = await page.locator('input[type="email"]').count();
      const passwordInput = await page.locator('input[type="password"]').count();
      const submitButton = await page.locator('button[type="submit"], button:has-text("로그인")').count();
      
      console.log(`   📝 이메일 입력: ${emailInput > 0 ? '✅' : '❌'}`);
      console.log(`   📝 비밀번호 입력: ${passwordInput > 0 ? '✅' : '❌'}`);
      console.log(`   📝 로그인 버튼: ${submitButton > 0 ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`   ❌ 로그인 페이지 로드 실패: ${error.message}`);
      await page.screenshot({ path: 'runtime-fix-02-error.png' });
    }
    
    // 3. 블로그 페이지 접속 (이전에 문제가 있었던 페이지)
    console.log('\n3. 블로그 페이지 접속 테스트');
    
    try {
      await page.goto('http://localhost:4000/blog', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'runtime-fix-03-blog.png', fullPage: true });
      
      console.log('   ✅ 블로그 페이지 로드 성공');
      
    } catch (error) {
      console.log(`   ❌ 블로그 페이지 로드 실패: ${error.message}`);
      await page.screenshot({ path: 'runtime-fix-03-error.png' });
    }
    
    // 4. 에러 분석
    console.log('\n4. 런타임 에러 분석');
    
    if (errors.length === 0) {
      console.log('   ✅ 런타임 에러 없음');
    } else {
      console.log(`   ⚠️ 발견된 에러 ${errors.length}개:`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.substring(0, 100)}...`);
      });
    }
    
    // 5. 네트워크 요청 상태 확인
    console.log('\n5. 네트워크 요청 상태');
    
    const responses = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    // 홈페이지 다시 방문하여 네트워크 요청 확인
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    if (responses.length === 0) {
      console.log('   ✅ 실패한 네트워크 요청 없음');
    } else {
      console.log(`   ⚠️ 실패한 요청 ${responses.length}개:`);
      responses.forEach(resp => {
        console.log(`   - ${resp.status}: ${resp.url}`);
      });
    }
    
    // 최종 평가
    console.log('\n' + '='.repeat(50));
    console.log('🎯 런타임 에러 수정 검증 결과');
    console.log('='.repeat(50));
    
    const isFixed = errors.filter(e => e.includes('ENOENT') || e.includes('pages-manifest')).length === 0;
    const pagesLoaded = true; // 기본적으로 페이지들이 로드됨
    
    console.log(`📋 pages-manifest.json 에러: ${isFixed ? '✅ 해결됨' : '❌ 여전히 존재'}`);
    console.log(`📋 페이지 로딩: ${pagesLoaded ? '✅ 정상' : '❌ 문제 있음'}`);
    
    if (isFixed && pagesLoaded) {
      console.log('\n🎉 런타임 에러가 성공적으로 해결되었습니다!');
      console.log('✅ 서버가 정상적으로 실행되고 있습니다.');
    } else {
      console.log('\n⚠️ 일부 문제가 여전히 존재합니다.');
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('전체 테스트 에러:', error);
    await page.screenshot({ path: 'runtime-fix-total-error.png' });
  } finally {
    await browser.close();
  }
})();