const { chromium } = require('playwright');

async function measureFinalSpacing() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('Navigating to http://localhost:4000/reading...');
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        
        // Enter a question in the textarea
        console.log('Entering question...');
        const questionTextarea = page.locator('textarea');
        await questionTextarea.fill('What does the future hold for me?');
        
        // Click the "카드 섞기" (Shuffle Cards) button
        console.log('Clicking shuffle button...');
        const shuffleButton = page.locator('button:has-text("카드 섞기")');
        await shuffleButton.click();
        await page.waitForTimeout(2000);
        
        // Dismiss any notification popup if it exists
        try {
            await page.locator('button').filter({ hasText: '×' }).first().click({ timeout: 2000 });
        } catch (e) {
            console.log('No popup to dismiss');
        }
        
        // Click the "카드 뽑기" (Draw Cards) button
        console.log('Clicking draw cards button...');
        const drawButton = page.locator('button:has-text("카드 뽑기")');
        await drawButton.click();
        await page.waitForTimeout(3000); // Wait for card spread animation
        
        // Take a final screenshot
        await page.screenshot({ 
            path: 'final-card-spread.png', 
            fullPage: true 
        });
        
        // Look for the specific card spread container
        console.log('Looking for card spread container...');
        
        // First, check if the exact space-x-[15px] class exists
        const exactContainer = page.locator('.flex.space-x-\\[15px\\]');
        if (await exactContainer.count() > 0) {
            console.log('✅ Found exact container with space-x-[15px] class');
            return await measureCardSpacing(page, exactContainer, 'space-x-[15px]');
        }
        
        // Look for the card images specifically  
        const cardImages = page.locator('img[src*="card"], img[alt*="card"], img[alt*="Card"]');
        if (await cardImages.count() >= 2) {
            console.log(`Found ${await cardImages.count()} card images`);
            return await measureImageSpacing(page, cardImages);
        }
        
        // Look for any container that might hold the cards
        const possibleContainers = [
            '.flex:has(img)',
            'div:has(img[src*="card"])',  
            '[class*="spread"]',
            '[class*="cards"]'
        ];
        
        for (const selector of possibleContainers) {
            const container = page.locator(selector).first();
            if (await container.count() > 0) {
                const children = container.locator('> *');
                if (await children.count() >= 2) {
                    console.log(`Found container: ${selector} with ${await children.count()} children`);
                    return await measureCardSpacing(page, container, selector);
                }
            }
        }
        
        return { success: false, error: 'No card spread container found' };
        
    } catch (error) {
        console.error('Error during verification:', error);
        await page.screenshot({ 
            path: 'error-final.png', 
            fullPage: true 
        });
        return { success: false, error: error.message };
    } finally {
        // Keep browser open for manual inspection
        console.log('Browser will remain open for 10 seconds for manual inspection...');
        await page.waitForTimeout(10000);
        await browser.close();
    }
}

async function measureImageSpacing(page, cardImages) {
    console.log('Measuring spacing between card images...');
    
    const imageCount = await cardImages.count();
    console.log(`Measuring ${imageCount} card images`);
    
    const spacings = [];
    const positions = [];
    
    // Get positions of all card images
    for (let i = 0; i < imageCount; i++) {
        const img = cardImages.nth(i);
        const box = await img.boundingBox();
        if (box) {
            positions.push({ index: i, x: box.x, width: box.width, right: box.x + box.width });
            console.log(`Card ${i}: x=${box.x}, width=${box.width}, right=${box.x + box.width}`);
        }
    }
    
    // Sort by x position
    positions.sort((a, b) => a.x - b.x);
    
    // Calculate spacings between adjacent cards
    for (let i = 0; i < positions.length - 1; i++) {
        const spacing = positions[i + 1].x - positions[i].right;
        spacings.push(spacing);
        console.log(`Spacing between card ${positions[i].index} and ${positions[i + 1].index}: ${spacing}px`);
    }
    
    if (spacings.length === 0) {
        return { success: false, error: 'Could not measure spacing between images' };
    }
    
    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    const isCorrect = Math.abs(avgSpacing - 15) <= 2; // Allow 2px tolerance
    
    console.log(`Average spacing: ${avgSpacing}px (expected: 15px)`);
    
    return {
        success: isCorrect,
        method: 'Image positioning measurement',
        expectedSpacing: 15,
        actualSpacing: avgSpacing,
        allSpacings: spacings,
        cardPositions: positions,
        message: isCorrect 
            ? `✅ Spacing is correct: ~${Math.round(avgSpacing)}px (expected 15px)` 
            : `❌ Spacing is incorrect: ~${Math.round(avgSpacing)}px (expected 15px)`
    };
}

