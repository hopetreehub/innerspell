const fs = require('fs');
const path = require('path');

// blog-posts.json 파일 경로
const blogPostsPath = path.join(__dirname, '../data/blog-posts.json');

// mockPosts 데이터 (타입스크립트에서 가져옴)
const mockPosts = [
  {
    id: 'tarot-basics-2025',
    title: '타로카드 기초 가이드 2025',
    slug: '타로카드-기초-가이드-2025',
    excerpt: '타로카드의 기본 개념부터 실제 리딩 방법까지 완벽 정리',
    content: `# 타로카드 기초 가이드 2025: AI 시대의 직관력 개발

타로카드는 단순한 점술 도구가 아닌, **자기 이해와 영적 성장을 위한 강력한 미러링 시스템**입니다. 2025년 AI 시대에 타로가 더욱 중요해지는 이유는 기술이 대체할 수 없는 인간의 직관력과 영적 통찰력을 개발하는 가장 효과적인 도구이기 때문입니다.

## 타로카드란 무엇인가?

타로는 78장의 카드로 구성된 상징 체계로, 인류의 집단 무의식과 보편적 경험을 담고 있습니다. 각 카드는 우리 삶의 다양한 측면과 단계를 나타내며, 이를 통해 현재 상황을 객관적으로 바라보고 미래의 가능성을 탐색할 수 있습니다.

### 타로의 구성
- **메이저 아르카나 (22장)**: 인생의 중요한 전환점과 영적 여정
- **마이너 아르카나 (56장)**: 일상적인 경험과 구체적인 상황`,
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
    content: `# 명상 입문 가이드: 2025년 AI 시대의 마음챙김 혁명

현대인의 삶은 그 어느 때보다 빠르고 복잡해졌습니다. AI 기술의 발전으로 정보의 홍수 속에서 살아가는 우리에게 **명상은 더 이상 선택이 아닌 필수**가 되었습니다.`,
    categories: ['영성'],
    tags: ['명상', '영성', '수행', '마음챙김', '2025', 'AI명상', '스트레스해소'],
    author: {
      id: 'innerspell-team',
      name: 'InnerSpell Team',
      email: 'team@innerspell.com'
    },
    status: 'published',
    publishedAt: new Date('2025-01-18').toISOString(),
    createdAt: new Date('2025-01-18').toISOString(),
    updatedAt: new Date('2025-01-18').toISOString(),
    viewCount: 1100,
    seoTitle: '명상 입문 가이드 - InnerSpell',
    seoDescription: '초보자를 위한 명상 기법과 실습 방법. AI 시대의 마음챙김을 위한 완벽한 가이드.'
  },
  {
    id: 'dream-interpretation-basics',
    title: '꿈해몽 기초 해석법',
    slug: '꿈해몽-기초-해석법',
    excerpt: '꿈의 상징과 의미를 이해하는 방법',
    content: `# 꿈해몽 기초 해석법: 무의식의 메시지를 읽는 현대적 접근

매일 밤 우리는 꿈의 세계로 여행을 떠납니다. 평균적으로 인생의 1/3을 잠으로 보내는 우리에게 **꿈은 단순한 수면 중 현상이 아닌, 무의식이 전하는 소중한 메시지**입니다.`,
    categories: ['영성'],
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
    viewCount: 950,
    seoTitle: '꿈해몽 기초 해석법 - InnerSpell',
    seoDescription: '꿈의 상징과 의미를 이해하는 현대적 접근법. 무의식의 메시지를 읽는 방법을 배워보세요.'
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
const newPosts = mockPosts.filter(post => !existingIds.has(post.id));

if (newPosts.length > 0) {
  const allPosts = [...existingPosts, ...newPosts];
  
  // 파일에 저장
  fs.writeFileSync(blogPostsPath, JSON.stringify(allPosts, null, 2));
  console.log(`✅ ${newPosts.length}개의 새 포스트가 추가되었습니다.`);
  console.log(`📊 총 포스트 수: ${allPosts.length}개`);
} else {
  console.log('ℹ️ 추가할 새로운 포스트가 없습니다.');
}