# 🚀 InnerSpell 출시 체크리스트

## 📋 출시 전 필수 확인 사항

### 1. 환경 변수 설정 ✅
- [ ] `.env.production` 파일 생성
- [ ] Firebase 프로덕션 키 설정
- [ ] OpenAI API 키 확인
- [ ] BLOG_API_SECRET_KEY 변경
- [ ] NEXT_PUBLIC_SITE_URL 프로덕션 URL로 변경

### 2. Firebase 설정 ✅
- [ ] Firebase 프로젝트 생성/확인
- [ ] Authentication 활성화
  - [ ] Email/Password 인증
  - [ ] Google 로그인
- [ ] Firestore Database 생성
- [ ] Storage 버킷 설정
- [ ] 보안 규칙 설정

### 3. 코드 정리 ✅
- [ ] 개발용 console.log 제거
- [ ] Mock 데이터 제거
- [ ] 테스트 파일 정리
- [ ] 불필요한 의존성 제거

### 4. 보안 확인 ✅
- [ ] API 키 노출 확인
- [ ] CORS 설정
- [ ] CSP 헤더 도메인 확인
- [ ] ADMIN_EMAILS 업데이트

### 5. 성능 최적화 ✅
- [ ] 이미지 최적화
- [ ] 번들 크기 확인
- [ ] Lighthouse 성능 테스트

### 6. SEO 및 메타데이터 ✅
- [ ] 메타 태그 확인
- [ ] OG 이미지 업로드
- [ ] robots.txt 설정
- [ ] sitemap.xml 생성

### 7. 테스트 ✅
- [ ] 주요 기능 테스트
  - [ ] 회원가입/로그인
  - [ ] 타로 리딩
  - [ ] 블로그 읽기
  - [ ] 커뮤니티 기능
- [ ] 모바일 반응형 테스트
- [ ] 크로스 브라우저 테스트

### 8. 빌드 및 배포 준비 ✅
```bash
# 프로덕션 빌드
npm run build

# 빌드 확인
npm run start
```

### 9. 배포 플랫폼 설정 (Vercel 권장) ✅
- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] SSL 인증서 확인

### 10. 모니터링 설정 ✅
- [ ] Google Analytics 설정
- [ ] Error tracking (Sentry 등)
- [ ] 성능 모니터링

## 🔧 즉시 수정 필요 사항

### 1. 테스트 파일 정리
```bash
# 모든 테스트 파일을 tests 폴더로 이동
mkdir -p tests
mv test-*.js tests/
mv check-*.js tests/
```

### 2. package.json 정리
```bash
# 불필요한 의존성 제거
npm prune --production
```

### 3. 환경 변수 템플릿 생성
```bash
cp .env.local .env.production.example
# 민감한 정보는 제거하고 템플릿만 남기기
```

## 📝 출시 후 확인 사항

- [ ] 실제 사용자 회원가입 테스트
- [ ] 결제 시스템 작동 확인 (있는 경우)
- [ ] 이메일 발송 확인
- [ ] 에러 로그 모니터링
- [ ] 성능 메트릭 확인

## 🚨 긴급 연락처

- 개발팀: [연락처]
- 서버 관리: [연락처]
- 고객 지원: [연락처]

---
**최종 업데이트**: 2025-07-21
**다음 검토일**: 출시 전날