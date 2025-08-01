const { chromium } = require('playwright');
const fs = require('fs');

async function findVercelUrls() {
  console.log('🔍 Vercel 배포 URL 찾기...\n');
  
  let browser;
  const results = [];
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      viewport: { width: 1280, height: 720 }
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // 가능한 Vercel URL 패턴들
    const possibleUrls = [
      'https://test-studio-firebase.vercel.app/',
      'https://test-studio-firebase-hopetreehub.vercel.app/',
      'https://test-studio-firebase-git-main-hopetreehub.vercel.app/',
      'https://innerspell-hopetreehub.vercel.app/',
      'https://innerspell-git-main-hopetreehub.vercel.app/',
      'https://nextn.vercel.app/',
      'https://nextn-hopetreehub.vercel.app/',
      'https://hopetreehub.vercel.app/',
      'https://test-studio.vercel.app/',
      'https://studio-firebase.vercel.app/'
    ];
    
    console.log('다음 URL들을 확인합니다:');
    console.log('='.repeat(50));
    
    for (const url of possibleUrls) {
      console.log(`\n🔗 시도 중: ${url}`);
      
      try {
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        const status = response?.status();
        const title = await page.title();
        
        // 실제 페이지 내용 확인
        const pageContent = await page.evaluate(() => {
          const h1 = document.querySelector('h1');
          const metaDescription = document.querySelector('meta[name="description"]');
          return {
            h1Text: h1?.textContent || '',
            description: metaDescription?.content || '',
            hasLoginForm: !!document.querySelector('input[type="email"]') || !!document.querySelector('button[data-testid="login-button"]'),
            hasVercelLogin: !!document.querySelector('button')?.textContent?.includes('Continue with'),
            bodyText: document.body.innerText.substring(0, 200)
          };
        });
        
        if (status === 200) {
          if (pageContent.hasVercelLogin || title.includes('Log in to Vercel')) {
            console.log('⚠️  Vercel 로그인 페이지 (비공개 프로젝트)');
            results.push({ url, status: 'private', title });
          } else if (pageContent.h1Text.includes('이너스펠') || pageContent.h1Text.includes('InnerSpell') || pageContent.bodyText.includes('타로')) {
            console.log('✅ 성공! 프로젝트 발견');
            results.push({ url, status: 'success', title, content: pageContent });
            await page.screenshot({ path: `found-${url.split('//')[1].split('.')[0]}.png` });
          } else {
            console.log(`🤔 다른 프로젝트: ${title}`);
            results.push({ url, status: 'other', title });
          }
        } else {
          console.log(`❌ HTTP ${status}`);
          results.push({ url, status: `error-${status}` });
        }
        
      } catch (error) {
        console.log(`❌ 실패: ${error.message.split('\n')[0]}`);
        results.push({ url, status: 'error', error: error.message });
      }
    }
    
    // 결과 저장
    console.log('\n\n📊 검색 결과 요약:');
    console.log('='.repeat(50));
    
    const successUrls = results.filter(r => r.status === 'success');
    if (successUrls.length > 0) {
      console.log('\n✅ 발견된 배포 URL:');
      successUrls.forEach(r => {
        console.log(`- ${r.url}`);
        console.log(`  제목: ${r.title}`);
      });
    } else {
      console.log('\n❌ 공개된 배포 URL을 찾을 수 없습니다.');
      console.log('모든 URL이 비공개이거나 404 에러입니다.');
    }
    
    // JSON 파일로 저장
    fs.writeFileSync('vercel-url-search-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 상세 결과가 vercel-url-search-results.json에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 실행
findVercelUrls().catch(console.error);