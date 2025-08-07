const { chromium } = require('playwright');
const fs = require('fs');

async function analyzePerformance() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const results = {
        timestamp: new Date().toISOString(),
        pages: {}
    };

    const pages = [
        { name: 'home', url: 'http://localhost:4000' },
        { name: 'blog', url: 'http://localhost:4000/blog' },
        { name: 'tarot', url: 'http://localhost:4000/tarot' },
        { name: 'dream', url: 'http://localhost:4000/dream' },
        { name: 'admin', url: 'http://localhost:4000/admin' }
    ];

    for (const pageInfo of pages) {
        console.log(`\n📊 분석 중: ${pageInfo.name} (${pageInfo.url})`);
        
        // Performance metrics 수집을 위한 CDP 활성화
        const cdpSession = await context.newCDPSession(page);
        await cdpSession.send('Performance.enable');

        const startTime = Date.now();
        
        try {
            // 네트워크 이벤트 리스너 설정
            const networkRequests = [];
            page.on('request', request => {
                networkRequests.push({
                    url: request.url(),
                    method: request.method(),
                    resourceType: request.resourceType()
                });
            });

            const responseData = [];
            page.on('response', response => {
                responseData.push({
                    url: response.url(),
                    status: response.status(),
                    contentLength: response.headers()['content-length'] || 'unknown'
                });
            });

            // 콘솔 메시지 수집
            const consoleMessages = [];
            page.on('console', msg => {
                consoleMessages.push({
                    type: msg.type(),
                    text: msg.text()
                });
            });

            // 페이지 로드
            await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
            const loadTime = Date.now() - startTime;

            // 스크린샷 촬영
            const screenshotPath = `/mnt/e/project/test-studio-firebase/performance-screenshots/${pageInfo.name}-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });

            // Performance metrics 수집
            const metrics = await cdpSession.send('Performance.getMetrics');
            
            // Web Vitals 측정
            const webVitals = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const vitals = {};
                    
                    // FCP 측정
                    new PerformanceObserver((entryList) => {
                        const entries = entryList.getEntries();
                        entries.forEach((entry) => {
                            if (entry.name === 'first-contentful-paint') {
                                vitals.fcp = entry.startTime;
                            }
                        });
                    }).observe({ entryTypes: ['paint'] });

                    // LCP 측정
                    new PerformanceObserver((entryList) => {
                        const entries = entryList.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        vitals.lcp = lastEntry.startTime;
                    }).observe({ entryTypes: ['largest-contentful-paint'] });

                    // CLS 측정
                    let clsValue = 0;
                    new PerformanceObserver((entryList) => {
                        for (const entry of entryList.getEntries()) {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        }
                        vitals.cls = clsValue;
                    }).observe({ entryTypes: ['layout-shift'] });

                    // 1초 후 결과 반환
                    setTimeout(() => {
                        resolve(vitals);
                    }, 1000);
                });
            });

            // Network 탭 정보 수집
            const performanceEntries = await page.evaluate(() => {
                const entries = performance.getEntriesByType('navigation')[0];
                return {
                    domContentLoaded: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
                    loadComplete: entries.loadEventEnd - entries.loadEventStart,
                    totalTime: entries.loadEventEnd - entries.fetchStart
                };
            });

            // 리소스 크기 계산
            const resourceSizes = await page.evaluate(() => {
                const resources = performance.getEntriesByType('resource');
                const sizes = {
                    javascript: 0,
                    css: 0,
                    image: 0,
                    total: 0
                };
                
                resources.forEach(resource => {
                    const size = resource.encodedBodySize || resource.transferSize || 0;
                    sizes.total += size;
                    
                    if (resource.name.includes('.js')) sizes.javascript += size;
                    else if (resource.name.includes('.css')) sizes.css += size;
                    else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) sizes.image += size;
                });
                
                return sizes;
            });

            results.pages[pageInfo.name] = {
                url: pageInfo.url,
                loadTime: loadTime,
                screenshot: screenshotPath,
                networkRequests: networkRequests.length,
                responseData: responseData,
                consoleMessages: consoleMessages,
                webVitals: webVitals,
                performanceEntries: performanceEntries,
                resourceSizes: resourceSizes,
                cdpMetrics: metrics.metrics
            };

            console.log(`✅ ${pageInfo.name} 분석 완료 (${loadTime}ms)`);
            console.log(`   - 네트워크 요청: ${networkRequests.length}개`);
            console.log(`   - 총 다운로드: ${Math.round(resourceSizes.total / 1024)}KB`);
            console.log(`   - JS: ${Math.round(resourceSizes.javascript / 1024)}KB`);
            console.log(`   - CSS: ${Math.round(resourceSizes.css / 1024)}KB`);
            console.log(`   - Images: ${Math.round(resourceSizes.image / 1024)}KB`);
            console.log(`   - FCP: ${webVitals.fcp ? webVitals.fcp.toFixed(2) + 'ms' : 'N/A'}`);
            console.log(`   - LCP: ${webVitals.lcp ? webVitals.lcp.toFixed(2) + 'ms' : 'N/A'}`);
            console.log(`   - CLS: ${webVitals.cls ? webVitals.cls.toFixed(4) : 'N/A'}`);
            
        } catch (error) {
            console.error(`❌ ${pageInfo.name} 분석 실패:`, error.message);
            results.pages[pageInfo.name] = {
                url: pageInfo.url,
                error: error.message
            };
        }

        // 페이지 간 2초 대기
        await page.waitForTimeout(2000);
    }

    // 결과를 JSON 파일로 저장
    fs.writeFileSync(
        '/mnt/e/project/test-studio-firebase/performance-results.json',
        JSON.stringify(results, null, 2)
    );

    await browser.close();
    console.log('\n🎉 성능 분석 완료! 결과는 performance-results.json에 저장되었습니다.');
}

analyzePerformance().catch(console.error);