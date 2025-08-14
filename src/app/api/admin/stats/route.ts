import { NextRequest, NextResponse } from 'next/server';
import { createDataSource, getCurrentDataSourceType } from '@/lib/admin';
import { adminAuth } from '@/lib/firebase/admin';

// Helper function to check admin authorization
async function checkAdminAuth(request: NextRequest) {
  try {
    const dataSourceType = getCurrentDataSourceType();
    
    // 개발 모드에서는 간단한 인증 bypass
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Admin auth bypassed in development');
      return { isAdmin: true, userId: 'dev-admin-123' };
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // TODO: Check admin status in database
    // For now, assume authenticated users are admins
    return { isAdmin: true, userId: decodedToken.uid };
  } catch (error) {
    console.error('Admin auth error:', error);
    
    // 개발 모드에서 에러 시 fallback
    const dataSourceType = getCurrentDataSourceType();
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Auth error, using development fallback');
      return { isAdmin: true, userId: 'dev-admin-123' };
    }
    
    return { isAdmin: false, error: 'Invalid token' };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const { isAdmin, error } = await checkAdminAuth(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // 데이터 소스 생성
    const dataSource = createDataSource();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    
    // 병렬로 데이터 가져오기
    const [
      adminStats,
      dailyStats,
      hourlyStats,
      realtimeData
    ] = await Promise.all([
      dataSource.getAdminStats(),
      dataSource.getDailyStats(thirtyDaysAgo, now),
      dataSource.getHourlyStats(now),
      dataSource.getRealtimeData()
    ]);

    // 일별 사용량 데이터 포맷
    const dailyUsage = dailyStats.map(stat => ({
      date: new Date(stat.date).toISOString(),
      usage: stat.totalReadings
    }));

    // 주간 사용량 데이터 (일별 데이터에서 집계)
    const weeklyUsage = [];
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(twelveWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekStats = dailyStats.filter(stat => {
        const statDate = new Date(stat.date);
        return statDate >= weekStart && statDate < weekEnd;
      });
      
      const weekTotal = weekStats.reduce((sum, stat) => sum + stat.totalReadings, 0);
      
      weeklyUsage.push({
        week: `W${i + 1}`,
        usage: weekTotal
      });
    }

    // 월간 사용량 데이터
    const year = now.getFullYear();
    const monthlyStats = await dataSource.getMonthlyStats(year);
    const monthlyUsage = monthlyStats.map(stat => ({
      month: stat.month,
      usage: stat.totalReadings
    }));

    // 사용자 성장 데이터 (일별 unique users 기반)
    const userGrowth = dailyStats.map((stat, index) => {
      // 누적 사용자 수 추정 (실제로는 Firebase에서 가져와야 함)
      const baseUsers = adminStats.totalUsers - (dailyStats.length - index - 1) * 2;
      return {
        date: new Date(stat.date).toISOString(),
        users: Math.max(baseUsers, 1)
      };
    });

    // 활성 사용자 정보
    const users = realtimeData.activeUsers.map(user => ({
      id: user.userId,
      email: user.email,
      displayName: user.email.split('@')[0], // 임시 display name
      photoURL: null,
      createdAt: new Date(), // TODO: 실제 생성일 가져오기
      lastActivity: user.lastActivity,
      usage: Math.floor(Math.random() * 100), // TODO: 실제 사용량 가져오기
      isAdmin: false
    }));

    // 요약 정보
    const summary = {
      totalUsers: adminStats.totalUsers,
      totalReadings: adminStats.totalReadings,
      activeToday: adminStats.activeUsers,
      growth30d: userGrowth.length > 1 
        ? Math.round(((userGrowth[userGrowth.length - 1].users / userGrowth[0].users) - 1) * 100)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        dailyUsage,
        weeklyUsage,
        monthlyUsage,
        userGrowth,
        users,
        summary
      },
      timestamp: new Date().toISOString(),
      dataSource: getCurrentDataSourceType() // 디버깅용
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}