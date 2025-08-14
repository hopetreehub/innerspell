# 🚀 InnerSpell Firebase 통합 배포 가이드

## 📋 빠른 시작

### 1. 로컬 테스트
```bash
# 빌드 테스트
npm run build

# 배포 준비 스크립트 실행
./scripts/deploy-to-vercel.sh
```

### 2. Vercel 환경변수 설정
Vercel Dashboard > Settings > Environment Variables에서 설정:

```bash
# 필수 환경변수 (예시)
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIs...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-a5bc5
ENCRYPTION_KEY=your-32-character-encryption-key-here
BLOG_API_SECRET_KEY=your-32-character-blog-api-key-here
OPENAI_API_KEY=sk-proj-...
```

### 3. 배포
```bash
# Vercel CLI 사용
vercel --prod

# 또는 Git push
git push origin main
```

### 4. Firebase 구조 생성
```bash
# 배포 후 한 번만 실행
curl -X POST https://your-app.vercel.app/api/admin/setup-firebase \
  -H "Content-Type: application/json" \
  -d '{"secret": "setup-innerspell-2024"}'
```

### 5. 프로덕션 테스트
```bash
# 배포된 앱 테스트
node scripts/test-production-firebase.js https://your-app.vercel.app
```

## 🔧 상세 설정

### Firebase 서비스 계정 키 Base64 인코딩
```bash
# Linux/Mac
base64 -w 0 firebase-service-account-key.json

# Windows PowerShell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("firebase-service-account-key.json"))
```

### Firebase Console 설정

1. **Firestore 데이터베이스 생성**
   - Firebase Console > Firestore Database
   - "데이터베이스 만들기" 클릭
   - 프로덕션 모드 선택
   - 리전: asia-northeast1 (도쿄) 권장

2. **복합 인덱스 생성**
   - Firestore > 인덱스 > 복합 색인 추가
   - 필요한 인덱스:
     - users: lastActivity (DESC) + status (ASC)
     - readings: userId (ASC) + createdAt (DESC)
     - blogPosts: status (ASC) + publishedAt (DESC)

## 📊 배포 후 확인사항

### 관리자 대시보드
1. `https://your-app.vercel.app/admin` 접속
2. "Firebase 연결됨" 표시 확인
3. 실시간 모니터링 데이터 표시 확인

### API 상태 확인
```bash
# Firebase 상태
curl https://your-app.vercel.app/api/admin/firebase-status

# 모니터링 데이터
curl https://your-app.vercel.app/api/admin/monitoring
```

## 🆘 문제 해결

### "Mock 데이터 모드" 계속 표시
1. 환경변수 확인:
   - `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` 설정됨
   - `FORCE_DATA_SOURCE=firebase` 설정됨
2. Vercel 재배포 필요할 수 있음

### Firebase 연결 실패
1. 서비스 계정 키 유효성 확인
2. Firebase 프로젝트 ID 일치 확인
3. Firestore 데이터베이스 생성 여부 확인

### API 404 오류
1. 빌드 로그 확인
2. API 라우트 파일 위치 확인
3. Vercel Functions 로그 확인

## 📈 모니터링

### Vercel Analytics
- Web Vitals 자동 수집
- 에러 로그 실시간 확인
- 함수 실행 시간 모니터링

### Firebase 사용량
- Firestore 읽기/쓰기 작업 수
- 저장 용량
- 네트워크 대역폭

### 커스텀 모니터링
- `/api/admin/monitoring` 엔드포인트 활용
- 실시간 사용자 추적
- 일일 통계 수집

## 🔒 보안 권장사항

1. **환경변수 보안**
   - Production 환경에만 실제 키 설정
   - Preview/Development 환경 분리

2. **API 보안**
   - 관리자 API 인증 강화
   - Rate limiting 적용 고려

3. **Firebase 보안 규칙**
   - Firestore 보안 규칙 설정
   - 읽기/쓰기 권한 제한

---
최종 업데이트: 2024-01-14