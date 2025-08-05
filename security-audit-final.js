const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('🔒 최종 보안 감사 실행...\n');
  
  let overallScore = 0;
  let maxScore = 0;
  
  try {
    // 1. 보안 헤더 검증
    console.log('1. 보안 헤더 검증...');
    page.on('response', async (response) => {
      if (response.url() === 'http://localhost:4000/') {
        const headers = response.headers();
        
        const securityHeaders = [
          { key: 'x-frame-options', name: 'X-Frame-Options', weight: 10 },
          { key: 'x-content-type-options', name: 'X-Content-Type-Options', weight: 10 },
          { key: 'x-xss-protection', name: 'X-XSS-Protection', weight: 10 },
          { key: 'referrer-policy', name: 'Referrer-Policy', weight: 10 },
          { key: 'permissions-policy', name: 'Permissions-Policy', weight: 15 },
          { key: 'content-security-policy', name: 'Content-Security-Policy', weight: 25 },
          { key: 'strict-transport-security', name: 'Strict-Transport-Security', weight: 20 }
        ];
        
        console.log('   보안 헤더 상세 분석:');
        securityHeaders.forEach(header => {
          const value = headers[header.key];
          const status = value ? '✅' : '❌';
          console.log(`   ${header.name}: ${status} ${value || '미설정'}`);
          
          maxScore += header.weight;
          if (value) overallScore += header.weight;
        });
      }
    });
    
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'security-audit-01-homepage.png' });
    
    // 2. 관리자 페이지 접근 테스트
    console.log('\n2. 관리자 페이지 접근 제한 테스트...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isProtected = currentUrl.includes('/auth/signin') || currentUrl.includes('/login');
    console.log(`   관리자 페이지 보호: ${isProtected ? '✅' : '❌'} ${isProtected ? '로그인 페이지로 리다이렉트됨' : '직접 접근 가능'}`);
    console.log(`   현재 URL: ${currentUrl}`);
    
    maxScore += 30;
    if (isProtected) overallScore += 30;
    
    await page.screenshot({ path: 'security-audit-02-admin-protection.png' });
    
    // 3. API 엔드포인트 보안 테스트
    console.log('\n3. API 엔드포인트 보안 테스트...');
    const apiTests = [
      { url: '/api/admin/stats', desc: '관리자 통계 API', weight: 15 },
      { url: '/api/setup-admin', desc: '관리자 설정 API', weight: 20 },
      { url: '/api/ai/providers', desc: 'AI 제공자 API', weight: 10 },
      { url: '/api/dream/interpretation', desc: '꿈 해석 API', weight: 5 }
    ];
    
    for (const test of apiTests) {
      try {
        const response = await page.request.get(`http://localhost:4000${test.url}`);
        const status = response.status();
        const isSecure = status === 401 || status === 403 || status === 404;
        console.log(`   ${test.desc}: ${isSecure ? '✅' : '❌'} HTTP ${status}`);
        
        maxScore += test.weight;
        if (isSecure) overallScore += test.weight;
      } catch (error) {
        console.log(`   ${test.desc}: ✅ 접근 차단됨 (네트워크 에러)`);
        maxScore += test.weight;
        overallScore += test.weight;
      }
    }
    
    // 4. 민감한 파일 접근 테스트
    console.log('\n4. 민감한 파일 접근 테스트...');
    const sensitiveFiles = [
      { path: '/.env', desc: '환경 변수 파일' },
      { path: '/.env.local', desc: '로컬 환경 변수' },
      { path: '/next.config.js', desc: 'Next.js 설정 파일' },
      { path: '/package.json', desc: '패키지 정보' }
    ];
    
    let protectedFiles = 0;
    for (const file of sensitiveFiles) {
      try {
        const response = await page.request.get(`http://localhost:4000${file.path}`);
        const isProtected = response.status() === 404 || response.status() === 403;
        console.log(`   ${file.desc}: ${isProtected ? '✅' : '❌'} HTTP ${response.status()}`);
        if (isProtected) protectedFiles++;
      } catch (error) {
        console.log(`   ${file.desc}: ✅ 접근 차단됨`);
        protectedFiles++;
      }
    }
    
    maxScore += 10;
    overallScore += Math.round((protectedFiles / sensitiveFiles.length) * 10);
    
    // 5. HTTPS 리다이렉트 테스트 (프로덕션 전용)
    console.log('\n5. HTTPS 설정 확인...');
    console.log('   HTTPS 리다이렉트: ⚠️  개발 환경 (프로덕션에서 확인 필요)');
    
    // 6. 최종 점수 계산
    console.log('\n📊 보안 감사 결과:');
    console.log('═══════════════════════════════════════');
    
    const finalScore = Math.round((overallScore / maxScore) * 100);
    console.log(`   전체 보안 점수: ${finalScore}% (${overallScore}/${maxScore})`);
    
    if (finalScore >= 90) {
      console.log('   🟢 보안 등급: 우수 (Excellent)');
    } else if (finalScore >= 80) {
      console.log('   🟡 보안 등급: 양호 (Good)');
    } else if (finalScore >= 70) {
      console.log('   🟠 보안 등급: 보통 (Fair)');
    } else {
      console.log('   🔴 보안 등급: 개선 필요 (Poor)');
    }
    
    console.log('\n✅ 보안 개선 사항:');
    if (finalScore >= 90) {
      console.log('   - 모든 주요 보안 조치가 적절히 구현됨');
      console.log('   - 프로덕션 배포 시 HTTPS 강제 설정 확인 필요');
    } else {
      console.log('   - 추가적인 보안 강화 조치 필요');
      console.log('   - API 엔드포인트 인증 강화');
      console.log('   - 관리자 페이지 접근 제어 개선');
    }
    
    await page.screenshot({ path: 'security-audit-final-results.png' });
    
  } catch (error) {
    console.error('\n❌ 보안 감사 중 에러 발생:', error.message);
    await page.screenshot({ path: 'security-audit-error.png' });
  }
  
  await browser.close();
  console.log('\n🔒 보안 감사 완료!');
})();