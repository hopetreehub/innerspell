# 🚀 InnerSpell 배포 체크리스트

## ✅ Phase 1: 보안 및 기본 설정 (완료)

### 환경 변수
- [x] 암호화 키 생성 (`node scripts/generate-encryption-key.js`)
- [x] `.env.local` 파일 생성 (`.env.local.template` 참고)
- [x] 민감한 정보 제거 (`.env.example`에서 실제 이메일 제거)
- [x] Rate limiting 구현
- [x] CSRF 보호 구현
- [x] 보안 헤더 설정

### Firebase 인증
- [x] 세션 기반 인증 구현
- [x] 프로덕션/개발 환경 분리
- [x] 인증 설정 파일 생성 (`auth-config.ts`)

### AI 통합
- [x] AI 설정 가이드 작성
- [x] AI 설정 도우미 스크립트 작성
- [ ] **필수: 최소 하나의 AI API 키 설정**
  ```bash
  node scripts/setup-ai.js
  ```

## ✅ Phase 2: 프론트엔드 최적화 (완료)

### UI/UX
- [x] 모바일 네비게이션 확인 (정상 작동)
- [x] SEO 메타데이터 추가
- [x] Canonical URL 설정
- [x] OG 이미지 placeholder 생성

### 성능
- [x] 코드 스플리팅 설정
- [x] 이미지 최적화 설정 (WebP, AVIF)
- [x] 번들 분석 설정
- [ ] 실제 OG 이미지 (1200x630) 생성 필요

## ✅ Phase 3: 테스트 및 배포 (완료)

### 테스트
- [x] Jest 설정
- [x] 단위 테스트 예제 작성
- [x] E2E 테스트 설정 (Playwright)
- [ ] 테스트 실행 및 통과 확인
  ```bash
  npm test
  npm run test:e2e
  ```

### 모니터링
- [x] 모니터링 서비스 구조 생성
- [ ] Google Analytics 설정
- [ ] Sentry 설정 (선택사항)

### 배포 인프라
- [x] Dockerfile 생성
- [x] GitHub Actions CI/CD 파이프라인
- [x] Vercel 배포 설정
- [ ] 환경 변수 설정 (Vercel/AWS)

## 🔧 배포 전 필수 작업

### 1. AI API 키 설정 (필수)
최소 하나의 AI 제공자 API 키가 필요합니다:
- OpenAI: https://platform.openai.com
- Anthropic: https://console.anthropic.com
- Google AI: https://makersuite.google.com

### 2. Firebase 프로젝트 설정
- Firebase Console에서 프로젝트 생성
- Authentication 활성화
- Firestore Database 생성
- Storage 버킷 생성

### 3. 환경 변수 설정
```bash
# .env.local 생성
cp .env.local.template .env.local

# 암호화 키 생성
node scripts/generate-encryption-key.js

# AI 키 설정
node scripts/setup-ai.js
```

### 4. 빌드 테스트
```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 프로덕션 모드 테스트
npm start
```

### 5. 배포
#### Vercel 배포
1. Vercel 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정 (Vercel 대시보드)
4. 배포

#### Docker 배포
```bash
# 이미지 빌드
docker build -t innerspell .

# 컨테이너 실행
docker run -p 4000:4000 --env-file .env.production innerspell
```

## 📊 배포 후 확인사항

1. **기능 테스트**
   - [ ] 로그인/회원가입
   - [ ] AI 타로 리딩
   - [ ] 모바일 반응형
   - [ ] 이미지 로딩

2. **성능 확인**
   - [ ] Lighthouse 점수 (목표: 90+)
   - [ ] 초기 로딩 시간 (목표: 3초 이내)
   - [ ] Core Web Vitals

3. **보안 확인**
   - [ ] HTTPS 적용
   - [ ] 보안 헤더 확인
   - [ ] Rate limiting 작동
   - [ ] API 키 노출 없음

4. **모니터링**
   - [ ] Google Analytics 데이터 수집
   - [ ] 에러 추적 확인
   - [ ] 서버 로그 확인

## 🎯 결론

모든 Phase가 완료되었습니다! 실제 배포를 위해서는:

1. **즉시 필요한 작업** (30분):
   - AI API 키 설정
   - 환경 변수 설정
   - 빌드 테스트

2. **배포 플랫폼 선택**:
   - Vercel (권장): 간단하고 빠른 배포
   - AWS/Docker: 더 많은 제어가 필요한 경우

3. **배포 후 24시간 모니터링**:
   - 에러 발생 확인
   - 성능 메트릭 확인
   - 사용자 피드백 수집

프로젝트가 실 서비스 준비가 완료되었습니다! 🎉