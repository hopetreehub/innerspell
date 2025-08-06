import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | null;
  sessionId: string;
}

// 에러 통계를 메모리에 저장 (프로덕션에서는 데이터베이스 사용 권장)
const errorStats = new Map<string, number>();
const recentErrors: ErrorReport[] = [];
const MAX_RECENT_ERRORS = 100;

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
    
    const errorReport: ErrorReport = await request.json();
    
    // 기본 검증
    if (!errorReport.message || !errorReport.errorType || !errorReport.severity) {
      return NextResponse.json(
        { error: 'Invalid error report format' },
        { status: 400 }
      );
    }
    
    // Rate limiting for error reports (동일 IP에서 너무 많은 에러 리포트 방지)
    const rateLimitKey = `error_report_${ip}`;
    const currentCount = errorStats.get(rateLimitKey) || 0;
    
    if (currentCount > 50) { // 시간당 50개 제한
      return NextResponse.json(
        { error: 'Too many error reports' },
        { status: 429 }
      );
    }
    
    errorStats.set(rateLimitKey, currentCount + 1);
    
    // 1시간 후 카운트 리셋
    setTimeout(() => {
      errorStats.delete(rateLimitKey);
    }, 60 * 60 * 1000);
    
    // 에러 통계 업데이트
    const errorKey = `${errorReport.errorType}_${errorReport.severity}`;
    const errorCount = errorStats.get(errorKey) || 0;
    errorStats.set(errorKey, errorCount + 1);
    
    // 최근 에러 목록에 추가
    recentErrors.unshift({
      ...errorReport,
      // 민감한 정보 제거/마스킹
      stack: errorReport.stack?.substring(0, 1000), // 스택 트레이스 길이 제한
      userId: errorReport.userId ? 'masked' : null, // 사용자 ID 마스킹
    });
    
    // 최대 개수 제한
    if (recentErrors.length > MAX_RECENT_ERRORS) {
      recentErrors.splice(MAX_RECENT_ERRORS);
    }
    
    // 심각한 에러의 경우 즉시 알림 (예: Slack, 이메일 등)
    if (errorReport.severity === 'critical') {
      await handleCriticalError(errorReport, ip);
    }
    
    // 개발 환경에서는 상세 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report Received:', {
        ...errorReport,
        ip,
        timestamp: new Date().toISOString(),
      });
    }
    
    // 프로덕션 환경에서는 외부 서비스로 전송 (Sentry, LogRocket 등)
    if (process.env.NODE_ENV === 'production') {
      await forwardToExternalService(errorReport, ip);
    }
    
    return NextResponse.json({ 
      success: true,
      reportId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
  } catch (error) {
    console.error('Failed to process error report:', error);
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}

async function handleCriticalError(errorReport: ErrorReport, ip: string) {
  try {
    // 여기서 Slack 웹훅, 이메일 등으로 즉시 알림 전송
    console.error('🚨 CRITICAL ERROR DETECTED:', {
      message: errorReport.message,
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      ip,
      timestamp: errorReport.timestamp,
    });
    
    // Slack 웹훅 예시 (실제 구현 시)
    /*
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Critical Error on InnerSpell`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Error', value: errorReport.message, short: false },
            { title: 'URL', value: errorReport.url, short: true },
            { title: 'Time', value: errorReport.timestamp, short: true },
          ]
        }]
      })
    });
    */
    
  } catch (notificationError) {
    console.error('Failed to send critical error notification:', notificationError);
  }
}

async function forwardToExternalService(errorReport: ErrorReport, ip: string) {
  try {
    // Sentry, LogRocket, Bugsnag 등 외부 서비스로 전송
    // 여기서는 예시로 자체 로깅만 수행
    
    console.log('Forwarding error to external service:', {
      type: errorReport.errorType,
      severity: errorReport.severity,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
    });
    
    // 실제 외부 서비스 API 호출 예시:
    /*
    await fetch('https://api.external-logging-service.com/errors', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorReport,
        ip,
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
      }),
    });
    */
    
  } catch (forwardError) {
    console.error('Failed to forward error to external service:', forwardError);
  }
}

// 에러 통계 조회 (관리자 전용)
export async function GET(request: NextRequest) {
  try {
    // 간단한 인증 체크 (실제로는 더 강력한 인증 필요)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const stats = Object.fromEntries(errorStats);
    
    return NextResponse.json({
      errorStats: stats,
      recentErrors: recentErrors.slice(0, 20), // 최근 20개만
      totalErrors: recentErrors.length,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Failed to retrieve error stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve error stats' },
      { status: 500 }
    );
  }
}