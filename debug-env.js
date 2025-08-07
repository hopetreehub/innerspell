// dotenv로 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

// 환경 변수 확인 테스트
console.log('🔍 Environment Variables Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_USE_REAL_AUTH:', process.env.NEXT_PUBLIC_USE_REAL_AUTH);
console.log('NEXT_PUBLIC_ENABLE_DEV_AUTH:', process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH);
console.log('NEXT_PUBLIC_ENABLE_FILE_STORAGE:', process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE);

// 파일 저장소 활성화 조건
const isFileStorageEnabled = process.env.NODE_ENV === 'development' && 
  (process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' ||
   process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
   process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');

console.log('\n🏪 File Storage Enabled:', isFileStorageEnabled);

// 파일 존재 확인
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const blogPostsFile = path.join(dataDir, 'blog-posts.json');

console.log('\n📁 File System Check:');
console.log('Data dir exists:', fs.existsSync(dataDir));
console.log('Blog posts file exists:', fs.existsSync(blogPostsFile));

if (fs.existsSync(blogPostsFile)) {
  const data = JSON.parse(fs.readFileSync(blogPostsFile, 'utf-8'));
  console.log('Blog posts count:', data.posts.length);
  console.log('First post title:', data.posts[0]?.title);
}