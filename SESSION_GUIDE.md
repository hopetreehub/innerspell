# 다음 세션을 위한 지침

## 프로젝트 상태 요약

### 현재 상태
- **프로젝트**: MysticSight Tarot (Next.js 15.3.3 + Firebase)
- **브랜치**: `clean-main` (GitHub에 푸시 완료)
- **포트**: 4000번 포트 사용 (모든 설정 완료)
- **배포**: Vercel 배포 에러 수정 완료

### 완료된 작업
1. ✅ **Vercel 배포 문제 해결**
   - Git submodule 에러 수정 (SuperClaude_Framework 제거)
   - SWC 종속성 경고 해결
   - Next.js 빌드 경고 모두 수정

2. ✅ **Missing 함수 구현**
   - `listFirebaseUsers()`: Firebase 사용자 목록 조회
   - `changeUserRole()`: 사용자 역할 변경
   - `updateUserProfile()`: 사용자 프로필 업데이트

3. ✅ **UI 컴포넌트 수정**
   - Cards 아이콘 → CreditCard로 교체
   - 타로 카드 데이터 오타 수정 (swords-06)

4. ✅ **GitHub 푸시 완료**
   - 모든 수정사항 커밋 및 푸시
   - 깔끔한 히스토리 유지

## 주요 파일 및 설정

### 핵심 설정 파일
```
package.json - 포트 4000 설정 완료
vercel.json - Vercel 배포 최적화 설정
.env.local - Firebase 및 API 키 설정
```

### 주요 구현된 기능
```
src/actions/userActions.ts - 사용자 관리 함수들
src/app/admin/users/page.tsx - 관리자 사용자 관리
src/components/admin/UserManagement.tsx - 사용자 관리 컴포넌트
```

### 테스트 환경
```
tests/simple-chromium-open.js - Playwright 크로미움 테스트
tests/ultimate-test-july22.js - 전체 기능 테스트
```

## 다음 세션에서 할 일

### 1. 서버 시작 및 확인
```bash
npm install  # 의존성 설치 확인
npm run dev  # 포트 4000에서 서버 시작
```

### 2. Playwright 테스트 실행
```bash
node tests/simple-chromium-open.js  # 크로미움으로 확인
```

### 3. 우선순위 작업
1. **Vercel 배포 상태 확인** - 배포가 성공했는지 확인
2. **실제 Firebase Admin SDK 설정** - 현재는 시뮬레이션 모드
3. **환경변수 보안 강화** - 실제 API 키들 설정
4. **추가 기능 개발** - 사용자 요청사항에 따라

### 4. 알려진 제한사항
- Firebase Admin SDK: 개발 모드에서는 시뮬레이션 데이터 사용
- AI API 키들: 현재 플레이스홀더 상태
- 일부 기능: 실제 환경에서 추가 설정 필요

## 중요 명령어

### 개발 서버
```bash
npm run dev           # 포트 4000에서 서버 시작
npm run build         # 프로덕션 빌드
npm run typecheck     # 타입 체크
```

### Git 관리
```bash
git status           # 현재 상태 확인
git log --oneline    # 커밋 히스토리
git push origin clean-main  # GitHub 푸시
```

### 테스트
```bash
node tests/simple-chromium-open.js    # 크로미움 테스트
node tests/ultimate-test-july22.js    # 종합 테스트
```

## 프로젝트 구조

### 주요 디렉토리
```
src/
├── app/                 # Next.js App Router 페이지들
│   ├── admin/          # 관리자 페이지
│   ├── community/      # 커뮤니티 기능
│   ├── reading/        # 타로 리딩
│   └── api/           # API 라우트
├── components/         # 재사용 가능한 컴포넌트들
├── actions/           # 서버 액션들
├── data/             # 타로 카드 데이터
└── lib/              # 유틸리티 및 설정
```

### 주요 기능별 파일
```
타로 리딩: src/app/reading/page.tsx
커뮤니티: src/app/community/
관리자: src/app/admin/
사용자 관리: src/actions/userActions.ts
Firebase 설정: src/lib/firebase/
```

## 환경 설정

### 필수 환경변수 (.env.local)
```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=944680989471
NEXT_PUBLIC_FIREBASE_APP_ID=1:944680989471:web:bc817b811a6033017f362a

# 사이트 설정
NEXT_PUBLIC_SITE_URL=http://localhost:4000

# 관리자 이메일
ADMIN_EMAILS=admin@innerspell.com,junsupark9999@gmail.com,ceo@innerspell.com

# API 키들 (현재 플레이스홀더)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_API_KEY=your-google-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 포트 설정 확인
- 개발 서버: http://localhost:4000
- package.json에 포트 4000 설정 완료
- 모든 테스트 스크립트도 포트 4000 사용

## 최근 수정사항 (2024-07-23)

### 1. Vercel 배포 수정 (커밋: ccfd437, 6e0e577)
- `vercel.json` 추가로 배포 설정 최적화
- Git submodule 문제 해결
- SWC 종속성 경고 수정

### 2. 함수 구현
- `listFirebaseUsers()`: 시뮬레이션 모드로 사용자 목록 반환
- `changeUserRole()`: 사용자 역할 변경 (시뮬레이션)
- `updateUserProfile()`: 사용자 프로필 업데이트

### 3. UI 수정
- lucide-react의 Cards 아이콘을 CreditCard로 교체
- 타로 카드 데이터 오타 수정

## 연락처 및 저장소
- **GitHub**: https://github.com/hopetreehub/innerspell
- **브랜치**: clean-main
- **로컬 경로**: /mnt/e/project/test-studio-firebase

## 문제 해결 가이드

### 서버 시작 안 될 때
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 포트 충돌 확인
lsof -i :4000
kill -9 <PID>
```

### 빌드 에러 시
```bash
# 타입 체크
npm run typecheck

# 린트 체크
npm run lint

# 캐시 정리
rm -rf .next
npm run build
```

### Git 이슈 시
```bash
# 현재 상태 확인
git status
git log --oneline -5

# 충돌 해결 후
git add .
git commit -m "fix: resolve conflicts"
git push origin clean-main
```

---
**📌 중요**: 다음 세션 시작 시 이 파일을 먼저 읽고 현재 상태를 파악한 후 작업을 시작하세요.

**마지막 업데이트**: 2024-07-23 (Vercel 배포 에러 수정 완료)