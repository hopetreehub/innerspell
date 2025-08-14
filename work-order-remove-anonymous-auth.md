# 작업지시서: 익명 인증 기능 제거 및 저장 로직 원복

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로 리딩 시스템
- **작업 요청자**: 사용자
- **작업 관리자**: SWARM PM
- **작업일**: 2025-08-13
- **우선순위**: 🔴 긴급 (High Priority)

## 🔍 요구사항 변경
- **변경 내용**: 익명 사용자를 위한 저장 기능 제거
- **사용자 요청**: "익명일때 저장은 필요없어 무료로그인 하면 저장이 되도 익명으로 저장은 필요없어"
- **결정 사항**: 
  - 익명 인증 기능 완전 제거
  - 로그인한 사용자만 저장 가능하도록 원복
  - 비로그인 사용자에게는 로그인 안내 표시

## 🎯 작업 목표
1. **익명 인증 코드 완전 제거**
2. **저장 버튼 표시 로직 원복**
3. **로그인 사용자만 저장 가능하도록 복구**
4. **비로그인 사용자를 위한 적절한 안내 유지**

## 👥 작업 배정

### **SuperClaude (풀스택 개발자)**
- 익명 인증 관련 코드 제거
- TarotReadingClient 컴포넌트 원복
- 테스트 및 검증

## 📝 작업 단계

### Phase 1: 익명 인증 코드 제거 (10분)

1. **익명 인증 모듈 삭제**
   ```bash
   # 익명 인증 파일 제거
   rm src/lib/firebase/anonymous-auth.ts
   ```

2. **TarotReadingClient에서 익명 인증 import 제거**
   ```typescript
   // 제거할 import
   import { ensureUserAuthenticated, isAnonymousUser, shouldShowAnonymousNotice, markAnonymousNoticeShown } from '@/lib/firebase/anonymous-auth';
   ```

3. **handleSaveReading 함수 원복**
   ```typescript
   const handleSaveReading = async () => {
     if (!user) {
       toast({ 
         variant: 'destructive', 
         title: '로그인 필요', 
         description: '리딩을 저장하려면 먼저 로그인해주세요.' 
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
     // 기존 저장 로직 유지
   };
   ```

### Phase 2: 저장 버튼 표시 로직 원복 (15분)

1. **AlertDialog 내 저장 버튼 원복**
   ```typescript
   // 비로그인 사용자를 위한 안내 버튼
   {!user && stage === 'interpretation_ready' && (
     <Button
       variant="default"
       onClick={() => {
         toast({ 
           title: '로그인 필요', 
           description: '리딩을 저장하려면 로그인이 필요합니다.',
           action: (
             <Link href="/sign-in?redirect=/reading">
               <Button variant="outline" size="sm">로그인하기</Button>
             </Link>
           )
         });
       }}
       className="w-full sm:w-auto bg-primary hover:bg-primary/80"
     >
       <Save className="mr-2 h-4 w-4" />
       이 리딩 저장하기
     </Button>
   )}
   
   // 로그인 사용자를 위한 저장 버튼
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

2. **하단 카드의 저장 버튼 원복**
   ```typescript
   {!readingJustSaved && (
     <Button
       variant="outline"
       onClick={user ? handleSaveReading : () => {
         toast({ 
           title: '로그인 필요', 
           description: '리딩을 저장하려면 로그인이 필요합니다.',
           action: (
             <Link href="/sign-in?redirect=/reading">
               <Button variant="outline" size="sm">로그인하기</Button>
             </Link>
           )
         });
       }}
       disabled={isSavingReading}
     >
       {isSavingReading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
       {isSavingReading ? '저장 중...' : '리딩 저장'}
       {!user && <span className="ml-1 text-xs text-muted-foreground">(로그인 필요)</span>}
     </Button>
   )}
   ```

### Phase 3: 코드 정리 및 검증 (10분)

1. **불필요한 변수 제거**
   - `currentUser` 변수를 `user`로 다시 변경
   - 익명 인증 관련 로직 완전 제거

2. **테스트 파일 정리**
   ```bash
   # 익명 인증 테스트 파일 제거
   rm test-anonymous-save-local.js
   ```

3. **로컬 환경 테스트**
   - 비로그인 상태에서 저장 버튼 클릭 시 로그인 안내 확인
   - 로그인 상태에서 정상 저장 확인

### Phase 4: Vercel 환경 재확인 (10분)

1. **Vercel 환경 동작 확인**
   - 비로그인 사용자: 저장 버튼 클릭 시 로그인 안내
   - 로그인 사용자: 정상적으로 저장 가능

2. **사용자 경험 검증**
   - 명확한 로그인 안내 메시지
   - 로그인 페이지로의 리다이렉트 지원

## 🛠️ 제거할 코드 목록

### 1. 파일 삭제
- `/src/lib/firebase/anonymous-auth.ts`
- `/test-anonymous-save-local.js`

### 2. Import 문 제거
```typescript
// TarotReadingClient.tsx에서 제거
import { ensureUserAuthenticated, isAnonymousUser, shouldShowAnonymousNotice, markAnonymousNoticeShown } from '@/lib/firebase/anonymous-auth';
```

### 3. 함수 내 익명 인증 로직 제거
- `handleSaveReading` 함수 내 익명 인증 코드
- `currentUser` 변수를 `user`로 원복
- 익명 사용자 안내 토스트 메시지 제거

## ⚠️ 주의사항

1. **기존 사용자 영향 없음**
   - 이미 로그인한 사용자는 계속 정상 저장 가능
   - 기존 저장된 데이터 유지

2. **명확한 안내 유지**
   - 비로그인 사용자에게 로그인 필요성 명확히 안내
   - 로그인 페이지로의 쉬운 이동 지원

3. **코드 깔끔하게 정리**
   - 익명 인증 관련 코드 완전 제거
   - 주석이나 잔여 코드 없도록 확인

## 📊 성공 기준
1. ✅ 익명 인증 코드 완전 제거
2. ✅ 비로그인 사용자 저장 시도 시 로그인 안내
3. ✅ 로그인 사용자 정상 저장 가능
4. ✅ Vercel 환경에서도 동일하게 작동
5. ✅ 코드 정리 및 불필요한 파일 제거

## 🔄 진행 상황 체크포인트
- [ ] Phase 1 완료: 익명 인증 코드 제거
- [ ] Phase 2 완료: 저장 버튼 로직 원복
- [ ] Phase 3 완료: 코드 정리 및 검증
- [ ] Phase 4 완료: Vercel 환경 확인

## 📅 예상 소요 시간
- 총 작업 시간: 45분
- 코드 제거 및 수정: 25분
- 테스트 및 검증: 20분

---

**PM 승인 필요**

사용자의 요구사항에 따라 익명 인증 기능을 완전히 제거하고,
로그인한 사용자만 저장할 수 있도록 원래 상태로 복구하는 작업입니다.

승인 후 즉시 Phase 1부터 체계적으로 진행하겠습니다.