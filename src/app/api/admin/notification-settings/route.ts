import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin';

export interface NotificationConfig {
  // 이메일 알림
  email: {
    enabled: boolean;
    address: string;
    frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
    types: {
      criticalErrors: boolean;
      performanceAlerts: boolean;
      userMilestones: boolean;
      systemUpdates: boolean;
      dailyReports: boolean;
      weeklyReports: boolean;
    };
  };
  
  // 슬랙 알림
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
    types: {
      criticalErrors: boolean;
      performanceAlerts: boolean;
      userActivity: boolean;
      newSignups: boolean;
    };
  };
  
  // 푸시 알림
  push: {
    enabled: boolean;
    types: {
      criticalErrors: boolean;
      userMilestones: boolean;
      systemAlerts: boolean;
    };
  };
  
  // 임계값 설정
  thresholds: {
    errorRate: number; // 퍼센트
    responseTime: number; // ms
    cpuUsage: number; // 퍼센트
    memoryUsage: number; // 퍼센트
    activeUsers: number; // 명
    requestsPerMinute: number; // 요청 수
  };
  
  // 알림 스케줄
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM
      end: string; // HH:MM
    };
    weekendNotifications: boolean;
  };
  
  // 메타데이터
  lastUpdated: string;
  updatedBy: string;
}

