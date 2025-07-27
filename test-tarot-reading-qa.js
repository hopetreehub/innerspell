const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testTarotReadingWithGuidelines() {
    console.log('🎭 Starting comprehensive tarot reading QA test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,  // Slow down for better observation
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    try {
        console.log('📋 Step 1: Navigating to Vercel deployment...');
        
        // Navigate to the Vercel deployment (assuming it's deployed)
        // First try to determine the Vercel URL
        const vercelUrl = 'https://test-studio-firebase.vercel.app';  // Default Vercel pattern
        
        await page.goto(`${vercelUrl}/reading`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Successfully loaded /reading page');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '01-reading-page-loaded.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 2: Filling out test question...');
        
        // Look for question input field
        const questionInput = await page.locator('textarea, input[type="text"]').first();
        await questionInput.waitFor({ state: 'visible', timeout: 10000 });
        
        const testQuestion = '내 연애 운세는 어떤가요?';
        await questionInput.fill(testQuestion);
        
        console.log(`✅ Filled question: "${testQuestion}"`);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '02-question-filled.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 3: Selecting 삼위일체 조망 spread type...');
        
        // Look for spread selection (could be dropdown, radio buttons, or cards)
        // Try different possible selectors
        const spreadSelectors = [
            'select[name*="spread"]',
            '[data-testid*="spread"]',
            'button:has-text("삼위일체")',
            'label:has-text("삼위일체")',
            '.spread-option:has-text("삼위일체")',
            '[value*="trinity"]',
            '[value*="삼위일체"]'
        ];
        
        let spreadSelected = false;
        for (const selector of spreadSelectors) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible()) {
                    await element.click();
                    console.log(`✅ Selected spread using selector: ${selector}`);
                    spreadSelected = true;
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!spreadSelected) {
            console.log('⚠️  Could not find specific spread selector, trying generic spread selection...');
            // Try to find any spread-related element
            const anySpread = await page.locator('button, select, input[type="radio"]').filter({ hasText: /spread|조망|스프레드/i }).first();
            if (await anySpread.isVisible()) {
                await anySpread.click();
                console.log('✅ Selected first available spread option');
            }
        }
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, '03-spread-selected.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 4: Looking for start/submit button...');
        
        // Look for start reading button
        const startButtonSelectors = [
            'button:has-text("시작")',
            'button:has-text("읽기")',
            'button:has-text("Start")',
            'button[type="submit"]',
            '.start-reading',
            '[data-testid*="start"]'
        ];
        
        let readingStarted = false;
        for (const selector of startButtonSelectors) {
            try {
                const button = await page.locator(selector).first();
                if (await button.isVisible() && await button.isEnabled()) {
                    await button.click();
                    console.log(`✅ Clicked start button using selector: ${selector}`);
                    readingStarted = true;
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!readingStarted) {
            console.log('⚠️  Could not find start button, looking for any clickable element...');
            const anyButton = await page.locator('button').filter({ hasText: /시작|start|읽기|reading/i }).first();
            if (await anyButton.isVisible()) {
                await anyButton.click();
                console.log('✅ Clicked generic start button');
            }
        }
        
        console.log('📋 Step 5: Waiting for reading process...');
        
        // Wait for the reading to process
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, '04-reading-in-progress.png'),
            fullPage: true 
        });
        
        // Look for cards or reading results
        console.log('📋 Step 6: Looking for cards or results...');
        
        // Wait for cards to appear
        const cardSelectors = [
            '.card',
            '.tarot-card',
            '[data-testid*="card"]',
            '.reading-result',
            '.interpretation'
        ];
        
        let cardsFound = false;
        for (const selector of cardSelectors) {
            try {
                await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15000 });
                console.log(`✅ Found cards/results using selector: ${selector}`);
                cardsFound = true;
                break;
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (cardsFound) {
            console.log('📋 Step 7: Capturing final results...');
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, '05-reading-complete.png'),
                fullPage: true 
            });
            
            // Try to extract the interpretation text
            const interpretationSelectors = [
                '.interpretation',
                '.reading-result',
                '.analysis',
                '.result-text',
                '[data-testid*="interpretation"]',
                'p, div'  // Fallback to any text content
            ];
            
            let interpretationText = '';
            for (const selector of interpretationSelectors) {
                try {
                    const element = await page.locator(selector).filter({ hasText: /해석|분석|의미/i }).first();
                    if (await element.isVisible()) {
                        interpretationText = await element.textContent();
                        console.log(`✅ Found interpretation using selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            if (interpretationText) {
                console.log('📋 Step 8: Analyzing interpretation for guideline usage...');
                console.log('📝 Interpretation text preview:');
                console.log(interpretationText.substring(0, 500) + '...');
                
                // Check for guideline keywords
                const guidelineKeywords = [
                    '삼위일체',
                    '원소',
                    '계절',
                    '중심',
                    '해석',
                    '가이드라인'
                ];
                
                const foundKeywords = guidelineKeywords.filter(keyword => 
                    interpretationText.includes(keyword)
                );
                
                console.log(`🔍 Found guideline keywords: ${foundKeywords.join(', ')}`);
                
                if (foundKeywords.length > 0) {
                    console.log('✅ Interpretation appears to use tarot guidelines!');
                } else {
                    console.log('⚠️  Could not clearly identify guideline usage in interpretation');
                }
            } else {
                console.log('⚠️  Could not extract interpretation text for analysis');
            }
        } else {
            console.log('⚠️  Could not find cards or reading results');
        }
        
        // Keep browser open for manual inspection
        console.log('🔍 Keeping browser open for manual inspection...');
        console.log('📋 Test completed. Check screenshots in /screenshots directory');
        
        // Wait for manual inspection
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'error-screenshot.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('🏁 Browser closed');
    }
}

// Run the test
testTarotReadingWithGuidelines().catch(console.error);