const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔧 직접 블로그 API 테스트 시작...\n');
  
  try {
    // 1. 로그인 먼저
    console.log('1️⃣ 관리자 로그인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    const devButton = await page.$('button:has-text("관리자로 로그인")');
    if (devButton) {
      await devButton.click();
      await page.waitForTimeout(5000);
    }
    
    // 2. 직접 API로 블로그 글 생성
    console.log('2️⃣ API로 직접 블로그 글 생성...');
    
    const blogData = {
      title: '테스트 블로그 글 - API 직접 호출',
      slug: 'test-blog-api-direct',
      excerpt: '이것은 API를 직접 호출해서 만든 테스트 블로그 글입니다.',
      content: `# 테스트 블로그 글

이 글은 API를 직접 호출해서 생성된 테스트 글입니다.

## 목적
- API 호출이 정상적으로 작동하는지 확인
- 블로그 저장 기능 검증
- Firebase 연동 상태 확인

## 내용
이것은 테스트를 위한 내용입니다. 실제 저장이 되는지 확인하겠습니다.`,
      category: '테스트',
      tags: ['테스트', 'API', '직접호출'],
      published: true
    };
    
    // API 호출
    const response = await page.evaluate(async (data) => {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      return {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        headers: Object.fromEntries(response.headers.entries())
      };
    }, blogData);
    
    console.log('📡 API 응답:', response);
    
    // 3. 결과 확인
    if (response.status === 200 || response.status === 201) {
      console.log('✅ API 호출 성공!');
      
      // 저장된 글 확인
      await page.waitForTimeout(2000);
      await page.goto('http://localhost:4000/api/blog/posts');
      const apiCheck = await page.textContent('body');
      console.log('📋 저장 확인:', apiCheck);
      
      // 관리자 페이지에서도 확인
      await page.goto('http://localhost:4000/admin');
      await page.waitForLoadState('networkidle');
      
      const blogTab = await page.$('button[role="tab"]:has-text("블로그 관리")');
      if (blogTab) {
        await blogTab.click();
        await page.waitForTimeout(2000);
      }
      
      await page.screenshot({ path: 'test-blog-api-result.png', fullPage: true });
      console.log('📸 결과 스크린샷 저장됨');
      
    } else {
      console.log('❌ API 호출 실패');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'test-blog-api-error.png', fullPage: true });
  } finally {
    console.log('\n브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();