const fs = require('fs');
const path = require('path');

async function publishTestPost() {
  console.log('📝 테스트 포스트를 공개 상태로 변경');
  
  try {
    // 블로그 포스트 데이터 읽기
    const dataPath = path.join(__dirname, 'data/blog-posts.json');
    const blogPosts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📊 총 ${blogPosts.length}개 블로그 포스트 확인`);
    
    // 최종 테스트 포스트 찾기
    const targetTitle = '최종 테스트 포스트';
    let testPostIndex = -1;
    
    for (let i = 0; i < blogPosts.length; i++) {
      if (blogPosts[i].title && blogPosts[i].title.includes(targetTitle)) {
        testPostIndex = i;
        break;
      }
    }
    
    if (testPostIndex === -1) {
      console.log('❌ 대상 포스트를 찾을 수 없습니다.');
      return { success: false, message: '대상 포스트 없음' };
    }
    
    const testPost = blogPosts[testPostIndex];
    console.log(`\n📝 "${testPost.title}" 처리 중...`);
    console.log(`   현재 상태: "${testPost.status}"`);
    console.log(`   현재 공개 여부: ${testPost.published}`);
    console.log(`   현재 이미지: "${testPost.image}"`);
    
    // 백업 생성
    const backupPath = path.join(__dirname, `data/backups/blog-posts_publish-backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(blogPosts, null, 2));
    console.log(`💾 백업 생성: ${backupPath}`);
    
    // 상태 변경
    blogPosts[testPostIndex].status = 'published';
    blogPosts[testPostIndex].published = true;
    blogPosts[testPostIndex].updatedAt = new Date().toISOString();
    
    // 발행 일시 설정 (없는 경우)
    if (!blogPosts[testPostIndex].publishedAt) {
      blogPosts[testPostIndex].publishedAt = new Date().toISOString();
    }
    
    console.log(`\n✅ 상태 변경 완료:`);
    console.log(`   새로운 상태: "${blogPosts[testPostIndex].status}"`);
    console.log(`   새로운 공개 여부: ${blogPosts[testPostIndex].published}`);
    console.log(`   업데이트 시각: ${blogPosts[testPostIndex].updatedAt}`);
    
    // 파일 저장
    fs.writeFileSync(dataPath, JSON.stringify(blogPosts, null, 2));
    console.log(`💾 변경사항 저장 완료`);
    
    // 변경된 포스트 정보 출력
    console.log(`\n📋 공개된 포스트 정보:`);
    console.log(`   ID: ${testPost.id}`);
    console.log(`   제목: ${testPost.title}`);
    console.log(`   이미지: ${testPost.image}`);
    console.log(`   카테고리: ${testPost.category}`);
    console.log(`   태그: ${testPost.tags?.join(', ') || '없음'}`);
    
    console.log(`\n✅ 테스트 포스트 공개 완료`);
    
    return {
      success: true,
      postId: testPost.id,
      title: testPost.title,
      image: testPost.image,
      status: testPost.status
    };
    
  } catch (error) {
    console.error(`❌ 공개 처리 실패:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 실행
if (require.main === module) {
  publishTestPost().catch(console.error);
}

module.exports = { publishTestPost };