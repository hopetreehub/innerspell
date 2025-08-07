import { NextRequest } from 'next/server';
import { getRecentActivities } from '@/services/usage-stats-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // 초기 연결 메시지
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
      );
      
      // 주기적으로 활동 데이터 전송
      const intervalId = setInterval(async () => {
        try {
          const activities = await getRecentActivities(5);
          const data = {
            type: 'activities',
            data: activities,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
      }, 5000); // 5초마다 업데이트
      
      // 클라이언트 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}