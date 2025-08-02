import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { monitoring } from '@/lib/monitoring';

export const runtime = 'nodejs';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database?: string;
    ai?: string;
  };
  environment_checks?: Record<string, boolean>;
  response_time?: number;
  issues?: string[];
}

export async function GET() {
  const startTime = performance.now();
  
  try {
    return await monitoring.measureAsync('health_check', async () => {
      const healthData: HealthCheckResult = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown',
        version: process.env.npm_package_version || '1.0.0',
        services: {},
        issues: [],
      };

      // Firebase 연결 테스트
      try {
        const firestoreStartTime = performance.now();
        await admin.firestore().collection('health-check').limit(1).get();
        const firestoreTime = performance.now() - firestoreStartTime;
        
        healthData.services.database = 'connected';
        monitoring.recordMetric('firestore_health_check', firestoreTime);
        
        if (firestoreTime > 5000) { // 5초 이상이면 성능 이슈
          healthData.issues?.push('Database response time is slow');
          healthData.status = 'degraded';
        }
      } catch (firebaseError) {
        console.error('Firebase connection test failed:', firebaseError);
        monitoring.reportError(firebaseError as Error, { context: 'health_check_firebase' });
        
        healthData.services.database = 'error';
        healthData.status = 'unhealthy';
        healthData.issues?.push('Database connection failed');
      }

      // AI 서비스 체크 (환경 변수 확인)
      const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && 
                             !process.env.OPENAI_API_KEY.includes('your-') && 
                             !process.env.OPENAI_API_KEY.includes('here') &&
                             process.env.OPENAI_API_KEY.length > 20);
      
      healthData.services.ai = hasOpenAIKey ? 'available' : 'not_configured';
      
      if (!hasOpenAIKey) {
        healthData.issues?.push('OpenAI API key not properly configured');
        if (healthData.status === 'healthy') {
          healthData.status = 'degraded';
        }
      }

      // 환경 변수 체크
      const envChecks = {
        node_env: !!(process.env.NODE_ENV),
        has_firebase_config: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        has_admin_emails: !!(process.env.ADMIN_EMAILS),
        has_blog_secret: !!(process.env.BLOG_API_SECRET_KEY),
      };

      healthData.environment_checks = envChecks;

      // 필수 환경 변수 누락 확인
      const missingEnvVars = Object.entries(envChecks)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key);

      if (missingEnvVars.length > 0) {
        healthData.issues?.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
        if (healthData.status === 'healthy') {
          healthData.status = 'degraded';
        }
      }

      // 응답 시간 추가
      healthData.response_time = performance.now() - startTime;
      
      // 응답 시간이 너무 느리면 성능 이슈
      if (healthData.response_time > 10000) { // 10초 이상
        healthData.issues?.push('Health check response time is too slow');
        healthData.status = 'degraded';
      }

      const statusCode = healthData.status === 'healthy' ? 200 : 
                        healthData.status === 'degraded' ? 200 : 503;
      
      // 메트릭 기록
      monitoring.recordMetric('health_check_total', healthData.response_time, {
        status: healthData.status,
        issues_count: healthData.issues?.length || 0,
      });
      
      return NextResponse.json(healthData, { 
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Health-Status': healthData.status,
          'X-Response-Time': healthData.response_time.toString(),
        },
      });
    });
  } catch (error) {
    const responseTime = performance.now() - startTime;
    console.error('Health check failed:', error);
    
    // 에러를 모니터링 시스템에 보고
    monitoring.reportError(error as Error, { 
      context: 'health_check_critical_failure',
      response_time: responseTime 
    });
    
    const errorResponse: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      services: {},
      response_time: responseTime,
      issues: [
        error instanceof Error ? error.message : 'Unknown critical error occurred',
      ],
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Health-Status': 'unhealthy',
        'X-Response-Time': responseTime.toString(),
      },
    });
  }
}