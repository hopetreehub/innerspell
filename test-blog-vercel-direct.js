const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogOnVercel() {
  console.log('🌐 Vercel 블로그 페이지 Chromium 테스트 시작...');
  
  let browser;
  let context;
  let page;
  
  try {
    // Chromium 브라우저 실행
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // 네트워크 로그 캐치
    const networkLogs = [];
    page.on('response', response => {
      if (response.url().includes('/api/blog/posts')) {
        networkLogs.push({
          url: response.url(),
          status: response.status(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 콘솔 로그 캐치
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Vercel 블로그 페이지 접속
    const vercelUrl = 'https://test-studio-firebase.vercel.app/blog';
    console.log(`📡 URL 접속: ${vercelUrl}`);
    
    const response = await page.goto(vercelUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log(`📊 페이지 응답 상태: ${response.status()}`);
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📋 페이지 제목: ${title}`);
    
    // 블로그 포스트 요소들 찾기
    console.log('🔍 블로그 포스트 요소 검색 중...');
    
    const blogPosts = await page.$$('[data-testid="blog-post"], .grid article, .blog-post, article');
    console.log(`📝 발견된 블로그 포스트 요소 수: ${blogPosts.length}`);
    
    // 블로그 포스트 제목들 수집
    const postTitles = [];
    for (let i = 0; i < Math.min(blogPosts.length, 10); i++) {
      try {
        const titleElement = await blogPosts[i].$('h1, h2, h3, .title, [class*="title"]');
        if (titleElement) {
          const title = await titleElement.textContent();
          if (title && title.trim()) {
            postTitles.push(title.trim());
          }
        }
      } catch (e) {
        // 개별 포스트 제목 추출 실패 시 무시
      }
    }
    
    console.log(`📋 추출된 블로그 포스트 제목들:`);
    postTitles.forEach((title, index) => {
      console.log(`  ${index + 1}. ${title}`);
    });
    
    // 새로 추가한 포스트들 확인
    const expectedNewPosts = [
      '타로 카드로 알아보는 2025년 새해 운세와 목표 설정법',
      'AI 타로 리딩의 정확도와 전통 타로의 차이점 완벽 가이드',
      '꿈해몽 완벽 가이드',
      '타로 카드 78장 완벽 해설',
      '현대인을 위한 영적 성장과 내면 탐구의 실용적 방법론'
    ];
    
    console.log(`🆕 새 포스트 확인:`);
    expectedNewPosts.forEach(expectedTitle => {
      const found = postTitles.some(actualTitle => 
        actualTitle.includes(expectedTitle.substring(0, 20)) || 
        expectedTitle.includes(actualTitle.substring(0, 20))
      );
      console.log(`  ${found ? '✅' : '❌'} ${expectedTitle}`);
    });
    
    // 스크린샷 촬영
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `blog-vercel-test-${timestamp}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`📸 스크린샷 저장됨: ${screenshotPath}`);
    
    // 네트워크 로그 출력
    console.log(`🌐 네트워크 로그:`);
    networkLogs.forEach(log => {
      console.log(`  ${log.timestamp}: ${log.url} - ${log.status}`);
    });
    
    // 콘솔 로그 출력 (에러만)
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    if (errorLogs.length > 0) {
      console.log(`❌ 콘솔 에러 로그:`);
      errorLogs.forEach(log => {
        console.log(`  ${log.timestamp}: ${log.text}`);
      });
    }
    
    // API 직접 테스트
    console.log('🔍 API 직접 테스트...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/blog/posts');
        const data = await response.json();
        return {
          status: response.status,
          posts: data.posts || [],
          postsCount: (data.posts || []).length
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`📊 API 응답:`, apiResponse);
    
    if (apiResponse.posts && apiResponse.posts.length > 0) {
      console.log(`📝 API에서 받은 포스트 제목들:`);
      apiResponse.posts.slice(0, 5).forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title} (ID: ${post.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// 테스트 실행
testBlogOnVercel();