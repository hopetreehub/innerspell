# 🚀 InnerSpell 빠른 배포 가이드

## 10분 안에 배포하기

### 1️⃣ AI API 키 받기 (3분)

#### 옵션 A: Google AI (무료)
1. https://makersuite.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 키 복사 (AIza로 시작)

#### 옵션 B: OpenAI
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 키 복사 (sk-로 시작)

### 2️⃣ 환경 설정 (2분)

```bash
# 1. 프로덕션 환경 파일 생성
cp env.production.example .env.production

# 2. 암호화 키 생성
node scripts/generate-encryption-key.js
# 출력된 ENCRYPTION_KEY를 복사

# 3. .env.production 편집
nano .env.production  # 또는 원하는 편집기 사용
```

필수 설정:
- `ENCRYPTION_KEY`: 위에서 생성한 키 붙여넣기
- `BLOG_API_SECRET_KEY`: 랜덤 문자열 입력
- AI API 키 중 하나 입력 (Google AI 또는 OpenAI)

### 3️⃣ Vercel로 배포 (5분)

#### A. Vercel CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### B. Vercel 웹사이트 사용
1. https://vercel.com 접속
2. "Import Project" 클릭
3. GitHub 저장소 연결
4. 환경 변수 추가 (.env.production 내용)
5. "Deploy" 클릭

### 4️⃣ 배포 확인

1. 배포 URL 접속
2. 다음 기능 테스트:
   - 홈페이지 로딩 ✓
   - 타로 리딩 페이지 ✓
   - AI 응답 확인 ✓
   - 모바일 반응형 ✓

## 🎉 완료!

축하합니다! InnerSpell이 성공적으로 배포되었습니다.

### 다음 단계 (선택사항)

1. **커스텀 도메인 연결**
   - Vercel 대시보드 > Settings > Domains
   - 도메인 추가 및 DNS 설정

2. **Google Analytics 추가**
   - GA4 계정 생성
   - 추적 ID를 .env.production에 추가

3. **관리자 설정**
   - /admin 접속
   - AI 제공자 우선순위 설정
   - 프롬프트 커스터마이징

### 문제 해결

**"No AI provider plugins available" 오류**
→ AI API 키가 올바르게 설정되었는지 확인

**빌드 실패**
→ `npm run build` 로컬에서 먼저 테스트

**404 오류**
→ Vercel 설정에서 Framework Preset이 "Next.js"인지 확인

### 지원

문제가 있으시면 GitHub Issues에 문의해주세요:
https://github.com/your-repo/innerspell/issues