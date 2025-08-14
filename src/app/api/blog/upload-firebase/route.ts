import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase/admin';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Firebase Storage upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    try {
      // 파일을 Buffer로 변환
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // 파일명 생성
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uniqueFileName = `blog/${nanoid()}_${Date.now()}.${fileExtension}`;
      
      // Firebase Storage에 업로드
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(uniqueFileName);
      
      // 파일 업로드
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        },
        public: true, // 파일을 공개로 설정
        validation: 'md5' // MD5 검증 활성화
      });

      // 공개 URL 생성
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
      
      console.log('✅ File uploaded to Firebase Storage:', uniqueFileName);
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
        size: file.size,
        type: file.type
      });
    } catch (storageError: any) {
      console.error('Firebase Storage error:', storageError);
      
      // 권한 오류인 경우
      if (storageError.code === 403) {
        return NextResponse.json(
          { error: 'Storage permission denied. Please check Firebase Storage rules.' },
          { status: 403 }
        );
      }
      
      // Storage bucket 설정 오류인 경우
      if (storageError.message?.includes('Storage bucket')) {
        return NextResponse.json(
          { error: 'Firebase Storage not configured. Please check your Firebase settings.' },
          { status: 500 }
        );
      }
      
      throw storageError;
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}