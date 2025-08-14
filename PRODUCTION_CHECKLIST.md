# 🚀 InnerSpell Firebase 프로덕션 배포 체크리스트

## 📋 배포 전 체크리스트

### 1. 코드 준비
- [ ] 모든 변경사항 커밋
- [ ] 빌드 오류 없음 (`npm run build`)
- [ ] TypeScript 오류 없음 (`npx tsc --noEmit`)
- [ ] 콘솔 로그 제거 또는 조건부 처리
- [ ] 개발용 코드 제거

### 2. 환경변수 설정 (Vercel Dashboard)
#### 필수 환경변수
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `ENCRYPTION_KEY` (32자 이상)
- [ ] `BLOG_API_SECRET_KEY` (32자 이상)
- [ ] `OPENAI_API_KEY` 또는 다른 AI Provider Key

#### 선택 환경변수
- [ ] `FIREBASE_SETUP_SECRET` (기본값: setup-innerspell-2024)
- [ ] `ADMIN_EMAILS`
- [ ] `NEXT_PUBLIC_SITE_URL`

### 3. Firebase 준비
- [ ] Firebase 프로젝트 생성 완료
- [ ] Firestore 데이터베이스 생성 (프로덕션 모드)
- [ ] 서비스 계정 키 생성 및 Base64 인코딩
- [ ] Firebase Console에서 웹 앱 등록

## 🔨 배포 프로세스

### 1. Vercel 배포
```bash
# 옵션 1: Vercel CLI
vercel --prod

# 옵션 2: Git push (자동 배포 설정된 경우)
git push origin main
```

### 2. 배포 확인
- [ ] Vercel 대시보드에서 빌드 성공 확인
- [ ] 배포된 URL 접속 테스트

### 3. Firebase 구조 초기화
```bash
# your-app을 실제 Vercel URL로 변경
curl -X POST https://your-app.vercel.app/api/admin/setup-firebase \
  -H "Content-Type: application/json" \
  -d '{"secret": "setup-innerspell-2024"}'
```

### 4. Firebase 인덱스 생성
Firebase Console > Firestore > 인덱스에서 생성:

1. **users 컬렉션**
   - lastActivity (내림차순) + status (오름차순)

2. **readings 컬렉션**
   - userId (오름차순) + createdAt (내림차순)

3. **blogPosts 컬렉션**
   - status (오름차순) + publishedAt (내림차순)

## 🧪 배포 후 테스트

### 1. 기본 기능 테스트
- [ ] 홈페이지 정상 로딩
- [ ] 타로 리딩 페이지 작동
- [ ] 꿈 해몽 기능 작동
- [ ] 블로그 페이지 접속

### 2. 관리자 기능 테스트
- [ ] `/admin` 페이지 접속
- [ ] Firebase 연결 상태 확인
- [ ] 사용 통계 표시 확인
- [ ] 블로그 포스트 생성/수정/삭제
- [ ] 실시간 모니터링 대시보드

### 3. API 엔드포인트 테스트
```bash
# Firebase 상태 확인
curl https://your-app.vercel.app/api/admin/firebase-status

# 모니터링 데이터 확인
curl https://your-app.vercel.app/api/admin/monitoring
```

## 📊 모니터링

### 1. Vercel Analytics
- [ ] Web Vitals 모니터링 활성화
- [ ] 에러 로그 확인

### 2. Firebase Console
- [ ] Firestore 사용량 모니터링
- [ ] 일일 읽기/쓰기 작업 수 확인
- [ ] 저장 용량 확인

### 3. 관리자 대시보드
- [ ] 일일 사용자 수 추적
- [ ] 타로 리딩 수 모니터링
- [ ] 시스템 상태 확인

## 🔒 보안 체크리스트

- [ ] 민감한 환경변수 노출 없음
- [ ] API 엔드포인트 인증 확인
- [ ] CORS 설정 적절함
- [ ] 보안 헤더 설정됨 (vercel.json)

## 🆘 문제 해결

### Firebase 연결 실패
1. 환경변수 설정 확인
2. 서비스 계정 키 유효성 확인
3. Firebase 프로젝트 ID 일치 확인

### 빌드 실패
1. 로컬에서 `npm run build` 성공 확인
2. Node.js 버전 호환성 확인
3. 종속성 설치 오류 확인

### 성능 문제
1. Firebase 인덱스 생성 확인
2. 이미지 최적화 확인
3. API 응답 시간 모니터링

## 📞 지원 연락처

- 기술 문의: admin@innerspell.com
- Firebase 지원: https://firebase.google.com/support
- Vercel 지원: https://vercel.com/support

---
최종 업데이트: 2024-01-14