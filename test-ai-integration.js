const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testAIIntegration() {
    console.log('=== AI Integration Test ===\n');
    
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    const driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    try {
        console.log('1. Opening homepage...');
        await driver.get('http://localhost:4000');
        
        // Wait for page to load
        await driver.wait(until.titleContains('InnerSpell'), 10000);
        console.log('   ✓ Homepage loaded');
        
        console.log('\n2. Navigating to reading page...');
        // Try to find reading link
        try {
            const readingLink = await driver.findElement(By.linkText('타로 리딩'));
            await readingLink.click();
            console.log('   ✓ Clicked 타로 리딩 link');
        } catch (e) {
            console.log('   ! Link not found, trying direct navigation');
            await driver.get('http://localhost:4000/reading');
        }
        
        // Check if we're on reading page
        await driver.wait(until.urlContains('/reading'), 5000);
        console.log('   ✓ Reading page loaded');
        
        console.log('\n3. Testing tarot card drawing...');
        
        // Look for question input
        const questionInput = await driver.wait(
            until.elementLocated(By.css('input[type="text"], textarea')), 
            10000
        );
        await questionInput.sendKeys('테스트 질문입니다');
        console.log('   ✓ Question entered');
        
        // Look for start reading button
        const startButton = await driver.findElement(
            By.xpath("//button[contains(text(), '시작') or contains(text(), '카드') or contains(text(), '리딩')]")
        );
        await startButton.click();
        console.log('   ✓ Reading started');
        
        // Wait for cards to be dealt (this might take a moment)
        await driver.sleep(3000);
        
        // Check if cards are visible
        const cards = await driver.findElements(By.css('.card, [class*="card"], img[alt*="card"], img[alt*="카드"]'));
        console.log(`   ✓ Found ${cards.length} card elements`);
        
        // Look for AI interpretation section
        console.log('\n4. Checking for AI interpretation...');
        
        // Wait a bit more for AI processing
        await driver.sleep(5000);
        
        const interpretationElements = await driver.findElements(
            By.xpath("//*[contains(text(), '해석') or contains(text(), '의미') or contains(text(), 'AI')]")
        );
        
        if (interpretationElements.length > 0) {
            console.log('   ✓ AI interpretation section found');
            
            // Check if there's actual interpretation text
            const pageSource = await driver.getPageSource();
            if (pageSource.includes('API 키') || pageSource.includes('설정되지 않았습니다')) {
                console.log('   ⚠ API key not configured');
            } else if (pageSource.includes('해석 생성 중') || pageSource.includes('loading')) {
                console.log('   ⏳ AI interpretation is loading');
            } else {
                console.log('   ✓ AI interpretation appears to be working');
            }
        } else {
            console.log('   ✗ No AI interpretation section found');
        }
        
        // Take a screenshot for debugging
        const screenshot = await driver.takeScreenshot();
        require('fs').writeFileSync('ai-test-screenshot.png', screenshot, 'base64');
        console.log('   ✓ Screenshot saved as ai-test-screenshot.png');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await driver.quit();
    }
}

// Check if selenium-webdriver is available
try {
    testAIIntegration().catch(console.error);
} catch (e) {
    console.log('Selenium WebDriver not available. Using Playwright instead...');
    
    // Fallback to simpler test
    const fetch = require('node-fetch');
    
    async function simpleTest() {
        try {
            console.log('Testing basic server response...');
            const response = await fetch('http://localhost:4000');
            console.log('Server status:', response.status);
            
            if (response.ok) {
                const html = await response.text();
                console.log('Homepage contains "타로":', html.includes('타로'));
                console.log('Homepage contains "리딩":', html.includes('리딩'));
            }
        } catch (error) {
            console.error('Simple test failed:', error.message);
        }
    }
    
    simpleTest();
}