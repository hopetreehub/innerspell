# 🚨 긴급 URL 안내

## 올바른 페이지 접근 경로

### ✅ 작동하는 URL:
1. **타로 리딩**: http://localhost:4000/reading
2. **꿈해몽**: http://localhost:4000/dream-interpretation  
3. **로그인**: http://localhost:4000/sign-in
4. **홈페이지**: http://localhost:4000

### ❌ 작동하지 않는 URL (404 오류):
- /tarot-reading (→ /reading 사용)
- /dream (→ /dream-interpretation 사용)
- /login (→ /sign-in 사용)

## 🔧 현재 상태

1. **서버**: ✅ 포트 4000에서 정상 작동
2. **환경 설정**: ⚠️ API 키 설정 필요
   - `.env.local` 파일 생성됨
   - OpenAI 또는 Anthropic API 키 입력 필요

## 📋 필요한 조치

1. **API 키 설정**:
   ```bash
   # .env.local 파일에 실제 API 키 입력
   OPENAI_API_KEY=sk-실제-api-키-입력
   # 또는
   ANTHROPIC_API_KEY=sk-ant-실제-api-키-입력
   ```

2. **서버 재시작**:
   ```bash
   # Ctrl+C로 서버 중지 후
   npm run dev
   ```

3. **올바른 URL로 접속**

## 🎯 테스트 방법

1. 타로리딩: http://localhost:4000/reading 접속
2. 질문 입력 후 "리딩 진행" 클릭
3. API 키가 설정되면 정상 작동

---
작성: SWARM PM
시간: 2025-08-12