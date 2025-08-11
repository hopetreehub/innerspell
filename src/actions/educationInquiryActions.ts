'use server';

import { revalidatePath } from 'next/cache';
import { 
  EducationInquiry, 
  EducationInquiryFormData, 
  EducationInquiryFormSchema 
} from '@/types';

// 교육 문의 생성
export async function createEducationInquiry(
  formData: EducationInquiryFormData
) {
  try {
    // 폼 데이터 검증
    const validatedData = EducationInquiryFormSchema.parse(formData);
    
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    console.log('📝 교육 문의 저장 시작', {
      isDevelopment,
      name: validatedData.name,
      email: validatedData.email,
      course: validatedData.course
    });
    
    if (isDevelopment) {
      console.log('📁 개발 환경 - 파일 시스템 사용');
      const { writeJSON, readJSON } = await import('@/services/file-storage-service');
      
      // 교육 문의 데이터 생성
      const inquiryData: EducationInquiry = {
        id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        course: validatedData.course,
        experience: validatedData.experience,
        purpose: validatedData.purpose,
        questions: validatedData.questions,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 기존 문의들 읽기
      const fileName = 'education-inquiries.json';
      let inquiries = await readJSON<EducationInquiry[]>(fileName) || [];
      
      // 새 문의 추가
      inquiries.unshift(inquiryData);
      
      // 파일에 저장
      await writeJSON(fileName, inquiries);
      
      console.log('✅ 교육 문의가 파일 시스템에 저장되었습니다', {
        fileName,
        totalInquiries: inquiries.length,
        newInquiryId: inquiryData.id
      });
      
      return { success: true, id: inquiryData.id };
    }
    
    // 프로덕션 환경에서는 Firebase 사용
    console.log('🔥 프로덕션 환경 - Firebase 사용 시도');
    
    // Firebase Admin SDK 동적 import
    const { firestore, admin } = await import('@/lib/firebase/admin');
    
    // Firestore 인스턴스 확인
    if (!firestore || typeof firestore.collection !== 'function') {
      console.error('❌ Firestore 인스턴스가 올바르지 않습니다:', firestore);
      throw new Error('데이터베이스 연결에 문제가 있습니다.');
    }
    
    // 교육 문의 데이터 생성
    const inquiryData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      course: validatedData.course,
      experience: validatedData.experience,
      purpose: validatedData.purpose || null,
      questions: validatedData.questions || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Firestore에 저장
    const docRef = await firestore.collection('education-inquiries').add(inquiryData);
    
    console.log('✅ 교육 문의가 Firebase에 저장되었습니다:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('교육 문의 생성 오류:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

// 교육 문의 목록 조회 (관리자용)
export async function getEducationInquiries(
  pageSize: number = 20,
  status?: 'pending' | 'contacted' | 'completed'
) {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 개발 환경에서는 파일 시스템 사용
      const { readJSON } = await import('@/services/file-storage-service');
      const inquiries = await readJSON<EducationInquiry[]>('education-inquiries.json') || [];
      
      // 필터링
      let filteredInquiries = inquiries;
      if (status) {
        filteredInquiries = inquiries.filter(inq => inq.status === status);
      }
      
      // 최신순 정렬
      filteredInquiries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // 페이지네이션
      const paginatedInquiries = filteredInquiries.slice(0, pageSize);
      
      return {
        success: true,
        inquiries: paginatedInquiries,
        hasMore: filteredInquiries.length > pageSize
      };
    }
    
    // 프로덕션 환경 - Firebase 사용
    const { firestore } = await import('@/lib/firebase/admin');
    
    let query = firestore.collection('education-inquiries')
      .orderBy('createdAt', 'desc')
      .limit(pageSize);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const inquiries: EducationInquiry[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      inquiries.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        course: data.course,
        experience: data.experience,
        purpose: data.purpose,
        questions: data.questions,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      });
    });
    
    return {
      success: true,
      inquiries,
      hasMore: inquiries.length === pageSize
    };
  } catch (error) {
    console.error('교육 문의 목록 조회 오류:', error);
    return { success: false, error: '데이터를 불러오는데 실패했습니다.' };
  }
}

// 교육 문의 상태 업데이트 (관리자용)
export async function updateInquiryStatus(
  inquiryId: string,
  status: 'pending' | 'contacted' | 'completed'
) {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 개발 환경에서는 파일 시스템 사용
      const { readJSON, writeJSON } = await import('@/services/file-storage-service');
      const inquiries = await readJSON<EducationInquiry[]>('education-inquiries.json') || [];
      
      const inquiryIndex = inquiries.findIndex(inq => inq.id === inquiryId);
      if (inquiryIndex === -1) {
        return { success: false, error: '문의를 찾을 수 없습니다.' };
      }
      
      // 상태 업데이트
      inquiries[inquiryIndex].status = status;
      inquiries[inquiryIndex].updatedAt = new Date();
      
      // 파일에 저장
      await writeJSON('education-inquiries.json', inquiries);
      
      revalidatePath('/admin/education-inquiries');
      return { success: true };
    }
    
    // 프로덕션 환경 - Firebase 사용
    const { firestore } = await import('@/lib/firebase/admin');
    
    await firestore.collection('education-inquiries').doc(inquiryId).update({
      status,
      updatedAt: new Date()
    });
    
    revalidatePath('/admin/education-inquiries');
    return { success: true };
  } catch (error) {
    console.error('교육 문의 상태 업데이트 오류:', error);
    return { success: false, error: '상태 업데이트에 실패했습니다.' };
  }
}