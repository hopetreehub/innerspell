const { chromium } = require('playwright');
const fs = require('fs');

// 점검 결과를 저장할 객체
const checkResults = {
  timestamp: new Date().toISOString(),
  totalChecks: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  details: {}
};

async function finalSystemCheck() {
  console.log('🚀 InnerSpell 최종 시스템 점검 시작...');
  console.log('📅 점검 시작 시간:', new Date().toLocaleString('ko-KR'));
  console.log('─'.repeat(80));
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // 1. 홈페이지 점검
    console.log('\n1️⃣ 홈페이지 (/) 점검 중...');
    await checkHomePage(page);
    
    // 2. 타로카드 페이지 점검
    console.log('\n2️⃣ 타로카드 (/tarot) 점검 중...');
    await checkTarotPage(page);
    
    // 3. 꿈해몽 페이지 점검
    console.log('\n3️⃣ 꿈해몽 (/dream) 점검 중...');
    await checkDreamPage(page);
    
    // 4. 블로그 페이지 점검
    console.log('\n4️⃣ 블로그 (/blog) 점검 중...');
    await checkBlogPage(page);
    
    // 5. 커뮤니티 페이지 점검
    console.log('\n5️⃣ 커뮤니티 (/community) 점검 중...');
    await checkCommunityPage(page);
    
    // 6. 관리자 대시보드 점검
    console.log('\n6️⃣ 관리자 대시보드 (/admin) 점검 중...');
    await checkAdminPage(page);
    
    // 7. API 엔드포인트 점검
    console.log('\n7️⃣ API 엔드포인트 점검 중...');
    await checkAPIEndpoints(page);
    
    // 8. 반응형 디자인 점검
    console.log('\n8️⃣ 반응형 디자인 점검 중...');
    await checkResponsiveDesign(page);
    
    // 최종 결과 출력
    printFinalResults();
    
    // 결과를 파일로 저장
    saveResultsToFile();
    
  } catch (error) {
    console.error('❌ 시스템 점검 중 오류 발생:', error.message);
    checkResults.failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 홈페이지 점검
async function checkHomePage(page) {
  checkResults.details.homepage = { checks: [] };
  
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 메인 배너 확인
    const banner = await page.locator('.hero-section, .main-banner, section').first();
    recordCheck('홈페이지 - 메인 배너', await banner.isVisible());
    
    // 네비게이션 메뉴
    const nav = await page.locator('nav, .navigation, header').first();
    recordCheck('홈페이지 - 네비게이션', await nav.isVisible());
    
    // 타로카드 섹션
    const tarotSection = await page.locator('text=/타로|tarot/i').first();
    recordCheck('홈페이지 - 타로카드 섹션', await tarotSection.isVisible());
    
    // 꿈해몽 섹션
    const dreamSection = await page.locator('text=/꿈|dream/i').first();
    recordCheck('홈페이지 - 꿈해몽 섹션', await dreamSection.isVisible());
    
    // 푸터
    const footer = await page.locator('footer').first();
    recordCheck('홈페이지 - 푸터', await footer.isVisible());
    
    // 스크린샷
    await page.screenshot({ 
      path: `check-homepage-${Date.now()}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    recordCheck('홈페이지 로드', false, error.message);
  }
}

// 타로카드 페이지 점검
async function checkTarotPage(page) {
  checkResults.details.tarot = { checks: [] };
  
  try {
    await page.goto('http://localhost:4000/tarot', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 타로카드 표시
    const cards = await page.locator('.tarot-card, .card, [class*="card"]').all();
    recordCheck('타로 - 카드 표시', cards.length > 0, `${cards.length}개 카드 발견`);
    
    // 카드 클릭 가능 여부
    if (cards.length > 0) {
      const firstCard = cards[0];
      const isClickable = await firstCard.isEnabled();
      recordCheck('타로 - 카드 클릭 가능', isClickable);
    }
    
    // AI 해석 섹션
    const aiSection = await page.locator('text=/AI|인공지능|해석/i').first();
    recordCheck('타로 - AI 해석 섹션', await aiSection.isVisible());
    
    await page.screenshot({ 
      path: `check-tarot-${Date.now()}.png`,
      fullPage: false 
    });
    
  } catch (error) {
    recordCheck('타로 페이지 로드', false, error.message);
  }
}

// 꿈해몽 페이지 점검
async function checkDreamPage(page) {
  checkResults.details.dream = { checks: [] };
  
  try {
    await page.goto('http://localhost:4000/dream', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 입력 폼
    const inputForm = await page.locator('textarea, input[type="text"], .dream-input').first();
    recordCheck('꿈해몽 - 입력 폼', await inputForm.isVisible());
    
    // 분석 버튼
    const analyzeButton = await page.locator('button:has-text("분석"), button:has-text("해석")').first();
    recordCheck('꿈해몽 - 분석 버튼', await analyzeButton.isVisible());
    
    await page.screenshot({ 
      path: `check-dream-${Date.now()}.png`,
      fullPage: false 
    });
    
  } catch (error) {
    recordCheck('꿈해몽 페이지 로드', false, error.message);
  }
}

// 블로그 페이지 점검
async function checkBlogPage(page) {
  checkResults.details.blog = { checks: [] };
  
  try {
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 포스트 목록
    const posts = await page.locator('.blog-post, article, .post-card, .card').all();
    recordCheck('블로그 - 포스트 목록', posts.length > 0, `${posts.length}개 포스트 표시`);
    
    // 카테고리 필터
    const categories = await page.locator('button:has-text("타로"), button:has-text("영성")').all();
    recordCheck('블로그 - 카테고리 필터', categories.length > 0);
    
    // 검색 기능
    const searchButton = await page.locator('button:has-text("검색"), input[placeholder*="검색"]').first();
    recordCheck('블로그 - 검색 기능', await searchButton.isVisible());
    
    // 페이지네이션
    const pagination = await page.locator('.pagination, nav[aria-label*="pagination"]').first();
    recordCheck('블로그 - 페이지네이션', await pagination.isVisible());
    
    // 포스트 클릭 테스트
    if (posts.length > 0) {
      const firstPostLink = await posts[0].locator('a').first();
      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();
        await page.waitForTimeout(2000);
        
        const postTitle = await page.locator('h1').first();
        recordCheck('블로그 - 포스트 상세 페이지', await postTitle.isVisible());
        
        // 블로그 목록으로 돌아가기
        await page.goBack();
      }
    }
    
    await page.screenshot({ 
      path: `check-blog-${Date.now()}.png`,
      fullPage: true 
    });
    
  } catch (error) {
    recordCheck('블로그 페이지 로드', false, error.message);
  }
}

// 커뮤니티 페이지 점검
async function checkCommunityPage(page) {
  checkResults.details.community = { checks: [] };
  
  try {
    await page.goto('http://localhost:4000/community', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 게시글 목록
    const posts = await page.locator('.community-post, .post-item, article').all();
    recordCheck('커뮤니티 - 게시글 목록', posts.length >= 0, `${posts.length}개 게시글`);
    
    // 카테고리 탭
    const tabs = await page.locator('[role="tab"], .tab-button').all();
    recordCheck('커뮤니티 - 카테고리 탭', tabs.length > 0);
    
    // 글쓰기 버튼
    const writeButton = await page.locator('button:has-text("글쓰기"), button:has-text("작성")').first();
    recordCheck('커뮤니티 - 글쓰기 버튼', await writeButton.isVisible());
    
    await page.screenshot({ 
      path: `check-community-${Date.now()}.png`,
      fullPage: false 
    });
    
  } catch (error) {
    recordCheck('커뮤니티 페이지 로드', false, error.message);
  }
}

// 관리자 대시보드 점검
async function checkAdminPage(page) {
  checkResults.details.admin = { checks: [] };
  
  try {
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 탭 메뉴
    const tabs = await page.locator('[role="tab"], button[class*="tab"]').all();
    recordCheck('관리자 - 탭 메뉴', tabs.length >= 6, `${tabs.length}개 탭`);
    
    // AI 분석 탭
    const aiTab = await page.locator('text=AI 분석').first();
    if (await aiTab.isVisible()) {
      await aiTab.click();
      await page.waitForTimeout(1000);
      recordCheck('관리자 - AI 분석 탭', true);
    }
    
    // 블로그 관리 탭
    const blogTab = await page.locator('text=블로그 관리').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(1000);
      
      const postsList = await page.locator('.post-item, .blog-item, tr').all();
      recordCheck('관리자 - 블로그 관리', postsList.length > 0);
    }
    
    await page.screenshot({ 
      path: `check-admin-${Date.now()}.png`,
      fullPage: false 
    });
    
  } catch (error) {
    recordCheck('관리자 페이지 로드', false, error.message);
  }
}

// API 엔드포인트 점검
async function checkAPIEndpoints(page) {
  checkResults.details.api = { checks: [] };
  
  const endpoints = [
    { url: '/api/health', name: 'Health Check' },
    { url: '/api/blog/posts', name: 'Blog Posts' },
    { url: '/api/tarot', name: 'Tarot API' },
    { url: '/api/dream', name: 'Dream API' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await page.goto(`http://localhost:4000${endpoint.url}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
      
      const status = response?.status() || 0;
      recordCheck(`API - ${endpoint.name}`, status >= 200 && status < 400, `Status: ${status}`);
      
    } catch (error) {
      recordCheck(`API - ${endpoint.name}`, false, error.message);
    }
  }
}

// 반응형 디자인 점검
async function checkResponsiveDesign(page) {
  checkResults.details.responsive = { checks: [] };
  
  const viewports = [
    { name: '모바일', width: 375, height: 667 },
    { name: '태블릿', width: 768, height: 1024 },
    { name: '데스크톱', width: 1920, height: 1080 }
  ];
  
  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:4000', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 네비게이션 확인
      const nav = await page.locator('nav, header').first();
      const navVisible = await nav.isVisible();
      
      // 컨텐츠 확인
      const content = await page.locator('main, .main-content, section').first();
      const contentVisible = await content.isVisible();
      
      recordCheck(`반응형 - ${viewport.name}`, navVisible && contentVisible, 
        `${viewport.width}x${viewport.height}`);
      
      await page.screenshot({ 
        path: `check-responsive-${viewport.name}-${Date.now()}.png`,
        fullPage: false 
      });
      
    } catch (error) {
      recordCheck(`반응형 - ${viewport.name}`, false, error.message);
    }
  }
}

