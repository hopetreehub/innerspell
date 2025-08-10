const { chromium } = require('playwright');

async function measureVisibleSpacing() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🚀 Navigating to tarot reading page...');
        await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
        
        // Fill in the question
        console.log('✏️  Filling in question...');
        await page.locator('textarea').fill('What does the future hold?');
        
        // Shuffle the deck
        console.log('🔀 Shuffling cards...');
        await page.locator('button:has-text("카드 섞기")').click();
        await page.waitForTimeout(4000); // Wait for shuffle animation
        
        // Click the reveal spread button (카드 펼치기)
        console.log('🎴 Revealing spread...');
        await page.locator('button:has-text("카드 펼치기")').click();
        await page.waitForTimeout(3000);
        
        // Take screenshot of the spread
        console.log('📸 Taking screenshot...');
        await page.screenshot({ 
            path: 'final-spread-spacing-check.png', 
            fullPage: true 
        });
        
        // Now look for the specific container with space-x-[15px]
        const spacingContainer = page.locator('.flex.space-x-\\[15px\\]');
        
        if (await spacingContainer.count() === 0) {
            console.log('❌ space-x-[15px] container not found');
            console.log('🔍 Looking for alternative containers...');
            
            // Look for any flex container with cards
            const alternativeContainers = await page.locator('.flex').filter({ hasText: '' }).count();
            console.log(`Found ${alternativeContainers} flex containers`);
            
            return {
                success: false,
                error: 'space-x-[15px] container not found',
                alternativeContainers
            };
        }
        
        console.log('✅ Found space-x-[15px] container!');
        
        // Get computed styles to verify Tailwind CSS application
        const containerInfo = await spacingContainer.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
                className: el.className,
                columnGap: styles.columnGap,
                gap: styles.gap,
                display: styles.display,
                childCount: el.children.length,
                boundingBox: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                }
            };
        });
        
        console.log('📊 Container info:', containerInfo);
        
        // Take a cropped screenshot of just the spread area
        if (containerInfo.boundingBox) {
            await page.screenshot({ 
                path: 'spread-area-closeup.png',
                clip: {
                    x: Math.max(0, containerInfo.boundingBox.x - 20),
                    y: Math.max(0, containerInfo.boundingBox.y - 20),
                    width: Math.min(containerInfo.boundingBox.width + 40, 1280),
                    height: Math.min(containerInfo.boundingBox.height + 40, 720)
                }
            });
        }
        
        // Measure actual spacing between cards
        const children = spacingContainer.locator('> *');
        const childCount = await children.count();
        
        console.log(`📏 Found ${childCount} cards in the spread`);
        
        if (childCount < 2) {
            return {
                success: false,
                error: `Not enough cards (${childCount}) to measure spacing`,
                containerInfo
            };
        }
        
        const spacingMeasurements = [];
        
        // Measure spacing between each adjacent pair
        for (let i = 0; i < childCount - 1; i++) {
            const card1 = children.nth(i);
            const card2 = children.nth(i + 1);
            
            const box1 = await card1.boundingBox();
            const box2 = await card2.boundingBox();
            
            if (box1 && box2) {
                const spacing = box2.x - (box1.x + box1.width);
                spacingMeasurements.push({
                    between: `Card ${i + 1} → Card ${i + 2}`,
                    spacing: Math.round(spacing * 10) / 10,
                    card1Right: box1.x + box1.width,
                    card2Left: box2.x
                });
                console.log(`   ${spacingMeasurements[i].between}: ${spacingMeasurements[i].spacing}px`);
            }
        }
        
        if (spacingMeasurements.length === 0) {
            return {
                success: false,
                error: 'Could not measure any spacing',
                containerInfo,
                childCount
            };
        }
        
        const averageSpacing = spacingMeasurements.reduce((sum, m) => sum + m.spacing, 0) / spacingMeasurements.length;
        const expectedSpacing = 15;
        const tolerance = 2;
        
        const isCorrect = Math.abs(averageSpacing - expectedSpacing) <= tolerance;
        
        // Verify that the CSS is working as expected
        const cssVerification = containerInfo.columnGap === '15px' || containerInfo.gap === '15px';
        
        console.log(`\n📊 SPACING ANALYSIS:`);
        console.log(`   Expected: ${expectedSpacing}px`);
        console.log(`   Measured Average: ${averageSpacing.toFixed(1)}px`);
        console.log(`   CSS column-gap: ${containerInfo.columnGap}`);
        console.log(`   CSS gap: ${containerInfo.gap}`);
        console.log(`   Tolerance: ±${tolerance}px`);
        console.log(`   ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} - Spacing ${isCorrect ? 'matches' : 'does not match'} expected 15px`);
        
        return {
            success: isCorrect,
            expected: expectedSpacing,
            measured: {
                average: Math.round(averageSpacing * 10) / 10,
                individual: spacingMeasurements
            },
            css: {
                columnGap: containerInfo.columnGap,
                gap: containerInfo.gap,
                correctCSSApplied: cssVerification
            },
            tolerance,
            containerInfo,
            verification: {
                spacingCorrect: isCorrect,
                cssCorrect: cssVerification,
                overallCorrect: isCorrect && cssVerification
            },
            message: isCorrect 
                ? `✅ SUCCESS: Card spacing is correct at ~${Math.round(averageSpacing)}px (expected 15px ±${tolerance}px)`
                : `❌ FAILURE: Card spacing is ~${Math.round(averageSpacing)}px, expected 15px ±${tolerance}px`
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        await page.screenshot({ path: 'spacing-error.png', fullPage: true });
        return { 
            success: false, 
            error: error.message 
        };
    } finally {
        console.log('\n⏳ Keeping browser open for 3 seconds for inspection...');
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

// Run the verification
measureVisibleSpacing().then(result => {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 TAROT CARD SPACING VERIFICATION - FINAL RESULTS');
    console.log('='.repeat(70));
    
    if (result.success) {
        console.log('🎉 RESULT: SUCCESS! ✅');
        console.log(`📏 Card spacing is correctly set to ${result.measured.average}px`);
        console.log(`💅 CSS spacing (space-x-[15px]) is properly applied`);
    } else {
        console.log('❌ RESULT: FAILURE');
        if (result.measured) {
            console.log(`📏 Actual spacing: ${result.measured.average}px (expected 15px)`);
        }
        if (result.error) {
            console.log(`🚨 Error: ${result.error}`);
        }
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(70));
}).catch(error => {
    console.error('💥 Script execution failed:', error);
});