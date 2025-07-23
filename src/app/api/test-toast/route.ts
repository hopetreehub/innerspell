import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Toast test endpoint',
    instruction: 'Use the test page at /test-toast to test the toast functionality'
  });
}