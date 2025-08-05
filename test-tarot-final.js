const { chromium } = require('playwright');
const fs = require('fs');

async function testTarotCards() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const results = {
    tested: [],
    successful: [],
    failed: []
  };

  try {
    // Test cards to verify
    const cardsToTest = [
      'the-fool',
      'the-magician', 
      'the-empress',
      'the-chariot',
      'the-world',
      'death',
      'the-tower',
      'the-star',
      'ace-of-wands',
      'three-of-cups'
    ];
    
    console.log('Testing Tarot Card Detail Pages...\n');
    
    for (let i = 0; i < cardsToTest.length; i++) {
      const cardSlug = cardsToTest[i];
      const cardUrl = `http://localhost:4000/tarot/cards/${cardSlug}`;
      
      console.log(`Testing ${i + 1}/${cardsToTest.length}: ${cardSlug}`);
      
      try {
        await page.goto(cardUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check page title exists
        const pageTitle = await page.textContent('h1, h2');
        
        // Check for key elements
        const hasImage = await page.$('img, canvas');
        const hasButtons = await page.$$('button');
        const hasContent = await page.$('.prose, .content, div[class*="content"], p');
        
        if (pageTitle && hasImage && hasButtons.length > 0 && hasContent) {
          results.successful.push(cardSlug);
          console.log(`  ✓ Success - Page loaded with title: ${pageTitle.trim()}`);
          
          // Try clicking reversed button if available
          const reversedBtn = await page.$('button:has-text("역방향")');
          if (reversedBtn) {
            await reversedBtn.click();
            await page.waitForTimeout(500);
            console.log(`    - Reversed view tested`);
          }
        } else {
          results.failed.push({
            card: cardSlug,
            reason: 'Missing essential elements'
          });
          console.log(`  ✗ Failed - Missing elements`);
        }
        
        // Take screenshot
        await page.screenshot({ 
          path: `tarot-test-screenshots/${i + 1}-${cardSlug}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        results.failed.push({
          card: cardSlug,
          reason: error.message
        });
        console.log(`  ✗ Error: ${error.message}`);
      }
      
      results.tested.push(cardSlug);
    }
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total tested: ${results.tested.length}`);
    console.log(`Successful: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Success rate: ${Math.round((results.successful.length / results.tested.length) * 100)}%`);
    
    if (results.successful.length > 0) {
      console.log('\n✓ Working cards:');
      results.successful.forEach(card => console.log(`  - ${card}`));
    }
    
    if (results.failed.length > 0) {
      console.log('\n✗ Failed cards:');
      results.failed.forEach(item => console.log(`  - ${item.card}: ${item.reason}`));
    }
    
    // Save report
    fs.writeFileSync(
      'tarot-test-screenshots/final-report.json',
      JSON.stringify(results, null, 2)
    );
    
  } catch (error) {
    console.error('Critical error:', error);
  } finally {
    await browser.close();
  }
}

// Create directory
if (!fs.existsSync('tarot-test-screenshots')) {
  fs.mkdirSync('tarot-test-screenshots');
}

testTarotCards();