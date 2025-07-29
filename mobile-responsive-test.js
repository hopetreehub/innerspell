const { chromium } = require('playwright');

async function testMobileResponsive() {
    console.log('📱 모바일 반응형 및 접근성 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 800
    });
    
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    
    // 다양한 디바이스 사이즈 테스트
    const devices = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 }
    ];
    
    for (const device of devices) {
        console.log(`\n📐 ${device.name} 뷰 테스트 (${device.width}x${device.height})`);
        
        const context = await browser.newContext({
            viewport: { width: device.width, height: device.height },
            userAgent: device.name === 'mobile' ? 
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' :
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        const page = await context.newPage();
        
        try {
            // 메인 페이지
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: `screenshots/responsive-${device.name}-main.png`, 
                fullPage: true 
            });
            console.log(`✅ ${device.name} 메인 페이지 스크린샷 저장됨`);
            
            // 네비게이션 접근성 확인
            if (device.name === 'mobile') {
                const mobileMenuSelectors = [
                    '[aria-label*="menu"]',
                    '.mobile-menu',
                    '.hamburger',
                    'button[class*="mobile"]',
                    '[data-mobile-menu]'
                ];
                
                let menuFound = false;
                for (const selector of mobileMenuSelectors) {
                    const menuBtn = page.locator(selector).first();
                    if (await menuBtn.count() > 0) {
                        console.log(`📱 모바일 메뉴 버튼 발견: ${selector}`);
                        await menuBtn.click();
                        await page.waitForTimeout(1000);
                        await page.screenshot({ 
                            path: `screenshots/responsive-${device.name}-menu-open.png`, 
                            fullPage: true 
                        });
                        menuFound = true;
                        break;
                    }
                }
                
                if (!menuFound) {
                    console.log('❌ 모바일 메뉴 버튼을 찾을 수 없음');
                }
            }
            
            // 타로 리딩 페이지 테스트
            const tarotSelectors = [
                'a[href*="tarot"]',
                'a:has-text("타로")',
                'a:has-text("Tarot")',
                '.tarot-link'
            ];
            
            for (const selector of tarotSelectors) {
                const tarotLink = page.locator(selector).first();
                if (await tarotLink.count() > 0) {
                    await tarotLink.click();
                    await page.waitForTimeout(2000);
                    await page.screenshot({ 
                        path: `screenshots/responsive-${device.name}-tarot.png`, 
                        fullPage: true 
                    });
                    console.log(`✅ ${device.name} 타로 페이지 접근 성공`);
                    break;
                }
            }
            
            // 터치 영역 크기 확인 (모바일)
            if (device.name === 'mobile') {
                const buttons = await page.locator('button, a[class*="btn"], .btn').all();
                console.log(`📱 터치 가능한 요소 개수: ${buttons.length}개`);
                
                // 터치 영역이 충분한지 확인 (최소 44px)
                for (let i = 0; i < Math.min(buttons.length, 3); i++) {
                    const box = await buttons[i].boundingBox();
                    if (box) {
                        const isTouchFriendly = box.width >= 44 && box.height >= 44;
                        console.log(`🔘 버튼 ${i+1}: ${box.width}x${box.height}px ${isTouchFriendly ? '✅' : '❌'}`);
                    }
                }
            }
            
        } catch (error) {
            console.error(`❌ ${device.name} 테스트 중 오류:`, error.message);
            await page.screenshot({ 
                path: `screenshots/responsive-${device.name}-error.png`, 
                fullPage: true 
            });
        } finally {
            await context.close();
        }
    }
    
    // 접근성 테스트
    console.log('\n♿ 접근성 테스트 시작...');
    const accessibilityContext = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    
    const accessibilityPage = await accessibilityContext.newPage();
    
    try {
        await accessibilityPage.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await accessibilityPage.waitForTimeout(2000);
        
        // 키보드 네비게이션 테스트
        console.log('⌨️ 키보드 네비게이션 테스트...');
        for (let i = 0; i < 5; i++) {
            await accessibilityPage.keyboard.press('Tab');
            await accessibilityPage.waitForTimeout(300);
        }
        
        await accessibilityPage.screenshot({ 
            path: 'screenshots/accessibility-keyboard-nav.png', 
            fullPage: true 
        });
        console.log('✅ 키보드 네비게이션 스크린샷 저장됨');
        
        // alt 속성 확인
        const images = await accessibilityPage.locator('img').all();
        let imagesWithoutAlt = 0;
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            if (!alt || alt.trim() === '') {
                imagesWithoutAlt++;
            }
        }
        console.log(`🖼️ 이미지 총 ${images.length}개 중 alt 없음: ${imagesWithoutAlt}개`);
        
        // 색상 대비 체크 (기본적인 체크)
        const darkElements = await accessibilityPage.locator('[class*="dark"], [style*="background: black"], [style*="background:#000"]').count();
        console.log(`🎨 다크 테마 요소: ${darkElements}개`);
        
    } catch (error) {
        console.error('❌ 접근성 테스트 중 오류:', error.message);
    } finally {
        await accessibilityContext.close();
    }
    
    await browser.close();
    console.log('\n🎯 모바일 반응형 및 접근성 테스트 완료!');
}

testMobileResponsive().catch(console.error);