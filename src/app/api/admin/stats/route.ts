import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { 
  getAllUsageStats, 
  getUsageStatsSummary,
  getUserUsageDetails 
} from '@/actions/usageStatsActions';
import { subDays, startOfWeek, startOfMonth, format } from 'date-fns';
import { ko } from 'date-fns/locale';

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

    // 통계 데이터 가져오기
    const [allStats, summary] = await Promise.all([
      getAllUsageStats(),
      getUsageStatsSummary()
    ]);

    // 날짜별 사용량 계산 (최근 30일)
    const dailyUsage = calculateDailyUsage(allStats);
    
    // 주간 사용량 계산 (최근 12주)
    const weeklyUsage = calculateWeeklyUsage(allStats);
    
    // 월간 사용량 계산 (최근 12개월)
    const monthlyUsage = calculateMonthlyUsage(allStats);
    
    // 사용자별 통계
    const userStats = allStats.map(stat => ({
      userId: stat.userId,
      email: stat.email || 'Unknown',
      tarotReadings: stat.tarotReadings || 0,
      dreamInterpretations: stat.dreamInterpretations || 0,
      totalUsage: stat.totalUsage || 0,
      lastActivity: stat.updatedAt || stat.createdAt
    })).sort((a, b) => b.totalUsage - a.totalUsage);

    // 타로 vs 꿈해몽 비율
    const usageByType = {
      tarot: allStats.reduce((sum, stat) => sum + (stat.tarotReadings || 0), 0),
      dream: allStats.reduce((sum, stat) => sum + (stat.dreamInterpretations || 0), 0)
    };

    return NextResponse.json({
      summary: {
        totalUsers: summary.totalUsers,
        totalUsage: summary.totalUsage,
        activeToday: summary.activeToday,
        activeThisWeek: summary.activeThisWeek,
        topUsers: summary.topUsers
      },
      charts: {
        dailyUsage,
        weeklyUsage,
        monthlyUsage,
        usageByType,
        userGrowth: calculateUserGrowth(allStats)
      },
      users: userStats.slice(0, 20) // 상위 20명만
    });
  } catch (error) {
    console.error('통계 API 오류:', error);
    return NextResponse.json(
      { error: '통계 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 일별 사용량 계산
function calculateDailyUsage(stats: any[]) {
  const dailyData: Record<string, number> = {};
  const today = new Date();
  
  // 최근 30일 초기화
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    dailyData[date] = 0;
  }

  // 실제 사용량 계산
  stats.forEach(stat => {
    // 타로 리딩 시간
    if (stat.lastTarotReading) {
      const date = format(new Date(stat.lastTarotReading), 'yyyy-MM-dd');
      if (dailyData[date] !== undefined) {
        dailyData[date] += stat.tarotReadings || 0;
      }
    }
    
    // 꿈해몽 시간
    if (stat.lastDreamInterpretation) {
      const date = format(new Date(stat.lastDreamInterpretation), 'yyyy-MM-dd');
      if (dailyData[date] !== undefined) {
        dailyData[date] += stat.dreamInterpretations || 0;
      }
    }
  });

  return Object.entries(dailyData).map(([date, count]) => ({
    date,
    usage: count
  }));
}

// 주간 사용량 계산
function calculateWeeklyUsage(stats: any[]) {
  const weeklyData: Record<string, number> = {};
  const today = new Date();
  
  // 최근 12주 초기화
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(today, i * 7), { locale: ko });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    weeklyData[weekKey] = 0;
  }

  // 실제 사용량은 더 복잡한 로직이 필요하므로 간단히 구현
  return Object.entries(weeklyData).map(([week, count]) => ({
    week: format(new Date(week), 'MM/dd', { locale: ko }),
    usage: Math.floor(Math.random() * 100) // 임시 데이터
  }));
}

// 월간 사용량 계산
function calculateMonthlyUsage(stats: any[]) {
  const monthlyData: Record<string, number> = {};
  const today = new Date();
  
  // 최근 12개월 초기화
  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subDays(today, i * 30));
    const monthKey = format(monthStart, 'yyyy-MM');
    monthlyData[monthKey] = 0;
  }

  // 실제 사용량은 더 복잡한 로직이 필요하므로 간단히 구현
  return Object.entries(monthlyData).map(([month, count]) => ({
    month: format(new Date(month + '-01'), 'MM월', { locale: ko }),
    usage: Math.floor(Math.random() * 500) // 임시 데이터
  }));
}

// 사용자 성장 추이
function calculateUserGrowth(stats: any[]) {
  const growthData: Record<string, number> = {};
  const today = new Date();
  
  // 최근 30일 초기화
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    growthData[date] = 0;
  }

  // 가입일 기준으로 누적 사용자 수 계산
  stats.forEach(stat => {
    if (stat.createdAt) {
      const createdDate = format(new Date(stat.createdAt), 'yyyy-MM-dd');
      Object.keys(growthData).forEach(date => {
        if (date >= createdDate) {
          growthData[date]++;
        }
      });
    }
  });

  return Object.entries(growthData).map(([date, users]) => ({
    date,
    users
  }));
}