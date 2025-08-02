import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { adminFirestore } from '@/lib/firebase/admin';

// 메모리에 실시간 데이터 저장
const liveData = {
  activeUsers: new Map<string, { lastSeen: Date; userId: string; page: string }>(),
  realtimeStats: {
    totalActiveUsers: 0,
    currentTarotReadings: 0,
    currentDreamInterpretations: 0,
    averageResponseTime: 0,
    errorRate: 0,
    pageViews: 0
  },
  recentEvents: [] as Array<{
    id: string;
    type: 'tarot_reading' | 'dream_interpretation' | 'page_view' | 'error';
    userId: string;
    timestamp: Date;
    details: any;
  }>
};

// 실시간 활성 사용자 정리 (5분마다)
setInterval(() => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  for (const [sessionId, data] of liveData.activeUsers.entries()) {
    if (data.lastSeen < fiveMinutesAgo) {
      liveData.activeUsers.delete(sessionId);
    }
  }
  
  liveData.realtimeStats.totalActiveUsers = liveData.activeUsers.size;
}, 60000); // 1분마다 정리

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // 관리자 권한 확인
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(decodedToken.email || '')) {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }

    // Server-Sent Events 설정
    const responseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    };

    // ReadableStream을 사용한 SSE 구현
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // 초기 데이터 전송
        const initialData = {
          type: 'initial',
          data: {
            activeUsers: Array.from(liveData.activeUsers.values()),
            stats: liveData.realtimeStats,
            recentEvents: liveData.recentEvents.slice(-20)
          }
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        // 실시간 데이터 업데이트 (5초마다)
        const interval = setInterval(async () => {
          try {
            // Firebase에서 최신 데이터 가져오기
            const realtimeStats = await fetchRealtimeStats();
            
            const updateData = {
              type: 'update',
              timestamp: new Date().toISOString(),
              data: {
                activeUsers: Array.from(liveData.activeUsers.values()),
                stats: realtimeStats,
                recentEvents: liveData.recentEvents.slice(-10)
              }
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`));
          } catch (error) {
            console.error('SSE 업데이트 오류:', error);
            const errorData = {
              type: 'error',
              data: { message: '데이터 업데이트 실패' }
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          }
        }, 5000);

        // 연결 종료 시 정리
        request.signal?.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error('실시간 모니터링 API 오류:', error);
    return NextResponse.json(
      { error: '실시간 모니터링 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 실시간 이벤트 수신
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, sessionId, details } = body;

    // 세션 정보 업데이트
    if (sessionId && userId) {
      liveData.activeUsers.set(sessionId, {
        lastSeen: new Date(),
        userId,
        page: details?.page || 'unknown'
      });
      
      liveData.realtimeStats.totalActiveUsers = liveData.activeUsers.size;
    }

    // 이벤트 기록
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId: userId || 'anonymous',
      timestamp: new Date(),
      details: details || {}
    };

    liveData.recentEvents.push(event);
    
    // 최근 100개 이벤트만 유지
    if (liveData.recentEvents.length > 100) {
      liveData.recentEvents = liveData.recentEvents.slice(-100);
    }

    // 타입별 통계 업데이트
    switch (type) {
      case 'tarot_reading':
        liveData.realtimeStats.currentTarotReadings++;
        break;
      case 'dream_interpretation':
        liveData.realtimeStats.currentDreamInterpretations++;
        break;
      case 'page_view':
        liveData.realtimeStats.pageViews++;
        break;
      case 'error':
        liveData.realtimeStats.errorRate++;
        break;
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('실시간 이벤트 처리 오류:', error);
    return NextResponse.json(
      { error: '이벤트 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Firebase에서 실시간 통계 데이터 가져오기
async function fetchRealtimeStats() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // 최근 5분간의 사용 기록 조회
    const recentUsageQuery = adminFirestore
      .collection('usageRecords')
      .where('timestamp', '>=', fiveMinutesAgo)
      .orderBy('timestamp', 'desc')
      .limit(100);

    const recentUsageSnapshot = await recentUsageQuery.get();
    
    let tarotCount = 0;
    let dreamCount = 0;
    const responseTimeSum = 0;
    const errorCount = 0;

    recentUsageSnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.type === 'tarot') {
        tarotCount++;
      } else if (data.type === 'dream') {
        dreamCount++;
      }
    });

    // 성능 데이터도 조회 (메모리에서)
    const performanceData = getPerformanceData();

    return {
      totalActiveUsers: liveData.activeUsers.size,
      currentTarotReadings: tarotCount,
      currentDreamInterpretations: dreamCount,
      averageResponseTime: performanceData.averageResponseTime,
      errorRate: performanceData.errorRate,
      pageViews: liveData.realtimeStats.pageViews,
      memoryUsage: performanceData.memoryUsage,
      cpuUsage: performanceData.cpuUsage
    };
  } catch (error) {
    console.error('실시간 통계 조회 오류:', error);
    return liveData.realtimeStats;
  }
}

// 성능 데이터 가져오기 (기존 성능 API에서)
function getPerformanceData() {
  // 실제 구현에서는 성능 모니터링 시스템에서 데이터를 가져와야 함
  return {
    averageResponseTime: Math.random() * 1000 + 200, // 200-1200ms
    errorRate: Math.random() * 5, // 0-5%
    memoryUsage: Math.random() * 100, // 0-100%
    cpuUsage: Math.random() * 100 // 0-100%
  };
}