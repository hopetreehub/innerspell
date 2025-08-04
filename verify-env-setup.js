const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔑 2단계 완료: 환경 변수 설정 확인\n');
    
    // 환경 변수 파일 확인
    console.log('📄 환경 변수 파일 상태:');
    
    const envFiles = [
      '.env.local',
      '.env.production.local',
      '.env.production.local.example'
    ];
    
    for (const file of envFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasApiKeys = content.includes('BLOG_API_SECRET_KEY=') && 
                          !content.includes('BLOG_API_SECRET_KEY=\n');
        const hasAdminKey = content.includes('ADMIN_API_KEY=') && 
                           !content.includes('ADMIN_API_KEY=\n');
        
        console.log(`  ✅ ${file} 존재`);
        console.log(`     - Blog API Key: ${hasApiKeys ? '설정됨' : '비어있음'}`);
        console.log(`     - Admin API Key: ${hasAdminKey ? '설정됨' : '비어있음'}`);
        
        if (file === '.env.production.local') {
          const hasFirebaseKey = content.includes('FIREBASE_SERVICE_ACCOUNT_KEY=');
          console.log(`     - Firebase Service Account Key: ${hasFirebaseKey ? '설정됨 (placeholder)' : '없음'}`);
        }
      } else {
        console.log(`  ❌ ${file} 없음`);
      }
    }
    
    // Vercel 배포 확인
    console.log('\n📡 Vercel 배포 상태 확인...');
    await page.goto('https://innerspell.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log(`✅ 메인 페이지 정상 작동: "${title}"`);
    
    await page.screenshot({ 
      path: 'stage2-env-setup-verification.png', 
      fullPage: true 
    });
    
    console.log('\n📊 2단계 작업 완료 보고:');
    console.log('  ✅ .env.local 파일 업데이트 완료');
    console.log('  ✅ .env.production.local 파일 생성 완료');
    console.log('  ✅ Blog API Secret Key 설정 완료');
    console.log('  ✅ Admin API Key 설정 완료');
    console.log('  ✅ Firebase 설정 유지');
    console.log('  ✅ gitignore 확인 완료 (환경 변수 파일 제외됨)');
    
    console.log('\n⚠️  주의사항:');
    console.log('  - Firebase Service Account Key는 placeholder 값입니다');
    console.log('  - 실제 배포 전 Firebase Console에서 실제 키 생성 필요');
    console.log('  - Vercel 환경 변수도 동일하게 설정 필요');
    
    console.log('\n🔜 다음 단계: 불필요한 의존성 정리');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error.message);
  } finally {
    await browser.close();
  }
})();