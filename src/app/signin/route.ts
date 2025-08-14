import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 기존 쿼리 파라미터 유지
  const queryString = searchParams.toString();
  const redirectUrl = queryString ? `/sign-in?${queryString}` : '/sign-in';
  
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}