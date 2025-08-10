const { chromium } = require('playwright');

async function measureCardOverlapSpacing() {
    console.log('📏 Measuring exact card overlap spacing...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    
    try {
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        
        // Fill question and shuffle/spread
        const textarea = page.locator('textarea').first();
        await textarea.fill('Test question for measuring card spacing');
        
        await page.locator('button').filter({ hasText: '카드 섞기' }).click();
        await page.waitForTimeout(2000);
        
        await page.locator('button').filter({ hasText: '카드 펼치기' }).click();
        await page.waitForTimeout(2000);
        
        // Wait for cards to be visible
        await page.waitForSelector('[class*="card"]', { timeout: 10000 });
        
        // Get card elements
        const cardElements = await page.locator('[class*="card"]').all();
        console.log(`Found ${cardElements.length} card elements`);
        
        if (cardElements.length >= 2) {
            // Measure the first two cards' positions
            const measurements = [];
            
            for (let i = 0; i < Math.min(cardElements.length, 10); i++) {
                try {
                    const boundingBox = await cardElements[i].boundingBox();
                    const styles = await cardElements[i].evaluate(el => {
                        const computed = window.getComputedStyle(el);
                        return {
                            marginLeft: computed.marginLeft,
                            width: computed.width,
                            position: computed.position
                        };
                    });
                    
                    measurements.push({
                        index: i,
                        left: boundingBox?.x,
                        right: boundingBox?.x + boundingBox?.width,
                        width: boundingBox?.width,
                        marginLeft: styles.marginLeft,
                        computedWidth: styles.width
                    });
                    
                    console.log(`Card ${i + 1}:`, {
                        left: boundingBox?.x,
                        right: boundingBox?.x + boundingBox?.width,
                        width: boundingBox?.width,
                        marginLeft: styles.marginLeft
                    });
                } catch (error) {
                    console.log(`Could not measure card ${i + 1}:`, error.message);
                }
            }
            
            // Calculate gaps/overlaps between consecutive cards
            console.log('\n📐 Gap/Overlap Analysis:');
            for (let i = 0; i < measurements.length - 1; i++) {
                const card1 = measurements[i];
                const card2 = measurements[i + 1];
                
                if (card1.right && card2.left) {
                    const gap = card2.left - card1.right;
                    const overlap = -gap;
                    const visibleWidth = gap < 0 ? card2.width + gap : card2.width;
                    
                    console.log(`Card ${i + 1} → Card ${i + 2}:`);
                    console.log(`  Gap: ${gap.toFixed(1)}px (negative = overlap)`);
                    console.log(`  Overlap: ${overlap.toFixed(1)}px`);
                    console.log(`  Visible width of Card ${i + 2}: ${visibleWidth.toFixed(1)}px`);
                    console.log(`  Expected ~15px visible? ${Math.abs(visibleWidth - 15) < 5 ? '✅ YES' : '❌ NO'}`);
                    console.log('');
                }
            }
            
            // Check CSS margin values
            console.log('🎨 CSS Style Analysis:');
            for (let i = 0; i < Math.min(measurements.length, 3); i++) {
                const measurement = measurements[i];
                console.log(`Card ${i + 1} marginLeft: ${measurement.marginLeft}`);
                
                if (i === 0) {
                    console.log(`  Expected 0px? ${measurement.marginLeft === '0px' ? '✅ YES' : '❌ NO'}`);
                } else {
                    console.log(`  Expected -145px? ${measurement.marginLeft === '-145px' ? '✅ YES' : '❌ NO'}`);
                }
            }
        }
        
        // Take a final measurement screenshot
        const screenshot = `card-spacing-measurement-${Date.now()}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
        console.log(`📸 Measurement screenshot saved: ${screenshot}`);
        
        // Keep browser open for visual inspection
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Measurement failed:', error);
        await page.screenshot({ path: `spacing-error-${Date.now()}.png` });
    } finally {
        await browser.close();
    }
}

measureCardOverlapSpacing().catch(console.error);