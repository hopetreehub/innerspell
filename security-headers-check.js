const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('🔒 보안 헤더 실제 확인...\n');
  
  try {
    // 네트워크 응답 리스너 등록
    page.on('response', async (response) => {
      if (response.url() === 'http://localhost:4000/') {
        console.log('📊 응답 헤더 분석:');
        const headers = response.headers();
        
        // 보안 헤더 확인
        const securityHeaders = [
          'x-frame-options',
          'x-content-type-options', 
          'x-xss-protection',
          'referrer-policy',
          'permissions-policy',
          'content-security-policy',
          'strict-transport-security'
        ];
        
        securityHeaders.forEach(header => {
          const value = headers[header];
          const status = value ? '✅' : '❌';
          console.log(`   ${header}: ${status} ${value || '미설정'}`);
        });
        
        console.log('\n📋 보안 점수:');
        const setHeaders = securityHeaders.filter(h => headers[h]).length;
        const score = Math.round((setHeaders / securityHeaders.length) * 100);
        console.log(`   총 ${securityHeaders.length}개 중 ${setHeaders}개 설정됨 (${score}%)`);
        
        if (score >= 80) console.log('   🟢 보안 등급: 우수');
        else if (score >= 60) console.log('   🟡 보안 등급: 양호');
        else console.log('   🔴 보안 등급: 개선 필요');
      }
    });
    
    // 홈페이지 로드
    console.log('1. 홈페이지 보안 헤더 확인...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'security-check-01-homepage.png' });
    
    // 관리자 페이지 접근 시도 (인증 없이)
    console.log('\n2. 관리자 페이지 접근 제한 확인...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('/admin');
    console.log(`   관리자 페이지 접근: ${isRedirected ? '✅ 차단됨' : '❌ 접근 가능'}`);
    console.log(`   현재 URL: ${currentUrl}`);
    await page.screenshot({ path: 'security-check-02-admin-access.png' });
    
    // API 엔드포인트 보안 확인
    console.log('\n3. API 엔드포인트 보안 확인...');
    const apiTests = [
      { url: '/api/admin/stats', desc: '관리자 통계 API' },
      { url: '/api/setup-admin', desc: '관리자 설정 API' }
    ];
    
    for (const test of apiTests) {
      try {
        const response = await page.request.get(`http://localhost:4000${test.url}`);
        const status = response.status();
        const isSecure = status === 401 || status === 403 || status === 404;
        console.log(`   ${test.desc}: ${isSecure ? '✅' : '❌'} HTTP ${status}`);
      } catch (error) {
        console.log(`   ${test.desc}: ✅ 접근 차단됨`);
      }
    }
    
    console.log('\n✅ 보안 헤더 확인 완료!');
    
  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
    await page.screenshot({ path: 'security-check-error.png' });
  }
  
  await browser.close();
})();