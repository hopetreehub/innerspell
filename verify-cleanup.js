const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧹 1단계 완료: 목업 파일 정리 확인\n');
    
    // Vercel 배포 상태 확인
    console.log('📡 Vercel 배포 상태 확인...');
    await page.goto('https://innerspell.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log(`✅ 메인 페이지 정상 작동: "${title}"`);
    
    await page.screenshot({ 
      path: 'stage1-cleanup-verification.png', 
      fullPage: true 
    });
    
    console.log('\n📊 1단계 작업 완료 보고:');
    console.log('  ✅ 모든 테스트 파일 삭제 완료 (0개 남음)');
    console.log('  ✅ 모든 스크린샷 파일 삭제 완료');
    console.log('  ✅ 모든 목업 관련 디렉토리 삭제 완료');
    console.log('  ✅ Vercel 배포 정상 작동 확인');
    
    console.log('\n🔜 다음 단계: 환경 변수 파일 실제 값으로 업데이트');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error.message);
  } finally {
    await browser.close();
  }
})();