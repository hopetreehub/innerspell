# 🔷 TypeScript 전문가 작업 지시서

## 📋 작업 개요
- **담당자**: TypeScript Specialist
- **우선순위**: 🔴 높음
- **예상 소요시간**: 2일
- **시작일**: 2025년 1월 3일

---

## 🎯 주요 목표
1. TypeScript 오류 완전 제거 (현재 ~100개 → 0개)
2. 타입 안전성 95% 이상 달성
3. 코드 품질 표준화

---

## 📝 상세 작업 내용

### Day 1: 오류 분석 및 우선순위 설정

#### 오전 (09:00-12:00)
```bash
# 1. 현재 TypeScript 오류 전체 스캔
npm run typecheck > typescript-errors.log

# 2. 오류 분류 및 카테고리화
- any 타입 사용
- null/undefined 처리
- 타입 불일치
- 누락된 타입 정의
```

#### 오후 (13:00-18:00)
```typescript
// 3. 핵심 타입 정의 파일 생성/수정
// src/types/global.d.ts
declare global {
  interface Window {
    // 전역 타입 정의
  }
}

// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 4. 공통 유틸리티 타입 정의
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
```

### Day 2: 오류 수정 및 테스트

#### 오전 (09:00-12:00)
```typescript
// 5. 컴포넌트 props 타입 강화
interface ComponentProps {
  // 명확한 타입 정의
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

// 6. API 호출 타입 안전성
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // 타입 안전한 API 호출
}
```

#### 오후 (13:00-18:00)
```bash
# 7. 린트 및 포맷팅
npm run lint:fix
npm run format

# 8. 최종 검증
npm run typecheck
npm run build
```

---

## 🔍 중점 확인 사항

### 1. Firebase 관련 타입
```typescript
// Firebase 타입 정의 확인
import { User } from 'firebase/auth';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

// 커스텀 타입 변환
type FirestoreDoc<T> = QueryDocumentSnapshot<T>;
```

### 2. React 컴포넌트 타입
```typescript
// 함수형 컴포넌트 타입
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // 구현
};

// 이벤트 핸들러 타입
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
  // 처리
};
```

### 3. 상태 관리 타입
```typescript
// useState 타입
const [state, setState] = useState<StateType>(initialState);

// useReducer 타입
const reducer: React.Reducer<State, Action> = (state, action) => {
  // 리듀서 로직
};
```

---

## 📊 체크리스트

### 필수 완료 항목
- [ ] `tsconfig.json` strict 모드 활성화
- [ ] 모든 `any` 타입 제거
- [ ] `@ts-ignore` 주석 제거
- [ ] 타입 정의 파일 완성 (`.d.ts`)
- [ ] API 응답 타입 검증
- [ ] 컴포넌트 props 타입 정의
- [ ] 이벤트 핸들러 타입 명시
- [ ] 유틸리티 함수 타입 정의

### 품질 기준
- [ ] TypeScript 컴파일 오류 0개
- [ ] 타입 커버리지 95% 이상
- [ ] ESLint 오류 0개
- [ ] 빌드 성공

---

## 🚨 주의사항

1. **점진적 수정**
   - 한 번에 모든 오류를 수정하지 말고 카테고리별로 진행
   - 각 수정 후 테스트 실행

2. **타입 추론 활용**
   - 불필요한 타입 명시 피하기
   - TypeScript의 타입 추론 최대한 활용

3. **제네릭 활용**
   ```typescript
   function getValue<T>(key: string): T {
     // 제네릭을 활용한 유연한 타입
   }
   ```

---

## 📁 주요 작업 파일

### 우선순위 높음
1. `/src/lib/firebase/*` - Firebase 관련 타입
2. `/src/actions/*` - Server Actions 타입
3. `/src/components/*` - React 컴포넌트 타입
4. `/src/hooks/*` - 커스텀 훅 타입

### 우선순위 중간
1. `/src/utils/*` - 유틸리티 함수
2. `/src/types/*` - 타입 정의 파일
3. `/src/context/*` - Context 타입

---

## 🎯 최종 목표

### 완료 기준
1. `npm run typecheck` 실행 시 오류 0개
2. `npm run build` 성공
3. 모든 파일에 적절한 타입 정의
4. 코드 리뷰 통과

### 산출물
1. TypeScript 오류 해결 보고서
2. 타입 정의 문서
3. 마이그레이션 가이드

---

## 💡 참고 자료
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [React TypeScript 치트시트](https://react-typescript-cheatsheet.netlify.app/)
- [Firebase TypeScript 가이드](https://firebase.google.com/docs/reference/js)

---

**작성자**: PM Claude  
**최종 수정**: 2025년 1월 3일