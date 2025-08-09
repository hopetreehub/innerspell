const fs = require('fs');
const path = require('path');

async function fixImageSyncProblem() {
  console.log('🔧 블로그 이미지 동기화 문제 해결 시작');
  
  try {
    // 1단계: 블로그 포스트 데이터 읽기
    const dataPath = path.join(__dirname, 'data/blog-posts.json');
    const blogPosts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📊 총 ${blogPosts.length}개 블로그 포스트 확인`);
    
    let fixedCount = 0;
    let backupCreated = false;
    
    // 2단계: 각 포스트의 이미지 필드 동기화
    for (let i = 0; i < blogPosts.length; i++) {
      const post = blogPosts[i];
      const postTitle = post.title || `포스트 ${i + 1}`;
      
      console.log(`\n📝 "${postTitle}" 처리 중...`);
      console.log(`   현재 image: "${post.image}"`);
      console.log(`   현재 featuredImage: "${post.featuredImage}"`);
      
      // featuredImage가 있고 image와 다른 경우 동기화
      if (post.featuredImage && post.featuredImage !== post.image) {
        if (!backupCreated) {
          // 백업 생성
          const backupPath = path.join(__dirname, `data/backups/blog-posts_sync-fix-backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
          fs.writeFileSync(backupPath, JSON.stringify(blogPosts, null, 2));
          console.log(`💾 백업 생성: ${backupPath}`);
          backupCreated = true;
        }
        
        console.log(`   🔄 동기화 필요: featuredImage를 image로 복사`);
        blogPosts[i].image = post.featuredImage;
        fixedCount++;
        
        console.log(`   ✅ 동기화 완료: "${post.featuredImage}"`);
      } else if (post.featuredImage && post.featuredImage === post.image) {
        console.log(`   ✅ 이미 동기화됨`);
      } else if (!post.featuredImage && post.image) {
        console.log(`   ℹ️ featuredImage 없음, image만 사용: "${post.image}"`);
      } else {
        console.log(`   ⚠️ 이미지 정보 없음`);
      }
    }
    
    // 3단계: 변경사항이 있는 경우 저장
    if (fixedCount > 0) {
      fs.writeFileSync(dataPath, JSON.stringify(blogPosts, null, 2));
      console.log(`\n💾 ${fixedCount}개 포스트의 이미지 동기화 완료`);
      console.log(`📁 업데이트된 데이터 저장: ${dataPath}`);
    } else {
      console.log(`\n✅ 동기화가 필요한 포스트 없음`);
    }
    
    // 4단계: 동기화 결과 확인
    console.log(`\n📊 동기화 결과 요약:`);
    console.log(`   - 처리된 포스트: ${blogPosts.length}개`);
    console.log(`   - 동기화된 포스트: ${fixedCount}개`);
    console.log(`   - 백업 생성: ${backupCreated ? '✅' : '❌'}`);
    
    // 5단계: 수정된 포스트 목록 표시
    if (fixedCount > 0) {
      console.log(`\n🎯 동기화된 포스트들:`);
      for (let i = 0; i < blogPosts.length; i++) {
        const post = blogPosts[i];
        if (post.image && post.image.includes('/uploads/')) {
          console.log(`   ${i + 1}. "${post.title}"`);
          console.log(`      이미지: ${post.image}`);
        }
      }
    }
    
    console.log(`\n✅ 블로그 이미지 동기화 문제 해결 완료`);
    
    return {
      totalPosts: blogPosts.length,
      fixedPosts: fixedCount,
      backupCreated,
      success: true
    };
    
  } catch (error) {
    console.error(`❌ 동기화 실패:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 실행
if (require.main === module) {
  fixImageSyncProblem().catch(console.error);
}

module.exports = { fixImageSyncProblem };