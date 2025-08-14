# 작업지시서: Vercel 환경 타로 리딩 저장 기능 구현

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로 리딩 시스템
- **작업 요청자**: 사용자
- **작업 관리자**: SWARM PM
- **작업일**: 2025-08-13
- **우선순위**: 🟡 중간 (Medium Priority)

## 🔍 분석 결과 기반 문제 정의
- **현재 상황**: Vercel에서 비로그인 사용자는 타로 리딩 저장 불가
- **근본 원인**: Firebase Auth 보안 정책에 따른 정상 동작
- **필요 조치**: 익명 인증 또는 게스트 저장 기능 구현

## 🎯 작업 목표
1. **모든 사용자가 Vercel에서 타로 리딩 저장 가능**
2. **보안성과 사용자 경험의 균형**
3. **기존 로그인 사용자 기능 유지**
4. **데이터 무결성 보장**

## 👥 작업 배정

### **SuperClaude (풀스택 개발자)**
- Firebase 익명 인증 구현
- 저장 로직 수정 및 테스트
- Vercel 환경 배포 검증

## 📝 작업 단계

### Phase 1: Firebase 익명 인증 설정 (15분)
1. **Firebase Console 설정**
   ```bash
   # Firebase 프로젝트에서 익명 인증 활성화 필요
   # Authentication > Sign-in method > Anonymous 활성화
   ```

2. **Auth 설정 코드 수정**
   ```typescript
   // src/lib/firebase/auth.ts 또는 관련 파일
   import { signInAnonymously } from 'firebase/auth';
   
   export const ensureUserAuthenticated = async () => {
     if (!auth.currentUser) {
       await signInAnonymously(auth);
     }
     return auth.currentUser;
   };
   ```

### Phase 2: 저장 로직 개선 (20분)
1. **자동 익명 로그인 구현**
   ```typescript
   // src/components/reading/SaveButton.tsx
   const handleSave = async () => {
     try {
       // 로그인되지 않은 사용자 자동 익명 로그인
       await ensureUserAuthenticated();
       
       // 기존 저장 로직 실행
       const result = await saveReading(readingData);
       
       if (result.success) {
         toast.success('타로 리딩이 저장되었습니다!');
       }
     } catch (error) {
       console.error('저장 실패:', error);
       toast.error('저장에 실패했습니다. 다시 시도해 주세요.');
     }
   };
   ```

2. **TarotReadingClient 컴포넌트 수정**
   ```typescript
   // src/components/reading/TarotReadingClient.tsx
   // 저장 버튼을 모든 사용자에게 표시하도록 수정
   const showSaveButton = interpretationText && drawnCards.length > 0;
   ```

### Phase 3: 사용자 경험 개선 (15분)
1. **익명 사용자 안내 메시지**
   ```typescript
   // 익명 로그인 시 사용자 안내
   const showAnonymousUserNotice = () => {
     toast.info('게스트 모드로 저장됩니다. 회원가입하면 모든 리딩을 영구 보관할 수 있습니다.');
   };
   ```

2. **저장 상태 표시 개선**
   ```typescript
   // 저장 버튼 상태 관리
   const [isSaving, setIsSaving] = useState(false);
   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
   ```

### Phase 4: Vercel 환경 테스트 및 검증 (25분)
1. **로컬 테스트**
   ```bash
   # 포트 4000에서 익명 인증 테스트
   npm run dev
   ```

2. **Vercel 배포 및 테스트**
   ```bash
   # 변경사항을 Vercel에 배포
   git add .
   git commit -m "feat: Firebase 익명 인증으로 모든 사용자 저장 지원"
   git push
   ```

3. **Playwright 검증 테스트**
   ```javascript
   // test-vercel-anonymous-save.js
   const testAnonymousSave = async () => {
     // 비로그인 상태에서 타로 리딩 수행
     // 저장 버튼 클릭
     // 저장 성공 확인
     // 리딩 히스토리에서 조회 확인
   };
   ```

## 🛠️ 구현 상세

### 1. Firebase 규칙 수정 (필요 시)
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자 (익명 포함)는 자신의 리딩만 접근 가능
    match /userReadings/{readingId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // 새 리딩 생성 시
    match /userReadings/{readingId} {
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 2. 익명 사용자 데이터 관리
```typescript
// src/types/user.ts
export interface UserProfile {
  uid: string;
  isAnonymous: boolean;
  email?: string;
  displayName?: string;
  createdAt: Date;
  readingCount: number;
}

// 익명 사용자 프로필 생성
export const createAnonymousUserProfile = async (uid: string) => {
  const profile: UserProfile = {
    uid,
    isAnonymous: true,
    createdAt: new Date(),
    readingCount: 0
  };
  
  await firestore.collection('users').doc(uid).set(profile);
  return profile;
};
```

### 3. 마이그레이션 지원 (향후 확장)
```typescript
// 익명 계정에서 정식 계정으로 데이터 이전
export const migrateAnonymousData = async (
  anonymousUid: string, 
  newUid: string
) => {
  const batch = firestore.batch();
  
  // 기존 익명 사용자의 리딩 데이터 조회
  const readings = await firestore
    .collection('userReadings')
    .where('userId', '==', anonymousUid)
    .get();
  
  // 새 사용자 ID로 이전
  readings.docs.forEach(doc => {
    const newRef = firestore.collection('userReadings').doc();
    batch.set(newRef, {
      ...doc.data(),
      userId: newUid,
      migratedFrom: anonymousUid,
      migratedAt: FieldValue.serverTimestamp()
    });
    
    // 기존 익명 데이터 삭제
    batch.delete(doc.ref);
  });
  
  await batch.commit();
};
```

## ⚠️ 주의사항

### 1. 보안 고려사항
- 익명 사용자도 Firebase 인증을 통해 관리
- Firestore 보안 규칙으로 데이터 접근 제한
- 익명 사용자 데이터 남용 방지

### 2. 성능 고려사항
- 익명 사용자 수 모니터링
- 데이터 정리 정책 수립 (30일 후 자동 삭제 등)
- Firebase 사용량 최적화

### 3. UX 고려사항
- 익명 저장의 한계점 명확히 안내
- 회원가입 유도를 위한 적절한 CTA
- 저장 실패 시 대체 방안 제공

## 📊 성공 기준
1. ✅ Vercel에서 비로그인 사용자 타로 리딩 저장 가능
2. ✅ 저장된 데이터가 Firebase에 정상 저장
3. ✅ 리딩 히스토리에서 익명 사용자 데이터 조회 가능  
4. ✅ 기존 로그인 사용자 기능 영향 없음
5. ✅ Playwright 테스트 통과

## 🔄 진행 상황 체크포인트
- [ ] Phase 1 완료: Firebase 익명 인증 설정
- [ ] Phase 2 완료: 저장 로직 개선
- [ ] Phase 3 완료: UX 개선 적용
- [ ] Phase 4 완료: Vercel 환경 검증

## 📅 예상 소요 시간
- 총 작업 시간: 1시간 15분
- Firebase Console 설정: 5분
- 코드 구현: 50분  
- 테스트 및 검증: 20분

---

**PM 승인 필요**

이 작업지시서는 Vercel 환경에서 모든 사용자가 타로 리딩을 저장할 수 있도록 
Firebase 익명 인증을 구현하는 계획입니다. 

승인 후 즉시 Phase 1부터 체계적으로 진행하겠습니다.