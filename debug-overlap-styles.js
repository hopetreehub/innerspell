const { chromium } = require('playwright');

async function debugOverlapStyles() {
    console.log('🐛 Debugging overlap styles application...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    const context = await browser.newContext({ viewport: { width: 1400, height: 800 } });
    const page = await context.newPage();
    
    try {
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        
        // Setup reading
        const textarea = page.locator('textarea').first();
        await textarea.fill('Debug test for overlap styles');
        
        await page.locator('button').filter({ hasText: '카드 섞기' }).click();
        await page.waitForTimeout(2000);
        
        await page.locator('button').filter({ hasText: '카드 펼치기' }).click();
        await page.waitForTimeout(3000);
        
        // Check if the -145px style is in the DOM
        console.log('🔍 Checking for -145px in page HTML...');
        const pageContent = await page.content();
        const hasMarginStyle = pageContent.includes('-145px');
        console.log(`Found -145px in HTML: ${hasMarginStyle ? '✅ YES' : '❌ NO'}`);
        
        // Find the actual spread container and cards
        console.log('🔍 Finding card elements with specific selectors...');
        
        // Look for the cards more specifically
        const cards = await page.locator('div[role="button"]').all();
        console.log(`Found ${cards.length} button-role div elements`);
        
        if (cards.length > 0) {
            console.log('\n📋 Analyzing each card element:');
            
            for (let i = 0; i < Math.min(cards.length, 10); i++) {
                const card = cards[i];
                
                // Get all style information
                const styleInfo = await card.evaluate(el => {
                    const inlineStyle = el.getAttribute('style') || '';
                    const computedStyle = window.getComputedStyle(el);
                    
                    return {
                        tagName: el.tagName,
                        className: el.className,
                        inlineStyle: inlineStyle,
                        hasMarginLeft: inlineStyle.includes('marginLeft'),
                        marginLeftValue: inlineStyle.match(/marginLeft:\s*([^;]+)/)?.[1] || 'not found',
                        computedMarginLeft: computedStyle.marginLeft,
                        computedZIndex: computedStyle.zIndex,
                        computedPosition: computedStyle.position,
                        role: el.getAttribute('role')
                    };
                });
                
                const boundingBox = await card.boundingBox();
                
                console.log(`Card ${i + 1}:`, {
                    position: { x: boundingBox?.x, y: boundingBox?.y, width: boundingBox?.width },
                    role: styleInfo.role,
                    hasMarginLeft: styleInfo.hasMarginLeft,
                    marginLeftInline: styleInfo.marginLeftValue,
                    marginLeftComputed: styleInfo.computedMarginLeft,
                    zIndex: styleInfo.computedZIndex,
                    className: styleInfo.className.substring(0, 60) + '...'
                });
                
                // Check if this is a spread card specifically
                if (styleInfo.hasMarginLeft && styleInfo.marginLeftValue.includes('-145px')) {
                    console.log(`  🎯 Found card with -145px margin!`);
                }
            }
            
            // Manually measure the first few cards if we found them
            if (cards.length >= 2) {
                console.log('\n📏 Manual card position measurements:');
                const positions = [];
                
                for (let i = 0; i < Math.min(cards.length, 5); i++) {
                    const boundingBox = await cards[i].boundingBox();
                    if (boundingBox) {
                        positions.push({
                            index: i,
                            left: boundingBox.x,
                            right: boundingBox.x + boundingBox.width,
                            width: boundingBox.width
                        });
                    }
                }
                
                for (let i = 0; i < positions.length - 1; i++) {
                    const curr = positions[i];
                    const next = positions[i + 1];
                    const gap = next.left - curr.right;
                    const expectedOverlap = curr.width - 15; // Expecting ~15px visible
                    
                    console.log(`Card ${i + 1} to Card ${i + 2}:`);
                    console.log(`  Current ends at: ${curr.right}px`);
                    console.log(`  Next starts at: ${next.left}px`);
                    console.log(`  Gap: ${gap}px (${gap < 0 ? 'OVERLAP' : 'SPACE'})`);
                    
                    if (gap < 0) {
                        const visibleWidth = Math.abs(gap);
                        console.log(`  Visible portion: ${visibleWidth}px`);
                        console.log(`  Expected ~15px? ${Math.abs(visibleWidth - 15) < 5 ? '✅ YES' : '❌ NO'}`);
                    }
                }
            }
        }
        
        // Check for container overflow settings that might affect layout
        console.log('\n🎨 Checking container properties:');
        const containerInfo = await page.evaluate(() => {
            const containers = document.querySelectorAll('div[class*="flex"], div[class*="overflow"]');
            return Array.from(containers).slice(0, 5).map(el => {
                const computed = window.getComputedStyle(el);
                return {
                    className: el.className,
                    display: computed.display,
                    flexDirection: computed.flexDirection,
                    overflowX: computed.overflowX,
                    position: computed.position
                };
            });
        });
        
        console.log('Container styles:', containerInfo);
        
        // Take screenshot with annotations
        const screenshot = `overlap-debug-${Date.now()}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
        console.log(`📸 Debug screenshot saved: ${screenshot}`);
        
        // Keep browser open for manual inspection
        console.log('\n⏸️  Browser will stay open for 15 seconds for manual inspection...');
        await page.waitForTimeout(15000);
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        await page.screenshot({ path: `debug-error-${Date.now()}.png` });
    } finally {
        await browser.close();
    }
}

debugOverlapStyles().catch(console.error);