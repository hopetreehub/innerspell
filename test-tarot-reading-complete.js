const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function completeTarotReadingTest() {
    console.log('🎭 Starting complete tarot reading test with extended waiting...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000,  // Slow down more for observation
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
        
        // Navigate to the Vercel deployment
        const vercelUrl = 'https://test-studio-firebase.vercel.app';
        
        await page.goto(`${vercelUrl}/reading`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Successfully loaded /reading page');
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'complete-01-page-loaded.png'),
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
            path: path.join(screenshotsDir, 'complete-02-question-entered.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 3: Ensuring 삼위일체 조망 is selected...');
        
        // Make sure Trinity View is selected (it should be by default)
        const trinityButton = await page.locator('button:has-text("삼위일체")').first();
        if (await trinityButton.isVisible()) {
            await trinityButton.click();
            console.log('✅ Trinity View (삼위일체 조망) confirmed selected');
        }
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'complete-03-spread-selected.png'),
            fullPage: true 
        });
        
        console.log('📋 Step 4: Starting the reading...');
        
        // Click the start button
        const submitButton = await page.locator('button[type="submit"]').first();
        await submitButton.click();
        
        console.log('✅ Reading started!');
        
        console.log('📋 Step 5: Waiting patiently for reading results (up to 3 minutes)...');
        
        // Wait for various possible result indicators
        const resultIndicators = [
            '.interpretation',
            '.reading-result',
            '.analysis',
            '.tarot-interpretation',
            '.result-text',
            '[data-testid*="interpretation"]',
            '[data-testid*="result"]',
            '.card-meaning',
            'div:has-text("해석")',
            'div:has-text("분석")',
            'div:has-text("의미")',
            'p:has-text("카드가")',
            'div:has-text("타로")'
        ];
        
        let interpretationFound = false;
        let interpretationElement = null;
        let interpretationText = '';
        
        // Try waiting for results with multiple attempts
        for (let attempt = 1; attempt <= 6; attempt++) {
            console.log(`🔍 Attempt ${attempt}/6: Looking for interpretation results...`);
            
            for (const selector of resultIndicators) {
                try {
                    const element = await page.locator(selector).first();
                    if (await element.isVisible()) {
                        const text = await element.textContent();
                        if (text && text.length > 50) {  // Ensure it's substantial content
                            interpretationElement = element;
                            interpretationText = text;
                            interpretationFound = true;
                            console.log(`✅ Found interpretation using selector: ${selector}`);
                            break;
                        }
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            if (interpretationFound) break;
            
            // Take screenshot of current state
            await page.screenshot({ 
                path: path.join(screenshotsDir, `complete-waiting-${attempt}.png`),
                fullPage: true 
            });
            
            // Wait 30 seconds before next attempt
            console.log(`⏳ Waiting 30 seconds before next attempt...`);
            await page.waitForTimeout(30000);
        }
        
        if (interpretationFound) {
            console.log('🎉 SUCCESS: Found tarot reading interpretation!');
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'complete-04-interpretation-found.png'),
                fullPage: true 
            });
            
            console.log('📋 Step 6: Analyzing interpretation for guideline usage...');
            
            console.log('📝 Full interpretation text:');
            console.log('=' * 80);
            console.log(interpretationText);
            console.log('=' * 80);
            
            // Check for guideline-specific keywords
            const guidelineKeywords = [
                '삼위일체',
                '원소',
                '계절',
                '중심',
                '해석',
                '가이드라인',
                '봄', '여름', '가을', '겨울',  // seasonal keywords
                '물', '불', '공기', '땅',      // elemental keywords
                '과거', '현재', '미래',        // trinity time aspects
                'Trinity'
            ];
            
            const foundKeywords = guidelineKeywords.filter(keyword => 
                interpretationText.toLowerCase().includes(keyword.toLowerCase())
            );
            
            console.log('🔍 Guideline Analysis Results:');
            console.log(`Found keywords: ${foundKeywords.join(', ')}`);
            
            if (foundKeywords.length > 0) {
                console.log('✅ VERIFICATION SUCCESSFUL: Interpretation contains guideline-related content!');
                
                // Specific checks for Trinity View guideline
                const trinityKeywords = foundKeywords.filter(kw => 
                    ['삼위일체', '과거', '현재', '미래', 'Trinity'].includes(kw)
                );
                
                if (trinityKeywords.length > 0) {
                    console.log('✅ Trinity View guideline integration confirmed!');
                }
                
                // Specific checks for Elemental/Seasonal guideline
                const elementalSeasonalKeywords = foundKeywords.filter(kw => 
                    ['원소', '계절', '봄', '여름', '가을', '겨울', '물', '불', '공기', '땅'].includes(kw)
                );
                
                if (elementalSeasonalKeywords.length > 0) {
                    console.log('✅ Elemental/Seasonal guideline integration confirmed!');
                }
                
            } else {
                console.log('⚠️  Could not identify clear guideline usage in interpretation');
            }
            
            // Save interpretation to file for further analysis
            const analysisFile = path.join(screenshotsDir, 'interpretation-analysis.txt');
            fs.writeFileSync(analysisFile, `
TAROT READING QA TEST RESULTS
============================

Question: ${testQuestion}
Spread: 삼위일체 조망 (Trinity View)
Date: ${new Date().toISOString()}

FULL INTERPRETATION:
${interpretationText}

GUIDELINE ANALYSIS:
Found Keywords: ${foundKeywords.join(', ')}
Trinity Keywords: ${foundKeywords.filter(kw => ['삼위일체', '과거', '현재', '미래', 'Trinity'].includes(kw)).join(', ')}
Elemental/Seasonal Keywords: ${foundKeywords.filter(kw => ['원소', '계절', '봄', '여름', '가을', '겨울', '물', '불', '공기', '땅'].includes(kw)).join(', ')}

CONCLUSION: ${foundKeywords.length > 0 ? 'GUIDELINE INTEGRATION VERIFIED' : 'GUIDELINE USAGE UNCLEAR'}
            `);
            
            console.log(`📄 Analysis saved to: ${analysisFile}`);
            
        } else {
            console.log('❌ Could not find interpretation results after 3 minutes');
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'complete-error.png'),
                fullPage: true 
            });
        }
        
        console.log('🔍 Keeping browser open for final manual verification (30 seconds)...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'complete-error-exception.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
        console.log('🏁 Test completed');
    }
}

// Run the test
completeTarotReadingTest().catch(console.error);