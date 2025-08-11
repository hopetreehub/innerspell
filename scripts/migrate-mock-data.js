const fs = require('fs').promises;
const path = require('path');

/**
 * Mock 데이터를 파일 저장소로 마이그레이션
 */

// 데이터 디렉토리 경로
const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// 초기 Mock 데이터
const mockBlogPosts = [
  {
    id: 'post1',
    title: '타로 카드의 역사와 기원',
    excerpt: '타로 카드의 신비로운 역사를 탐험해보세요.',
    content: `# 타로 카드의 역사와 기원

타로 카드는 수세기 동안 인류와 함께해온 신비로운 도구입니다. 
이 글에서는 타로 카드의 기원부터 현대에 이르기까지의 여정을 살펴보겠습니다.

## 타로의 기원

타로 카드의 정확한 기원은 여전히 미스터리에 싸여 있습니다...`,
    category: 'tarot',
    tags: ['타로', '역사', '기원'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    readingTime: 5,
    image: '/images/blog/tarot-history.jpg',
    featured: true,
    published: true,
    views: 156,
    likes: 23
  },
  {
    id: 'post2',
    title: '꿈 해석의 기초',
    excerpt: '꿈의 상징과 의미를 이해하는 방법',
    content: `# 꿈 해석의 기초

꿈은 우리 무의식의 창입니다. 
이 글에서는 꿈을 해석하는 기본적인 방법들을 소개합니다.

## 꿈의 상징

꿈에서 나타나는 상징들은 개인적인 의미를 담고 있습니다...`,
    category: 'dream',
    tags: ['꿈해석', '심리학', '무의식'],
    author: 'InnerSpell Team',
    authorId: 'admin',
    publishedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    readingTime: 7,
    image: '/images/blog/dream-basics.jpg',
    featured: false,
    published: true,
    views: 89,
    likes: 15
  }
];

const mockUsageStats = {
  stats: {
    totalUsers: 150,
    activeUsers: 45,
    newUsers: 12,
    totalSessions: 890,
    totalReadings: 2345,
    avgSessionDuration: 8.5,
    lastUpdated: new Date()
  },
  dailyStats: [],
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

const mockUserActivities = {
  activities: [
    {
      id: 'activity-1',
      userId: 'user-001',
      action: 'tarot_reading',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      details: { spreadType: '켈틱 크로스', cardCount: 10 }
    },
    {
      id: 'activity-2',
      userId: 'user-002',
      action: 'blog_view',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      details: { postId: 'post1', postTitle: '타로 카드의 역사와 기원' }
    },
    {
      id: 'activity-3',
      userId: 'user-003',
      action: 'dream_interpretation',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      details: { dreamType: '일반 꿈' }
    },
    {
      id: 'activity-4',
      userId: 'user-001',
      action: 'session_start',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      details: { source: 'web' }
    },
    {
      id: 'activity-5',
      userId: 'user-004',
      action: 'tarot_reading',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      details: { spreadType: '3카드 스프레드', cardCount: 3 }
    }
  ],
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// 일별 통계 생성
function generateDailyStats(days = 30) {
  const stats = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    stats.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(30 + Math.random() * 50),
      sessions: Math.floor(50 + Math.random() * 100),
      tarotReadings: Math.floor(20 + Math.random() * 40),
      dreamInterpretations: Math.floor(10 + Math.random() * 20),
      yesNoReadings: Math.floor(15 + Math.random() * 30)
    });
  }
  
  return stats;
}

// 디렉토리 생성
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// JSON 파일 쓰기
async function writeJSON(filePath, data) {
  const jsonString = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, jsonString, 'utf-8');
  console.log(`✅ Created: ${path.basename(filePath)}`);
}

// 마이그레이션 실행
async function migrate() {
  try {
    console.log('🚀 Starting Mock data migration...\n');
    
    // 디렉토리 생성
    await ensureDirectory(DATA_DIR);
    await ensureDirectory(BACKUP_DIR);
    
    // 블로그 포스트 마이그레이션
    const blogData = {
      posts: mockBlogPosts,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    await writeJSON(path.join(DATA_DIR, 'blog-posts.json'), blogData);
    
    // 사용 통계 마이그레이션
    mockUsageStats.dailyStats = generateDailyStats(30);
    await writeJSON(path.join(DATA_DIR, 'usage-stats.json'), mockUsageStats);
    
    // 사용자 활동 마이그레이션
    await writeJSON(path.join(DATA_DIR, 'user-activities.json'), mockUserActivities);
    
    // 세션 데이터 초기화
    const sessionData = {
      sessions: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    await writeJSON(path.join(DATA_DIR, 'active-sessions.json'), sessionData);
    
    // 마이그레이션 완료 마커
    const migrationInfo = {
      migrated: true,
      migratedAt: new Date().toISOString(),
      files: [
        'blog-posts.json',
        'usage-stats.json',
        'user-activities.json',
        'active-sessions.json'
      ]
    };
    await writeJSON(path.join(DATA_DIR, 'migration-info.json'), migrationInfo);
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`📁 Data files created in: ${DATA_DIR}`);
    
    // 파일 목록 확인
    const files = await fs.readdir(DATA_DIR);
    console.log('\n📋 Created files:');
    for (const file of files) {
      if (file.endsWith('.json')) {
        const stats = await fs.stat(path.join(DATA_DIR, file));
        console.log(`   - ${file} (${stats.size} bytes)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// 실행
migrate();