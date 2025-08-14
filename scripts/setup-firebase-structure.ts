import { firestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Firebase 데이터 구조 초기 설정 스크립트
 * 필요한 컬렉션과 초기 데이터를 생성합니다.
 */

async function setupFirebaseStructure() {
  console.log('🚀 Starting Firebase structure setup...\n');

  try {
    // Firebase 초기화 확인
    const db = firestore;
    
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    // 1. 인덱스 문서 생성
    console.log('1. Creating index documents...');
    
    // 통계 인덱스
    await db.collection('stats').doc('_index').set({
      collections: ['hourly', 'daily', 'monthly'],
      description: 'Statistics data organized by time period',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 사용자 인덱스
    await db.collection('users').doc('_index').set({
      totalCount: 0,
      activeCount: 0,
      description: 'User profiles and activity data',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 타로 리딩 인덱스
    await db.collection('readings').doc('_index').set({
      totalCount: 0,
      todayCount: 0,
      description: 'Tarot reading sessions and results',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 블로그 포스트 인덱스
    await db.collection('blogPosts').doc('_index').set({
      totalCount: 0,
      publishedCount: 0,
      draftCount: 0,
      description: 'Blog posts and articles',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log('✅ Index documents created\n');

    // 2. 초기 통계 데이터 생성
    console.log('2. Creating initial statistics...');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = todayStr.substring(0, 7);
    const currentYear = today.getFullYear().toString();

    // 일일 통계
    await db.collection('stats').doc('daily').collection(currentMonth).doc(todayStr).set({
      date: todayStr,
      totalReadings: 0,
      uniqueUsers: 0,
      newUsers: 0,
      peakHour: 0,
      averageSessionTime: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 월간 통계
    await db.collection('stats').doc('monthly').collection(currentYear).doc(currentMonth).set({
      month: currentMonth,
      totalReadings: 0,
      uniqueUsers: 0,
      newUsers: 0,
      growthRate: 0,
      averageDailyReadings: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 실시간 통계
    await db.collection('stats').doc('realtime').set({
      activeUsers: 0,
      currentReadings: 0,
      todayReadings: 0,
      todayNewUsers: 0,
      lastUpdated: FieldValue.serverTimestamp()
    });

    console.log('✅ Initial statistics created\n');

    // 3. 시스템 설정 생성
    console.log('3. Creating system configuration...');
    
    await db.collection('system').doc('config').set({
      version: '1.0.0',
      features: {
        tarotReading: true,
        dreamInterpretation: true,
        blog: true,
        community: true,
        aiProviders: ['openai', 'anthropic', 'google']
      },
      maintenance: {
        enabled: false,
        message: ''
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection('system').doc('status').set({
      services: {
        firebase: 'operational',
        vercel: 'operational',
        nextjs: 'operational'
      },
      lastHealthCheck: FieldValue.serverTimestamp()
    });

    console.log('✅ System configuration created\n');

    // 4. 보안 규칙을 위한 메타데이터
    console.log('4. Creating security metadata...');
    
    await db.collection('_metadata').doc('collections').set({
      public: ['blogPosts', 'system'],
      authenticated: ['readings', 'users'],
      admin: ['stats', '_metadata'],
      createdAt: FieldValue.serverTimestamp()
    });

    console.log('✅ Security metadata created\n');

    // 5. 샘플 블로그 포스트 생성 (선택사항)
    console.log('5. Creating sample blog post...');
    
    const samplePost = await db.collection('blogPosts').add({
      title: 'InnerSpell 플랫폼 소개',
      slug: 'innerspell-platform-introduction',
      content: '# InnerSpell에 오신 것을 환영합니다\n\nInnerSpell은 AI 기반 타로 리딩과 영성 콘텐츠를 제공하는 현대적인 플랫폼입니다.',
      excerpt: 'InnerSpell 플랫폼의 주요 기능과 비전을 소개합니다.',
      author: {
        name: 'InnerSpell Team',
        email: 'admin@innerspell.com'
      },
      category: 'announcement',
      tags: ['introduction', 'platform', 'tarot'],
      status: 'published',
      viewCount: 0,
      publishedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log(`✅ Sample blog post created with ID: ${samplePost.id}\n`);

    // 6. Firestore 복합 인덱스 정보 출력
    console.log('6. Required Firestore composite indexes:');
    console.log('   - Collection: users');
    console.log('     Fields: lastActivity (DESC), status (ASC)');
    console.log('   - Collection: readings');
    console.log('     Fields: userId (ASC), createdAt (DESC)');
    console.log('   - Collection: blogPosts');
    console.log('     Fields: status (ASC), publishedAt (DESC)');
    console.log('\n⚠️  Note: These indexes should be created in Firebase Console\n');

    console.log('✅ Firebase structure setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Created 4 main collections');
    console.log('   - Set up initial statistics');
    console.log('   - Configured system settings');
    console.log('   - Added security metadata');
    console.log('   - Created 1 sample blog post');

  } catch (error) {
    console.error('❌ Error setting up Firebase structure:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  setupFirebaseStructure()
    .then(() => {
      console.log('\n🎉 Setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}