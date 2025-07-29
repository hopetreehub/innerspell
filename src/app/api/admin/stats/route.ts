import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Mock 데이터 생성 함수
function generateMockStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // 일별 사용량 데이터 생성 (30일)
  const dailyUsage = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    dailyUsage.push({
      date: date.toISOString(),
      usage: Math.floor(Math.random() * 100) + 50 + (i * 2) // 증가 추세
    });
  }
  
  // 주간 사용량 데이터 생성 (12주)
  const weeklyUsage = [];
  for (let i = 0; i < 12; i++) {
    weeklyUsage.push({
      week: `W${i + 1}`,
      usage: Math.floor(Math.random() * 500) + 300 + (i * 20)
    });
  }
  
  // 월간 사용량 데이터 생성 (12개월)
  const monthlyUsage = [];
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  for (let i = 0; i < 12; i++) {
    monthlyUsage.push({
      month: months[i],
      usage: Math.floor(Math.random() * 2000) + 1000 + (i * 100)
    });
  }
  
  // 사용자 성장 데이터 생성
  const userGrowth = [];
  let totalUsers = 100;
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    totalUsers += Math.floor(Math.random() * 10) + 5;
    userGrowth.push({
      date: date.toISOString(),
      users: totalUsers
    });
  }
  
  // 사용자별 상세 데이터 생성
  const users = [];
  const emails = [
    'user1@example.com', 'user2@example.com', 'user3@example.com',
    'user4@example.com', 'user5@example.com', 'power.user@example.com',
    'casual.user@example.com', 'new.user@example.com', 'test@example.com',
    'demo@example.com', 'premium@example.com', 'basic@example.com',
    'super@example.com', 'regular@example.com', 'vip@example.com',
    'trial@example.com', 'pro@example.com', 'free@example.com',
    'guest@example.com', 'member@example.com'
  ];
  
  for (let i = 0; i < 20; i++) {
    const tarotReadings = Math.floor(Math.random() * 50) + 10;
    const dreamInterpretations = Math.floor(Math.random() * 30) + 5;
    users.push({
      userId: `user_${i + 1}`,
      email: emails[i] || `user${i + 1}@example.com`,
      tarotReadings,
      dreamInterpretations,
      totalUsage: tarotReadings + dreamInterpretations,
      lastActivity: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // 총 사용량 정렬
  users.sort((a, b) => b.totalUsage - a.totalUsage);
  
  // 서비스별 사용 비율
  const totalTarot = users.reduce((sum, user) => sum + user.tarotReadings, 0);
  const totalDream = users.reduce((sum, user) => sum + user.dreamInterpretations, 0);
  
  return {
    summary: {
      totalUsers: totalUsers,
      totalUsage: totalTarot + totalDream,
      activeToday: Math.floor(totalUsers * 0.3),
      activeThisWeek: Math.floor(totalUsers * 0.7),
      topUsers: users.slice(0, 5).map(u => ({
        email: u.email,
        totalUsage: u.totalUsage
      }))
    },
    charts: {
      dailyUsage,
      weeklyUsage,
      monthlyUsage,
      usageByType: {
        tarot: totalTarot,
        dream: totalDream
      },
      userGrowth
    },
    users: users
  };
}

export async function GET(request: NextRequest) {
  try {
    // 헤더에서 인증 토큰 확인 (실제로는 Firebase Admin SDK로 검증)
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    // Mock 인증 체크
    if (!authorization && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // Mock 데이터 생성 및 반환
    const stats = generateMockStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: '통계 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}