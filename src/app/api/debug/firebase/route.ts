import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const debugInfo = {
    nodeEnv: process.env.NODE_ENV,
    useRealAuth: process.env.NEXT_PUBLIC_USE_REAL_AUTH,
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.slice(0, 10)}...` : 'NOT_SET',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT_SET',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'NOT_SET',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'NOT_SET',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_APP_ID.slice(0, 10)}...` : 'NOT_SET',
    },
    adminCredentials: {
      googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT_SET',
      firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'SET' : 'NOT_SET',
    },
    authMode: {
      shouldUseRealAuth: process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true' || process.env.NODE_ENV === 'production',
      configComplete: !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ),
      hasAdminCredentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
    }
  };

  return NextResponse.json(debugInfo);
}