const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 스크린샷 저장 디렉토리 생성
const screenshotDir = path.join(__dirname, 'status-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

// 페이지 목록
const pages = [
  { name: 'home', url: 'http://localhost:4000', description: '홈페이지' },
  { name: 'tarot', url: 'http://localhost:4000/tarot', description: '타로 카드 페이지' },
  { name: 'new-reading', url: 'http://localhost:4000/tarot/new-reading', description: '새로운 리딩 페이지' },
  { name: 'history', url: 'http://localhost:4000/tarot/history', description: '히스토리 페이지' },
  { name: 'blog', url: 'http://localhost:4000/blog', description: '블로그 페이지' },
  { name: 'about', url: 'http://localhost:4000/about', description: '어바웃 페이지' },
  { name: 'admin', url: 'http://localhost:4000/admin', description: '어드민 페이지' }
];

async function checkProjectStatus() {
  console.log('🔍 프로젝트 상태 확인 시작...\n');

  // 1. 서버 상태 확인
  console.log('1️⃣ 서버 상태 확인');
  try {
    execSync('lsof -i :4000', { stdio: 'pipe' });
    console.log('✅ 서버가 포트 4000에서 실행 중입니다.\n');
  } catch (error) {
    console.log('❌ 서버가 실행되지 않고 있습니다.');
    console.log('💡 서버를 시작하려면: npm run dev\n');
    
    // 서버가 실행되지 않으면 시작 시도
    console.log('🚀 서버 시작 시도 중...');
    const { spawn } = require('child_process');
    const server = spawn('npm', ['run', 'dev'], {
      detached: true,
      stdio: 'ignore'
    });
    server.unref();
    
    console.log('⏳ 서버 시작을 기다리는 중... (15초)');
    await new Promise(resolve => setTimeout(resolve, 15000));
  }

  // 2. Playwright로 페이지 확인
  console.log('2️⃣ Playwright로 페이지 확인 시작\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const results = [];

  for (const pageInfo of pages) {
    console.log(`📄 ${pageInfo.description} 확인 중...`);
    const page = await context.newPage();
    
    try {
      // 페이지 로드 시도
      const response = await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 응답 상태 확인
      const status = response.status();
      const isSuccess = status >= 200 && status < 300;
      
      // 스크린샷 촬영
      const screenshotPath = path.join(screenshotDir, `${pageInfo.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // 페이지 타이틀 가져오기
      const title = await page.title();
      
      // 주요 요소 확인
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body && body.textContent.trim().length > 0;
      });
      
      results.push({
        ...pageInfo,
        status,
        isSuccess,
        title,
        hasContent,
        screenshotPath
      });
      
      if (isSuccess) {
        console.log(`  ✅ 성공 (${status}) - ${title}`);
        console.log(`  📸 스크린샷 저장: ${screenshotPath}`);
      } else {
        console.log(`  ❌ 실패 (${status})`);
      }
      
    } catch (error) {
      console.log(`  ❌ 에러: ${error.message}`);
      results.push({
        ...pageInfo,
        status: 'error',
        isSuccess: false,
        error: error.message
      });
    }
    
    await page.close();
    console.log('');
  }

  // 3. 기능 테스트
  console.log('3️⃣ 기능 테스트');
  
  // 타로 카드 뽑기 테스트
  console.log('\n🎴 타로 카드 뽑기 기능 테스트');
  const tarotPage = await context.newPage();
  try {
    await tarotPage.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    
    // 카드 뽑기 버튼 찾기
    const drawButton = await tarotPage.locator('button:has-text("카드 뽑기"), button:has-text("Draw Card"), button:has-text("새로운 리딩")').first();
    if (await drawButton.isVisible()) {
      await drawButton.click();
      await tarotPage.waitForTimeout(2000);
      
      // 카드가 표시되는지 확인
      const cardElements = await tarotPage.locator('.card, [class*="card"], img[alt*="card"], img[alt*="타로"]').count();
      if (cardElements > 0) {
        console.log('  ✅ 타로 카드 뽑기 기능 정상 작동');
        await tarotPage.screenshot({ path: path.join(screenshotDir, 'tarot-draw-result.png') });
      } else {
        console.log('  ⚠️  카드가 표시되지 않음');
      }
    } else {
      console.log('  ⚠️  카드 뽑기 버튼을 찾을 수 없음');
    }
  } catch (error) {
    console.log(`  ❌ 타로 기능 테스트 실패: ${error.message}`);
  }
  await tarotPage.close();

  // 메뉴 네비게이션 테스트
  console.log('\n🧭 메뉴 네비게이션 테스트');
  const navPage = await context.newPage();
  try {
    await navPage.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    // 네비게이션 메뉴 확인
    const navLinks = await navPage.locator('nav a, header a, [role="navigation"] a').all();
    console.log(`  📋 발견된 네비게이션 링크: ${navLinks.length}개`);
    
    if (navLinks.length > 0) {
      // 첫 번째 링크 클릭 테스트
      const firstLink = navLinks[0];
      const linkText = await firstLink.textContent();
      await firstLink.click();
      await navPage.waitForTimeout(2000);
      console.log(`  ✅ 네비게이션 링크 "${linkText}" 클릭 성공`);
    } else {
      console.log('  ⚠️  네비게이션 링크를 찾을 수 없음');
    }
  } catch (error) {
    console.log(`  ❌ 네비게이션 테스트 실패: ${error.message}`);
  }
  await navPage.close();

  await browser.close();

  // 4. 결과 요약
  console.log('\n📊 테스트 결과 요약');
  console.log('=' * 50);
  
  const successCount = results.filter(r => r.isSuccess).length;
  const failCount = results.length - successCount;
  
  console.log(`총 페이지: ${results.length}개`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);
  
  if (failCount > 0) {
    console.log('\n실패한 페이지:');
    results.filter(r => !r.isSuccess).forEach(r => {
      console.log(`- ${r.description}: ${r.error || `HTTP ${r.status}`}`);
    });
  }
  
  console.log(`\n📸 스크린샷이 ${screenshotDir} 디렉토리에 저장되었습니다.`);
  
  // 결과를 JSON 파일로 저장
  const resultPath = path.join(__dirname, 'project-status-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
  console.log(`📄 상세 결과가 ${resultPath}에 저장되었습니다.`);
}

// 실행
checkProjectStatus().catch(console.error);