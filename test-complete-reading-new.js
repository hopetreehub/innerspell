const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testCompleteReading() {
    console.log('🔍 Testing complete tarot reading workflow...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();
    
    try {
        const screenshotDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        console.log('📱 Accessing reading page...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotDir, 'complete-01-page-loaded.png'), fullPage: true });
        
        console.log('📱 Entering question...');
        const questionInput = await page.locator('textarea[placeholder*="질문"]').first();
        await questionInput.fill('새로운 삼위일체 조망 가이드라인이 적용되었는지 확인해주세요');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotDir, 'complete-02-question-entered.png'), fullPage: true });
        
        console.log('📱 Selecting Trinity View spread...');
        const spreadSelect = await page.locator('select').first();
        await spreadSelect.selectOption('trinity');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotDir, 'complete-03-spread-selected.png'), fullPage: true });
        
        console.log('📱 Starting reading...');
        const startButton = await page.locator('button').filter({ hasText: /카드 섞기|시작/i }).first();
        if (await startButton.isVisible()) {
            await startButton.click();
            await page.waitForTimeout(3000);
            
            // Wait for cards to appear
            await page.waitForSelector('.tarot-card, .card, [class*="card"]', { timeout: 10000 });
            
            console.log('📱 Selecting cards...');
            const cards = await page.locator('.tarot-card, .card, [class*="card"]').all();
            console.log(`Found ${cards.length} cards`);
            
            // Select 3 cards for Trinity View
            for (let i = 0; i < Math.min(3, cards.length); i++) {
                await cards[i].click();
                await page.waitForTimeout(1500);
                console.log(`Selected card ${i + 1}`);
            }
            
            console.log('📱 Waiting for interpretation...');
            await page.waitForTimeout(15000); // Wait for AI interpretation
            
            await page.screenshot({ path: path.join(screenshotDir, 'complete-04-interpretation.png'), fullPage: true });
            
            // Check interpretation content
            const bodyText = await page.textContent('body');
            
            const hasTrinityConcepts = bodyText.includes('과거') || 
                                     bodyText.includes('현재') || 
                                     bodyText.includes('미래') ||
                                     bodyText.includes('삼위일체');
            
            console.log(`🔍 Trinity concepts found in interpretation: ${hasTrinityConcepts}`);
            
            // Log some of the interpretation content
            const interpretationElements = await page.locator('div, p').filter({ hasText: /해석|결과|의미/ }).all();
            for (const element of interpretationElements.slice(0, 3)) {
                const text = await element.textContent();
                if (text && text.length > 20) {
                    console.log('📝 Interpretation sample:', text.substring(0, 100) + '...');
                }
            }
            
        } else {
            console.log('❌ Start button not found');
            await page.screenshot({ path: path.join(screenshotDir, 'complete-error.png'), fullPage: true });
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: path.join(screenshotDir, 'complete-error.png'), fullPage: true });
    } finally {
        await browser.close();
    }
}

testCompleteReading().catch(console.error);