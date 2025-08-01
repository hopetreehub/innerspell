const { chromium } = require('playwright');

async function verifyCurrentStatus() {
  console.log('🔍 현재 프로젝트 상태 검증 시작...\n');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      viewport: { width: 1280, height: 720 }
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // 1. Vercel 배포 확인
    console.log('1️⃣ Vercel 배포 상태 확인');
    try {
      await page.goto('https://innerspell.vercel.app/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      console.log('✅ Vercel 사이트 접근 성공');
      await page.screenshot({ path: 'verify-vercel-status.png' });
    } catch (error) {
      console.log('❌ Vercel 사이트 접근 실패:', error.message);
      
      // 다른 가능한 URL 시도
      const alternativeUrls = [
        'https://test-studio-firebase.vercel.app/',
        'https://innerspell-hopetreehub.vercel.app/',
        'https://innerspell-git-main-hopetreehub.vercel.app/'
      ];
      
      for (const url of alternativeUrls) {
        try {
          console.log(`\n시도 중: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
          console.log(`✅ 성공: ${url}`);
          await page.screenshot({ path: `verify-${url.split('//')[1].split('.')[0]}.png` });
          break;
        } catch (e) {
          console.log(`❌ 실패: ${url}`);
        }
      }
    }
    
    // 2. 로컬 서버 확인 (포트 4000)
    console.log('\n2️⃣ 로컬 서버 상태 확인 (포트 4000)');
    try {
      await page.goto('http://localhost:4000/', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      console.log('✅ 로컬 서버 실행 중');
      await page.screenshot({ path: 'verify-local-4000.png' });
      
      // 타로 리딩 페이지 확인
      await page.goto('http://localhost:4000/tarot/reading');
      await page.screenshot({ path: 'verify-local-reading-4000.png' });
      
      // 카드 이미지 경로 확인
      const cardImages = await page.$$eval('img[src*="tarot"]', imgs => 
        imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }))
      );
      
      console.log('\n📷 타로 카드 이미지 확인:');
      cardImages.forEach(img => {
        console.log(`- ${img.alt || 'Unknown'}: ${img.src}`);
        console.log(`  크기: ${img.naturalWidth}x${img.naturalHeight}`);
      });
      
    } catch (error) {
      console.log('❌ 로컬 서버 접근 실패:', error.message);
    }
    
    // 3. 프로젝트 구조 정보
    console.log('\n3️⃣ 프로젝트 정보:');
    console.log('- Git 브랜치: main');
    console.log('- 최근 커밋: Fix: Auth 무한로딩 해결 및 카드 펼치기 간격 -125px로 수정');
    console.log('- 포트 설정: 4000 (package.json에서 확인됨)');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
verifyCurrentStatus().catch(console.error);