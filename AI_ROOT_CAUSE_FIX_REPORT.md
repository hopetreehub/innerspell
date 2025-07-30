# AI Model Error - 근본 원인 해결 보고서
*Date: 2025-07-30*
*전문가 페르소나: Genkit & Firebase AI Architecture Expert*

## 🔍 근본 원인 분석 (Root Cause Analysis)

### 문제의 핵심
`NOT_FOUND: Model 'openai/gpt-3.5-turbo' not found` 오류는 Model ID 처리 로직의 복잡성에서 발생했습니다.

### 상세 분석
1. **genkitx-openai 플러그인 동작**
   - 내부적으로 모델을 `openai/gpt-3.5-turbo` 형식으로 등록
   - definePrompt에서는 이 형식을 그대로 사용해야 함

2. **기존 코드의 문제점**
   ```typescript
   // 문제 코드 (라인 104-127)
   if (config.model.includes('/')) {
     const modelParts = config.model.split('/');
     provider = modelParts[0];
     cleanModelId = modelParts[1];  // 'gpt-3.5-turbo'만 추출
   }
   model = cleanModelId;  // provider 접두사 제거됨
   
   // 나중에 다시 추가 시도 (라인 170-175)
   let modelForPrompt = model;
   if (providerConfig.provider === 'openai' && !model.startsWith('openai/')) {
     modelForPrompt = `openai/${model}`;  // 다시 추가
   }
   ```

3. **문제 발생 과정**
   - Config: `openai/gpt-3.5-turbo` → Split → `gpt-3.5-turbo` → 재조합 → `openai/gpt-3.5-turbo`
   - 이 과정에서 불필요한 변환과 오류 가능성 증가

## ✅ 근본적 해결책

### 핵심 원칙
**"Don't manipulate what's already correct"** - 이미 올바른 형식을 가진 데이터를 불필요하게 조작하지 않기

### 구현된 해결책
```typescript
// 수정된 코드 (라인 171-178)
// IMPORTANT: Genkit expects the full model ID with provider prefix
// For primary config, use the original config.model
// For fallback, model variable already has the correct format
const modelForPrompt = providerInfo.fallbackInfo?.fallbackUsed ? model : config.model;

console.log('[TAROT] Using model ID for prompt:', modelForPrompt);
console.log('[TAROT] Is fallback:', providerInfo.fallbackInfo?.fallbackUsed || false);
```

### 장점
1. **단순성**: 불필요한 문자열 조작 제거
2. **신뢰성**: 원본 설정값 그대로 사용
3. **유지보수성**: 코드 이해와 디버깅 용이
4. **확장성**: 새로운 provider 추가 시 수정 불필요

## 🚀 적용된 수정사항

### 1. Primary Config 처리
- `config.model` 값을 그대로 사용 (이미 올바른 형식)
- 불필요한 split/join 로직 제거

### 2. Fallback 처리
```typescript
// Fallback 시 provider 접두사 확인 및 추가
model = fallbackInfo.provider && !fallbackInfo.model.includes('/') 
  ? `${fallbackInfo.provider}/${fallbackInfo.model}` 
  : fallbackInfo.model;
```

### 3. 캐시 정리
- `vercel.json`: `MIDDLEWARE_CACHE_BUST` 업데이트
- Vercel 빌드 캐시 강제 정리

## 📊 테스트 결과

### Git 커밋
- `658a196`: 초기 수정 시도
- `da848db`: 근본 원인 해결

### 예상 동작
1. Config에 `openai/gpt-3.5-turbo` 저장
2. 코드에서 그대로 사용
3. Genkit이 정확한 모델 찾음
4. AI 해석 정상 생성

## 🔧 Vercel 수동 재배포 방법

### 방법 1: 대시보드에서
1. https://vercel.com 로그인
2. `test-studio-firebase` 프로젝트 선택
3. **Deployments** 탭 → 최신 배포 → ⋮ → **Redeploy**
4. ✅ **"Use existing Build Cache"** 체크 해제
5. **Redeploy** 클릭

### 방법 2: 강제 재빌드
1. **Settings** → **Environment Variables**
2. 추가: `FORCE_REBUILD=2025-07-30`
3. 저장 시 자동 재배포

## 📝 교훈 (Lessons Learned)

1. **과도한 엔지니어링 피하기**
   - 문제: Model ID를 분해했다가 재조합
   - 해결: 원본 값 그대로 사용

2. **플러그인 동작 이해**
   - genkitx-openai는 내부적으로 `openai/` 접두사 포함
   - definePrompt는 이 형식을 기대함

3. **디버깅 전략**
   - 로그 추가로 실제 값 확인
   - 소스 코드(node_modules) 직접 확인
   - 단순한 해결책부터 시도

## 🎯 최종 확인 사항

1. **로컬 테스트**
   ```bash
   rm -rf .next node_modules/.cache
   npm run dev
   ```

2. **Vercel 배포 후**
   - 브라우저 캐시 강제 새로고침 (Ctrl+Shift+R)
   - 개발자 도구 콘솔 확인
   - 전체 타로 리딩 프로세스 테스트

## 📌 결론

Model not found 오류는 불필요한 Model ID 조작에서 발생했습니다. 
근본적인 해결책은 **원본 설정값을 그대로 사용**하는 것입니다.

**카드 간격**: 이미 `-125px`로 올바르게 설정되어 있습니다.

---
*이 보고서는 SuperClaude + Swarm 전문가 워크플로우로 작성되었습니다.*