# 작업지시서: 꿈해몽 AI 연결 문제 해결

## 📋 작업 개요
- **작업명**: 꿈해몽 AI 기능 정상화
- **우선순위**: 🔴 최우선
- **예상 소요시간**: 2-3시간
- **작업자**: Development Team

## 🎯 목표
꿈해몽 페이지에서 사용자가 꿈 내용을 입력하면 AI가 추가 질문을 생성하고, 최종적으로 꿈 해석을 제공하는 기능을 완전히 정상화

## 🔍 현재 문제점

### 1. OpenAI API 키 문제
- **증상**: "401 Incorrect API key provided" 오류 발생
- **원인**: 
  - API 키가 유효하지 않거나 만료됨
  - API 키 형식에 문제가 있을 수 있음
- **로그**:
  ```
  Error: 401 Incorrect API key provided: sk-proj-***...-M8A
  ```

### 2. Firebase 연결 문제
- **증상**: "Could not load the default credentials" 오류
- **영향 범위**:
  - AI Provider 설정 로드 불가
  - 프롬프트 설정 로드 불가
- **현재 상태**: 환경 변수 폴백으로 부분 작동 중

### 3. 질문 생성은 되지만 오류 메시지 표시
- **증상**: AI가 질문을 생성하지만 사용자에게는 오류 메시지가 표시됨
- **원인**: API 오류 처리 로직 문제

## 📝 작업 내용

### Phase 1: API 키 검증 및 수정
1. **현재 API 키 상태 확인**
   - `.env.local`의 OPENAI_API_KEY 검증
   - OpenAI 대시보드에서 키 상태 확인
   - 새 API 키 생성 필요 여부 판단

2. **API 키 테스트**
   ```bash
   # API 키 직접 테스트
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

### Phase 2: AI Provider 파일 스토리지 폴백 강화
1. **파일 기반 AI Provider 설정 개선**
   - `/src/services/ai-provider-service-file.ts` 수정
   - 환경 변수의 API 키를 자동으로 사용하도록 설정

2. **코드 수정 위치**:
   ```typescript
   // src/services/ai-provider-service-file.ts
   const mockProviders = [
     {
       provider: 'openai',
       apiKey: process.env.OPENAI_API_KEY || '', // 환경 변수에서 직접 읽기
       baseUrl: 'https://api.openai.com/v1',
       isActive: true,
       models: [
         { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', isActive: true },
         { id: 'gpt-4', name: 'GPT-4', isActive: true }
       ]
     }
   ];
   ```

### Phase 3: Genkit AI 초기화 로직 수정
1. **파일 위치**: `/src/ai/genkit.ts`
2. **수정 내용**:
   - 개발 모드에서 환경 변수 직접 사용
   - Firebase 폴백 로직 개선
   - 에러 핸들링 강화

### Phase 4: 꿈해몽 플로우 에러 처리 개선
1. **파일 위치**: `/src/ai/flows/generate-dream-clarification-questions.ts`
2. **수정 내용**:
   - API 오류 시에도 기본 질문 생성
   - 사용자에게 보여지는 오류 메시지 개선
   - 폴백 메커니즘 구현

### Phase 5: 프롬프트 서비스 개발 폴백
1. **파일 위치**: `/src/ai/services/prompt-service.ts`
2. **수정 내용**:
   - `getDreamPromptConfig` 함수에 개발 폴백 추가
   - Firebase 없이도 기본 프롬프트 설정 사용

## 🧪 테스트 계획

### 1. 단계별 테스트
1. API 키 유효성 테스트
2. AI Provider 설정 로드 테스트
3. 꿈 질문 생성 테스트
4. 전체 플로우 테스트

### 2. 테스트 시나리오
```javascript
// test-dream-ai-complete.js
const { chromium } = require('playwright');

async function testDreamAIComplete() {
  // 1. 페이지 접속
  // 2. 이메일 입력
  // 3. 꿈 내용 입력
  // 4. 제출
  // 5. 질문 생성 확인
  // 6. 질문 답변
  // 7. 최종 해석 확인
}
```

## ✅ 완료 기준
1. 꿈 내용 입력 시 AI 질문이 정상적으로 생성됨
2. 오류 메시지가 사용자에게 표시되지 않음
3. 질문 답변 후 최종 해석이 제공됨
4. 개발 환경에서 Firebase 없이도 완전히 작동

## 🚨 주의사항
1. **API 키 보안**: 새 API 키 생성 시 절대 코드에 하드코딩하지 않음
2. **환경 분리**: 개발/프로덕션 환경 설정 명확히 구분
3. **백업**: 작업 전 현재 상태 백업
4. **커밋 분리**: 각 Phase별로 별도 커밋

## 📊 진행 상황 추적
- [ ] Phase 1: API 키 검증 및 수정
- [ ] Phase 2: AI Provider 파일 스토리지 폴백 강화
- [ ] Phase 3: Genkit AI 초기화 로직 수정
- [ ] Phase 4: 꿈해몽 플로우 에러 처리 개선
- [ ] Phase 5: 프롬프트 서비스 개발 폴백
- [ ] 통합 테스트
- [ ] 문서 업데이트

## 🔄 롤백 계획
문제 발생 시:
```bash
git checkout HEAD~1 -- src/ai/
git checkout HEAD~1 -- src/services/ai-provider-service-file.ts
```

---
작성일: 2025-08-07
작성자: SWARM PM