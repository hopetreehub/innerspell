const { chromium } = require('playwright');

async function verify15pxSpacing() {
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
        
        // Draw/reveal the spread
        console.log('🎴 Drawing cards...');
        await page.locator('button:has-text("카드 뽑기")').click();
        await page.waitForTimeout(3000);
        
        // Take screenshot of the spread
        console.log('📸 Taking screenshot of spread...');
        await page.screenshot({ 
            path: 'spread-with-15px-spacing.png', 
            fullPage: true 
        });
        
        // Look for the div with flex space-x-[15px] class
        console.log('🔍 Looking for space-x-[15px] container...');
        const spacingContainer = page.locator('.flex.space-x-\\[15px\\]');
        
        if (await spacingContainer.count() === 0) {
            console.log('❌ Container with space-x-[15px] class not found');
            return {
                success: false,
                error: 'space-x-[15px] container not found',
                foundContainers: []
            };
        }
        
        console.log('✅ Found space-x-[15px] container!');
        
        // Get the computed styles to verify CSS is applied correctly
        const computedStyles = await spacingContainer.evaluate((element) => {
            const styles = window.getComputedStyle(element);
            return {
                gap: styles.gap,
                columnGap: styles.columnGap,
                marginLeft: styles.marginLeft,
                marginRight: styles.marginRight,
                display: styles.display,
                className: element.className
            };
        });
        
        console.log('🎨 Container computed styles:', computedStyles);
        
        // Get all child elements in the container
        const children = spacingContainer.locator('> *');
        const childCount = await children.count();
        
        if (childCount < 2) {
            console.log(`❌ Not enough children (${childCount}) to measure spacing`);
            return {
                success: false,
                error: `Only ${childCount} children found, need at least 2 to measure spacing`,
                computedStyles
            };
        }
        
        console.log(`📏 Measuring spacing between ${childCount} children...`);
        
        // Measure the actual pixel distances between cards
        const spacings = [];
        
        for (let i = 0; i < childCount - 1; i++) {
            const currentChild = children.nth(i);
            const nextChild = children.nth(i + 1);
            
            const currentBox = await currentChild.boundingBox();
            const nextBox = await nextChild.boundingBox();
            
            if (currentBox && nextBox) {
                const spacing = nextBox.x - (currentBox.x + currentBox.width);
                spacings.push(spacing);
                console.log(`   Card ${i + 1} to Card ${i + 2}: ${spacing}px`);
            }
        }
        
        if (spacings.length === 0) {
            return {
                success: false,
                error: 'Could not measure any spacings',
                computedStyles,
                childCount
            };
        }
        
        const averageSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
        const expectedSpacing = 15;
        const tolerance = 2; // Allow 2px tolerance for rounding
        
        const isCorrect = Math.abs(averageSpacing - expectedSpacing) <= tolerance;
        
        console.log(`📊 Average spacing: ${averageSpacing.toFixed(1)}px (expected: ${expectedSpacing}px)`);
        console.log(`✅ Tolerance: ±${tolerance}px`);
        console.log(`${isCorrect ? '✅' : '❌'} Spacing ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        
        // Verify that Tailwind's space-x-[15px] should create 15px spacing
        const tailwindExpectedSpacing = await page.evaluate(() => {
            // Create a test element to verify Tailwind CSS behavior
            const testDiv = document.createElement('div');
            testDiv.className = 'flex space-x-[15px]';
            testDiv.innerHTML = '<div>1</div><div>2</div>';
            document.body.appendChild(testDiv);
            
            const computedStyle = window.getComputedStyle(testDiv);
            const columnGap = computedStyle.columnGap;
            
            document.body.removeChild(testDiv);
            
            return {
                columnGap,
                shouldBe15px: columnGap === '15px'
            };
        });
        
        console.log('🧪 Tailwind CSS verification:', tailwindExpectedSpacing);
        
        return {
            success: isCorrect,
            expectedSpacing,
            averageActualSpacing: Math.round(averageSpacing * 10) / 10,
            individualSpacings: spacings.map(s => Math.round(s * 10) / 10),
            tolerance,
            computedStyles,
            tailwindExpectedSpacing,
            childCount,
            message: isCorrect 
                ? `✅ Spacing is CORRECT: ~${Math.round(averageSpacing)}px (expected 15px ±${tolerance}px)`
                : `❌ Spacing is INCORRECT: ~${Math.round(averageSpacing)}px (expected 15px ±${tolerance}px)`
        };
        
    } catch (error) {
        console.error('❌ Error during verification:', error);
        await page.screenshot({ path: 'error-spacing-verification.png', fullPage: true });
        return { 
            success: false, 
            error: error.message 
        };
    } finally {
        console.log('⏳ Keeping browser open for 5 seconds for inspection...');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

// Run the verification
verify15pxSpacing().then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL TAROT CARD SPACING VERIFICATION RESULT');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));
}).catch(error => {
    console.error('💥 Script failed:', error);
});