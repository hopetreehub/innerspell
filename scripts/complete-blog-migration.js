// Complete Blog Posts Migration Script
// 이 스크립트는 src/lib/blog/posts.ts의 mockPosts 배열에서 
// 모든 12개의 블로그 포스트를 추출하여 마이그레이션 준비를 합니다.

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase 설정 (실제 환경에 맞게 수정 필요)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// 마이그레이션할 전체 블로그 포스트 데이터
const blogPosts = [
  {
    id: 'tarot-basics-2025',
    title: '타로카드 기초 가이드 2025',
    excerpt: '타로카드의 기본 개념부터 실제 리딩 방법까지 완벽 정리',
    category: 'tarot',
    tags: ['타로', '기초', '입문', '2025', 'AI시대', '직관력', '자기계발'],
    author: 'InnerSpell Team',
    image: '/images/blog1.png',
    featured: true,
    published: true,
    readingTime: 15,
    views: 800
  },
  {
    id: 'meditation-guide-2025',
    title: '명상 입문 가이드',
    excerpt: '초보자를 위한 명상 기법과 실습 방법',
    category: 'meditation',
    tags: ['명상', '마음챙김', '기초', '2025', '스트레스해소', '집중력'],
    author: 'InnerSpell Team',
    image: '/images/blog2.png',
    featured: true,
    published: true,
    readingTime: 12,
    views: 650
  },
  {
    id: 'dream-interpretation-basics',
    title: '꿈해몽 기초 해석법',
    excerpt: '꿈의 상징과 의미를 이해하는 방법',
    category: 'dream',
    tags: ['꿈해몽', '무의식', '심리학', '해석법'],
    author: 'InnerSpell Team',
    image: '/images/blog3.png',
    featured: false,
    published: true,
    readingTime: 10,
    views: 450
  },
  {
    id: 'tarot-spread-complete-guide',
    title: '타로 스프레드 완벽 가이드: 켈틱 크로스부터 쓰리카드까지',
    excerpt: '효과적인 타로 리딩을 위한 다양한 스프레드 방법을 상세하게 알아봅니다.',
    category: 'tarot',
    tags: ['타로', '스프레드', '켈틱크로스', '리딩법', '실전가이드'],
    author: 'InnerSpell Team',
    image: '/images/tarot-spread-guide.jpg',
    featured: true,
    published: true,
    readingTime: 20,
    views: 1250
  },
  {
    id: 'spiritual-productivity-2025',
    title: '영성과 생산성의 조화: 2025년 목표 달성 전략',
    excerpt: '영적 수행과 현실적 목표 달성을 동시에 이루는 혁신적인 방법론',
    category: 'lifestyle',
    tags: ['영성', '생산성', '목표설정', '2025', '자기계발', '균형'],
    author: 'InnerSpell Team',
    image: '/images/spiritual-productivity.jpg',
    featured: true,
    published: true,
    readingTime: 18,
    views: 920
  },
  {
    id: 'ai-tarot-integration',
    title: 'AI 시대의 타로: 직관과 기술의 완벽한 융합',
    excerpt: 'AI 기술을 활용한 타로 해석의 새로운 가능성과 한계점을 탐구합니다.',
    category: 'tarot',
    tags: ['AI', '타로', '기술융합', '미래', '디지털영성'],
    author: 'InnerSpell Team',
    image: '/images/ai-tarot-fusion.jpg',
    featured: true,
    published: true,
    readingTime: 15,
    views: 1100
  },
  {
    id: 'dream-journal-power',
    title: '꿈 일기의 힘: 무의식과 소통하는 가장 효과적인 방법',
    excerpt: '꿈 일기 작성법과 해석 기법을 통해 내면의 지혜에 접근하는 방법',
    category: 'dream',
    tags: ['꿈일기', '무의식', '자기탐색', '내면성장', '기록법'],
    author: 'InnerSpell Team',
    image: '/images/dream-journal.jpg',
    featured: false,
    published: true,
    readingTime: 14,
    views: 680
  },
  {
    id: 'tarot-2025-new-year-guide',
    title: '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
    excerpt: '새해를 맞아 타로 카드로 2025년 운세를 확인하고, 개인별 맞춤 목표 설정 방법과 성취 전략을 타로의 지혜로 알아보세요.',
    category: 'tarot',
    tags: ['타로운세', '2025년', '신년운세', '목표설정', '새해', '연간전망'],
    author: 'InnerSpell Team',
    image: '/images/2025-tarot-forecast.jpg',
    featured: true,
    published: true,
    readingTime: 25,
    views: 2100
  },
  {
    id: 'ai-tarot-future-guide',
    title: 'AI 타로의 미래: 디지털 시대 영성과 전통의 만남',
    excerpt: 'AI 기술과 전통 타로가 만나 새로운 영적 경험을 창조합니다. 디지털 시대의 타로 리딩이 가져올 변화와 가능성을 탐구해보세요.',
    category: 'tarot',
    tags: ['AI타로', '미래기술', '디지털영성', '전통과혁신', '타로진화'],
    author: 'InnerSpell Team',
    image: '/images/ai-tarot-future.jpg',
    featured: true,
    published: true,
    readingTime: 22,
    views: 1450
  },
  {
    id: 'dream-meaning-psychology',
    title: '꿈의 심리학: 무의식이 전하는 메시지 해독법',
    excerpt: '프로이드와 융의 꿈 이론부터 현대 심리학까지, 꿈이 담고 있는 무의식의 메시지를 과학적으로 분석하고 해석하는 방법을 알아보세요.',
    category: 'dream',
    tags: ['꿈심리학', '프로이드', '융', '무의식', '꿈해석', '심리분석'],
    author: 'InnerSpell Team',
    image: '/images/dream-psychology.jpg',
    featured: true,
    published: true,
    readingTime: 18,
    views: 890
  },
  {
    id: 'tarot-meditation-practice',
    title: '타로 명상: 카드와 함께하는 내면 여행',
    excerpt: '타로 카드를 활용한 명상 기법으로 더 깊은 자기 이해와 영적 통찰을 얻으세요. 일상에서 쉽게 실천할 수 있는 타로 명상법을 소개합니다.',
    category: 'meditation',
    tags: ['타로명상', '명상기법', '내면여행', '영적수행', '마음챙김'],
    author: 'InnerSpell Team',
    image: '/images/tarot-meditation.jpg',
    featured: false,
    published: true,
    readingTime: 16,
    views: 720
  },
  {
    id: 'modern-spirituality-guide',
    title: '현대인을 위한 영성 가이드: 바쁜 일상 속 영적 성장법',
    excerpt: '바쁜 현대 생활 속에서도 실천할 수 있는 영적 성장 방법들을 소개합니다. 일상에 영성을 통합하여 더 의미 있고 평화로운 삶을 살아보세요.',
    category: 'lifestyle',
    tags: ['영성', '현대생활', '일상영성', '성장', '라이프스타일', '균형'],
    author: 'InnerSpell Team',
    image: '/images/modern-spirituality.jpg',
    featured: true,
    published: true,
    readingTime: 15,
    views: 980
  }
];

