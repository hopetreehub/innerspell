import { NextRequest, NextResponse } from 'next/server';
import { getUserReadings } from '@/actions/readingActions';

export async function GET(request: NextRequest) {
  try {
    const userId = 'mock-google-user-id';
    console.log(`📝 사용자 ID: ${userId}로 리딩 기록 조회 중...`);
    
    const readings = await getUserReadings(userId);
    
    console.log(`✅ 조회 성공: ${readings.length}개의 리딩 기록을 찾았습니다.`);
    
    if (readings.length > 0) {
      console.log('\n📋 리딩 기록 목록:');
      readings.forEach((reading, index) => {
        console.log(`${index + 1}. ${reading.question} (${reading.spreadName})`);
        console.log(`   - 생성일: ${reading.createdAt}`);
        console.log(`   - 카드 수: ${reading.drawnCards.length}`);
      });
    } else {
      console.log('❌ 저장된 리딩 기록이 없습니다.');
    }
    
    return NextResponse.json({
      success: true,
      userId,
      readingCount: readings.length,
      readings: readings.map(r => ({
        id: r.id,
        question: r.question,
        spreadName: r.spreadName,
        createdAt: r.createdAt,
        cardCount: r.drawnCards.length
      }))
    });
  } catch (error) {
    console.error('❌ 리딩 기록 조회 중 오류 발생:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}