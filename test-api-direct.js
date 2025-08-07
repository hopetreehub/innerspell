// 직접 API 호출 테스트
async function testBlogAPIDirectly() {
  console.log('🚀 블로그 API 직접 테스트 시작...\n');
  
  const apiUrl = 'http://localhost:4000/api/blog/posts';
  
  // 테스트 데이터
  const testPost = {
    title: 'API 직접 테스트 포스트',
    excerpt: 'API 엔드포인트를 직접 호출하여 테스트합니다.',
    content: '# 테스트 포스트\n\n이것은 API를 직접 호출하는 테스트입니다.',
    category: 'tarot',
    tags: ['테스트', 'API', 'blog'],
    published: false,
    featured: false
  };
  
  try {
    console.log('📤 POST 요청 전송...');
    console.log('URL:', apiUrl);
    console.log('데이터:', JSON.stringify(testPost, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 필요한 경우 인증 헤더 추가
        'Cookie': 'mock-auth-token=dev-admin'
      },
      body: JSON.stringify(testPost)
    });
    
    console.log('\n📥 응답 받음:');
    console.log('상태 코드:', response.status);
    console.log('상태 텍스트:', response.statusText);
    console.log('헤더:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    const responseText = await response.text();
    console.log('\n응답 본문 (원시):');
    console.log(responseText);
    
    // JSON 파싱 시도
    try {
      const responseData = JSON.parse(responseText);
      console.log('\n응답 본문 (JSON):');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (response.ok) {
        console.log('\n✅ 포스트 생성 성공\!');
        console.log('생성된 포스트 ID:', responseData.postId);
      } else {
        console.log('\n❌ 포스트 생성 실패');
        console.log('에러 메시지:', responseData.error || responseData.message);
      }
    } catch (parseError) {
      console.log('\n⚠️ JSON 파싱 실패 - HTML 응답일 수 있습니다');
    }
    
    // GET 요청으로 포스트 목록 확인
    console.log('\n\n📤 GET 요청으로 포스트 목록 확인...');
    const getResponse = await fetch(`${apiUrl}?published=false`);
    const posts = await getResponse.json();
    console.log('포스트 총 개수:', posts.posts?.length || 0);
    
    // 방금 생성한 포스트 찾기
    const newPost = posts.posts?.find(p => p.title === testPost.title);
    if (newPost) {
      console.log('✅ 새로 생성된 포스트 발견:', newPost.id);
    } else {
      console.log('⚠️ 새로 생성된 포스트를 목록에서 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('서버가 실행되고 있지 않거나 포트 4000에서 접근할 수 없습니다.');
    }
  }
}

// 테스트 실행
testBlogAPIDirectly();
EOF < /dev/null
