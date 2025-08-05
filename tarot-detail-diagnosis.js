const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function diagnoseTarotDetailPage() {
  console.log('=== 타로카드 상세 페이지 진단 시작 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // 네트워크 요청 모니터링
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    // 페이지 접속
    console.log('1. 페이지 접속 중...');
    const url = 'http://localhost:4000/tarot/major-00-fool';
    
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      console.log('✓ 페이지 접속 성공\n');
    } catch (error) {
      console.log('✗ 페이지 접속 실패:', error.message);
      return;
    }
    
    // 스크린샷 촬영
    console.log('2. 스크린샷 촬영 중...');
    const screenshotPath = path.join(__dirname, 'tarot-detail-diagnosis-screenshot.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`✓ 스크린샷 저장: ${screenshotPath}\n`);
    
    // 페이지 내용 추출
    console.log('3. 페이지 내용 분석 중...');
    
    // 타이틀 확인
    const pageTitle = await page.title();
    console.log(`페이지 타이틀: ${pageTitle}`);
    
    // 주요 요소들의 텍스트 내용 추출
    const pageContent = await page.evaluate(() => {
      const result = {
        title: '',
        mainHeading: '',
        bodyText: [],
        images: [],
        hasErrors: false,
        errorMessages: [],
        structure: {}
      };
      
      // 타이틀
      const h1 = document.querySelector('h1');
      if (h1) result.mainHeading = h1.textContent.trim();
      
      // body 전체 텍스트 (간략히)
      const bodyText = document.body.innerText.trim();
      result.bodyText = bodyText.split('\n').filter(line => line.trim()).slice(0, 20);
      
      // 이미지 확인
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        result.images.push({
          src: img.src,
          alt: img.alt,
          loaded: img.complete && img.naturalWidth > 0,
          displayed: window.getComputedStyle(img).display !== 'none',
          dimensions: `${img.naturalWidth}x${img.naturalHeight}`
        });
      });
      
      // 에러 메시지나 특정 클래스 확인
      const errorElements = document.querySelectorAll('.error, .error-message, [class*="error"]');
      errorElements.forEach(el => {
        result.errorMessages.push(el.textContent.trim());
      });
      
      // HTML 구조 확인
      result.structure = {
        hasMainContainer: !!document.querySelector('main, .main, #main'),
        hasTarotContent: !!document.querySelector('[class*="tarot"], [id*="tarot"]'),
        hasCardImage: !!document.querySelector('[class*="card-image"], [class*="tarot-image"], img[alt*="tarot"], img[alt*="Fool"]'),
        hasDescription: !!document.querySelector('[class*="description"], [class*="meaning"], [class*="content"]'),
        totalElements: document.querySelectorAll('*').length
      };
      
      return result;
    });
    
    console.log('\n=== 페이지 내용 ===');
    console.log('메인 제목:', pageContent.mainHeading || '없음');
    console.log('\n텍스트 내용 (처음 20줄):');
    pageContent.bodyText.forEach((line, i) => {
      console.log(`${i + 1}. ${line}`);
    });
    
    console.log('\n=== 이미지 상태 ===');
    if (pageContent.images.length === 0) {
      console.log('✗ 이미지가 없습니다!');
    } else {
      pageContent.images.forEach((img, i) => {
        console.log(`\n이미지 ${i + 1}:`);
        console.log(`  - URL: ${img.src}`);
        console.log(`  - Alt: ${img.alt || '없음'}`);
        console.log(`  - 로딩 완료: ${img.loaded ? '✓' : '✗'}`);
        console.log(`  - 표시됨: ${img.displayed ? '✓' : '✗'}`);
        console.log(`  - 크기: ${img.dimensions}`);
      });
    }
    
    console.log('\n=== HTML 구조 분석 ===');
    console.log('메인 컨테이너:', pageContent.structure.hasMainContainer ? '✓ 있음' : '✗ 없음');
    console.log('타로 콘텐츠:', pageContent.structure.hasTarotContent ? '✓ 있음' : '✗ 없음');
    console.log('카드 이미지:', pageContent.structure.hasCardImage ? '✓ 있음' : '✗ 없음');
    console.log('설명 섹션:', pageContent.structure.hasDescription ? '✓ 있음' : '✗ 없음');
    console.log('전체 요소 수:', pageContent.structure.totalElements);
    
    // 특정 타로 관련 요소 세부 확인
    const tarotElements = await page.evaluate(() => {
      const elements = {
        cardName: null,
        cardNumber: null,
        cardImage: null,
        upright: null,
        reversed: null,
        symbolism: null,
        overview: null
      };
      
      // 다양한 선택자로 요소 찾기
      const selectors = {
        cardName: ['h1', '.card-name', '.tarot-name', '[class*="title"]'],
        cardNumber: ['.card-number', '.tarot-number', '[class*="number"]'],
        cardImage: ['img[src*="tarot"]', 'img[src*="fool"]', '.card-image img', '.tarot-image img'],
        upright: ['[class*="upright"]', '[class*="정방향"]', '.meaning-upright'],
        reversed: ['[class*="reversed"]', '[class*="역방향"]', '.meaning-reversed'],
        symbolism: ['[class*="symbol"]', '[class*="상징"]', '.symbolism'],
        overview: ['[class*="overview"]', '[class*="개요"]', '.overview', '.description']
      };
      
      for (const [key, selectorList] of Object.entries(selectors)) {
        for (const selector of selectorList) {
          const el = document.querySelector(selector);
          if (el) {
            elements[key] = {
              found: true,
              selector: selector,
              text: el.textContent.trim().substring(0, 100),
              tagName: el.tagName
            };
            break;
          }
        }
        if (!elements[key]) {
          elements[key] = { found: false };
        }
      }
      
      return elements;
    });
    
    console.log('\n=== 타로 카드 요소 상세 분석 ===');
    for (const [key, value] of Object.entries(tarotElements)) {
      if (value.found) {
        console.log(`\n${key}: ✓ 발견됨`);
        console.log(`  - 선택자: ${value.selector}`);
        console.log(`  - 태그: ${value.tagName}`);
        console.log(`  - 내용: ${value.text}...`);
      } else {
        console.log(`\n${key}: ✗ 찾을 수 없음`);
      }
    }
    
    // 콘솔 에러 확인
    console.log('\n=== 콘솔 메시지 ===');
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    
    if (errors.length > 0) {
      console.log(`\n에러 (${errors.length}개):`);
      errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.text}`);
        if (err.location.url) {
          console.log(`   위치: ${err.location.url}:${err.location.lineNumber}`);
        }
      });
    } else {
      console.log('✓ 콘솔 에러 없음');
    }
    
    if (warnings.length > 0) {
      console.log(`\n경고 (${warnings.length}개):`);
      warnings.slice(0, 5).forEach((warn, i) => {
        console.log(`${i + 1}. ${warn.text}`);
      });
    }
    
    // 실패한 네트워크 요청
    console.log('\n=== 네트워크 상태 ===');
    if (failedRequests.length > 0) {
      console.log(`\n실패한 요청 (${failedRequests.length}개):`);
      failedRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
        console.log(`   실패 이유: ${req.failure.errorText}`);
      });
    } else {
      console.log('✓ 모든 네트워크 요청 성공');
    }
    
    // 이미지 요청 분석
    const imageRequests = networkRequests.filter(req => req.resourceType === 'image');
    console.log(`\n이미지 요청 (${imageRequests.length}개):`);
    imageRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.url}`);
    });
    
    // 페이지 소스 일부 추출
    const pageSource = await page.content();
    console.log('\n=== 페이지 소스 (처음 1000자) ===');
    console.log(pageSource.substring(0, 1000));
    console.log('...');
    
    // 진단 결과 요약
    console.log('\n=== 진단 결과 요약 ===');
    const issues = [];
    
    if (!pageContent.mainHeading) issues.push('페이지 제목이 없음');
    if (pageContent.images.length === 0) issues.push('이미지가 전혀 없음');
    if (pageContent.images.some(img => !img.loaded)) issues.push('로딩되지 않은 이미지 있음');
    if (!tarotElements.cardImage.found) issues.push('타로 카드 이미지를 찾을 수 없음');
    if (!tarotElements.upright.found) issues.push('정방향 의미를 찾을 수 없음');
    if (!tarotElements.reversed.found) issues.push('역방향 의미를 찾을 수 없음');
    if (errors.length > 0) issues.push(`콘솔 에러 ${errors.length}개 발생`);
    if (failedRequests.length > 0) issues.push(`네트워크 요청 실패 ${failedRequests.length}개`);
    
    if (issues.length > 0) {
      console.log('\n발견된 문제:');
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    } else {
      console.log('\n✓ 명확한 문제가 발견되지 않았습니다.');
    }
    
    // 진단 보고서 저장
    const report = {
      timestamp: new Date().toISOString(),
      url: url,
      pageTitle: pageTitle,
      mainHeading: pageContent.mainHeading,
      images: pageContent.images,
      structure: pageContent.structure,
      tarotElements: tarotElements,
      consoleErrors: errors,
      failedRequests: failedRequests,
      issues: issues
    };
    
    await fs.writeFile(
      path.join(__dirname, 'tarot-detail-diagnosis-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('\n진단 보고서 저장: tarot-detail-diagnosis-report.json');
    
  } catch (error) {
    console.error('진단 중 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('\n=== 진단 완료 ===');
  }
}

// 실행
diagnoseTarotDetailPage().catch(console.error);