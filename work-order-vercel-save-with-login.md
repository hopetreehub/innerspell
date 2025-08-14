# 작업지시서: 익명 인증 제거 및 Vercel 로그인 사용자 저장 기능 구현

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로 리딩 시스템
- **작업 요청자**: 사용자
- **작업 관리자**: SWARM PM
- **작업일**: 2025-08-13
- **우선순위**: 🔴 긴급 (High Priority)

## 🔍 통합 요구사항
1. **익명 저장 기능 완전 제거**
2. **Vercel에서 로그인한 사용자는 저장 가능하도록 구현**
3. **비로그인 사용자에게는 명확한 로그인 안내**

## 🎯 작업 목표
1. ✅ 익명 인증 관련 코드 완전 제거
2. ✅ Vercel 환경에서 로그인 사용자 저장 기능 정상 작동
3. ✅ Firebase 연결 및 저장 로직 최적화
4. ✅ 명확한 사용자 경험 제공

## 👥 작업 배정

### **SuperClaude (풀스택 개발자)**
- 익명 인증 코드 제거
- Vercel 저장 기능 디버깅 및 수정
- 통합 테스트 수행

## 📝 작업 단계

### Phase 1: 익명 인증 완전 제거 (15분)

1. **익명 인증 파일 삭제**
   ```bash
   rm src/lib/firebase/anonymous-auth.ts
   rm test-anonymous-save-local.js
   ```

2. **TarotReadingClient.tsx 수정**
   ```typescript
   // 제거할 import
   - import { ensureUserAuthenticated, isAnonymousUser, shouldShowAnonymousNotice, markAnonymousNoticeShown } from '@/lib/firebase/anonymous-auth';
   
   // handleSaveReading 함수 원복
   const handleSaveReading = async () => {
     if (!user) {
       toast({ 
         variant: 'destructive', 
         title: '로그인 필요', 
         description: '리딩을 저장하려면 먼저 로그인해주세요.',
         action: (
           <ToastAction altText="로그인" onClick={() => router.push('/sign-in?redirect=/reading')}>
             로그인하기
           </ToastAction>
         )
       });
       return;
     }
     
     if (!interpretation || selectedCardsForReading.length === 0 || !question.trim()) {
       toast({ 
         variant: 'destructive', 
         title: '저장 오류', 
         description: '저장할 해석 내용, 선택된 카드, 또는 질문이 없습니다.' 
       });
       return;
     }
     
     setIsSavingReading(true);
     
     // 기존 저장 로직으로 진행
     try {
       const drawnCardsToSave = selectedCardsForReading.map((card, index) => ({
         id: card.id,
         isReversed: !!card.isReversed,
         position: selectedSpread.positions?.[index] || `카드 ${index + 1}`,
       }));
       
       console.log('📤 저장 요청 데이터:', {
         userId: user.uid,
         question: question.substring(0, 50) + '...',
         spreadName: selectedSpread.name,
         drawnCardsCount: drawnCardsToSave.length
       });
       
       // ... 기존 저장 로직
     }
   };
   ```

3. **currentUser 변수를 user로 원복**
   ```typescript
   // 모든 currentUser를 user로 변경
   userId: user.uid,  // currentUser.uid -> user.uid
   ```

### Phase 2: Vercel 저장 기능 점검 및 수정 (20분)

1. **Firebase 클라이언트 저장 함수 개선**
   ```typescript
   // src/lib/firebase/client-save.ts
   export async function saveUserReadingClient(
     input: SaveReadingInput
   ): Promise<{ success: boolean; readingId?: string; error?: string }> {
     try {
       // Firebase 초기화 확인
       if (!db) {
         console.error('❌ Firebase가 초기화되지 않았습니다');
         // Firebase 재초기화 시도
         const { db: reinitDb } = await import('./client');
         if (!reinitDb) {
           return { 
             success: false, 
             error: 'Firebase 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' 
           };
         }
       }
       
       // 입력 검증 강화
       const validation = validateSaveInput(input);
       if (!validation.valid) {
         return { success: false, error: validation.error };
       }
       
       // Firestore 저장
       const docRef = await addDoc(collection(db, 'userReadings'), {
         ...readingData,
         environment: 'vercel', // Vercel 환경 표시
         savedAt: new Date().toISOString()
       });
       
       console.log(`✅ Vercel 환경에서 저장 성공: ${docRef.id}`);
       return { success: true, readingId: docRef.id };
       
     } catch (error) {
       console.error('❌ Vercel 저장 실패:', error);
       return handleFirebaseError(error);
     }
   }
   ```

2. **저장 버튼 UI 원복**
   ```typescript
   // AlertDialog 내부
   {!user && stage === 'interpretation_ready' && (
     <Button
       variant="default"
       onClick={() => {
         toast({ 
           title: '로그인 필요', 
           description: '리딩을 저장하려면 로그인이 필요합니다.',
           action: (
             <ToastAction altText="로그인" onClick={() => router.push('/sign-in?redirect=/reading')}>
               로그인하기
             </ToastAction>
           )
         });
       }}
       className="w-full sm:w-auto bg-primary hover:bg-primary/80"
     >
       <Save className="mr-2 h-4 w-4" />
       이 리딩 저장하기 (로그인 필요)
     </Button>
   )}
   
   {user && !readingJustSaved && stage === 'interpretation_ready' && (
     <Button
       variant="default"
       onClick={handleSaveReading}
       disabled={isSavingReading}
       className="w-full sm:w-auto bg-primary hover:bg-primary/80"
     >
       {isSavingReading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
       {isSavingReading ? '저장 중...' : '이 리딩 저장하기'}
     </Button>
   )}
   ```

