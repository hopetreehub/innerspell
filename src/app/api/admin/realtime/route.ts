import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// 실시간 모니터링 데이터 생성 함수
function generateRealtimeData() {
  try {
    const now = new Date();
    
    // 활성 사용자 생성 (2-15명)
    const activeUsers = [];
    const userCount = Math.floor(Math.random() * 14) + 2;
    const pages = ['/tarot', '/dream', '/admin', '/blog', '/profile', '/', '/about'];
    
    for (let i = 0; i < userCount; i++) {
      activeUsers.push({
        userId: `user_${Math.random().toString(36).substring(2, 11)}`,
        page: pages[Math.floor(Math.random() * pages.length)],
        lastSeen: new Date(now.getTime() - Math.random() * 300000).toISOString(), // 최근 5분 내
        sessionDuration: Math.floor(Math.random() * 1800) + 60, // 1분-30분
        userAgent: 'Chrome/120.0.0.0',
        location: ['서울', '부산', '대구', '인천', '광주'][Math.floor(Math.random() * 5)]
      });
    }

  // 최근 이벤트 생성 (10-25개)
  const recentEvents = [];
  const eventTypes = ['tarot_reading', 'dream_interpretation', 'page_view', 'user_action', 'error'];
  const eventCount = Math.floor(Math.random() * 16) + 10;

  for (let i = 0; i < eventCount; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const eventTime = new Date(now.getTime() - i * 15000 - Math.random() * 60000); // 지난 1시간 내
    
    const event = {
      id: `event_${Math.random().toString(36).substring(2, 11)}`,
      type: eventType,
      userId: `user_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: eventTime.toISOString(),
      details: {
        page: pages[Math.floor(Math.random() * pages.length)],
        duration: Math.floor(Math.random() * 300) + 10,
        success: eventType !== 'error' ? true : Math.random() > 0.3
      }
    };

    // 이벤트 타입별 추가 세부사항
    switch (eventType) {
      case 'tarot_reading':
        event.details.spread = ['celtic-cross', '3-card', 'single-card'][Math.floor(Math.random() * 3)];
        event.details.style = ['traditional', 'modern', 'psychological'][Math.floor(Math.random() * 3)];
        break;
      case 'dream_interpretation':
        event.details.dreamLength = Math.floor(Math.random() * 500) + 50;
        event.details.symbols = Math.floor(Math.random() * 10) + 1;
        break;
      case 'error':
        event.details.errorCode = ['AUTH_FAILED', 'API_TIMEOUT', 'VALIDATION_ERROR'][Math.floor(Math.random() * 3)];
        event.details.errorMessage = 'System error occurred';
        break;
      case 'user_action':
        event.details.action = ['click', 'scroll', 'form_submit', 'share', 'bookmark'][Math.floor(Math.random() * 5)];
        break;
    }

    recentEvents.push(event);
  }

  // 최신순으로 정렬
  recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 성능 지표 생성
  const serverMetrics = {
    cpuUsage: Math.random() * 40 + 10, // 10-50%
    memoryUsage: Math.random() * 30 + 40, // 40-70%
    diskUsage: Math.random() * 20 + 20, // 20-40%
    networkLatency: Math.random() * 100 + 50, // 50-150ms
    activeConnections: Math.floor(Math.random() * 100) + 50,
    requestsPerMinute: Math.floor(Math.random() * 200) + 100
  };

  // 에러율 계산
  const errorEvents = recentEvents.filter(e => e.type === 'error' || !e.details.success);
  const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

  // 응답시간 계산 (지난 5분간 평균)
  const responseTime = Math.random() * 300 + 100; // 100-400ms

  return {
    timestamp: now.toISOString(),
    stats: {
      totalActiveUsers: activeUsers.length,
      currentTarotReadings: recentEvents.filter(e => 
        e.type === 'tarot_reading' && 
        new Date(e.timestamp).getTime() > now.getTime() - 300000 // 최근 5분
      ).length,
      currentDreamInterpretations: recentEvents.filter(e => 
        e.type === 'dream_interpretation' && 
        new Date(e.timestamp).getTime() > now.getTime() - 300000 // 최근 5분
      ).length,
      averageResponseTime: responseTime,
      errorRate: errorRate,
      requestsPerMinute: serverMetrics.requestsPerMinute,
      
      // 서버 메트릭스
      cpuUsage: serverMetrics.cpuUsage,
      memoryUsage: serverMetrics.memoryUsage,
      diskUsage: serverMetrics.diskUsage,
      networkLatency: serverMetrics.networkLatency,
      activeConnections: serverMetrics.activeConnections
    },
    activeUsers: activeUsers.slice(0, 20), // 최대 20명까지만
    recentEvents: recentEvents.slice(0, 30), // 최근 30개 이벤트
    serverMetrics,
    
    // 추가 통계
    analytics: {
      topPages: [
        { page: '/tarot', views: Math.floor(Math.random() * 100) + 50 },
        { page: '/dream', views: Math.floor(Math.random() * 80) + 30 },
        { page: '/blog', views: Math.floor(Math.random() * 60) + 20 },
        { page: '/', views: Math.floor(Math.random() * 150) + 100 }
      ].sort((a, b) => b.views - a.views),
      
      userGeography: [
        { location: '서울', count: Math.floor(Math.random() * 50) + 20 },
        { location: '부산', count: Math.floor(Math.random() * 30) + 10 },
        { location: '대구', count: Math.floor(Math.random() * 20) + 8 },
        { location: '인천', count: Math.floor(Math.random() * 25) + 5 },
        { location: '광주', count: Math.floor(Math.random() * 15) + 3 }
      ],
      
      deviceTypes: {
        mobile: Math.floor(Math.random() * 30) + 40, // 40-70%
        desktop: Math.floor(Math.random() * 20) + 20, // 20-40%
        tablet: Math.floor(Math.random() * 10) + 5   // 5-15%
      },
      
      conversionMetrics: {
        visitorToUser: Math.random() * 15 + 5, // 5-20%
        userToReading: Math.random() * 40 + 30, // 30-70%
        completionRate: Math.random() * 20 + 80 // 80-100%
      }
    }
  };
  } catch (error) {
    console.error('Error generating realtime data:', error);
    // 오류 발생 시 기본 데이터 반환
    return {
      timestamp: new Date().toISOString(),
      stats: {
        totalActiveUsers: 0,
        currentTarotReadings: 0,
        currentDreamInterpretations: 0,
        averageResponseTime: 100,
        errorRate: 0,
        requestsPerMinute: 0,
        cpuUsage: 20,
        memoryUsage: 50,
        diskUsage: 30,
        networkLatency: 80,
        activeConnections: 0
      },
      activeUsers: [],
      recentEvents: [],
      serverMetrics: {
        cpuUsage: 20,
        memoryUsage: 50,
        diskUsage: 30,
        networkLatency: 80,
        activeConnections: 0,
        requestsPerMinute: 0
      },
      analytics: {
        topPages: [],
        userGeography: [],
        deviceTypes: {
          mobile: 50,
          desktop: 30,
          tablet: 20
        },
        conversionMetrics: {
          visitorToUser: 10,
          userToReading: 50,
          completionRate: 90
        }
      }
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // 헤더에서 인증 토큰 확인
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    // Mock 인증 체크 (실제로는 Firebase Admin SDK로 검증)
    if (!authorization && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 실시간 데이터 생성
    const realtimeData = generateRealtimeData();
    
    // SSE 헤더 설정
    const response = new NextResponse(JSON.stringify(realtimeData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
    return response;
    
  } catch (error) {
    console.error('Realtime API Error:', error);
    return NextResponse.json(
      { error: '실시간 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// CORS 지원을 위한 OPTIONS 핸들러
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}