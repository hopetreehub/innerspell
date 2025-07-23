# 🤖 AI API 설정 가이드

## 필수 준비사항

InnerSpell은 다양한 AI 제공자를 지원합니다. 최소 하나의 AI API 키가 필요합니다.

## 1. OpenAI 설정 (권장)

### API 키 발급
1. [OpenAI Platform](https://platform.openai.com) 접속
2. API Keys 메뉴에서 새 키 생성
3. `.env.local`에 추가:
   ```
   OPENAI_API_KEY=sk-...
   ```

### 요금제
- GPT-3.5-turbo: $0.002 / 1K tokens
- GPT-4: $0.03 / 1K tokens

## 2. Claude (Anthropic) 설정

### API 키 발급
1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys에서 새 키 생성
3. `.env.local`에 추가:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### 요금제
- Claude 3 Haiku: $0.25 / 1M tokens
- Claude 3 Sonnet: $3 / 1M tokens

## 3. Google AI (Gemini) 설정

### API 키 발급
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 생성
3. `.env.local`에 추가:
   ```
   GOOGLE_API_KEY=AIza...
   # 또는
   GEMINI_API_KEY=AIza...
   ```

### 요금제
- Gemini Pro: 무료 (60 QPM 제한)
- Gemini Pro Vision: 무료 (60 QPM 제한)

## 4. Admin 패널에서 AI 설정

1. `/admin`에 관리자로 로그인
2. "AI 제공자 관리" 메뉴 접근
3. 사용할 AI 제공자 활성화
4. API 키 입력 (자동 암호화됨)
5. 모델 선택 및 우선순위 설정

## 5. 설정 확인

```bash
# API 건강 상태 확인
curl http://localhost:4000/api/health

# AI 설정 디버그
curl http://localhost:4000/api/debug/ai-config
```

## 문제 해결

### "No AI provider plugins available" 오류
- 최소 하나의 API 키가 설정되어 있는지 확인
- `.env.local` 파일이 올바르게 로드되는지 확인

### API 키 인증 실패
- API 키가 올바른지 확인
- API 사용량 한도 확인
- 결제 정보 등록 여부 확인

### Fallback 시스템
- 주 AI 제공자 실패 시 자동으로 다음 제공자로 전환
- 우선순위: OpenAI → Anthropic → Google AI

## 보안 주의사항

1. **절대 하지 말아야 할 것**:
   - API 키를 코드에 직접 입력
   - Git에 API 키 커밋
   - 클라이언트 사이드에서 API 키 사용

2. **반드시 해야 할 것**:
   - `.env.local` 사용
   - Admin 패널에서 암호화된 키 관리
   - Rate limiting 적용
   - 사용량 모니터링