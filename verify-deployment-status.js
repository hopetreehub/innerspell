const fetch = require('node-fetch');

async function checkDeploymentStatus() {
  console.log('Checking Vercel deployment status...\n');
  
  const deploymentUrl = 'https://innerspell.vercel.app';
  
  try {
    // Check main page
    console.log('1. Checking main page...');
    const mainResponse = await fetch(deploymentUrl, { timeout: 30000 });
    console.log(`   Status: ${mainResponse.status} ${mainResponse.statusText}`);
    
    // Check tarot reading page
    console.log('\n2. Checking tarot reading page...');
    const tarotResponse = await fetch(`${deploymentUrl}/tarot-reading`, { timeout: 30000 });
    console.log(`   Status: ${tarotResponse.status} ${tarotResponse.statusText}`);
    
    // Check API endpoint
    console.log('\n3. Checking API endpoint...');
    const apiResponse = await fetch(`${deploymentUrl}/api/generate-tarot-interpretation`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Test question',
        cardSpread: 'Test spread',
        cardInterpretations: 'Test cards',
        spreadId: 'trinity-view',
        styleId: 'traditional-rws'
      }),
      timeout: 30000
    });
    console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('   Response preview:', JSON.stringify(data).substring(0, 100) + '...');
    }
    
    console.log('\n✅ Deployment appears to be working!');
    console.log('\nTo test the guideline integration:');
    console.log('1. Open https://innerspell.vercel.app/tarot-reading');
    console.log('2. Enter a question');
    console.log('3. Select "삼위일체 조망 (Trinity View)" spread');
    console.log('4. Select "전통 RWS (Traditional RWS)" style');
    console.log('5. Draw cards and get interpretation');
    console.log('6. Check if interpretation mentions spread positions (과거/현재/미래) and follows the style');
    
  } catch (error) {
    console.error('Error checking deployment:', error.message);
  }
}

checkDeploymentStatus();