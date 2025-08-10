const { chromium } = require('playwright');

async function inspectCardSpreadStructure() {
    console.log('🔍 Inspecting actual card spread structure...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    
    try {
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        
        // Enter question
        const textarea = page.locator('textarea').first();
        await textarea.fill('Test to inspect card structure');
        
        // Shuffle and spread cards
        await page.locator('button').filter({ hasText: '카드 섞기' }).click();
        await page.waitForTimeout(2000);
        
        await page.locator('button').filter({ hasText: '카드 펼치기' }).click();
        await page.waitForTimeout(3000);
        
        // Look for the actual card elements that should have the overlapping style
        console.log('🔍 Searching for spread cards...');
        
        // Check different selectors for the actual overlapping cards
        const selectors = [
            'div[role="button"][style*="marginLeft"]',
            'div[style*="marginLeft: -145px"]',
            'div[style*="marginLeft"]',
            'div.shrink-0',
            'div[class*="h-80"]'
        ];
        
        let foundCards = [];
        
        for (const selector of selectors) {
            const elements = await page.locator(selector).all();
            if (elements.length > 0) {
                console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
                
                for (let i = 0; i < Math.min(elements.length, 5); i++) {
                    try {
                        const element = elements[i];
                        const boundingBox = await element.boundingBox();
                        const styles = await element.evaluate(el => {
                            const style = el.getAttribute('style') || '';
                            const computed = window.getComputedStyle(el);
                            return {
                                inlineStyle: style,
                                marginLeft: computed.marginLeft,
                                zIndex: computed.zIndex,
                                width: computed.width,
                                position: computed.position,
                                className: el.className
                            };
                        });
                        
                        foundCards.push({
                            selector,
                            index: i,
                            boundingBox,
                            styles
                        });
                        
                        console.log(`  Card ${i + 1}:`, {
                            position: { x: boundingBox?.x, width: boundingBox?.width },
                            inlineStyle: styles.inlineStyle.substring(0, 100) + '...',
                            marginLeft: styles.marginLeft,
                            zIndex: styles.zIndex,
                            className: styles.className.substring(0, 50) + '...'
                        });
                    } catch (error) {
                        console.log(`    Could not analyze element ${i + 1}: ${error.message}`);
                    }
                }
                break; // Use the first selector that finds elements
            } else {
                console.log(`❌ No elements found with selector: ${selector}`);
            }
        }
        
        if (foundCards.length > 1) {
            console.log('\n📏 Measuring overlaps between found cards:');
            for (let i = 0; i < foundCards.length - 1; i++) {
                const card1 = foundCards[i];
                const card2 = foundCards[i + 1];
                
                if (card1.boundingBox && card2.boundingBox) {
                    const card1Right = card1.boundingBox.x + card1.boundingBox.width;
                    const card2Left = card2.boundingBox.x;
                    const gap = card2Left - card1Right;
                    const overlap = -gap;
                    const visibleWidth = gap < 0 ? Math.abs(gap) : card2.boundingBox.width;
                    
                    console.log(`Card ${i + 1} → Card ${i + 2}:`);
                    console.log(`  Card 1 right edge: ${card1Right}px`);
                    console.log(`  Card 2 left edge: ${card2Left}px`);
                    console.log(`  Gap: ${gap}px (negative = overlap)`);
                    console.log(`  Overlap: ${overlap}px`);
                    console.log(`  Visible width: ${visibleWidth}px`);
                    console.log(`  ✅ ~15px visible? ${Math.abs(visibleWidth - 15) < 10 ? 'YES' : 'NO'}`);
                    console.log('');
                }
            }
        }
        
        // Get page HTML for debugging
        const html = await page.locator('body').innerHTML();
        console.log('\n🔍 Looking for marginLeft in HTML:', 
            html.includes('marginLeft: -145px') ? '✅ Found -145px margin' : '❌ No -145px margin found'
        );
        
        // Take screenshot
        await page.screenshot({ 
            path: `card-structure-analysis-${Date.now()}.png`,
            fullPage: true
        });
        
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        await page.screenshot({ path: `structure-error-${Date.now()}.png` });
    } finally {
        await browser.close();
    }
}

inspectCardSpreadStructure().catch(console.error);