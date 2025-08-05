const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveTarotTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const results = {
    mainPage: {},
    cards: {
      tested: [],
      successful: [],
      failed: []
    }
  };

  try {
    console.log('=== COMPREHENSIVE TAROT CARD TEST ===\n');
    
    // 1. Test main tarot page
    console.log('1. Testing main tarot page...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'tarot-test-screenshots/01-main-tarot-page.png',
      fullPage: true 
    });
    
    // Get all card links
    const cardLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href^="/tarot/major-"], a[href^="/tarot/minor-"], a[href*="/tarot/wands-"], a[href*="/tarot/cups-"], a[href*="/tarot/swords-"], a[href*="/tarot/pentacles-"]').forEach(link => {
        const href = link.getAttribute('href');
        const img = link.querySelector('img');
        const text = link.textContent.trim();
        
        links.push({
          href: href,
          title: img ? img.alt : text,
          type: href.includes('major') ? 'Major Arcana' : 'Minor Arcana'
        });
      });
      return links;
    });
    
    results.mainPage = {
      totalCards: cardLinks.length,
      majorArcana: cardLinks.filter(c => c.type === 'Major Arcana').length,
      minorArcana: cardLinks.filter(c => c.type === 'Minor Arcana').length
    };
    
    console.log(`  ✓ Found ${results.mainPage.totalCards} cards`);
    console.log(`    - Major Arcana: ${results.mainPage.majorArcana}`);
    console.log(`    - Minor Arcana: ${results.mainPage.minorArcana}`);
    
    // 2. Test individual card pages
    console.log('\n2. Testing individual card detail pages...\n');
    
    // Select cards to test: first 5 major, last 3 major, and some minor if available
    const cardsToTest = [
      ...cardLinks.filter(c => c.type === 'Major Arcana').slice(0, 5),
      ...cardLinks.filter(c => c.type === 'Major Arcana').slice(-3),
      ...cardLinks.filter(c => c.type === 'Minor Arcana').slice(0, 4)
    ];
    
    for (let i = 0; i < cardsToTest.length; i++) {
      const card = cardsToTest[i];
      const cardUrl = `http://localhost:4000${card.href}`;
      
      console.log(`Testing ${i + 1}/${cardsToTest.length}: ${card.title} (${card.type})`);
      
      try {
        await page.goto(cardUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check if page loaded successfully
        const pageTitle = await page.textContent('h1, h2');
        const is404 = pageTitle && pageTitle.includes('404');
        
        if (is404) {
          results.cards.failed.push({
            ...card,
            error: '404 Page Not Found'
          });
          console.log(`  ✗ 404 Error`);
        } else {
          // Check for essential elements
          const elements = {
            title: await page.$('h1, h2'),
            image: await page.$('img[src*="tarot"], canvas, .card-image'),
            uprightToggle: await page.$('button:has-text("정방향"), button:has-text("Upright")'),
            reversedToggle: await page.$('button:has-text("역방향"), button:has-text("Reversed")'),
            tabs: await page.$$('button:has-text("전체"), button:has-text("연애"), button:has-text("사업"), button:has-text("건강")'),
            content: await page.$('.prose, .content, [class*="content"], .description'),
            keywords: await page.$('text=/키워드/i, text=/Keywords/i, .keywords')
          };
          
          const missingElements = [];
          for (const [name, element] of Object.entries(elements)) {
            if (!element || (Array.isArray(element) && element.length === 0)) {
              missingElements.push(name);
            }
          }
          
          if (missingElements.length === 0) {
            results.cards.successful.push({
              ...card,
              pageTitle: pageTitle.trim()
            });
            console.log(`  ✓ All elements present - "${pageTitle.trim()}"`);
            
            // Test interactions
            // Test upright/reversed toggle
            if (elements.reversedToggle) {
              await elements.reversedToggle.click();
              await page.waitForTimeout(500);
              console.log(`    - Reversed toggle tested`);
            }
            
            // Test category tabs
            if (elements.tabs.length > 1) {
              await elements.tabs[1].click(); // Click 연애 tab
              await page.waitForTimeout(500);
              console.log(`    - Category tabs tested`);
            }
          } else {
            results.cards.failed.push({
              ...card,
              error: `Missing: ${missingElements.join(', ')}`
            });
            console.log(`  ⚠ Missing elements: ${missingElements.join(', ')}`);
          }
        }
        
        // Take screenshot
        if (i < 5 || results.cards.failed.some(f => f.href === card.href)) {
          await page.screenshot({ 
            path: `tarot-test-screenshots/card-${String(i + 2).padStart(2, '0')}-${card.href.split('/').pop()}.png`,
            fullPage: true 
          });
        }
        
        results.cards.tested.push(card);
        
      } catch (error) {
        results.cards.failed.push({
          ...card,
          error: error.message
        });
        console.log(`  ✗ Error: ${error.message}`);
      }
    }
    
    // 3. Test mobile responsiveness
    console.log('\n3. Testing mobile responsiveness...');
    if (results.cards.successful.length > 0) {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test main page mobile
      await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'tarot-test-screenshots/mobile-01-main-page.png',
        fullPage: true 
      });
      
      // Test card detail mobile
      const successfulCard = results.cards.successful[0];
      await page.goto(`http://localhost:4000${successfulCard.href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'tarot-test-screenshots/mobile-02-card-detail.png',
        fullPage: true 
      });
      
      console.log('  ✓ Mobile views tested');
    }
    
    // 4. Generate comprehensive report
    const report = {
      testDate: new Date().toISOString(),
      summary: {
        mainPage: {
          totalCardsAvailable: results.mainPage.totalCards,
          majorArcana: results.mainPage.majorArcana,
          minorArcana: results.mainPage.minorArcana
        },
        testing: {
          cardsTested: results.cards.tested.length,
          successful: results.cards.successful.length,
          failed: results.cards.failed.length,
          successRate: `${Math.round((results.cards.successful.length / results.cards.tested.length) * 100)}%`
        }
      },
      successfulCards: results.cards.successful,
      failedCards: results.cards.failed,
      recommendations: []
    };
    
    // Add recommendations
    if (results.cards.failed.length > 0) {
      const notFoundCount = results.cards.failed.filter(c => c.error.includes('404')).length;
      if (notFoundCount > 0) {
        report.recommendations.push(`${notFoundCount} cards return 404 errors - check URL routing`);
      }
      
      const missingElementsCards = results.cards.failed.filter(c => c.error.includes('Missing'));
      if (missingElementsCards.length > 0) {
        report.recommendations.push('Some cards are missing UI elements - check component rendering');
      }
    }
    
    if (results.cards.successful.length === results.cards.tested.length) {
      report.recommendations.push('All tested cards are working perfectly!');
    }
    
    // Save report
    fs.writeFileSync(
      'tarot-test-screenshots/comprehensive-test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Print final summary
    console.log('\n=== COMPREHENSIVE TEST SUMMARY ===');
    console.log(`Total cards available: ${report.summary.mainPage.totalCardsAvailable}`);
    console.log(`  - Major Arcana: ${report.summary.mainPage.majorArcana}`);
    console.log(`  - Minor Arcana: ${report.summary.mainPage.minorArcana}`);
    console.log(`\nCards tested: ${report.summary.testing.cardsTested}`);
    console.log(`Successful: ${report.summary.testing.successful}`);
    console.log(`Failed: ${report.summary.testing.failed}`);
    console.log(`Success rate: ${report.summary.testing.successRate}`);
    
    if (results.cards.successful.length > 0) {
      console.log('\n✓ WORKING CARDS:');
      results.cards.successful.forEach(card => {
        console.log(`  - ${card.title} (${card.type})`);
      });
    }
    
    if (results.cards.failed.length > 0) {
      console.log('\n✗ FAILED CARDS:');
      results.cards.failed.forEach(card => {
        console.log(`  - ${card.title}: ${card.error}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
    
  } catch (error) {
    console.error('Critical error:', error);
    await page.screenshot({ 
      path: 'tarot-test-screenshots/error-screenshot.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n✓ Test completed. Check tarot-test-screenshots folder for detailed results.');
  }
}

// Create directory if needed
if (!fs.existsSync('tarot-test-screenshots')) {
  fs.mkdirSync('tarot-test-screenshots');
}

comprehensiveTarotTest();