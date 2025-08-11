import { mockPosts } from '@/lib/blog/posts';
import * as fs from 'fs/promises';
import * as path from 'path';

// 블로그 포스트를 관리자 대시보드 형식으로 변환
async function migrateBlogPosts() {
  console.log('🚀 블로그 포스트 마이그레이션 시작...');
  
  // data 디렉토리 확인 및 생성
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('📁 data 디렉토리 생성');
  }
  
  // 블로그 포스트 파일 경로
  const blogPostsFile = path.join(dataDir, 'blog-posts.json');
  
  // 기존 포스트 읽기 (있다면)
  let existingPosts = [];
  try {
    const fileContent = await fs.readFile(blogPostsFile, 'utf-8');
    const data = JSON.parse(fileContent);
    existingPosts = data.posts || data || [];
    console.log(`📄 기존 포스트 ${existingPosts.length}개 발견`);
  } catch {
    console.log('📄 기존 포스트 파일 없음, 새로 생성');
  }
  
  // mockPosts를 관리자 대시보드 형식으로 변환
  const migratedPosts = mockPosts.map((post, index) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    author: post.author || 'InnerSpell Team',
    image: post.image || `/images/blog${(index % 8) + 1}.png`,
    featuredImage: post.image || `/images/blog${(index % 8) + 1}.png`,
    featured: post.featured,
    published: post.published,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt.toISOString ? post.publishedAt.toISOString() : post.publishedAt,
    updatedAt: new Date().toISOString(),
    views: post.views || 0,
    slug: post.id,
    metaDescription: post.excerpt,
    metaKeywords: post.tags.join(', ')
  }));
  
  // 중복 제거 (ID 기준)
  const existingIds = new Set(existingPosts.map(p => p.id));
  const newPosts = migratedPosts.filter(post => !existingIds.has(post.id));
  
  console.log(`✨ ${newPosts.length}개의 새 포스트 추가 예정`);
  
  // 병합
  const allPosts = [...existingPosts, ...newPosts];
  
  // 날짜순 정렬 (최신순)
  allPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // 파일 저장 (기존 구조 유지)
  await fs.writeFile(
    blogPostsFile, 
    JSON.stringify({ posts: allPosts }, null, 2),
    'utf-8'
  );
  
  console.log(`✅ 총 ${allPosts.length}개의 포스트 저장 완료`);
  
  // 카테고리 통계
  const categoryStats = allPosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 카테고리별 포스트 수:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count}개`);
  });
  
  // 태그 통계
  const allTags = allPosts.flatMap(post => post.tags);
  const uniqueTags = [...new Set(allTags)];
  console.log(`\n🏷️  총 ${uniqueTags.length}개의 고유 태그`);
  
  return {
    totalPosts: allPosts.length,
    newPosts: newPosts.length,
    categories: categoryStats,
    tags: uniqueTags.length
  };
}

// 스크립트 실행
if (require.main === module) {
  migrateBlogPosts()
    .then(result => {
      console.log('\n🎉 마이그레이션 완료!');
      console.log(result);
    })
    .catch(error => {
      console.error('❌ 마이그레이션 실패:', error);
      process.exit(1);
    });
}

export { migrateBlogPosts };