import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { validateApiAccess } from '@/lib/security/api-validator';

// Firebase Admin 초기화
if (!getApps().length) {
  try {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
      (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
       process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');

    if (isDevelopmentMode) {
      console.log('🔥 Upload API - Development mode enabled');
      // 개발 모드에서는 mock storage 사용
    } else {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey || serviceAccountKey === 'your-service-account-key-json-here') {
        throw new Error('Firebase service account key not configured');
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // API 접근 권한 검증
    const validationResult = await validateApiAccess(request);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: validationResult.statusCode }
      );
    }

    // 개발 모드 확인
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
      (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
       process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');

    if (isDevelopmentMode) {
      // 개발 모드에서는 기존 이미지 중 하나를 랜덤으로 사용
      const mockImages = [
        '/images/blog1.png',
        '/images/blog2.png', 
        '/images/blog3.png',
        '/images/blog4.png',
        '/images/blog5.png',
        '/images/blog6.png',
        '/images/blog7.png',
        '/images/1ai.png',
        '/images/2road.png',
        '/images/3wisdom.png',
        '/images/ai-tarot-fusion.svg',
        '/images/daily-tarot-ritual.svg',
        '/images/dream-interpretation.svg',
        '/images/intuition-development.svg',
        '/images/meditation-guide.svg',
        '/images/spiritual-productivity.svg',
        '/images/success-mindset.svg',
        '/images/tarot-major-arcana.svg',
        '/images/tarot-psychology.svg',
        '/images/tarot-spread-guide.svg'
      ];
      
      const randomIndex = Math.floor(Math.random() * mockImages.length);
      const mockUrl = mockImages[randomIndex];
      
      console.log('🎯 Development mode - returning existing blog image:', mockUrl);
      
      return NextResponse.json({
        success: true,
        url: mockUrl,
        message: '개발 모드에서 기존 이미지 사용 완료'
      });
    }

    // 실제 프로덕션에서는 Firebase Storage 사용
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'blog-images';

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 유효성 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 지원)' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. (최대 5MB)' },
        { status: 400 }
      );
    }

    try {
      // Firebase Storage 업로드
      const storage = getStorage();
      const bucket = storage.bucket();
      
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${file.name.split('.').pop()}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      
      const fileUpload = bucket.file(fileName);
      await fileUpload.save(fileBuffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // 공개 URL 생성
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: '이미지 업로드가 완료되었습니다.'
      });

    } catch (storageError) {
      console.error('❌ Storage upload failed:', storageError);
      return NextResponse.json(
        { error: '이미지 업로드 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Image upload API endpoint',
      methods: ['POST'],
      description: 'Upload images to Firebase Storage with CORS bypass'
    },
    { status: 200 }
  );
}