const { chromium } = require('playwright');

async function testLatestDeploymentComprehensive() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('🚀 최신 배포 종합 테스트 시작...');
    console.log('⏰ 시간:', new Date().toLocaleString());
    
    // 테스트할 URL들 (최신 순)
    const urlsToTest = [
      'https://test-studio-firebase.vercel.app',
      'https://test-studio-firebase-johns-projects-bf5e60f3.vercel.app',
      'https://test-studio-firebase-alp3fznx4-johns-projects-bf5e60f3.vercel.app'
    ];
    
    let workingUrl = null;
    
    // 1단계: 작동하는 URL 찾기
    console.log('\n📍 1단계: 접근 가능한 URL 확인...');
    
    for (const url of urlsToTest) {
      try {
        console.log(`🔍 테스트: ${url}`);
        
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        const currentUrl = page.url();
        const title = await page.title();
        const status = response ? response.status() : 'unknown';
        
        console.log(`   📄 제목: ${title}`);
        console.log(`   🌐 현재 URL: ${currentUrl}`);
        console.log(`   📊 상태: ${status}`);
        
        if (!currentUrl.includes('vercel.com/login') && !title.includes('404') && status === 200) {
          console.log('   ✅ 접근 성공!');
          workingUrl = url;
          
          // 스크린샷
          await page.screenshot({ 
            path: `latest-deployment-homepage-${Date.now()}.png`,
            fullPage: true 
          });
          
          break;
        } else {
          console.log('   ❌ 접근 실패 (로그인 필요 또는 오류)');
        }
        
      } catch (error) {
        console.log(`   ❌ 오류: ${error.message}`);
      }
    }
    
    if (!workingUrl) {
      console.log('\n🚨 모든 URL이 접근 불가 상태입니다.');
      console.log('💡 Vercel 프로젝트가 Private으로 설정되어 있을 수 있습니다.');
      
      await page.screenshot({ 
        path: `latest-deployment-access-failed-${Date.now()}.png`,
        fullPage: true 
      });
      
      return {
        success: false,
        message: '사이트 접근 불가 - 로그인 필요',
        recommendation: 'Vercel 대시보드에서 프로젝트를 Public으로 변경 필요'
      };
    }
    
    console.log(`\n🎉 작동하는 URL 발견: ${workingUrl}`);
    
    // 2단계: 주요 페이지 기능 테스트
    console.log('\n📋 2단계: 주요 페이지 기능 테스트...');
    
    const pagesToTest = [
      { path: '/', name: '홈페이지', required: true },
      { path: '/tarot', name: '타로 리딩', required: true },
      { path: '/reading', name: '리딩 페이지', required: true },
      { path: '/blog', name: '블로그', required: true },
      { path: '/dream', name: '꿈해몽', required: false },
      { path: '/admin', name: '관리자', required: false }
    ];
    
    const testResults = {};
    
    for (const pageTest of pagesToTest) {
      try {
        console.log(`\n🔍 ${pageTest.name} 테스트...`);
        const testUrl = new URL(pageTest.path, workingUrl).href;
        
        const startTime = Date.now();
        await page.goto(testUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        const loadTime = Date.now() - startTime;
        
        const title = await page.title();
        const currentUrl = page.url();
        
        // 페이지 분석
        const analysis = await page.evaluate(() => {
          const content = document.body?.innerText || '';
          return {
            hasContent: content.length > 100,
            contentLength: content.length,
            hasNavigation: document.querySelector('nav') !== null,
            hasMainContent: document.querySelector('main') !== null,
            hasErrorMessage: content.toLowerCase().includes('error') || content.includes('404'),
            isLoadingState: content.includes('로딩') || content.includes('Loading'),
            contentPreview: content.substring(0, 150).replace(/\s+/g, ' ')
          };
        });
        
        const isSuccess = !currentUrl.includes('vercel.com/login') && 
                         !analysis.hasErrorMessage && 
                         analysis.hasContent &&
                         !analysis.isLoadingState;
        
        testResults[pageTest.path] = {
          success: isSuccess,
          loadTime,
          title,
          currentUrl,
          analysis,
          required: pageTest.required
        };
        
        console.log(`   ⏱️ 로딩 시간: ${loadTime}ms`);
        console.log(`   📄 제목: ${title}`);
        console.log(`   ${isSuccess ? '✅' : '❌'} 상태: ${isSuccess ? '성공' : '실패'}`);
        
        if (isSuccess) {
          console.log(`   📊 콘텐츠 길이: ${analysis.contentLength}자`);
          console.log(`   🧭 네비게이션: ${analysis.hasNavigation ? '✅' : '❌'}`);
          console.log(`   📝 메인 콘텐츠: ${analysis.hasMainContent ? '✅' : '❌'}`);
        }
        
        // 스크린샷
        await page.screenshot({ 
          path: `latest-${pageTest.name.replace(/\s+/g, '-')}-${Date.now()}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`   ❌ ${pageTest.name} 테스트 실패: ${error.message}`);
        testResults[pageTest.path] = {
          success: false,
          error: error.message,
          required: pageTest.required
        };
      }
    }
    
    // 3단계: 성능 및 기능 상세 분석
    console.log('\n🔬 3단계: 성능 및 기능 상세 분석...');
    
    // 홈페이지로 돌아가서 상세 분석
    await page.goto(workingUrl, { waitUntil: 'networkidle' });
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        navigation: {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
        },
        resourceCount: resources.length,
        memory: performance.memory ? {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        } : null
      };
    });
    
    console.log('   📈 성능 메트릭:');
    console.log(`      - DOM 로드: ${performanceMetrics.navigation.domContentLoaded}ms`);
    console.log(`      - 전체 로드: ${performanceMetrics.navigation.totalTime}ms`);
    console.log(`      - 리소스 수: ${performanceMetrics.resourceCount}개`);
    if (performanceMetrics.memory) {
      console.log(`      - 메모리 사용: ${performanceMetrics.memory.usedJSHeapSize}MB`);
    }
    
    // 4단계: 결과 분석 및 보고서 생성
    console.log('\n📊 4단계: 종합 결과 분석...');
    
    const successfulPages = Object.values(testResults).filter(r => r.success).length;
    const totalPages = Object.keys(testResults).length;
    const requiredPagesFailed = Object.values(testResults).filter(r => r.required && !r.success);
    
    console.log(`\n✅ 성공한 페이지: ${successfulPages}/${totalPages}`);
    
    // 필수 페이지 실패 체크
    if (requiredPagesFailed.length > 0) {
      console.log(`\n🚨 필수 페이지 실패:`);
      requiredPagesFailed.forEach(result => {
        const pageName = Object.keys(testResults).find(key => testResults[key] === result);
        console.log(`   ❌ ${pageName}: ${result.error || '접근 실패'}`);
      });
    }
    
    // 성능 등급 매기기
    const avgLoadTime = Object.values(testResults)
      .filter(r => r.loadTime)
      .reduce((sum, r) => sum + r.loadTime, 0) / successfulPages;
    
    let performanceGrade = 'A';
    if (avgLoadTime > 3000) performanceGrade = 'D';
    else if (avgLoadTime > 2000) performanceGrade = 'C';
    else if (avgLoadTime > 1000) performanceGrade = 'B';
    
    console.log(`\n🏆 전체 성능 등급: ${performanceGrade} (평균 ${Math.round(avgLoadTime)}ms)`);
    
    // 개선 제안
    console.log('\n💡 개선 제안:');
    if (requiredPagesFailed.length > 0) {
      console.log('   🔧 필수 페이지 접근 문제 해결 필요');
    }
    if (avgLoadTime > 2000) {
      console.log('   ⚡ 페이지 로딩 속도 최적화 필요');
    }
    if (workingUrl !== urlsToTest[0]) {
      console.log('   🌐 메인 도메인 접근성 문제 해결 필요');
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: `latest-deployment-final-${Date.now()}.png`,
      fullPage: true 
    });
    
    return {
      success: successfulPages >= Math.ceil(totalPages * 0.7), // 70% 이상 성공
      workingUrl,
      testResults,
      performanceMetrics,
      performanceGrade,
      avgLoadTime: Math.round(avgLoadTime),
      successRate: `${successfulPages}/${totalPages}`,
      requiredPagesFailed: requiredPagesFailed.length,
      message: `${successfulPages}/${totalPages} 페이지 접근 성공 (성능 등급: ${performanceGrade})`
    };
    
  } catch (error) {
    console.error('❌ 종합 테스트 오류:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// 실행
testLatestDeploymentComprehensive()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 최신 배포 종합 테스트 완료!');
    console.log('='.repeat(60));
    
    if (result.success) {
      console.log('🎊 축하합니다! 배포가 성공적으로 작동하고 있습니다!');
      console.log(`🌐 작동 URL: ${result.workingUrl}`);
      console.log(`📊 성공률: ${result.successRate}`);
      console.log(`🏆 성능 등급: ${result.performanceGrade} (평균 ${result.avgLoadTime}ms)`);
    } else {
      console.log('⚠️ 일부 문제가 발견되었습니다.');
      if (result.requiredPagesFailed > 0) {
        console.log(`🚨 필수 페이지 ${result.requiredPagesFailed}개 실패`);
      }
    }
    
    console.log('\n📋 상세 결과:', JSON.stringify(result, null, 2));
  })
  .catch(console.error);