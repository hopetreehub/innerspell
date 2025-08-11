import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '@/services/usage-stats-service';

export async function GET(request: NextRequest) {
  try {
    const stats = await getUsageStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '통계 데이터를 불러올 수 없습니다.' 
      },
      { status: 500 }
    );
  }
}