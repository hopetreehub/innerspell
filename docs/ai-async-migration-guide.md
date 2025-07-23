# AI Async Migration Guide - 다음 세션을 위한 지침

## 작업 완료 상태

모든 AI flow 파일들이 새로운 async `getAI()` 함수를 사용하도록 성공적으로 업데이트되었습니다.

### 업데이트된 파일들:
1. ✅ `/src/ai/flows/generate-tarot-interpretation.ts`
2. ✅ `/src/ai/flows/generate-dream-interpretation.ts`
3. ✅ `/src/ai/flows/sequential-thinking-flow.ts`
4. ✅ `/src/ai/flows/generate-dream-clarification-questions.ts`
5. ✅ `/src/ai/flows/configure-ai-prompt-settings.ts`
6. ✅ `/src/ai/flows/configure-dream-prompt-settings.ts`

## 주요 변경 사항

### 1. Import 변경
```typescript
// 이전
import { ai } from '@/ai/genkit';

// 이후
import { getAI } from '@/ai/genkit';
```

### 2. Flow 정의 패턴 변경

#### 기본 패턴 (대부분의 flow들):
```typescript
// 이전
const myFlow = ai.defineFlow({...}, async (input) => {...});

// 이후
export async function myFlow(input: InputType): Promise<OutputType> {
  const ai = await getAI();
  
  const flow = ai.defineFlow({...}, async (flowInput) => {...});
  
  return flow(input);
}
```

#### 내부 함수가 있는 패턴 (generate-dream-clarification-questions.ts):
```typescript
// 이전
export async function generateDreamClarificationQuestions(input) {
  return generateDreamClarificationQuestionsFlow(input);
}

const generateDreamClarificationQuestionsFlow = ai.defineFlow({...});

// 이후
export async function generateDreamClarificationQuestions(input) {
  const ai = await getAI();
  return generateDreamClarificationQuestionsFlow(ai, input);
}

async function generateDreamClarificationQuestionsFlow(ai: any, input) {
  const flow = ai.defineFlow({...});
  return flow(input);
}
```

## 다음 세션에서 확인할 사항

1. **테스트 실행**: 모든 AI 기능들이 정상적으로 작동하는지 확인
   - Tarot 해석 생성
   - Dream 해석 생성
   - Dream 추가 질문 생성
   - Sequential thinking flow
   - AI 설정 구성

2. **동적 AI Provider 전환**: Admin 패널에서 AI provider를 변경했을 때 실시간으로 반영되는지 확인

3. **성능 모니터링**: 
   - API 키 캐싱이 제대로 작동하는지 확인 (5분 TTL)
   - 불필요한 Firestore 읽기가 발생하지 않는지 확인

4. **에러 처리**: 
   - API 키가 없을 때의 fallback 동작 확인
   - 잘못된 API 키가 설정되었을 때의 에러 처리 확인

## 아키텍처 개선 사항

이제 시스템은 다음과 같이 작동합니다:

1. **동적 AI Provider 로딩**: 
   - Admin 패널에서 설정한 AI provider 설정을 Firestore에서 읽어옴
   - 암호화된 API 키를 복호화하여 사용
   - 5분간 캐싱하여 성능 최적화

2. **Fallback 메커니즘**:
   - Firestore에서 설정을 읽을 수 없는 경우 환경 변수 사용
   - 여러 환경 변수 이름 지원 (GOOGLE_API_KEY, GEMINI_API_KEY 등)

3. **유연한 Provider 지원**:
   - Google AI와 OpenAI를 동시에 지원
   - Admin 패널에서 활성화된 provider만 초기화

## 추가 개선 가능 사항

1. **타입 안전성 개선**: `ai: any` 대신 적절한 타입 정의 추가
2. **에러 로깅 개선**: 더 상세한 에러 정보 수집 및 모니터링
3. **Provider 전환 시 캐시 무효화**: Admin에서 설정 변경 시 즉시 반영되도록 캐시 관리 개선
4. **Health Check**: 각 AI provider의 상태를 확인하는 엔드포인트 추가