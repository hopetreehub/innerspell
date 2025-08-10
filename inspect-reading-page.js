const { chromium } = require('playwright');

async function inspectReadingPage() {
    console.log('🔍 Inspecting reading page structure...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    
    try {
        await page.goto('http://localhost:4000/reading');
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of the page
        await page.screenshot({ 
            path: `reading-page-structure-${Date.now()}.png`,
            fullPage: true
        });
        
        // Get page title and basic info
        const title = await page.title();
        console.log('Page title:', title);
        
        // Get all interactive elements
        const inputs = await page.locator('input').count();
        const buttons = await page.locator('button').count();
        const textareas = await page.locator('textarea').count();
        const selects = await page.locator('select').count();
        
        console.log('Interactive elements found:');
        console.log(`- Inputs: ${inputs}`);
        console.log(`- Buttons: ${buttons}`);
        console.log(`- Textareas: ${textareas}`);
        console.log(`- Selects: ${selects}`);
        
        // Get all button texts
        const buttonTexts = await page.locator('button').allTextContents();
        console.log('Button texts:', buttonTexts);
        
        // Get all input placeholders
        const inputPlaceholders = await page.locator('input').evaluateAll(inputs => 
            inputs.map(input => input.placeholder || input.type || 'no placeholder')
        );
        console.log('Input placeholders:', inputPlaceholders);
        
        // Check for cards already visible
        const cardElements = await page.locator('[class*="card"], .tarot-card, .card').count();
        console.log(`Card elements visible: ${cardElements}`);
        
        // Get the page content structure
        const bodyContent = await page.locator('body').innerHTML();
        console.log('Page structure preview:', bodyContent.substring(0, 500) + '...');
        
        // Wait a bit to see the page
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('Error inspecting page:', error);
        await page.screenshot({ path: `reading-page-error-${Date.now()}.png` });
    } finally {
        await browser.close();
    }
}

inspectReadingPage().catch(console.error);