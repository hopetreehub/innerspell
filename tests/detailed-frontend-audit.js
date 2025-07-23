const { chromium } = require('playwright');

(async () => {
  console.log('🎨 상세 프론트엔드 종합 검사 시작\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const issues = [];
  const recommendations = [];
  
  // 데스크톱 테스트
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await desktop.newPage();
  
  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 1. 상세 접근성 검사
    const accessibility = await page.evaluate(() => {
      const issues = [];
      const stats = {
        images: { total: 0, withAlt: 0, missing: [] },
        buttons: { total: 0, withLabel: 0, missing: [] },
        forms: { total: 0, withLabels: 0 },
        headings: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
        links: { total: 0, withText: 0 }
      };
      
      // 이미지 alt 텍스트 검사
      const images = document.querySelectorAll('img');
      stats.images.total = images.length;
      images.forEach(img => {
        if (img.alt) {
          stats.images.withAlt++;
        } else {
          stats.images.missing.push(img.src.split('/').pop());
        }
      });
      
      // 버튼 접근성 검사
      const buttons = document.querySelectorAll('button');
      stats.buttons.total = buttons.length;
      buttons.forEach(btn => {
        if (btn.textContent.trim() || btn.getAttribute('aria-label')) {
          stats.buttons.withLabel++;
        } else {
          stats.buttons.missing.push(btn.className || 'unnamed');
        }
      });
      
      // 폼 레이블 검사
      const forms = document.querySelectorAll('form');
      stats.forms.total = forms.length;
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        const hasLabels = Array.from(inputs).every(input => {
          const id = input.id;
          return id && document.querySelector(`label[for="${id}"]`);
        });
        if (hasLabels) stats.forms.withLabels++;
      });
      
      // 제목 구조 검사
      for (let i = 1; i <= 6; i++) {
        stats.headings[`h${i}`] = document.querySelectorAll(`h${i}`).length;
      }
      
      // 링크 검사
      const links = document.querySelectorAll('a');
      stats.links.total = links.length;
      links.forEach(link => {
        if (link.textContent.trim() || link.getAttribute('aria-label')) {
          stats.links.withText++;
        }
      });
      
      // 색상 대비 검사
      const darkMode = document.documentElement.classList.contains('dark');
      
      return { issues, stats, darkMode };
    });
    
    console.log('🔍 상세 접근성 검사:');
    console.log(`  다크모드: ${accessibility.darkMode ? '활성' : '비활성'}`);
    console.log(`\n  이미지 (${accessibility.stats.images.total}개):`);
    console.log(`    - Alt 텍스트 있음: ${accessibility.stats.images.withAlt}개`);
    console.log(`    - Alt 텍스트 없음: ${accessibility.stats.images.total - accessibility.stats.images.withAlt}개`);
    if (accessibility.stats.images.missing.length > 0) {
      console.log(`    - 누락된 파일: ${accessibility.stats.images.missing.join(', ')}`);
      issues.push(`Alt 텍스트 누락: ${accessibility.stats.images.missing.length}개 이미지`);
    }
    
    console.log(`\n  버튼 (${accessibility.stats.buttons.total}개):`);
    console.log(`    - 레이블 있음: ${accessibility.stats.buttons.withLabel}개`);
    console.log(`    - 레이블 없음: ${accessibility.stats.buttons.total - accessibility.stats.buttons.withLabel}개`);
    
    console.log(`\n  제목 구조:`);
    Object.entries(accessibility.stats.headings).forEach(([level, count]) => {
      if (count > 0) console.log(`    - ${level.toUpperCase()}: ${count}개`);
    });
    
    console.log(`\n  링크 (${accessibility.stats.links.total}개):`);
    console.log(`    - 텍스트/레이블 있음: ${accessibility.stats.links.withText}개`);
    
    // 2. 반응형 디자인 테스트
    console.log('\n📱 반응형 디자인 테스트:');
    
    const breakpoints = [
      { name: '모바일', width: 375, height: 667 },
      { name: '태블릿', width: 768, height: 1024 },
      { name: '데스크톱', width: 1920, height: 1080 }
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.waitForTimeout(500);
      
      const layoutInfo = await page.evaluate(() => {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        const mobileMenu = document.querySelector('[aria-label*="메뉴"], button[class*="menu"]');
        const content = document.querySelector('main');
        
        return {
          headerHeight: header?.offsetHeight || 0,
          navVisible: nav && window.getComputedStyle(nav).display !== 'none',
          mobileMenuVisible: mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none',
          contentWidth: content?.offsetWidth || 0,
          scrollBarVisible: document.documentElement.scrollHeight > window.innerHeight
        };
      });
      
      console.log(`  ${breakpoint.name} (${breakpoint.width}px):`);
      console.log(`    - 헤더 높이: ${layoutInfo.headerHeight}px`);
      console.log(`    - 네비게이션 표시: ${layoutInfo.navVisible ? '✅' : '❌'}`);
      console.log(`    - 모바일 메뉴: ${layoutInfo.mobileMenuVisible ? '✅' : '❌'}`);
      console.log(`    - 콘텐츠 너비: ${layoutInfo.contentWidth}px`);
      console.log(`    - 스크롤바: ${layoutInfo.scrollBarVisible ? '있음' : '없음'}`);
      
      if (breakpoint.name === '모바일' && !layoutInfo.mobileMenuVisible) {
        recommendations.push('모바일 뷰에서 햄버거 메뉴가 표시되지 않습니다.');
      }
    }
    
    // 3. 성능 최적화 검사
    console.log('\n⚡ 성능 최적화 검사:');
    
    const performance = await page.evaluate(() => {
      const resources = window.performance.getEntriesByType('resource');
      const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp)/i));
      const scripts = resources.filter(r => r.name.match(/\.js$/i));
      const styles = resources.filter(r => r.name.match(/\.css$/i));
      
      const largeImages = images.filter(img => img.transferSize > 100000); // 100KB 이상
      const largeScripts = scripts.filter(script => script.transferSize > 50000); // 50KB 이상
      
      return {
        totalResources: resources.length,
        images: {
          count: images.length,
          totalSize: images.reduce((sum, img) => sum + img.transferSize, 0),
          large: largeImages.map(img => ({
            name: img.name.split('/').pop(),
            size: Math.round(img.transferSize / 1024)
          }))
        },
        scripts: {
          count: scripts.length,
          totalSize: scripts.reduce((sum, script) => sum + script.transferSize, 0),
          large: largeScripts.map(script => ({
            name: script.name.split('/').pop(),
            size: Math.round(script.transferSize / 1024)
          }))
        },
        styles: {
          count: styles.length,
          totalSize: styles.reduce((sum, style) => sum + style.transferSize, 0)
        }
      };
    });
    
    console.log(`  총 리소스: ${performance.totalResources}개`);
    console.log(`  이미지: ${performance.images.count}개 (${Math.round(performance.images.totalSize / 1024)}KB)`);
    if (performance.images.large.length > 0) {
      console.log('    큰 이미지 파일:');
      performance.images.large.forEach(img => {
        console.log(`      - ${img.name}: ${img.size}KB`);
      });
      recommendations.push(`${performance.images.large.length}개의 큰 이미지 파일을 최적화하세요.`);
    }
    
    console.log(`  스크립트: ${performance.scripts.count}개 (${Math.round(performance.scripts.totalSize / 1024)}KB)`);
    console.log(`  스타일시트: ${performance.styles.count}개 (${Math.round(performance.styles.totalSize / 1024)}KB)`);
    
    // 4. SEO 기본 검사
    console.log('\n🔎 SEO 기본 검사:');
    
    const seo = await page.evaluate(() => {
      const title = document.querySelector('title')?.textContent || '';
      const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
      const h1 = document.querySelector('h1')?.textContent || '';
      const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
      const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
      
      return { title, metaDescription, h1, canonical, ogImage };
    });
    
    console.log(`  페이지 제목: ${seo.title ? '✅' : '❌'} ${seo.title}`);
    console.log(`  메타 설명: ${seo.metaDescription ? '✅' : '❌'} ${seo.metaDescription.substring(0, 50)}...`);
    console.log(`  H1 제목: ${seo.h1 ? '✅' : '❌'} ${seo.h1}`);
    console.log(`  Canonical URL: ${seo.canonical ? '✅' : '❌'}`);
    console.log(`  OG 이미지: ${seo.ogImage ? '✅' : '❌'}`);
    
    // 최종 결과
    console.log('\n📊 검사 요약:');
    console.log(`  발견된 이슈: ${issues.length}개`);
    console.log(`  개선 권장사항: ${recommendations.length}개`);
    
    if (issues.length > 0) {
      console.log('\n❗ 이슈:');
      issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 권장사항:');
      recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    }
    
    if (issues.length === 0 && recommendations.length === 0) {
      console.log('\n✅ 모든 검사를 통과했습니다!');
    }
    
    // 스크린샷 저장
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({
      path: 'tests/screenshots/detailed-audit-desktop.png',
      fullPage: true
    });
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ 검사 중 오류:', error.message);
    await browser.close();
  }
})();