import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';

// 허용된 이미지 파일 타입
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

// 최대 파일 크기 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 파일 유효성 검증
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 지원)' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: '파일 크기가 너무 큽니다. (최대 5MB)' 
    };
  }

  return { isValid: true };
}

// 파일명 생성 (충돌 방지)
function generateFileName(originalName: string, prefix: string = 'blog'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${prefix}/${timestamp}_${randomStr}.${extension}`;
}

// 이미지 파일 업로드
export async function uploadImageFile(
  file: File, 
  folder: string = 'blog-images'
): Promise<string> {
  try {
    // 개발 모드이거나 Storage가 없는 경우 API 프록시 사용
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
      (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
       process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');
    
    // 🎯 API 프록시 강제 사용 (CORS 문제 해결을 위해)
    console.log('🔍 Upload conditions:', {
      storageExists: !!storage,
      isDevelopmentMode,
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_DEV_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH,
      USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH
    });
    
    console.log('📤 Force using API proxy for CORS fix');
    return await uploadViaAPI(file, folder);
    
    // 기존 Firebase Storage 코드는 임시로 비활성화
    if (false && (!storage || isDevelopmentMode)) {
      console.log('📤 Using API proxy for image upload');
      return await uploadViaAPI(file, folder);
    }

    // 파일 유효성 검증
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 파일명 생성
    const fileName = generateFileName(file.name, folder);
    
    // Storage 참조 생성
    const storageRef = ref(storage, fileName);
    
    console.log('📤 Uploading image to:', fileName);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Image uploaded successfully:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Image upload failed, trying API proxy:', error);
    // Firebase 업로드 실패 시 API 프록시로 폴백
    return await uploadViaAPI(file, folder);
  }
}

// API 프록시를 통한 이미지 업로드
async function uploadViaAPI(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  // CSRF 토큰 가져오기
  const getCsrfToken = (): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf-token') {
        return value;
      }
    }
    return null;
  };
  
  const csrfToken = getCsrfToken();
  const headers: HeadersInit = {
    // API secret for development
    'x-api-secret': process.env.NEXT_PUBLIC_BLOG_API_SECRET || 'c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=',
  };
  
  // CSRF 토큰이 있으면 추가
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API 업로드 실패');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'API 업로드 응답 오류');
  }

  return result.url;
}

// Base64 이미지 업로드
export async function uploadBase64Image(
  base64Data: string,
  fileName: string = 'image.jpg',
  folder: string = 'blog-images'
): Promise<string> {
  try {
    if (!storage) {
      throw new Error('Storage가 초기화되지 않았습니다.');
    }

    // 파일명 생성
    const generatedFileName = generateFileName(fileName, folder);
    
    // Storage 참조 생성
    const storageRef = ref(storage, generatedFileName);
    
    console.log('📤 Uploading base64 image to:', generatedFileName);
    
    // Base64 업로드
    const snapshot = await uploadString(storageRef, base64Data, 'data_url');
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Base64 image uploaded successfully:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Base64 image upload failed:', error);
    throw error;
  }
}

// 이미지 크기 조정 (클라이언트 사이드)
export function resizeImage(
  file: File, 
  maxWidth: number = 1200, 
  maxHeight: number = 800, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 비율 계산
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('이미지 크기 조정에 실패했습니다.'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('이미지 로드에 실패했습니다.'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// 이미지 미리보기 URL 생성
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

// 이미지 미리보기 URL 해제
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

// 업로드 진행 상태 타입
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// 진행 상태와 함께 업로드
export async function uploadImageWithProgress(
  file: File,
  folder: string = 'blog-images',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    if (!storage) {
      throw new Error('Storage가 초기화되지 않았습니다.');
    }

    // 파일 유효성 검증
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Mock 환경에서는 진행상태 시뮬레이션
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      // 진행상태 시뮬레이션
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        onProgress?.({
          loaded: (file.size * progress) / 100,
          total: file.size,
          percentage: progress
        });
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);

      // 실제 업로드 수행
      const url = await uploadImageFile(file, folder);
      clearInterval(interval);
      return url;
    }

    // 실제 Firebase에서는 업로드 task 사용 (향후 구현)
    return await uploadImageFile(file, folder);
  } catch (error) {
    console.error('❌ Image upload with progress failed:', error);
    throw error;
  }
}