const { chromium } = require('playwright');
const fs = require('fs');

async function finalTarotTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const results = {
    mainPage: {},
    cardTests: []
  };

  try {
    console.log('=== TAROT CARD COMPREHENSIVE TEST ===\n');
    
    // 1. Test main tarot page
    console.log('1. Testing main tarot page...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tarot-test-screenshots/01-main-page.png',
      fullPage: true 
    });
    
    // Count cards on page
    const cardCount = await page.evaluate(() => {
      const majorCards = document.querySelectorAll('a[href*="/tarot/major-"]').length;
      const minorCards = document.querySelectorAll('a[href*="/tarot/wands-"], a[href*="/tarot/cups-"], a[href*="/tarot/swords-"], a[href*="/tarot/pentacles-"]').length;
      return { major: majorCards, minor: minorCards, total: majorCards + minorCards };
    });
    
    results.mainPage = cardCount;
    console.log(`  ✓ Found ${cardCount.total} cards (${cardCount.major} Major, ${cardCount.minor} Minor)\n`);
    
    // 2. Test individual cards
    console.log('2. Testing individual card pages...\n');
    
    // Define specific cards to test
    const testCards = [
      { name: 'The Fool', url: '/tarot/major-00-fool' },
      { name: 'The Magician', url: '/tarot/major-01-magician' },
      { name: 'The High Priestess', url: '/tarot/major-02-high-priestess' },
      { name: 'The Empress', url: '/tarot/major-03-empress' },
      { name: 'The Chariot', url: '/tarot/major-07-chariot' },
      { name: 'Death', url: '/tarot/major-13-death' },
      { name: 'The Tower', url: '/tarot/major-16-tower' },
      { name: 'The World', url: '/tarot/major-21-world' }
    ];
    
    for (let i = 0; i < testCards.length; i++) {
      const card = testCards[i];
      console.log(`Testing ${i + 1}/${testCards.length}: ${card.name}`);
      
      const testResult = {
        name: card.name,
        url: card.url,
        status: 'testing',
        elements: {},
        errors: []
      };
      
      try {
        await page.goto(`http://localhost:4000${card.url}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check page title
        const pageTitle = await page.textContent('h1, h2').catch(() => null);
        testResult.pageTitle = pageTitle ? pageTitle.trim() : 'No title found';
        
        // Check for 404
        if (pageTitle && pageTitle.includes('404')) {
          testResult.status = 'failed';
          testResult.errors.push('404 Page Not Found');
          console.log(`  ✗ 404 Error`);
        } else {
          // Check elements
          testResult.elements = {
            hasImage: !!(await page.$('img, canvas').catch(() => false)),
            hasTitle: !!(await page.$('h1, h2').catch(() => false)),
            hasContent: !!(await page.$('.prose, p, div[class*="content"]').catch(() => false)),
            hasButtons: (await page.$$('button').catch(() => [])).length > 0,
            hasUprightReversed: !!(await page.$('button:has-text("정방향"), button:has-text("역방향")').catch(() => false)),
            hasTabs: (await page.$$('button:has-text("전체"), button:has-text("연애"), button:has-text("사업"), button:has-text("건강")').catch(() => [])).length > 0
          };
          
          const allElementsPresent = Object.values(testResult.elements).every(v => v);
          
          if (allElementsPresent) {
            testResult.status = 'success';
            console.log(`  ✓ All elements present`);
            
            // Test interactions
            const reversedBtn = await page.$('button:has-text("역방향")').catch(() => null);
            if (reversedBtn) {
              await reversedBtn.click();
              await page.waitForTimeout(500);
              console.log(`    - Reversed toggle tested`);
            }
            
            const loveTab = await page.$('button:has-text("연애")').catch(() => null);
            if (loveTab) {
              await loveTab.click();
              await page.waitForTimeout(500);
              console.log(`    - Category tab tested`);
            }
          } else {
            testResult.status = 'partial';
            const missing = Object.entries(testResult.elements)
              .filter(([k, v]) => !v)
              .map(([k]) => k);
            testResult.errors.push(`Missing: ${missing.join(', ')}`);
            console.log(`  ⚠ Missing elements: ${missing.join(', ')}`);
          }
        }
        
        // Take screenshot for first 5 cards
        if (i < 5) {
          await page.screenshot({ 
            path: `tarot-test-screenshots/card-${String(i + 1).padStart(2, '0')}-${card.url.split('/').pop()}.png`,
            fullPage: true 
          });
        }
        
      } catch (error) {
        testResult.status = 'error';
        testResult.errors.push(error.message);
        console.log(`  ✗ Error: ${error.message}`);
      }
      
      results.cardTests.push(testResult);
    }
    
    // 3. Test mobile view
    console.log('\n3. Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'tarot-test-screenshots/mobile-main-page.png',
      fullPage: true 
    });
    
    if (results.cardTests.some(t => t.status === 'success')) {
      const successCard = results.cardTests.find(t => t.status === 'success');
      await page.goto(`http://localhost:4000${successCard.url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'tarot-test-screenshots/mobile-card-detail.png',
        fullPage: true 
      });
    }
    console.log('  ✓ Mobile views tested');
    
    // 4. Generate summary
    const summary = {
      totalCardsOnSite: results.mainPage.total,
      majorArcana: results.mainPage.major,
      minorArcana: results.mainPage.minor,
      cardsTested: results.cardTests.length,
      successful: results.cardTests.filter(t => t.status === 'success').length,
      partial: results.cardTests.filter(t => t.status === 'partial').length,
      failed: results.cardTests.filter(t => t.status === 'failed').length,
      errors: results.cardTests.filter(t => t.status === 'error').length
    };
    
    // Save detailed report
    const report = {
      testDate: new Date().toISOString(),
      summary,
      mainPage: results.mainPage,
      cardTests: results.cardTests
    };
    
    fs.writeFileSync(
      'tarot-test-screenshots/test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Print summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total cards available: ${summary.totalCardsOnSite}`);
    console.log(`  - Major Arcana: ${summary.majorArcana}`);
    console.log(`  - Minor Arcana: ${summary.minorArcana}`);
    console.log(`\nCards tested: ${summary.cardsTested}`);
    console.log(`  ✓ Fully working: ${summary.successful}`);
    console.log(`  ⚠ Partially working: ${summary.partial}`);
    console.log(`  ✗ Failed (404): ${summary.failed}`);
    console.log(`  ✗ Errors: ${summary.errors}`);
    
    console.log('\n=== DETAILED RESULTS ===');
    results.cardTests.forEach(test => {
      const icon = test.status === 'success' ? '✓' : test.status === 'partial' ? '⚠' : '✗';
      console.log(`${icon} ${test.name}: ${test.status}`);
      if (test.errors.length > 0) {
        console.log(`    Issues: ${test.errors.join(', ')}`);
      }
    });
    
    const successRate = Math.round((summary.successful / summary.cardsTested) * 100);
    console.log(`\nOverall success rate: ${successRate}%`);
    
    if (successRate === 100) {
      console.log('\n🎉 All tested cards are working perfectly!');
    } else if (successRate >= 75) {
      console.log('\n👍 Most cards are working well, minor issues to fix.');
    } else {
      console.log('\n⚠️  Several cards need attention.');
    }
    
  } catch (error) {
    console.error('Critical error:', error);
  } finally {
    await browser.close();
    console.log('\n✓ Test completed. Results saved to tarot-test-screenshots/');
  }
}

// Create directory
if (!fs.existsSync('tarot-test-screenshots')) {
  fs.mkdirSync('tarot-test-screenshots');
}

finalTarotTest();