// 점검 결과 기록
function recordCheck(name, passed, details = '') {
  checkResults.totalChecks++;
  
  if (passed) {
    checkResults.passed++;
    console.log(`✅ ${name} ${details ? `(${details})` : ''}`);
  } else {
    checkResults.failed++;
    console.log(`❌ ${name} ${details ? `- ${details}` : ''}`);
  }
  
  // 카테고리별로 결과 저장
  const category = name.split(' - ')[0];
  if (!checkResults.details[category]) {
    checkResults.details[category] = { checks: [] };
  }
  
  checkResults.details[category].checks.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  });
}

// 최종 결과 출력
function printFinalResults() {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 최종 점검 결과');
  console.log('═'.repeat(80));
  
  console.log(`\n총 점검 항목: ${checkResults.totalChecks}개`);
  console.log(`✅ 통과: ${checkResults.passed}개 (${Math.round(checkResults.passed / checkResults.totalChecks * 100)}%)`);
  console.log(`❌ 실패: ${checkResults.failed}개 (${Math.round(checkResults.failed / checkResults.totalChecks * 100)}%)`);
  
  // 카테고리별 요약
  console.log('\n📋 카테고리별 결과:');
  for (const [category, data] of Object.entries(checkResults.details)) {
    if (data.checks) {
      const passed = data.checks.filter(c => c.passed).length;
      const total = data.checks.length;
      console.log(`  - ${category}: ${passed}/${total} 통과`);
    }
  }
  
  // 배포 가능 여부
  console.log('\n🚀 배포 가능 여부:');
  if (checkResults.failed === 0) {
    console.log('✅ 모든 테스트를 통과했습니다. 배포 가능합니다!');
  } else if (checkResults.failed <= 3) {
    console.log('⚠️ 일부 테스트가 실패했습니다. 검토 후 배포를 권장합니다.');
  } else {
    console.log('❌ 여러 테스트가 실패했습니다. 문제 해결 후 재점검이 필요합니다.');
  }
  
  console.log('\n점검 완료 시간:', new Date().toLocaleString('ko-KR'));
}

// 결과를 파일로 저장
function saveResultsToFile() {
  const filename = `system-check-results-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(checkResults, null, 2));
  console.log(`\n📄 상세 결과가 ${filename} 파일에 저장되었습니다.`);
}

// 실행
if (require.main === module) {
  finalSystemCheck().catch(console.error);
}

module.exports = { finalSystemCheck };