async function measureCardSpacing(page, container, containerType) {
    console.log(`Measuring spacing in container: ${containerType}`);
    
    // Get all child elements (cards)
    const cards = container.locator('> *');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} direct children in container`);
    
    if (cardCount < 2) {
        return { success: false, error: `Not enough cards (${cardCount}) to measure spacing` };
    }
    
    // Take a focused screenshot of the spread area
    const containerBox = await container.boundingBox();
    if (containerBox) {
        await page.screenshot({
            path: 'spread-area-measurement.png',
            clip: {
                x: Math.max(0, containerBox.x - 50),
                y: Math.max(0, containerBox.y - 50), 
                width: Math.min(containerBox.width + 100, 1920),
                height: Math.min(containerBox.height + 100, 1080)
            }
        });
    }
    
    // Measure spacing between adjacent cards
    const spacings = [];
    
    for (let i = 0; i < cardCount - 1; i++) {
        const currentCard = cards.nth(i);
        const nextCard = cards.nth(i + 1);
        
        const currentBox = await currentCard.boundingBox();
        const nextBox = await nextCard.boundingBox();
        
        if (currentBox && nextBox) {
            const spacing = nextBox.x - (currentBox.x + currentBox.width);
            spacings.push(spacing);
            console.log(`Spacing between card ${i} and ${i+1}: ${spacing}px`);
            console.log(`  Card ${i}: x=${currentBox.x}, width=${currentBox.width}, right=${currentBox.x + currentBox.width}`);
            console.log(`  Card ${i+1}: x=${nextBox.x}`);
        }
    }
    
    if (spacings.length === 0) {
        return { success: false, error: 'Could not measure any spacing' };
    }
    
    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    console.log(`Average spacing: ${avgSpacing}px`);
    
    // Check if it matches the expected 15px (with 2px tolerance)
    const isCorrect = Math.abs(avgSpacing - 15) <= 2;
    
    // Get computed styles of the container
    const computedStyles = await page.evaluate(() => {
        const containers = document.querySelectorAll('.flex');
        for (let container of containers) {
            // Look for container with card-like children
            const hasCards = container.querySelector('img, [class*="card"], [alt*="card"]');
            if (hasCards && container.children.length >= 2) {
                const styles = window.getComputedStyle(container);
                return {
                    className: container.className,
                    gap: styles.gap,
                    columnGap: styles.columnGap,
                    marginLeft: styles.marginLeft,
                    marginRight: styles.marginRight
                };
            }
        }
        return null;
    });
    
    console.log('Container computed styles:', computedStyles);
    
    return {
        success: isCorrect,
        containerType,
        expectedSpacing: 15,
        actualSpacing: avgSpacing,
        allSpacings: spacings,
        computedStyles,
        message: isCorrect 
            ? `✅ Spacing is correct: ~${Math.round(avgSpacing)}px (expected 15px)` 
            : `❌ Spacing is incorrect: ~${Math.round(avgSpacing)}px (expected 15px)`
    };
}

// Run the verification
measureFinalSpacing().then(result => {
    console.log('\n=== FINAL SPACING VERIFICATION RESULT ===');
    console.log(JSON.stringify(result, null, 2));
}).catch(error => {
    console.error('Script failed:', error);
});