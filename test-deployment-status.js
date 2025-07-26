const https = require('https');

console.log('🔍 새로운 배포 상태 확인...');

// Test new API endpoint
const testNewAPI = () => {
  console.log('\n1. 새로운 API 엔드포인트 테스트:');
  https.get('https://test-studio-firebase.vercel.app/api/force-deploy', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ 새로운 API 엔드포인트 작동!');
        console.log(`배포 시간: ${response.timestamp}`);
        console.log(`버전: ${response.version}`);
        console.log(`블로그 포스트: ${response.blogPosts}개`);
        console.log(`상태: ${response.status}`);
      } catch (error) {
        console.log('❌ 새로운 API 아직 배포되지 않음');
      }
    });
  }).on('error', () => {
    console.log('❌ 새로운 API 연결 실패 - 아직 배포 중');
  });
};

// Test blog API
const testBlogAPI = () => {
  console.log('\n2. 블로그 API 테스트:');
  https.get('https://test-studio-firebase.vercel.app/api/blog/posts', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`블로그 포스트 수: ${response.posts?.length || 0}개`);
        if (response.posts?.length >= 12) {
          console.log('🎉 성공! 12개 포스트 확인됨!');
        } else {
          console.log('⏳ 아직 이전 버전 (배포 진행 중)');
        }
      } catch (error) {
        console.log('❌ 블로그 API 응답 파싱 실패');
      }
    });
  }).on('error', () => {
    console.log('❌ 블로그 API 연결 실패');
  });
};

// Run tests
testNewAPI();
setTimeout(testBlogAPI, 1000);