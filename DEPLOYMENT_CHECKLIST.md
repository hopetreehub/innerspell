# Vercel 배포 체크리스트

## 🚀 Git 커밋 전 준비사항

### 1. 테스트 파일 정리
```bash
# 테스트 관련 파일 삭제
rm -f test-*.js
rm -f performance-*.js
rm -f check-*.js
rm -f verify-*.js
rm -f *test-log.json
rm -f cookies.txt
rm -f post-data.json

# 스크린샷 폴더 삭제
rm -rf screenshots/
rm -rf test-screenshots/
rm -rf qa-screenshots/
rm -rf performance-screenshots/

# 로그 파일 삭제
rm -f server.log
rm -f dev.log
rm -f *.log

# 테스트 결과 파일 삭제
rm -f *-test-results.json
rm -f *-test-result.json
```

### 2. .env.local 프로덕션 설정
```bash
# .env.local에서 다음 값들을 변경하세요:
NEXT_PUBLIC_USE_REAL_AUTH="true"
NODE_ENV="production"
NEXT_PUBLIC_ENABLE_DEV_AUTH="false"
NEXT_PUBLIC_ENABLE_FILE_STORAGE="false"
```

### 3. 개발 데이터 확인
```bash
# data 폴더가 gitignore에 포함되어 있는지 확인
cat .gitignore | grep "data/"
```

## 📝 Git 커밋 명령어

### 옵션 1: 전체 커밋 (권장)
```bash
# 모든 변경사항 추가
git add -A

# 커밋 메시지와 함께 커밋
git commit -m "feat: 커뮤니티 파일 스토리지 폴백 및 성능 최적화

- 개발 환경에서 Firebase 없이 작동하는 파일 스토리지 구현
- 커뮤니티 게시글 및 댓글 CRUD 기능 완전 지원
- 이미지 최적화 (WebP 변환, lazy loading)
- 코드 스플리팅으로 초기 로딩 속도 개선
- 관리자 대시보드 성능 최적화
- 꿈해몽 페이지 최적화

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 옵션 2: 단계별 커밋
```bash
# 1. 커뮤니티 기능
git add src/actions/communityActions.ts src/actions/commentActions.ts
git add src/services/community-service-file.ts src/services/comment-service-file.ts
git add src/lib/development-helpers.ts
git commit -m "feat: 커뮤니티 개발 환경 파일 스토리지 폴백"

# 2. 성능 최적화
git add src/components/OptimizedImage.tsx
git add src/components/reading/TarotReadingClient.tsx
git add src/components/dynamic/
git add next.config.js scripts/optimize-images.js
git commit -m "perf: 이미지 최적화 및 코드 스플리팅"

# 3. 기타 수정사항
git add .
git commit -m "chore: 문서 업데이트 및 설정 정리"
```

## 🌐 Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

### 필수 환경 변수
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_KEY (JSON을 한 줄로)

OPENAI_API_KEY
GEMINI_API_KEY
GOOGLE_API_KEY

ENCRYPTION_KEY
BLOG_API_SECRET_KEY
NEXT_PUBLIC_BLOG_API_SECRET

ADMIN_EMAILS

# 프로덕션 설정
NEXT_PUBLIC_USE_REAL_AUTH=true
NODE_ENV=production
NEXT_PUBLIC_ENABLE_DEV_AUTH=false
NEXT_PUBLIC_ENABLE_FILE_STORAGE=false
```

## ✅ 최종 체크리스트

- [ ] 테스트 파일 모두 삭제
- [ ] .env.local 프로덕션 설정 확인
- [ ] .gitignore 확인
- [ ] Git 상태 확인 (`git status`)
- [ ] Git 커밋 완료
- [ ] GitHub 푸시 (`git push origin clean-main`)
- [ ] Vercel 환경 변수 설정
- [ ] Vercel 배포 트리거

## 🔄 배포 후 확인

1. 배포 URL 접속
2. 로그인/회원가입 테스트
3. 타로 리딩 테스트
4. 커뮤니티 게시글 작성 테스트
5. 관리자 대시보드 접속 테스트

## ⚠️ 주의사항

- FIREBASE_SERVICE_ACCOUNT_KEY는 JSON을 한 줄로 변환해서 입력
- 개발 환경 변수가 프로덕션에 설정되지 않도록 주의
- data/ 폴더가 배포에 포함되지 않도록 확인