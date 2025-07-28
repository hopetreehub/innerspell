import { NextRequest, NextResponse } from 'next/server';
import { admin, firestore } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const status = {
      // Environment check
      environment: {
        nodeEnv: process.env.NODE_ENV,
        useRealAuth: process.env.NEXT_PUBLIC_USE_REAL_AUTH,
        hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        hasGoogleAppCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      },
      
      // Admin SDK check
      adminSDK: {
        initialized: false,
        appCount: 0,
        error: null as string | null,
      },
      
      // Firestore check
      firestore: {
        canConnect: false,
        error: null as string | null,
      },
      
      // Mock mode check
      mockMode: {
        isActive: false,
        reason: null as string | null,
      }
    };
    
    // Check if mock mode is active
    const hasFirebaseCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const isMockMode = process.env.NODE_ENV === 'development' && !hasFirebaseCredentials;
    
    status.mockMode.isActive = isMockMode;
    if (isMockMode) {
      status.mockMode.reason = 'Development mode without Firebase credentials';
    }
    
    // Check Admin SDK
    try {
      if (admin && admin.apps) {
        status.adminSDK.initialized = true;
        status.adminSDK.appCount = admin.apps.length;
      }
    } catch (error) {
      status.adminSDK.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Test Firestore connection
    if (!isMockMode && firestore) {
      try {
        // Try to read a simple document
        const testCollection = await firestore.collection('_test_connection').limit(1).get();
        status.firestore.canConnect = true;
      } catch (error) {
        status.firestore.error = error instanceof Error ? error.message : 'Unknown error';
        // Still consider it connected if we get a permission error (means Firebase is working)
        if (error instanceof Error && error.message.includes('permission')) {
          status.firestore.canConnect = true;
          status.firestore.error = 'Permission denied (Firebase is connected but rules are blocking access)';
        }
      }
    }
    
    // Summary
    const summary = {
      isProperlyConfigured: !isMockMode && status.adminSDK.initialized && status.firestore.canConnect,
      issues: [] as string[],
    };
    
    if (isMockMode) {
      summary.issues.push('Running in mock mode - Firebase credentials not found');
    }
    if (!status.adminSDK.initialized) {
      summary.issues.push('Firebase Admin SDK not initialized');
    }
    if (!status.firestore.canConnect && !isMockMode) {
      summary.issues.push('Cannot connect to Firestore');
    }
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.NODE_ENV === 'production') {
      summary.issues.push('FIREBASE_SERVICE_ACCOUNT_KEY not set in production');
    }
    
    return NextResponse.json({
      success: true,
      status,
      summary,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[DEBUG] Firebase status check error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}