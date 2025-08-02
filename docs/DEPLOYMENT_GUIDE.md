# 배포 가이드 (Deployment Guide)

## 📋 목차
1. [개요](#개요)
2. [환경 설정](#환경-설정)
3. [배포 프로세스](#배포-프로세스)
4. [배포 후 확인](#배포-후-확인)
5. [롤백 절차](#롤백-절차)
6. [트러블슈팅](#트러블슈팅)

## 개요

InnerSpell 프로젝트는 Vercel을 통해 자동 배포됩니다. Git 푸시 시 자동으로 빌드 및 배포가 진행됩니다.

### 핵심 정보
- **배포 플랫폼**: Vercel
- **프로덕션 URL**: https://test-studio-firebase.vercel.app
- **Firebase 프로젝트**: innerspell-an7ce
- **포트**: 4000 (로컬 개발 시 필수)

## 환경 설정

### 1. 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

```env
# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# AI Provider Keys (선택사항)
GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Admin Configuration
ADMIN_EMAILS=admin@example.com,another@example.com
```

### 2. Firebase 권한 도메인 설정

Firebase Console > Authentication > Settings > Authorized domains에 추가:
- `test-studio-firebase.vercel.app`
- `innerspell.vercel.app`
- 기타 커스텀 도메인

## 배포 프로세스

### 1. 코드 변경 및 테스트

```bash
# 1. 기능 개발/버그 수정
# 2. 로컬 테스트 (포트 4000 필수)
npm run dev

# 3. 빌드 테스트
npm run build

# 4. TypeScript 오류 확인
npm run typecheck

# 5. ESLint 검사
npm run lint
```

### 2. Git 커밋 및 푸시

```bash
# 변경사항 스테이징
git add -A

# 커밋 (의미 있는 메시지 작성)
git commit -m "feat: 새로운 기능 추가"

# origin/main으로 푸시
git push origin main
```

### 3. Vercel 자동 배포

푸시 후 자동으로:
1. Vercel이 코드 변경 감지
2. 빌드 프로세스 시작
3. 성공 시 프로덕션 배포
4. 실패 시 이전 버전 유지

### 4. 배포 상태 확인

- Vercel 대시보드: https://vercel.com/dashboard
- GitHub에서 배포 상태 확인 (커밋 옆 체크 마크)
- 배포 로그 확인 가능

## 배포 후 확인

### 1. 기본 동작 확인

```bash
# Playwright 테스트로 확인
npx playwright test tests/integration/deployment.spec.ts
```

### 2. 주요 기능 체크리스트

- [ ] 홈페이지 로딩
- [ ] 타로 리딩 기능
- [ ] 꿈 해몽 기능
- [ ] 사용자 인증 (Google 로그인)
- [ ] 이미지 로딩
- [ ] API 응답 확인

### 3. 성능 모니터링

- Vercel Analytics 확인
- 로딩 시간 측정
- 에러 로그 모니터링

## 롤백 절차

### 1. Vercel 대시보드에서 롤백

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. "Deployments" 탭 이동
4. 이전 성공 배포 찾기
5. "..." 메뉴 > "Promote to Production"

### 2. Git을 통한 롤백

```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# 또는 특정 커밋으로 리셋 (주의!)
git reset --hard <commit-hash>
git push --force origin main
```

## 트러블슈팅

### 1. 빌드 실패

**증상**: Vercel에서 빌드 에러

**해결 방법**:
- TypeScript 오류 확인: `npm run typecheck`
- 환경 변수 누락 확인
- package.json 의존성 확인

### 2. Firebase 연결 오류

**증상**: "Failed to initialize Firebase Admin"

**해결 방법**:
- FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수 확인
- JSON 형식 유효성 검증
- Firebase 프로젝트 ID 확인

### 3. AI 서비스 오류

**증상**: AI 기능 작동 안 함

**해결 방법**:
- AI Provider API 키 확인
- API 사용량 한도 확인
- 백업 시스템 작동 여부 확인

### 4. 이미지 로딩 실패

**증상**: 타로 카드 이미지 안 보임

**해결 방법**:
- public/images 디렉토리 확인
- Next.js Image 최적화 설정 확인
- Vercel 캐시 초기화

### 5. 청크 로딩 오류

**증상**: "Loading chunk failed"

**해결 방법**:
- 브라우저 캐시 삭제
- Vercel 캐시 무효화
- 빌드 ID 확인

## 베스트 프랙티스

### 1. 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] TypeScript 오류 0개
- [ ] ESLint 오류 0개
- [ ] 환경 변수 확인
- [ ] 민감 정보 제거

### 2. 커밋 메시지 규칙

```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 등
```

### 3. 브랜치 전략

- `main`: 프로덕션 브랜치
- 기능 개발은 별도 브랜치에서
- PR을 통한 코드 리뷰 권장

## 모니터링 및 알림

### 1. Vercel 알림 설정

- 배포 성공/실패 알림
- 성능 저하 알림
- 에러율 증가 알림

### 2. 로그 확인

- Vercel Functions 로그
- 브라우저 콘솔 에러
- Firebase 사용량 모니터링

## 긴급 연락처

- **Vercel 지원**: https://vercel.com/support
- **Firebase 지원**: https://firebase.google.com/support
- **프로젝트 이슈**: GitHub Issues

---

최종 업데이트: 2025년 8월 2일