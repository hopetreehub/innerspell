const { chromium } = require('playwright');

async function simpleTest() {
    console.log('🎯 Simple Chromium Test');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newContext().then(ctx => ctx.newPage());
    
    // Monitor console
    page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('generateTarotInterpretation')) {
            console.log('❌ AI Error:', msg.text());
        }
    });
    
    try {
        // Just load the page
        console.log('Loading page...');
        await page.goto('https://test-studio-firebase.vercel.app/reading', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'simple-test.png' });
        
        console.log('✅ Page loaded successfully');
        
        // Check if reading page elements exist
        const hasQuestionInput = await page.locator('textarea').count() > 0;
        const hasShuffleButton = await page.locator('button:has-text("카드 섞기")').count() > 0;
        
        console.log('Question input exists:', hasQuestionInput);
        console.log('Shuffle button exists:', hasShuffleButton);
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

simpleTest().catch(console.error);