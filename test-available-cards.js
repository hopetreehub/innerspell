const { chromium } = require('playwright');
const fs = require('fs');

async function testAvailableCards() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  try {
    console.log('1. Getting available cards from main tarot page...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Get all card links from the main page
    const cardData = await page.evaluate(() => {
      const cards = [];
      const cardElements = document.querySelectorAll('a[href*="/tarot/cards/"]');
      
      cardElements.forEach(card => {
        const href = card.getAttribute('href');
        const imgElement = card.querySelector('img');
        const titleElement = card.querySelector('h3, h4, p, div');
        
        if (href) {
          cards.push({
            href: href,
            slug: href.split('/').pop(),
            title: titleElement ? titleElement.textContent.trim() : 'Unknown',
            imgSrc: imgElement ? imgElement.src : null
          });
        }
      });
      
      return cards;
    });
    
    console.log(`\nFound ${cardData.length} cards on the main page:`);
    cardData.forEach((card, i) => {
      console.log(`  ${i + 1}. ${card.title} (${card.slug})`);
    });
    
    console.log('\n2. Testing each available card...\n');
    
    const results = {
      totalAvailable: cardData.length,
      tested: [],
      working: [],
      notWorking: []
    };
    
    // Test up to 10 cards
    const cardsToTest = cardData.slice(0, 10);
    
    for (let i = 0; i < cardsToTest.length; i++) {
      const card = cardsToTest[i];
      const cardUrl = `http://localhost:4000${card.href}`;
      
      console.log(`Testing ${i + 1}/${cardsToTest.length}: ${card.title} (${card.slug})`);
      
      try {
        await page.goto(cardUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        
        // Check if it's a 404 page
        const pageTitle = await page.textContent('h1, h2');
        const is404 = pageTitle && pageTitle.includes('404');
        
        if (is404) {
          results.notWorking.push({
            ...card,
            error: '404 - Page not found'
          });
          console.log(`  ✗ 404 Error`);
        } else {
          // Check for card elements
          const hasCardImage = await page.$('img[src*="tarot"], canvas, .card-image');
          const hasContent = await page.$('.prose, .content, p');
          const hasButtons = await page.$$('button');
          
          if (hasCardImage && hasContent && hasButtons.length > 0) {
            results.working.push(card);
            console.log(`  ✓ Working properly - Title: ${pageTitle.trim()}`);
            
            // Test reversed button
            const reversedBtn = await page.$('button:has-text("역방향")');
            if (reversedBtn) {
              await reversedBtn.click();
              await page.waitForTimeout(500);
              console.log(`    - Reversed toggle tested`);
            }
            
            // Test a category tab
            const tabs = await page.$$('button:has-text("연애"), button:has-text("사업")');
            if (tabs.length > 0) {
              await tabs[0].click();
              await page.waitForTimeout(500);
              console.log(`    - Category tab tested`);
            }
          } else {
            results.notWorking.push({
              ...card,
              error: 'Missing essential elements'
            });
            console.log(`  ✗ Missing elements`);
          }
        }
        
        // Take screenshot
        await page.screenshot({ 
          path: `tarot-test-screenshots/card-${String(i + 1).padStart(2, '0')}-${card.slug}.png`,
          fullPage: true 
        });
        
        results.tested.push(card);
        
      } catch (error) {
        results.notWorking.push({
          ...card,
          error: error.message
        });
        console.log(`  ✗ Error: ${error.message}`);
      }
    }
    
    // Test mobile view on a working card
    if (results.working.length > 0) {
      console.log('\n3. Testing mobile responsiveness...');
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`http://localhost:4000${results.working[0].href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'tarot-test-screenshots/mobile-view.png',
        fullPage: true 
      });
      console.log('✓ Mobile view tested');
    }
    
    // Generate final report
    const report = {
      summary: {
        totalCardsOnMainPage: results.totalAvailable,
        cardsTested: results.tested.length,
        workingCards: results.working.length,
        notWorkingCards: results.notWorking.length,
        successRate: `${Math.round((results.working.length / results.tested.length) * 100)}%`
      },
      workingCards: results.working,
      notWorkingCards: results.notWorking,
      timestamp: new Date().toISOString()
    };
    
    // Save report
    fs.writeFileSync(
      'tarot-test-screenshots/comprehensive-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n=== FINAL REPORT ===');
    console.log(`Total cards on main page: ${report.summary.totalCardsOnMainPage}`);
    console.log(`Cards tested: ${report.summary.cardsTested}`);
    console.log(`Working cards: ${report.summary.workingCards}`);
    console.log(`Not working: ${report.summary.notWorkingCards}`);
    console.log(`Success rate: ${report.summary.successRate}`);
    
    console.log('\n✓ WORKING CARDS:');
    results.working.forEach(card => {
      console.log(`  - ${card.title} (${card.slug})`);
    });
    
    if (results.notWorking.length > 0) {
      console.log('\n✗ NOT WORKING:');
      results.notWorking.forEach(card => {
        console.log(`  - ${card.title} (${card.slug}): ${card.error}`);
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
    console.log('\n✓ Test completed. Check tarot-test-screenshots folder for screenshots and report.');
  }
}

// Create directory if needed
if (!fs.existsSync('tarot-test-screenshots')) {
  fs.mkdirSync('tarot-test-screenshots');
}

testAvailableCards();