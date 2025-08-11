/**
 * Development Mode Firebase Fallback
 * 
 * Firebase 인증이 설정되지 않은 개발 환경에서 
 * 애플리케이션이 정상 작동하도록 하는 fallback 시스템
 */

// 개발 환경 여부 확인
export const isDevelopmentMode = process.env.NODE_ENV === 'development';

// Firebase 서비스 계정 키가 있는지 확인
export const hasFirebaseCredentials = () => {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_ADMIN_SDK_CONFIG
  );
};

// 개발 모드에서 Firebase 없이 작동할지 결정
export const shouldUseDevelopmentFallback = () => {
  return isDevelopmentMode && !hasFirebaseCredentials();
};

// 개발용 mock 데이터
export const developmentMockData = {
  // 카테고리 mock 데이터
  categories: [
    { id: 'tarot', name: '타로', description: '타로 카드 관련 콘텐츠' },
    { id: 'dream', name: '꿈해석', description: '꿈 해석 관련 콘텐츠' },
    { id: 'astrology', name: '점성술', description: '점성술 관련 콘텐츠' },
    { id: 'spirituality', name: '영성', description: '영성 관련 콘텐츠' }
  ],

  // AI 제공자 mock 데이터
  aiProviders: [
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      isEnabled: false,
      apiKey: '',
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7
    },
    {
      id: 'google',
      name: 'Google AI',
      type: 'google',
      isEnabled: false,
      apiKey: '',
      model: 'gemini-pro',
      maxTokens: 2000,
      temperature: 0.7
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      type: 'anthropic',
      isEnabled: false,
      apiKey: '',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 2000,
      temperature: 0.7
    }
  ],

  // 사용자 프로필 mock 데이터
  userProfile: {
    uid: 'dev-user-123',
    email: 'dev-admin@example.com',
    displayName: 'Development Admin',
    role: 'admin',
    subscriptionStatus: 'premium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 관리자 통계 mock 데이터
  adminStats: {
    totalUsers: 156,
    activeUsers: 89,
    totalReadings: 2341,
    todayReadings: 47,
    totalBlogPosts: 23,
    publishedPosts: 20,
    totalCategories: 4,
    systemHealth: 'good' as const
  },

  // 타로 가이드라인 (이미 구현됨)
  tarotGuidelines: [], // TarotGuidelineActions에서 이미 로컬 데이터 사용

  // 블로그 포스트 mock 데이터
  blogPosts: [
    {
      id: 'post-1',
      title: '타로 카드 초보자 가이드',
      excerpt: '타로 카드를 처음 시작하는 분들을 위한 완전 가이드',
      content: '타로 카드의 기본적인 의미와 사용법을 알아보세요...',
      category: 'tarot',
      tags: ['초보자', '타로', '가이드'],
      published: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1일 전
      updatedAt: new Date().toISOString()
    },
    {
      id: 'post-2',
      title: '꿈의 상징과 의미',
      excerpt: '꿈에서 나타나는 다양한 상징들의 의미를 해석해보세요',
      content: '꿈은 우리의 무의식이 전하는 메시지입니다...',
      category: 'dream',
      tags: ['꿈해석', '상징', '심리학'],
      published: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2일 전
      updatedAt: new Date().toISOString()
    }
  ]
};

// 개발 모드 로깅
export const developmentLog = (service: string, message: string, data?: any) => {
  if (shouldUseDevelopmentFallback()) {
    console.log(`🔧 [DEV-FALLBACK] ${service}: ${message}`, data || '');
  }
};

// Firebase 에러를 개발 모드에서 처리
export const handleFirebaseError = (error: any, service: string, fallbackData?: any) => {
  if (shouldUseDevelopmentFallback()) {
    developmentLog(service, `Firebase error caught, using fallback data`, {
      error: error.message,
      fallback: !!fallbackData
    });
    return fallbackData;
  }
  throw error;
};

// 개발 모드 상태 확인 함수
export const getDevelopmentStatus = () => {
  return {
    isDevelopmentMode,
    hasCredentials: hasFirebaseCredentials(),
    useFallback: shouldUseDevelopmentFallback(),
    mockDataAvailable: Object.keys(developmentMockData).length
  };
};