### Phase 3: Vercel 환경 디버깅 추가 (15분)

1. **Firebase 연결 상태 확인 로직 추가**
   ```typescript
   // src/lib/firebase/client.ts에 연결 상태 확인 함수 추가
   export function getFirebaseStatus() {
     return {
       appInitialized: !!app,
       authInitialized: !!auth,
       dbInitialized: !!db,
       storageInitialized: !!storage,
       config: {
         projectId: firebaseConfig.projectId,
         authDomain: firebaseConfig.authDomain
       }
     };
   }
   ```

2. **디버그 정보 API 엔드포인트 개선**
   ```typescript
   // src/app/api/debug-firebase/route.ts
   import { NextResponse } from 'next/server';
   import { getFirebaseStatus } from '@/lib/firebase/client';
   
   export async function GET() {
     const status = getFirebaseStatus();
     const isVercel = process.env.VERCEL === '1';
     
     return NextResponse.json({
       environment: isVercel ? 'vercel' : 'local',
       firebase: status,
       timestamp: new Date().toISOString()
     });
   }
   ```

### Phase 4: Vercel 환경 테스트 스크립트 (15분)

1. **Vercel 로그인 사용자 저장 테스트**
   ```javascript
   // test-vercel-logged-in-save.js
   const testVercelLoggedInSave = async () => {
     console.log('🎭 Vercel 로그인 사용자 저장 테스트');
     
     // 1. 로그인 프로세스
     // 2. 타로 리딩 수행
     // 3. 저장 시도
     // 4. 저장 성공 확인
     // 5. 리딩 히스토리에서 확인
   };
   ```

2. **비로그인 사용자 안내 테스트**
   ```javascript
   // 비로그인 상태에서 저장 버튼 클릭
   // 로그인 안내 메시지 확인
   // 로그인 페이지로 리다이렉트 확인
   ```

### Phase 5: Firestore 보안 규칙 확인 (10분)

1. **현재 보안 규칙 검토**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 로그인한 사용자만 자신의 리딩 생성/읽기 가능
       match /userReadings/{document} {
         allow read: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
         allow update: if request.auth != null && request.auth.uid == resource.data.userId;
         allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       
       // 사용자 프로필
       match /users/{userId} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 🛠️ 핵심 수정 사항

### 1. 제거할 코드
- `/src/lib/firebase/anonymous-auth.ts` 파일
- 모든 익명 인증 관련 import 및 함수 호출
- `currentUser` 변수 (다시 `user`로 변경)

### 2. 수정할 코드
- `handleSaveReading` 함수 - 원래 로직으로 복구
- 저장 버튼 UI - 로그인 여부에 따른 조건부 렌더링
- Firebase 클라이언트 저장 함수 - 에러 처리 개선

### 3. 추가할 코드
- Firebase 연결 상태 확인 함수
- 디버그 API 엔드포인트
- Vercel 환경 전용 에러 처리

## ⚠️ 주의사항

1. **Vercel 환경 변수 확인**
   - `FIREBASE_SERVICE_ACCOUNT_KEY` 정확히 설정
   - 이스케이프 문자 처리 확인
   - 프로젝트 ID 특수문자 제거

2. **보안 규칙 준수**
   - 로그인한 사용자만 저장 가능
   - 자신의 데이터만 접근 가능
   - 익명 접근 차단

3. **사용자 경험**
   - 명확한 로그인 안내
   - 저장 실패 시 구체적인 에러 메시지
   - 로그인 페이지로 쉬운 이동

## 📊 성공 기준
1. ✅ 익명 인증 코드 완전 제거
2. ✅ Vercel에서 로그인 사용자 저장 성공
3. ✅ 비로그인 사용자 명확한 안내
4. ✅ Firebase 연결 안정성 확보
5. ✅ 에러 처리 및 사용자 피드백 개선

## 🔄 진행 상황 체크포인트
- [ ] Phase 1 완료: 익명 인증 제거
- [ ] Phase 2 완료: Vercel 저장 기능 수정
- [ ] Phase 3 완료: 디버깅 도구 추가
- [ ] Phase 4 완료: 테스트 수행
- [ ] Phase 5 완료: 보안 규칙 확인

## 📅 예상 소요 시간
- 총 작업 시간: 1시간 15분
- 코드 수정: 45분
- 테스트 및 검증: 30분

## 🚀 즉시 실행 가능한 조치
1. 익명 인증 파일 삭제
2. TarotReadingClient.tsx 수정
3. Vercel 환경에서 테스트
4. 로그인 후 저장 기능 확인

---

**PM 승인 필요**

익명 인증을 제거하고 Vercel에서 로그인한 사용자가 
정상적으로 타로 리딩을 저장할 수 있도록 하는 통합 작업입니다.

승인 후 즉시 Phase 1부터 체계적으로 진행하겠습니다.