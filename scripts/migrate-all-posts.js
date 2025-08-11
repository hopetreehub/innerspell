const fs = require('fs');
const path = require('path');

// blog-posts.json 파일 경로
const blogPostsPath = path.join(__dirname, '../data/blog-posts.json');

// 전체 12개의 mockPosts 데이터
const allMockPosts = [
  {
    id: 'tarot-basics-2025',
    title: '타로카드 기초 가이드 2025',
    slug: '타로카드-기초-가이드-2025',
    excerpt: '타로카드의 기본 개념부터 실제 리딩 방법까지 완벽 정리',
    content: '# 타로카드 기초 가이드 2025: AI 시대의 직관력 개발\n\n타로카드는 단순한 점술 도구가 아닌, **자기 이해와 영적 성장을 위한 강력한 미러링 시스템**입니다.',
    categories: ['타로'],
    tags: ['타로', '기초', '입문', '2025', 'AI시대', '직관력', '자기계발'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-20').toISOString(),
    createdAt: new Date('2025-01-20').toISOString(),
    updatedAt: new Date('2025-01-20').toISOString(),
    viewCount: 800,
    seoTitle: '타로카드 기초 가이드 2025 - InnerSpell',
    seoDescription: '타로카드의 기본 개념부터 실제 리딩 방법까지. AI 시대에 필요한 직관력 개발을 위한 완벽한 타로 입문 가이드.'
  },
  {
    id: 'meditation-guide-2025',
    title: '명상 입문 가이드',
    slug: '명상-입문-가이드',
    excerpt: '초보자를 위한 명상 기법과 실습 방법',
    content: '# 명상 입문 가이드: 2025년 AI 시대의 마음챙김 혁명\n\n현대인의 삶은 그 어느 때보다 빠르고 복잡해졌습니다.',
    categories: ['명상'],
    tags: ['명상', '마음챙김', '기초', '2025', '스트레스해소', '집중력'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-18').toISOString(),
    createdAt: new Date('2025-01-18').toISOString(),
    updatedAt: new Date('2025-01-18').toISOString(),
    viewCount: 650,
    seoTitle: '명상 입문 가이드 - InnerSpell',
    seoDescription: '초보자를 위한 명상 기법과 실습 방법. AI 시대의 마음챙김을 위한 완벽한 가이드.'
  },
  {
    id: 'dream-interpretation-basics',
    title: '꿈해몽 기초 해석법',
    slug: '꿈해몽-기초-해석법',
    excerpt: '꿈의 상징과 의미를 이해하는 방법',
    content: '# 꿈해몽 기초 해석법: 무의식의 메시지를 읽는 현대적 접근\n\n매일 밤 우리는 꿈의 세계로 여행을 떠납니다.',
    categories: ['꿈해몽'],
    tags: ['꿈해몽', '꿈', '무의식', '심리', '상징', '해석'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-15').toISOString(),
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date('2025-01-15').toISOString(),
    viewCount: 520,
    seoTitle: '꿈해몽 기초 해석법 - InnerSpell',
    seoDescription: '꿈의 상징과 의미를 이해하는 현대적 접근법. 무의식의 메시지를 읽는 방법을 배워보세요.'
  },
  {
    id: 'tarot-spread-complete-guide',
    title: '타로 스프레드 완벽 가이드',
    slug: '타로-스프레드-완벽-가이드',
    excerpt: '다양한 타로 스프레드 방법과 활용법',
    content: '# 타로 스프레드 완벽 가이드: 상황별 최적의 배열법\n\n타로 리딩에서 스프레드는 카드의 의미를 체계적으로 해석하는 틀입니다.',
    categories: ['타로'],
    tags: ['타로', '스프레드', '켈틱크로스', '리딩', '고급'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-12').toISOString(),
    createdAt: new Date('2025-01-12').toISOString(),
    updatedAt: new Date('2025-01-12').toISOString(),
    viewCount: 890,
    seoTitle: '타로 스프레드 완벽 가이드 - InnerSpell',
    seoDescription: '다양한 타로 스프레드 방법과 활용법. 켈틱크로스부터 고급 스프레드까지 완벽 정리.'
  },
  {
    id: 'spiritual-productivity-2025',
    title: '영성과 생산성의 조화',
    slug: '영성과-생산성의-조화',
    excerpt: '내면의 평화와 외적 성과를 동시에 이루는 방법',
    content: '# 영성과 생산성의 조화: 2025년 균형잡힌 삶의 비밀\n\n많은 사람들이 영성과 생산성을 상반된 개념으로 생각합니다.',
    categories: ['라이프스타일'],
    tags: ['영성', '생산성', '균형', '라이프스타일', '2025'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-10').toISOString(),
    createdAt: new Date('2025-01-10').toISOString(),
    updatedAt: new Date('2025-01-10').toISOString(),
    viewCount: 720,
    seoTitle: '영성과 생산성의 조화 - InnerSpell',
    seoDescription: '내면의 평화와 외적 성과를 동시에 이루는 방법. 2025년 균형잡힌 삶의 비밀.'
  },
  {
    id: 'ai-tarot-integration',
    title: 'AI 시대의 타로',
    slug: 'AI-시대의-타로',
    excerpt: 'AI 기술과 타로의 만남, 새로운 가능성',
    content: '# AI 시대의 타로: 기술과 영성의 혁신적 만남\n\nAI 기술의 발전이 타로 리딩에 새로운 차원을 열고 있습니다.',
    categories: ['타로'],
    tags: ['AI', '타로', '기술', '혁신', '미래'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-08').toISOString(),
    createdAt: new Date('2025-01-08').toISOString(),
    updatedAt: new Date('2025-01-08').toISOString(),
    viewCount: 1250,
    seoTitle: 'AI 시대의 타로 - InnerSpell',
    seoDescription: 'AI 기술과 타로의 만남. 새로운 가능성과 혁신적인 리딩 방법.'
  },
  {
    id: 'dream-journal-power',
    title: '꿈 일기의 힘',
    slug: '꿈-일기의-힘',
    excerpt: '꿈 일기 작성이 가져오는 놀라운 변화',
    content: '# 꿈 일기의 힘: 무의식과의 대화를 통한 자기 발견\n\n꿈 일기는 단순한 기록을 넘어 자기 발견의 강력한 도구입니다.',
    categories: ['꿈해몽'],
    tags: ['꿈일기', '자기발견', '무의식', '기록', '성장'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-05').toISOString(),
    createdAt: new Date('2025-01-05').toISOString(),
    updatedAt: new Date('2025-01-05').toISOString(),
    viewCount: 430,
    seoTitle: '꿈 일기의 힘 - InnerSpell',
    seoDescription: '꿈 일기 작성이 가져오는 놀라운 변화. 무의식과의 대화를 통한 자기 발견.'
  },
  {
    id: 'tarot-2025-new-year-guide',
    title: '2025년 타로 신년 운세',
    slug: '2025년-타로-신년-운세',
    excerpt: '2025년을 위한 타로 가이드와 월별 운세',
    content: '# 2025년 타로 신년 운세: 변화와 성장의 한 해\n\n2025년은 큰 변화와 새로운 시작의 에너지가 가득한 해입니다.',
    categories: ['타로'],
    tags: ['2025', '신년운세', '타로', '운세', '예측'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-01').toISOString(),
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date('2025-01-01').toISOString(),
    viewCount: 2100,
    seoTitle: '2025년 타로 신년 운세 - InnerSpell',
    seoDescription: '2025년을 위한 타로 가이드와 월별 운세. 변화와 성장의 한 해를 준비하세요.'
  },
  {
    id: 'ai-tarot-future-guide',
    title: 'AI 타로의 미래',
    slug: 'AI-타로의-미래',
    excerpt: 'AI와 타로가 만들어갈 미래의 영적 지도',
    content: '# AI 타로의 미래: 기술과 직관의 완벽한 융합\n\nAI 기술이 타로 리딩의 패러다임을 바꾸고 있습니다.',
    categories: ['타로'],
    tags: ['AI', '미래', '타로', '기술', '혁신', '예측'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2024-12-28').toISOString(),
    createdAt: new Date('2024-12-28').toISOString(),
    updatedAt: new Date('2024-12-28').toISOString(),
    viewCount: 980,
    seoTitle: 'AI 타로의 미래 - InnerSpell',
    seoDescription: 'AI와 타로가 만들어갈 미래의 영적 지도. 기술과 직관의 완벽한 융합.'
  },
  {
    id: 'dream-meaning-psychology',
    title: '꿈의 심리학',
    slug: '꿈의-심리학',
    excerpt: '프로이트부터 현대까지, 꿈 해석의 심리학적 접근',
    content: '# 꿈의 심리학: 무의식의 언어를 해독하는 과학적 접근\n\n꿈은 인류 역사상 가장 신비로운 현상 중 하나입니다.',
    categories: ['꿈해몽'],
    tags: ['심리학', '프로이트', '융', '꿈해석', '무의식'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2024-12-25').toISOString(),
    createdAt: new Date('2024-12-25').toISOString(),
    updatedAt: new Date('2024-12-25').toISOString(),
    viewCount: 670,
    seoTitle: '꿈의 심리학 - InnerSpell',
    seoDescription: '프로이트부터 현대까지, 꿈 해석의 심리학적 접근. 무의식의 언어를 해독하는 과학적 방법.'
  },
  {
    id: 'tarot-meditation-practice',
    title: '타로 명상',
    slug: '타로-명상',
    excerpt: '타로 카드를 활용한 깊은 명상 기법',
    content: '# 타로 명상: 카드를 통한 내면의 여정\n\n타로 명상은 카드의 상징을 통해 깊은 내면의 통찰을 얻는 수행법입니다.',
    categories: ['명상'],
    tags: ['타로', '명상', '수행', '내면', '통찰'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2024-12-20').toISOString(),
    createdAt: new Date('2024-12-20').toISOString(),
    updatedAt: new Date('2024-12-20').toISOString(),
    viewCount: 540,
    seoTitle: '타로 명상 - InnerSpell',
    seoDescription: '타로 카드를 활용한 깊은 명상 기법. 카드를 통한 내면의 여정.'
  },
  {
    id: 'modern-spirituality-guide',
    title: '현대인을 위한 영성 가이드',
    slug: '현대인을-위한-영성-가이드',
    excerpt: '바쁜 일상 속에서 영적 균형을 찾는 방법',
    content: '# 현대인을 위한 영성 가이드: 일상에서 찾는 신성함\n\n현대 사회의 속도와 압박 속에서 영성을 추구하는 것은 쉽지 않습니다.',
    categories: ['라이프스타일'],
    tags: ['영성', '현대인', '균형', '일상', '가이드'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2024-12-15').toISOString(),
    createdAt: new Date('2024-12-15').toISOString(),
    updatedAt: new Date('2024-12-15').toISOString(),
    viewCount: 820,
    seoTitle: '현대인을 위한 영성 가이드 - InnerSpell',
    seoDescription: '바쁜 일상 속에서 영적 균형을 찾는 방법. 현대인을 위한 실용적인 영성 가이드.'
  }
];

// 기존 데이터 읽기
let existingPosts = [];
if (fs.existsSync(blogPostsPath)) {
  const data = fs.readFileSync(blogPostsPath, 'utf8');
  existingPosts = JSON.parse(data);
  console.log(`기존 포스트 ${existingPosts.length}개 발견`);
}

// 중복 체크 후 새 포스트 추가
const existingIds = new Set(existingPosts.map(post => post.id));
const newPosts = allMockPosts.filter(post => !existingIds.has(post.id));

if (newPosts.length > 0) {
  // 모든 포스트를 날짜순으로 정렬 (최신순)
  const allPosts = [...existingPosts, ...newPosts].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  
  // 파일에 저장
  fs.writeFileSync(blogPostsPath, JSON.stringify(allPosts, null, 2));
  console.log(`✅ ${newPosts.length}개의 새 포스트가 추가되었습니다.`);
  console.log(`📊 총 포스트 수: ${allPosts.length}개`);
  
  // 추가된 포스트 목록 출력
  console.log('\n📝 추가된 포스트:');
  newPosts.forEach(post => {
    console.log(`- ${post.id}: ${post.title}`);
  });
} else {
  console.log('ℹ️ 추가할 새로운 포스트가 없습니다.');
}

// 카테고리별 통계 출력
const allPosts = [...existingPosts, ...newPosts];
const categoryCounts = {};
allPosts.forEach(post => {
  post.categories.forEach(cat => {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
});

console.log('\n📊 카테고리별 포스트 수:');
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(`- ${cat}: ${count}개`);
});