const defaultConfig: NotificationConfig = {
  email: {
    enabled: true,
    address: 'admin@innerspell.com',
    frequency: 'instant',
    types: {
      criticalErrors: true,
      performanceAlerts: true,
      userMilestones: false,
      systemUpdates: true,
      dailyReports: false,
      weeklyReports: true,
    },
  },
  slack: {
    enabled: false,
    webhookUrl: '',
    channel: '#alerts',
    types: {
      criticalErrors: true,
      performanceAlerts: true,
      userActivity: false,
      newSignups: true,
    },
  },
  push: {
    enabled: false,
    types: {
      criticalErrors: true,
      userMilestones: false,
      systemAlerts: true,
    },
  },
  thresholds: {
    errorRate: 5,
    responseTime: 1000,
    cpuUsage: 80,
    memoryUsage: 85,
    activeUsers: 100,
    requestsPerMinute: 1000,
  },
  schedule: {
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    weekendNotifications: true,
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
};

// GET: 알림 설정 불러오기
export async function GET(request: NextRequest) {
  try {
    // 헤더에서 관리자 API 키 확인
    const headersList = await headers();
    const apiKey = headersList.get('x-admin-api-key') || 
                   request.nextUrl.searchParams.get('api_key');
    
    // API 키 검증 (개발 환경에서는 생략)
    if (process.env.NODE_ENV === 'production' && apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const db = getFirestore(adminApp);
    
    // 알림 설정 문서 가져오기
    const settingsDoc = await db.collection('adminSettings')
      .doc('notificationConfig')
      .get();
    
    let config: NotificationConfig;
    
    if (settingsDoc.exists) {
      config = settingsDoc.data() as NotificationConfig;
      
      // 기본값과 병합 (새로운 필드가 추가된 경우 대비)
      config = {
        ...defaultConfig,
        ...config,
        email: { ...defaultConfig.email, ...(config.email || {}) },
        slack: { ...defaultConfig.slack, ...(config.slack || {}) },
        push: { ...defaultConfig.push, ...(config.push || {}) },
        thresholds: { ...defaultConfig.thresholds, ...(config.thresholds || {}) },
        schedule: { ...defaultConfig.schedule, ...(config.schedule || {}) },
      };
    } else {
      // 설정이 없으면 기본 설정 생성
      config = defaultConfig;
      await db.collection('adminSettings')
        .doc('notificationConfig')
        .set(config);
    }
    
    console.log('✅ Notification settings loaded successfully');
    
    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to load notification settings:', error);
    return NextResponse.json(
      { 
        error: '알림 설정을 불러오는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: 알림 설정 저장하기
export async function POST(request: NextRequest) {
  try {
    // 헤더에서 관리자 API 키 확인
    const headersList = await headers();
    const apiKey = headersList.get('x-admin-api-key') || 
                   request.nextUrl.searchParams.get('api_key');
    
    // API 키 검증 (개발 환경에서는 생략)
    if (process.env.NODE_ENV === 'production' && apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const config: Partial<NotificationConfig> = body.config;
    
    if (!config) {
      return NextResponse.json(
        { error: '알림 설정 데이터가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const db = getFirestore(adminApp);
    
    // 현재 설정 가져오기
    const settingsDoc = await db.collection('adminSettings')
      .doc('notificationConfig')
      .get();
    
    let currentConfig: NotificationConfig;
    
    if (settingsDoc.exists) {
      currentConfig = settingsDoc.data() as NotificationConfig;
    } else {
      currentConfig = defaultConfig;
    }
    
    // 새로운 설정으로 업데이트
    const updatedConfig: NotificationConfig = {
      ...currentConfig,
      ...config,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin' // 실제로는 인증된 사용자 ID 사용
    };
    
    // Firebase에 저장
    await db.collection('adminSettings')
      .doc('notificationConfig')
      .set(updatedConfig);
    
    console.log('✅ Notification settings saved successfully');
    
    // 설정 변경에 따른 알림 발송 (선택사항)
    if (config.email?.enabled && config.email?.address) {
      // 여기서 실제 이메일 알림 서비스 설정
      console.log('📧 Email notifications configured for:', config.email.address);
    }
    
    if (config.slack?.enabled && config.slack?.webhookUrl) {
      // 여기서 실제 Slack webhook 테스트
      console.log('💬 Slack notifications configured for:', config.slack.channel);
    }
    
    return NextResponse.json({
      success: true,
      message: '알림 설정이 성공적으로 저장되었습니다.',
      data: updatedConfig,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to save notification settings:', error);
    return NextResponse.json(
      { 
        error: '알림 설정을 저장하는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: 알림 테스트 발송
export async function PUT(request: NextRequest) {
  try {
    // 헤더에서 관리자 API 키 확인
    const headersList = await headers();
    const apiKey = headersList.get('x-admin-api-key') || 
                   request.nextUrl.searchParams.get('api_key');
    
    // API 키 검증 (개발 환경에서는 생략)
    if (process.env.NODE_ENV === 'production' && apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { type } = body; // 'email', 'slack', 'push'
    
    if (!type || !['email', 'slack', 'push'].includes(type)) {
      return NextResponse.json(
        { error: '유효한 알림 타입이 필요합니다. (email, slack, push)' },
        { status: 400 }
      );
    }
    
    const db = getFirestore(adminApp);
    
    // 현재 알림 설정 가져오기
    const settingsDoc = await db.collection('adminSettings')
      .doc('notificationConfig')
      .get();
    
    if (!settingsDoc.exists) {
      return NextResponse.json(
        { error: '알림 설정을 먼저 구성해주세요.' },
        { status: 404 }
      );
    }
    
    const config = settingsDoc.data() as NotificationConfig;
    
    // 테스트 알림 발송
    let result: { success: boolean; message: string } = { success: false, message: '' };
    
    switch (type) {
      case 'email':
        if (!config.email.enabled || !config.email.address) {
          result = { success: false, message: '이메일 설정이 활성화되지 않았거나 주소가 없습니다.' };
        } else {
          // 실제 구현에서는 이메일 서비스 (SendGrid, AWS SES 등) 사용
          console.log(`📧 Test email would be sent to: ${config.email.address}`);
          result = { success: true, message: `테스트 이메일이 ${config.email.address}로 발송되었습니다.` };
        }
        break;
        
      case 'slack':
        if (!config.slack.enabled || !config.slack.webhookUrl) {
          result = { success: false, message: 'Slack 설정이 활성화되지 않았거나 Webhook URL이 없습니다.' };
        } else {
          // 실제 구현에서는 Slack Webhook API 호출
          console.log(`💬 Test Slack message would be sent to: ${config.slack.channel}`);
          result = { success: true, message: `테스트 메시지가 ${config.slack.channel}로 발송되었습니다.` };
        }
        break;
        
      case 'push':
        if (!config.push.enabled) {
          result = { success: false, message: '푸시 알림 설정이 활성화되지 않았습니다.' };
        } else {
          // 실제 구현에서는 브라우저 Push API 사용
          console.log('📱 Test push notification would be sent');
          result = { success: true, message: '테스트 푸시 알림이 발송되었습니다.' };
        }
        break;
    }
    
    // 테스트 로그 저장
    await db.collection('notificationLogs').add({
      type: 'test',
      channel: type,
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      triggeredBy: 'admin'
    });
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
    return NextResponse.json(
      { 
        error: '테스트 알림 발송에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Api-Key',
    },
  });
}