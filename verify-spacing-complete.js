const { chromium } = require('playwright');

async function verifyCardSpacing() {
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
        
        // Dismiss any notification popup
        console.log('Dismissing notifications...');
        const closeButtons = page.locator('button[aria-label="Close"], .close, button:has-text("×"), button:has-text("close")');
        if (await closeButtons.count() > 0) {
            await closeButtons.first().click();
            await page.waitForTimeout(1000);
        }
        
        // Click the "카드 뽑기" (Draw Cards) button
        console.log('Clicking draw cards button...');
        const drawButton = page.locator('button:has-text("카드 뽑기")');
        if (await drawButton.count() > 0) {
            await drawButton.click();
            await page.waitForTimeout(5000); // Wait longer for cards to appear
        }
        
        // Take screenshot after drawing
        console.log('Taking screenshot after drawing cards...');
        await page.screenshot({ 
            path: 'after-draw-cards.png', 
            fullPage: true 
        });
        
        // Look for any card spread or revealed cards
        console.log('Looking for card spread...');
        
        // Check for the specific space-x-[15px] container
        const exactSpreadContainer = page.locator('.flex.space-x-\\[15px\\]');
        
        if (await exactSpreadContainer.count() > 0) {
            console.log('✅ Found exact spread container with space-x-[15px] class');
            return await measureSpacing(page, exactSpreadContainer, '15px exact match');
        }
        
        // Check for other spacing classes
        const spacingVariants = [
            '.space-x-4', // 16px in Tailwind
            '.space-x-3', // 12px in Tailwind  
            '.gap-4',     // 16px gap
            '.gap-3',     // 12px gap
            '[class*="space-x"]',
            '[class*="gap"]'
        ];
        
        for (const variant of spacingVariants) {
            const container = page.locator(variant);
            if (await container.count() > 0) {
                console.log(`Found container with ${variant}`);
                return await measureSpacing(page, container, variant);
            }
        }
        
        // Look for any flex container with cards
        const anyFlexContainer = page.locator('.flex').filter({ has: page.locator('.card, [class*="card"], img') });
        
        if (await anyFlexContainer.count() > 0) {
            console.log('Found flex container with cards');
            return await measureSpacing(page, anyFlexContainer.first(), 'flex container');
        }
        
        return { success: false, error: 'No card spread found' };
        
    } catch (error) {
        console.error('Error during verification:', error);
        await page.screenshot({ 
            path: 'error-screenshot.png', 
            fullPage: true 
        });
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

async function measureSpacing(page, container, containerType) {
    console.log(`Measuring spacing in ${containerType}...`);
    
    // Get all child elements (cards)
    const cards = container.locator('> *');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} cards in the container`);
    
    if (cardCount < 2) {
        return { success: false, error: `Not enough cards (${cardCount}) to measure spacing` };
    }
    
    // Take a focused screenshot of the spread area
    const containerBox = await container.boundingBox();
    if (containerBox) {
        await page.screenshot({
            path: 'spread-measurement.png',
            clip: {
                x: containerBox.x - 20,
                y: containerBox.y - 20, 
                width: containerBox.width + 40,
                height: containerBox.height + 40
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
        }
    }
    
    if (spacings.length === 0) {
        return { success: false, error: 'Could not measure any spacing' };
    }
    
    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    console.log(`Average spacing: ${avgSpacing}px`);
    
    // Check if it matches the expected 15px (with 1px tolerance)
    const isCorrect = Math.abs(avgSpacing - 15) <= 1;
    
    // Also get the computed styles of the container
    const computedStyles = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        const styles = window.getComputedStyle(element);
        return {
            gap: styles.gap,
            columnGap: styles.columnGap,
            className: element.className,
            marginLeft: styles.marginLeft,
            marginRight: styles.marginRight,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight
        };
    }, container.first().locator().toString().replace('locator(', '').replace(')', ''));
    
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
verifyCardSpacing().then(result => {
    console.log('\n=== FINAL RESULT ===');
    console.log(JSON.stringify(result, null, 2));
}).catch(error => {
    console.error('Script failed:', error);
});