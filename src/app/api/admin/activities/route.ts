import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivities, recordUserActivity } from '@/services/usage-stats-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const activities = await getRecentActivities(limit);
    
    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '활동 데이터를 불러올 수 없습니다.' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, details } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId와 action은 필수입니다.' 
        },
        { status: 400 }
      );
    }
    
    await recordUserActivity(userId, action, details);
    
    return NextResponse.json({
      success: true,
      message: '활동이 기록되었습니다.'
    });
  } catch (error) {
    console.error('Error recording activity:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '활동 기록에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}