import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { shouldUseDevelopmentFallback, developmentMockData, developmentLog } from '@/lib/firebase/development-mode';

// Helper function to check admin authorization
async function checkAdminAuth(request: NextRequest) {
  try {
    // 개발 모드에서는 간단한 인증 bypass
    if (shouldUseDevelopmentFallback()) {
      developmentLog('AdminStatsAPI', 'Development mode - bypassing admin auth');
      return { isAdmin: true, userId: 'dev-admin-123' };
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check admin status in Firestore
    const userDoc = await adminFirestore
      .collection('users')
      .doc(decodedToken.uid)
      .get();
    
    const isAdmin = userDoc.data()?.isAdmin === true;
    return { isAdmin, userId: decodedToken.uid };
  } catch (error) {
    console.error('Admin auth error:', error);
    // 개발 모드에서 Firebase 에러 시 fallback
    if (shouldUseDevelopmentFallback()) {
      developmentLog('AdminStatsAPI', 'Firebase auth failed, using development fallback');
      return { isAdmin: true, userId: 'dev-admin-123' };
    }
    return { isAdmin: false, error: 'Invalid token' };
  }
}

// Get real statistics from Firebase
async function getRealStats() {
  // 개발 모드에서는 mock 데이터 반환
  if (shouldUseDevelopmentFallback()) {
    developmentLog('AdminStatsAPI', 'Using development mock statistics');
    return generateMockStats();
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  try {
    // Get total users count
    const usersSnapshot = await adminFirestore.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Get usage statistics from saved readings
    const readingsSnapshot = await adminFirestore
      .collection('savedReadings')
      .where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      .orderBy('createdAt', 'desc')
      .get();

    // Process daily usage
    const dailyUsageMap = new Map<string, number>();
    const userDailyActivity = new Map<string, Set<string>>();

    readingsSnapshot.forEach((doc: FirebaseFirestore.DocumentSnapshot) => {
      const data = doc.data();
      if (data.createdAt) {
        const date = data.createdAt.toDate();
        const dateKey = date.toISOString().split('T')[0];
        dailyUsageMap.set(dateKey, (dailyUsageMap.get(dateKey) || 0) + 1);
        
        // Track unique users per day
        if (!userDailyActivity.has(dateKey)) {
          userDailyActivity.set(dateKey, new Set());
        }
        userDailyActivity.get(dateKey)?.add(data.userId);
      }
    });

    // Generate daily usage array
    const dailyUsage = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyUsage.push({
        date: date.toISOString(),
        usage: dailyUsageMap.get(dateKey) || 0
      });
    }

    // Get weekly and monthly aggregates
    const weeklyUsage = [];
    const monthlyUsage = [];
    
    // Process weekly data
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(twelveWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekReadings = await adminFirestore
        .collection('savedReadings')
        .where('createdAt', '>=', Timestamp.fromDate(weekStart))
        .where('createdAt', '<', Timestamp.fromDate(weekEnd))
        .get();
      
      weeklyUsage.push({
        week: `W${i + 1}`,
        usage: weekReadings.size
      });
    }

    // Process monthly data
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(twelveMonthsAgo);
      monthDate.setMonth(monthDate.getMonth() + i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      
      const monthReadings = await adminFirestore
        .collection('savedReadings')
        .where('createdAt', '>=', Timestamp.fromDate(monthStart))
        .where('createdAt', '<', Timestamp.fromDate(monthEnd))
        .get();
      
      monthlyUsage.push({
        month: months[monthDate.getMonth()],
        usage: monthReadings.size
      });
    }

    // Get user growth data
    const userGrowth = [];
    let cumulativeUsers = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const newUsersCount = await adminFirestore
        .collection('users')
        .where('createdAt', '>=', Timestamp.fromDate(date))
        .where('createdAt', '<', Timestamp.fromDate(dayEnd))
        .get();
      
      cumulativeUsers += newUsersCount.size;
      
      userGrowth.push({
        date: date.toISOString(),
        users: totalUsers - (30 - i - 1) * 2 + cumulativeUsers // Approximate total users
      });
    }

    // Get user details with real activity
    const usersData = [];
    const usersList = await adminFirestore
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    for (const userDoc of usersList.docs) {
      const userData = userDoc.data();
      
      // Get user's reading count
      const userReadings = await adminFirestore
        .collection('savedReadings')
        .where('userId', '==', userDoc.id)
        .get();
      
      // Get last activity
      const lastReading = await adminFirestore
        .collection('savedReadings')
        .where('userId', '==', userDoc.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      const lastActivity = !lastReading.empty 
        ? lastReading.docs[0].data().createdAt?.toDate()
        : userData.lastSignInTime || userData.createdAt?.toDate();

      usersData.push({
        id: userDoc.id,
        email: userData.email || 'Unknown',
        displayName: userData.displayName || userData.nickname || 'Anonymous',
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastActivity: lastActivity || new Date(),
        usage: userReadings.size,
        isAdmin: userData.isAdmin || false
      });
    }

    return {
      dailyUsage,
      weeklyUsage,
      monthlyUsage,
      userGrowth,
      users: usersData,
      summary: {
        totalUsers,
        totalReadings: readingsSnapshot.size,
        activeToday: userDailyActivity.get(new Date().toISOString().split('T')[0])?.size || 0,
        growth30d: Math.round(((userGrowth[29]?.users || totalUsers) / (userGrowth[0]?.users || totalUsers) - 1) * 100)
      }
    };
  } catch (error) {
    console.error('Error fetching real stats:', error);
    // Firebase 에러 시 개발 모드 fallback
    if (shouldUseDevelopmentFallback()) {
      developmentLog('AdminStatsAPI', 'Firebase error, using mock stats fallback');
      return generateMockStats();
    }
    throw error;
  }
}

// Generate mock statistics for development mode
function generateMockStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Generate daily usage data
  const dailyUsage = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    dailyUsage.push({
      date: date.toISOString(),
      usage: Math.floor(Math.random() * 50) + 10 // 10-60 usage per day
    });
  }

  // Generate weekly usage data
  const weeklyUsage = [];
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(now.getTime() - (12 - i) * 7 * 24 * 60 * 60 * 1000);
    weeklyUsage.push({
      week: weekStart.toISOString().split('T')[0],
      usage: Math.floor(Math.random() * 300) + 100 // 100-400 usage per week
    });
  }

  // Generate monthly usage data
  const monthlyUsage = [];
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    monthlyUsage.push({
      month: monthStart.toISOString().split('T')[0],
      usage: Math.floor(Math.random() * 1200) + 400 // 400-1600 usage per month
    });
  }

  // Generate user growth data
  const userGrowth = [];
  let baseUsers = 50;
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    baseUsers += Math.floor(Math.random() * 5); // 0-5 new users per day
    userGrowth.push({
      date: date.toISOString(),
      users: baseUsers
    });
  }

  // Generate mock users data
  const users = developmentMockData.adminStats;

  return {
    dailyUsage,
    weeklyUsage,
    monthlyUsage,
    userGrowth,
    users: [users], // Wrap in array for compatibility
    summary: {
      totalUsers: users.totalUsers,
      totalReadings: users.totalReadings,
      activeToday: users.activeUsers,
      growth30d: 15 // 15% growth
    }
  };
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

    // Get real statistics
    const stats = await getRealStats();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
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