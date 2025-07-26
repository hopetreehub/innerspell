const https = require('https');

// Test the API endpoint directly
const url = 'https://test-studio-firebase.vercel.app/api/blog/posts';

console.log('🔍 Testing blog API directly...');
console.log(`URL: ${url}`);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n📊 API Response:');
      console.log(`Status: ${res.statusCode}`);
      console.log(`Posts returned: ${response.posts?.length || 0}`);
      
      if (response.posts && response.posts.length > 0) {
        console.log('\n📝 Post titles:');
        response.posts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
        });
        
        // Check for new posts
        const newPostIds = [
          'tarot-2025-new-year-guide',
          'ai-tarot-future-guide',
          'dream-meaning-psychology',
          'tarot-meditation-practice',
          'modern-spirituality-guide'
        ];
        
        console.log('\n🔍 New posts check:');
        newPostIds.forEach(id => {
          const found = response.posts.some(post => post.id === id);
          console.log(`- ${id}: ${found ? '✅' : '❌'}`);
        });
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err);
});