const fs = require('fs').promises;
const path = require('path');

// mockPosts 데이터 가져오기
const mockPosts = [
  {
    id: 'post-1',
    title: '타로카드 기초 가이드 2025',
    excerpt: '타로카드를 처음 시작하는 분들을 위한 완벽한 입문 가이드입니다.',
    content: `타로카드는 78장의 카드로 구성된 점술 도구입니다. 메이저 아르카나 22장과 마이너 아르카나 56장으로 나뉘며, 각 카드는 고유한 상징과 의미를 담고 있습니다.

## 타로카드의 구성

### 메이저 아르카나 (22장)
인생의 중요한 전환점과 영적 성장을 나타냅니다.

### 마이너 아르카나 (56장)
일상적인 사건과 경험을 다룹니다.

## 타로 리딩 시작하기

1. **카드 선택**: 직관을 따라 카드를 선택하세요.
2. **질문 설정**: 명확하고 구체적인 질문을 준비하세요.
3. **해석**: 카드의 상징과 위치를 종합적으로 해석하세요.`,
    category: 'tarot',
    tags: ['타로', '입문', '가이드', '2025'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    createdAt: new Date('2025-01-15'),
    readingTime: 5,
    image: '/images/blog/tarot-guide.jpg',
    featured: true,
    published: true,
    views: 342,
    likes: 45
  },
  {
    id: 'post-2',
    title: '명상 입문 가이드',
    excerpt: '일상에서 쉽게 실천할 수 있는 명상 방법을 소개합니다.',
    content: `명상은 마음을 고요하게 하고 내면의 평화를 찾는 수련법입니다.

## 명상의 이점

- 스트레스 감소
- 집중력 향상
- 정서적 안정
- 자기 인식 증진

## 기초 명상법

### 호흡 명상
1. 편안한 자세로 앉습니다
2. 눈을 감고 호흡에 집중합니다
3. 들숨과 날숨을 자연스럽게 관찰합니다
4. 10-15분간 지속합니다`,
    category: 'spiritual',
    tags: ['명상', '마음챙김', '영성'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14'),
    createdAt: new Date('2025-01-14'),
    readingTime: 4,
    image: '/images/blog/meditation.jpg',
    featured: false,
    published: true,
    views: 234,
    likes: 32
  },
  {
    id: 'post-3',
    title: '꿈해몽 기초 해석법',
    excerpt: '꿈의 상징과 의미를 이해하는 기본적인 방법을 알아봅니다.',
    content: `꿈은 우리 무의식의 메시지입니다. 올바른 해석을 통해 내면의 목소리를 들을 수 있습니다.

## 꿈 해석의 기본 원칙

1. **개인적 맥락 고려**: 같은 상징도 사람마다 다른 의미를 가집니다
2. **감정 주목**: 꿈에서 느낀 감정이 중요한 단서입니다
3. **반복 패턴**: 자주 나타나는 꿈은 특별한 의미가 있습니다

## 흔한 꿈 상징

- 물: 감정, 무의식
- 날기: 자유, 해방
- 추락: 불안, 통제력 상실`,
    category: 'dream',
    tags: ['꿈해몽', '무의식', '상징'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-13'),
    updatedAt: new Date('2025-01-13'),
    createdAt: new Date('2025-01-13'),
    readingTime: 6,
    image: '/images/blog/dream.jpg',
    featured: false,
    published: true,
    views: 189,
    likes: 28
  },
  {
    id: 'post-4',
    title: '타로 스프레드 완벽 가이드: 켈틱 크로스부터 쓰리카드까지',
    excerpt: '다양한 타로 스프레드 방법과 각각의 활용법을 상세히 알아봅니다.',
    content: `타로 스프레드는 카드를 배치하는 특정한 패턴으로, 질문의 성격에 따라 적절한 스프레드를 선택하는 것이 중요합니다.

## 주요 타로 스프레드

### 1. 쓰리카드 스프레드
가장 간단하면서도 효과적인 스프레드입니다.
- 과거 - 현재 - 미래
- 상황 - 행동 - 결과
- 마음 - 몸 - 영혼

### 2. 켈틱 크로스
가장 전통적이고 포괄적인 10장 스프레드입니다.

### 3. 관계 스프레드
두 사람 간의 관계를 살펴보는 특별한 배치법입니다.`,
    category: 'tarot',
    tags: ['타로', '스프레드', '켈틱크로스', '점술'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
    createdAt: new Date('2025-01-12'),
    readingTime: 8,
    image: '/images/blog/tarot-spread.jpg',
    featured: true,
    published: true,
    views: 567,
    likes: 78
  },
  {
    id: 'post-5',
    title: '영성과 생산성의 조화: 2025년 목표 달성 전략',
    excerpt: '영적 성장과 현실적 목표 달성을 동시에 이루는 방법을 탐구합니다.',
    content: `영성과 생산성은 상반된 개념이 아닙니다. 오히려 조화롭게 결합할 때 더 큰 시너지를 낼 수 있습니다.

## 영적 생산성의 핵심 원칙

1. **의도 설정**: 모든 행동에 명확한 의도를 부여합니다
2. **마음챙김 실천**: 현재 순간에 집중하며 일합니다
3. **에너지 관리**: 영적 에너지와 신체적 에너지의 균형을 맞춥니다

## 실천 방법

- 아침 명상으로 하루 시작하기
- 업무 중 짧은 호흡 명상
- 감사 일기 작성
- 주간 회고와 성찰`,
    category: 'spiritual',
    tags: ['영성', '생산성', '목표설정', '2025'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
    createdAt: new Date('2025-01-11'),
    readingTime: 7,
    image: '/images/blog/spiritual-productivity.jpg',
    featured: false,
    published: true,
    views: 423,
    likes: 56
  },
  {
    id: 'post-6',
    title: 'AI 시대의 타로: 직관과 기술의 완벽한 융합',
    excerpt: 'AI 기술이 전통적인 타로 리딩을 어떻게 혁신하고 있는지 살펴봅니다.',
    content: `AI 기술은 타로 리딩의 새로운 가능성을 열어주고 있습니다. InnerSpell은 이러한 혁신의 최전선에 있습니다.

## AI 타로의 장점

1. **일관된 해석**: AI는 방대한 데이터를 기반으로 일관된 해석을 제공합니다
2. **개인화된 리딩**: 사용자의 이전 리딩 기록을 분석해 맞춤형 조언을 제공합니다
3. **24/7 이용 가능**: 언제 어디서나 전문적인 타로 리딩을 받을 수 있습니다

## 인간 직관의 중요성

AI는 도구일 뿐, 최종적인 해석과 적용은 여전히 인간의 직관과 지혜가 필요합니다.`,
    category: 'tarot',
    tags: ['AI', '타로', '기술', '혁신'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
    createdAt: new Date('2025-01-10'),
    readingTime: 6,
    image: '/images/blog/ai-tarot.jpg',
    featured: true,
    published: true,
    views: 892,
    likes: 124
  },
  {
    id: 'post-7',
    title: '꿈 일기 작성법: 무의식과의 대화',
    excerpt: '꿈 일기를 통해 무의식의 메시지를 해독하는 방법을 배워봅니다.',
    content: `꿈 일기는 자기 이해와 성장을 위한 강력한 도구입니다.

## 꿈 일기 작성 요령

1. **즉시 기록**: 깨어나자마자 기록합니다
2. **세부사항 포함**: 감정, 색상, 소리 등을 상세히 적습니다
3. **그림 활용**: 말로 표현하기 어려운 부분은 그림으로 그립니다

## 꿈 패턴 분석

- 반복되는 상징 찾기
- 감정 패턴 파악
- 현실과의 연관성 탐구`,
    category: 'dream',
    tags: ['꿈일기', '무의식', '자기계발'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-09'),
    updatedAt: new Date('2025-01-09'),
    createdAt: new Date('2025-01-09'),
    readingTime: 5,
    image: '/images/blog/dream-journal.jpg',
    featured: false,
    published: true,
    views: 345,
    likes: 47
  },
  // SEO 최적화된 새 포스트들
  {
    id: 'post-8',
    title: '2025년 타로 신년 운세: 새해 목표 달성을 위한 완벽 가이드',
    excerpt: '2025년 을사년, 타로카드로 알아보는 신년 운세와 목표 달성 전략을 상세히 소개합니다.',
    content: `2025년 을사년이 밝았습니다. 타로카드를 통해 새해 운세를 살펴보고, 목표 달성을 위한 구체적인 전략을 세워보세요.

## 2025년 전체 운세

### 을사년의 에너지
뱀의 해인 2025년은 지혜와 변화의 에너지가 강합니다. 타로의 대아르카나 중 '죽음' 카드와 연결되어 있어, 낡은 것을 버리고 새로운 시작을 알리는 해입니다.

## 월별 타로 가이드

### 1월 - 바보 카드
새로운 시작의 달. 두려움 없이 도전하세요.

### 2월 - 마법사 카드
의지력이 강해지는 시기. 계획을 실행에 옮기세요.

## 목표 달성 타로 스프레드

1. 현재 위치
2. 도전 과제
3. 숨겨진 강점
4. 필요한 행동
5. 최종 결과`,
    category: 'tarot',
    tags: ['2025년', '신년운세', '타로운세', '을사년', '목표달성'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08'),
    createdAt: new Date('2025-01-08'),
    readingTime: 10,
    image: '/images/blog/2025-tarot.jpg',
    featured: true,
    published: true,
    views: 1234,
    likes: 189
  },
  {
    id: 'post-9',
    title: 'AI 시대의 타로: 전통과 기술의 만남이 만드는 새로운 점술',
    excerpt: 'InnerSpell AI가 제공하는 혁신적인 타로 리딩 경험과 전통 타로의 조화를 탐구합니다.',
    content: `AI 기술이 5000년 역사의 타로를 만났을 때, 어떤 시너지가 생길까요? InnerSpell은 이 질문에 대한 답을 제시합니다.

## AI 타로 리딩의 혁신

### 1. 빅데이터 기반 해석
수만 건의 타로 리딩 데이터를 학습한 AI는 더 정확하고 깊이 있는 해석을 제공합니다.

### 2. 개인 맞춤형 리딩
사용자의 이전 리딩 기록과 피드백을 분석하여 개인화된 조언을 제공합니다.

### 3. 다국어 지원
한국어, 영어, 일본어 등 다양한 언어로 타로 리딩이 가능합니다.

## 전통 타로의 가치

AI가 아무리 발전해도 타로의 본질인 '직관'과 '영적 연결'은 여전히 중요합니다.`,
    category: 'tarot',
    tags: ['AI타로', 'InnerSpell', '타로리딩', '점술AI', '디지털점술'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-07'),
    updatedAt: new Date('2025-01-07'),
    createdAt: new Date('2025-01-07'),
    readingTime: 8,
    image: '/images/blog/ai-tarot-innovation.jpg',
    featured: true,
    published: true,
    views: 987,
    likes: 156
  },
  {
    id: 'post-10',
    title: '꿈 해몽과 무의식: 당신의 내면이 전하는 메시지 해독법',
    excerpt: '꿈의 상징과 의미를 심층 분석하여 무의식의 메시지를 이해하는 전문가 가이드입니다.',
    content: `매일 밤 우리는 꿈을 꿉니다. 이 꿈들은 단순한 뇌의 활동이 아닌, 무의식이 전하는 중요한 메시지입니다.

## 꿈의 유형별 해석

### 1. 반복되는 꿈
같은 꿈이 반복된다면, 해결되지 않은 내면의 문제를 나타냅니다.

### 2. 악몽
두려움과 불안을 처리하는 무의식의 방식입니다.

### 3. 예지몽
미래에 대한 직관적 통찰을 담고 있을 수 있습니다.

## 주요 꿈 상징 사전

- 물: 감정과 무의식
- 집: 자아와 정체성
- 동물: 본능과 욕구
- 죽음: 변화와 새로운 시작`,
    category: 'dream',
    tags: ['꿈해몽', '무의식', '꿈분석', '심리학', '꿈상징'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-06'),
    updatedAt: new Date('2025-01-06'),
    createdAt: new Date('2025-01-06'),
    readingTime: 12,
    image: '/images/blog/dream-analysis.jpg',
    featured: false,
    published: true,
    views: 765,
    likes: 98
  },
  {
    id: 'post-11',
    title: '타로와 명상: 카드를 통한 마음챙김과 영적 성장법',
    excerpt: '타로카드를 명상 도구로 활용하여 내면의 평화와 영적 성장을 이루는 방법을 소개합니다.',
    content: `타로카드는 단순한 점술 도구가 아닙니다. 깊은 명상과 자기 성찰의 도구로도 활용할 수 있습니다.

## 타로 명상의 기초

### 1. 카드 선택
직관적으로 한 장의 카드를 선택합니다.

### 2. 시각적 명상
카드의 이미지를 깊이 관찰하며 명상합니다.

### 3. 상징과의 대화
카드의 상징들이 전하는 메시지에 귀 기울입니다.

## 주요 명상 카드

- 은둔자: 내면의 지혜
- 별: 희망과 영감
- 절제: 균형과 조화`,
    category: 'spiritual',
    tags: ['타로명상', '마음챙김', '영적성장', '명상법', '타로활용'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
    createdAt: new Date('2025-01-05'),
    readingTime: 9,
    image: '/images/blog/tarot-meditation.jpg',
    featured: false,
    published: true,
    views: 543,
    likes: 87
  },
  {
    id: 'post-12',
    title: '현대인을 위한 영성: 바쁜 일상 속 영적 균형 찾기',
    excerpt: '디지털 시대를 살아가는 현대인들이 일상에서 영적 균형을 찾는 실용적인 방법들을 제시합니다.',
    content: `바쁜 현대 생활 속에서도 영적 성장은 가능합니다. 작은 실천으로 큰 변화를 만들어보세요.

## 일상 속 영성 실천법

### 1. 마이크로 명상
- 엘리베이터 대기 시간
- 신호등 대기 시간
- 커피 브레이크

### 2. 디지털 디톡스
- 하루 1시간 스마트폰 끄기
- 주말 SNS 금식
- 명상 앱 활용

### 3. 감사 실천
- 매일 3가지 감사 일기
- 타인에게 감사 표현
- 자기 자신에게 감사

## 영적 균형의 신호

- 내면의 평화
- 직관력 향상
- 삶의 의미 발견`,
    category: 'spiritual',
    tags: ['영성', '일상영성', '영적균형', '현대인', '마음챙김'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2025-01-04'),
    updatedAt: new Date('2025-01-04'),
    createdAt: new Date('2025-01-04'),
    readingTime: 7,
    image: '/images/blog/modern-spirituality.jpg',
    featured: true,
    published: true,
    views: 678,
    likes: 112
  }
];

async function initBlogData() {
  try {
    console.log('🚀 블로그 데이터 초기화 시작...');
    
    // data 디렉토리 생성
    const dataDir = path.join(process.cwd(), 'data');
    const backupsDir = path.join(dataDir, 'backups');
    
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(backupsDir, { recursive: true });
    console.log('📁 디렉토리 생성 완료');
    
    // 블로그 포스트 데이터 저장
    const blogPostsPath = path.join(dataDir, 'blog-posts.json');
    
    // 기존 파일이 있는지 확인
    try {
      await fs.access(blogPostsPath);
      console.log('⚠️  기존 blog-posts.json 파일이 존재합니다.');
      
      // 백업 생성
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupsDir, `blog-posts_backup_${timestamp}.json`);
      await fs.copyFile(blogPostsPath, backupPath);
      console.log(`📦 백업 파일 생성: ${backupPath}`);
    } catch (error) {
      console.log('📄 새로운 blog-posts.json 파일을 생성합니다.');
    }
    
    // 데이터 저장
    const blogData = {
      posts: mockPosts,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        totalPosts: mockPosts.length
      }
    };
    
    await fs.writeFile(blogPostsPath, JSON.stringify(blogData, null, 2));
    console.log(`✅ ${mockPosts.length}개의 블로그 포스트 저장 완료`);
    
    // 카테고리 데이터 생성
    const categories = [
      { id: 'tarot', name: '타로', slug: 'tarot', description: '타로카드 관련 글' },
      { id: 'dream', name: '꿈해몽', slug: 'dream', description: '꿈 해석과 분석' },
      { id: 'spiritual', name: '영성', slug: 'spiritual', description: '영적 성장과 명상' }
    ];
    
    const categoriesPath = path.join(dataDir, 'blog-categories.json');
    await fs.writeFile(categoriesPath, JSON.stringify({ categories }, null, 2));
    console.log('✅ 카테고리 데이터 저장 완료');
    
    // 요약 정보 출력
    console.log('\n📊 초기화 완료 요약:');
    console.log(`- 총 포스트 수: ${mockPosts.length}개`);
    console.log(`- 타로 카테고리: ${mockPosts.filter(p => p.category === 'tarot').length}개`);
    console.log(`- 꿈해몽 카테고리: ${mockPosts.filter(p => p.category === 'dream').length}개`);
    console.log(`- 영성 카테고리: ${mockPosts.filter(p => p.category === 'spiritual').length}개`);
    console.log(`- Featured 포스트: ${mockPosts.filter(p => p.featured).length}개`);
    
    console.log('\n🎉 블로그 데이터 초기화가 성공적으로 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 초기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
initBlogData();