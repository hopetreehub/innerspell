import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// 보안을 위한 간단한 인증
const SETUP_SECRET = process.env.FIREBASE_SETUP_SECRET || 'setup-innerspell-2024';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { secret } = await request.json();
    
    if (secret !== SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vercel 환경에서만 실행 가능
    if (!process.env.VERCEL) {
      return NextResponse.json(
        { error: 'This endpoint can only be run on Vercel' },
        { status: 400 }
      );
    }

    const results = {
      success: true,
      created: {
        indexes: 0,
        stats: 0,
        system: 0,
        sample: 0
      },
      errors: []
    };

    const db = firestore;

    // 1. 인덱스 문서 생성
    try {
      await db.collection('stats').doc('_index').set({
        collections: ['hourly', 'daily', 'monthly'],
        description: 'Statistics data organized by time period',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      results.created.indexes++;

      await db.collection('users').doc('_index').set({
        totalCount: 0,
        activeCount: 0,
        description: 'User profiles and activity data',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      results.created.indexes++;

      await db.collection('readings').doc('_index').set({
        totalCount: 0,
        todayCount: 0,
        description: 'Tarot reading sessions and results',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      results.created.indexes++;

      await db.collection('blogPosts').doc('_index').set({
        totalCount: 0,
        publishedCount: 0,
        draftCount: 0,
        description: 'Blog posts and articles',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      results.created.indexes++;
    } catch (error) {
      results.errors.push({
        step: 'indexes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. 초기 통계 데이터 생성
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentMonth = todayStr.substring(0, 7);
      const currentYear = today.getFullYear().toString();

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
      results.created.stats++;

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
      results.created.stats++;

      await db.collection('stats').doc('realtime').set({
        activeUsers: 0,
        currentReadings: 0,
        todayReadings: 0,
        todayNewUsers: 0,
        lastUpdated: FieldValue.serverTimestamp()
      });
      results.created.stats++;
    } catch (error) {
      results.errors.push({
        step: 'stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 3. 시스템 설정 생성
    try {
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
      results.created.system++;

      await db.collection('system').doc('status').set({
        services: {
          firebase: 'operational',
          vercel: 'operational',
          nextjs: 'operational'
        },
        lastHealthCheck: FieldValue.serverTimestamp()
      });
      results.created.system++;

      await db.collection('_metadata').doc('collections').set({
        public: ['blogPosts', 'system'],
        authenticated: ['readings', 'users'],
        admin: ['stats', '_metadata'],
        createdAt: FieldValue.serverTimestamp()
      });
      results.created.system++;
    } catch (error) {
      results.errors.push({
        step: 'system',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 4. 샘플 블로그 포스트 생성
    try {
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
      results.created.sample++;
    } catch (error) {
      results.errors.push({
        step: 'sample',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json({
      ...results,
      message: 'Firebase structure setup completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method with { secret: "your-secret" } to run setup',
    note: 'This endpoint can only be run on Vercel'
  });
}