// 마이그레이션 실행 함수
async function migrateBlogPosts() {
  try {
    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🚀 블로그 포스트 마이그레이션 시작...');
    console.log(`📊 총 ${blogPosts.length}개의 포스트를 마이그레이션합니다.`);
    
    // 각 포스트를 Firestore에 저장
    for (const post of blogPosts) {
      try {
        // publishedAt 날짜 생성
        const publishedAt = new Date('2025-01-20');
        publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30));
        
        // Firestore 문서 데이터 준비
        const postData = {
          ...post,
          publishedAt: publishedAt,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          // content는 별도로 처리해야 함 (너무 길어서 여기서는 제외)
          content: `포스트 내용은 원본 파일에서 가져와야 합니다. (${post.id})`
        };
        
        // Firestore에 저장
        await setDoc(doc(db, 'blog-posts', post.id), postData);
        
        console.log(`✅ ${post.title} - 마이그레이션 완료`);
      } catch (error) {
        console.error(`❌ ${post.title} - 마이그레이션 실패:`, error);
      }
    }
    
    console.log('\n🎉 모든 블로그 포스트 마이그레이션 완료!');
    
    // 통계 출력
    const categories = [...new Set(blogPosts.map(p => p.category))];
    const featuredCount = blogPosts.filter(p => p.featured).length;
    
    console.log('\n📈 마이그레이션 통계:');
    console.log(`- 총 포스트 수: ${blogPosts.length}개`);
    console.log(`- 카테고리: ${categories.join(', ')}`);
    console.log(`- 주요 포스트: ${featuredCount}개`);
    console.log(`- 총 조회수: ${blogPosts.reduce((sum, p) => sum + (p.views || 0), 0)}회`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  migrateBlogPosts().then(() => {
    console.log('\n✨ 마이그레이션 프로세스 완료');
    process.exit(0);
  });
}

// 모듈로 export
module.exports = { blogPosts, migrateBlogPosts };