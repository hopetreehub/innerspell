import { NextRequest, NextResponse } from 'next/server';
import { createDataSource } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const dataSource = createDataSource();
    
    // 기본 통계
    const stats = await dataSource.getAdminStats();
    
    // 실시간 데이터
    const realtimeData = await dataSource.getRealtimeData();
    
    // 시스템 상태
    const systemStatus = await dataSource.getSystemStatus();
    
    // 오늘의 시간별 통계
    const today = new Date();
    const hourlyStats = await dataSource.getHourlyStats(today);
    
    // 응답 시간 측정
    const startTime = Date.now();
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        overview: {
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          totalReadings: stats.totalReadings,
          todayReadings: stats.todayReadings,
          averageSessionTime: stats.averageSessionTime
        },
        realtime: {
          activeUsersCount: realtimeData.activeUsers.length,
          activeUsersList: realtimeData.activeUsers.slice(0, 10), // 최대 10명만
          currentReadings: realtimeData.currentReadings,
          todayStats: realtimeData.todayStats
        },
        performance: {
          responseTime,
          dataSourceType: dataSource.constructor.name,
          isConnected: dataSource.isConnected(),
          ...systemStatus.performance
        },
        hourlyTrend: hourlyStats.map(stat => ({
          hour: stat.hour,
          readings: stat.readings,
          users: stat.users
        })),
        system: systemStatus
      }
    });
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Server-Sent Events for real-time updates
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const dataSource = createDataSource();
      let intervalId: NodeJS.Timeout;
      
      const sendUpdate = async () => {
        try {
          const realtimeData = await dataSource.getRealtimeData();
          const data = JSON.stringify({
            timestamp: new Date().toISOString(),
            activeUsers: realtimeData.activeUsers.length,
            currentReadings: realtimeData.currentReadings,
            todayStats: realtimeData.todayStats
          });
          
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error('SSE update error:', error);
        }
      };
      
      // 초기 데이터 전송
      await sendUpdate();
      
      // 30초마다 업데이트
      intervalId = setInterval(sendUpdate, 30000);
      
      // 클라이언트 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}