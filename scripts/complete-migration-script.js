// Complete Blog Posts Migration Script
// This script migrates all 12 blog posts from mockPosts to Firestore

const posts = [
  {
    id: 'tarot-basics-2025',
    title: '타로카드 기초 가이드 2025',
    excerpt: '타로카드의 기본 개념부터 실제 리딩 방법까지 완벽 정리'
  },
  {
    id: 'meditation-guide-2025',
    title: '명상 입문 가이드',
    excerpt: '초보자를 위한 명상 기법과 실습 방법'
  },
  {
    id: 'dream-interpretation-basics',
    title: '꿈해몽 기초 해석법',
    excerpt: '꿈의 상징과 의미를 이해하는 방법'
  },
  {
    id: 'tarot-spread-complete-guide',
    title: '타로 스프레드 완벽 가이드: 켈틱 크로스부터 쓰리카드까지',
    excerpt: '효과적인 타로 리딩을 위한 다양한 스프레드 방법을 상세하게 알아봅니다.'
  },
  {
    id: 'spiritual-productivity-2025',
    title: '영성과 생산성의 조화: 2025년 목표 달성 전략',
    excerpt: '영적 수행과 현실적 목표 달성을 동시에 이루는 혁신적인 방법론'
  },
  {
    id: 'ai-tarot-integration',
    title: 'AI 시대의 타로: 직관과 기술의 완벽한 융합',
    excerpt: 'AI 기술을 활용한 타로 해석의 새로운 가능성과 한계점을 탐구합니다.'
  },
  {
    id: 'dream-journal-power',
    title: '꿈 일기의 힘: 무의식과 소통하는 가장 효과적인 방법',
    excerpt: '꿈 일기 작성법과 해석 기법을 통해 내면의 지혜에 접근하는 방법'
  },
  {
    id: 'tarot-2025-new-year-guide',
    title: '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
    excerpt: '새해를 맞아 타로 카드로 2025년 운세를 확인하고, 개인별 맞춤 목표 설정 방법과 성취 전략을 타로의 지혜로 알아보세요.'
  },
  {
    id: 'ai-tarot-future-guide',
    title: 'AI 타로의 미래: 디지털 시대 영성과 전통의 만남',
    excerpt: 'AI 기술과 전통 타로가 만나 새로운 영적 경험을 창조합니다. 디지털 시대의 타로 리딩이 가져올 변화와 가능성을 탐구해보세요.'
  },
  {
    id: 'dream-meaning-psychology',
    title: '꿈의 심리학: 무의식이 전하는 메시지 해독법',
    excerpt: '프로이드와 융의 꿈 이론부터 현대 심리학까지, 꿈이 담고 있는 무의식의 메시지를 과학적으로 분석하고 해석하는 방법을 알아보세요.'
  },
  {
    id: 'tarot-meditation-practice',
    title: '타로 명상: 카드와 함께하는 내면 여행',
    excerpt: '타로 카드를 활용한 명상 기법으로 더 깊은 자기 이해와 영적 통찰을 얻으세요. 일상에서 쉽게 실천할 수 있는 타로 명상법을 소개합니다.'
  },
  {
    id: 'modern-spirituality-guide',
    title: '현대인을 위한 영성 가이드: 바쁜 일상 속 영적 성장법',
    excerpt: '바쁜 현대 생활 속에서도 실천할 수 있는 영적 성장 방법들을 소개합니다. 일상에 영성을 통합하여 더 의미 있고 평화로운 삶을 살아보세요.'
  }
];

console.log(`Total posts to migrate: ${posts.length}`);

// Export for use in migration scripts
if (typeof module \!== 'undefined' && module.exports) {
  module.exports = { posts };
}
EOF < /dev/null
