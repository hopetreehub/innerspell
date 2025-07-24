# 🚀 Vercel 배포 완전 가이드

## 📋 배포 정보

**GitHub 저장소**: https://github.com/hopetreehub/innerspell.git  
**브랜치**: `clean-main`  
**상태**: ✅ 업로드 완료 (63개 파일, 7,766줄 추가)

## 🌐 Vercel 배포 단계

### 1. Vercel 프로젝트 생성

1. **Vercel 접속**: https://vercel.com
2. **"New Project" 클릭**
3. **GitHub 계정 연결** (필요시)
4. **저장소 선택**: `hopetreehub/innerspell`
5. **브랜치 선택**: `clean-main`

### 2. 프로젝트 설정

#### Framework Preset
- **Framework**: `Next.js` (자동 감지됨)
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm ci --legacy-peer-deps`

#### 고급 설정
```bash
# Root Directory: (비워둠)
# Build Command Override: npm run build
# Install Command Override: npm ci --legacy-peer-deps
```

### 3. 환경 변수 설정 (중요!)

Vercel 대시보드 → Settings → Environment Variables에서 다음 설정:

#### 🔥 Firebase 필수 설정 (6개)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=944680989471
NEXT_PUBLIC_FIREBASE_APP_ID=1:944680989471:web:bc817b811a6033017f362a
```

#### 🔒 보안 키 생성 및 설정
```bash
# 로컬에서 먼저 생성하세요
node scripts/generate-encryption-key.js

# 출력된 키를 Vercel에 추가
ENCRYPTION_KEY=생성된_32자_암호화키
BLOG_API_SECRET_KEY=c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=
```

#### 🤖 AI API 키 (최소 1개 필수)
```bash
# 옵션 1: OpenAI (권장)
OPENAI_API_KEY=sk-...

# 옵션 2: Google AI (무료)
GOOGLE_API_KEY=AIza...
GEMINI_API_KEY=AIza...

# 옵션 3: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
```

#### ⚙️ 프로덕션 설정
```bash
NODE_ENV=production
NEXT_PUBLIC_USE_REAL_AUTH=true
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
ADMIN_EMAILS=admin@innerspell.com
```

### 4. 배포 실행

1. **"Deploy" 버튼 클릭**
2. **빌드 로그 확인** (약 3-5분 소요)
3. **배포 URL 확인**

## 🧪 배포 후 테스트

### 필수 확인 사항
1. **홈페이지 로딩** ✓
2. **모바일 반응형** ✓
3. **AI 타로 리딩 테스트** ✓
4. **로그인/회원가입** ✓
5. **Admin 패널 접근** (`/admin`)

### 테스트 시나리오
```bash
# 1. 기본 접속
curl -I https://your-app.vercel.app

# 2. API 상태 확인
curl https://your-app.vercel.app/api/health

# 3. AI 설정 확인 (관리자만)
curl https://your-app.vercel.app/api/debug/ai-config
```

## 🔧 문제 해결

### 빌드 실패
**증상**: Build failed 또는 Command failed
**해결**:
1. 환경 변수 누락 확인
2. `Install Command`를 `npm ci --legacy-peer-deps`로 설정
3. Next.js 버전 호환성 확인

### AI 기능 오류
**증상**: "No AI provider plugins available"
**해결**:
1. AI API 키가 올바르게 설정되었는지 확인
2. API 키 권한 및 사용량 한도 확인
3. `/admin`에서 AI 제공자 활성화

### 환경 변수 오류
**증상**: Configuration 관련 오류
**해결**:
1. 모든 `NEXT_PUBLIC_*` 변수 설정 확인
2. `ENCRYPTION_KEY` 32자 이상인지 확인
3. Firebase 프로젝트 설정 일치 확인

## 📈 성능 최적화

### Vercel 설정
- **Region**: `icn1` (서울) - 한국 사용자 최적화
- **Functions**: Edge Functions 활용
- **Analytics**: Vercel Analytics 활성화

### 도메인 연결
1. Vercel 대시보드 → Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정 업데이트

## 🎯 예상 결과

- **배포 시간**: 3-5분
- **빌드 크기**: ~15MB
- **Lighthouse 점수**: 90+
- **초기 로딩**: 2초 이내

## 📞 지원

배포 중 문제가 발생하면:
1. Vercel 빌드 로그 확인
2. GitHub Issues 작성
3. 환경 변수 재확인

---

**GitHub**: https://github.com/hopetreehub/innerspell  
**브랜치**: clean-main  
**배포 준비**: ✅ 완료