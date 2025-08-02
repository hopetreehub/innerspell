import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Deployment test endpoint',
    timestamp: new Date().toISOString(),
    deploymentId: 'v3-fixed-firebase-connection',
    version: '1.0.0-health-fix',
  });
}