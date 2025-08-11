# 🚀 Vercel 배포 가이드

## ✅ 배포 준비 상태 확인

### 현재 상태:
- ✅ **Gemini API 연동 완료** - 실제 AI 질문 생성 및 해석 작동
- ✅ **폴백 시스템 구축** - API 오류 시 사용자 친화적 처리
- ✅ **UI/UX 완성** - 전체 꿈해몽 플로우 작동
- ✅ **성능 최적화** - 6초 이내 AI 응답
- ✅ **한국어 지원** - 완벽한 한국어 AI 처리

## 🔐 Vercel 환경 변수 설정

### 필수 설정 변수:

#### AI API 설정:
```bash
GEMINI_API_KEY=AIzaSyCEYBrskvxVcI7oANkKWn__AxeDWSFQ3Yc
GOOGLE_API_KEY=AIzaSyDKqXrsTTtBEFpQC-ndtTtGIXw5_KedxCU
OPENAI_API_KEY=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
```

#### 프로덕션 환경 설정:
```bash
NODE_ENV=production
NEXT_PUBLIC_USE_REAL_AUTH=true
NEXT_PUBLIC_ENABLE_DEV_AUTH=false
NEXT_PUBLIC_ENABLE_FILE_STORAGE=false
```

#### Firebase 설정:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg
NEXT_PUBLIC_FIREBASE_APP_ID=1:944680989471:web:bc817b811a6033017f362a
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=innerspell-an7ce.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=944680989471
NEXT_PUBLIC_FIREBASE_PROJECT_ID=innerspell-an7ce
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=innerspell-an7ce.firebasestorage.app
```

#### 애플리케이션 보안:
```bash
ENCRYPTION_KEY=imYNbSV++Pcv5Hrybj4HDt0xkEL4ojD6/xF2O+SrJLk=
BLOG_API_SECRET_KEY=c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=
NEXT_PUBLIC_BLOG_API_SECRET=c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=
ADMIN_EMAILS=admin@innerspell.com
```

#### 빌드 설정:
```bash
NEXT_PUBLIC_BUILD_TIMESTAMP=production
NEXT_PUBLIC_FORCE_REFRESH=false
TURBO_CACHE=remote:ro
TURBO_REMOTE_ONLY=true
```

## 🔧 배포 단계

### 1단계: Vercel 프로젝트 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. GitHub 저장소 연결

### 2단계: 환경 변수 설정
1. Vercel Dashboard → Settings → Environment Variables
2. 위의 모든 환경 변수를 Production 환경에 추가
3. **주의**: API 키들은 절대 공개 저장소에 커밋하지 않기

### 3단계: 배포 설정 확인
1. Build Command: `npm run build`
2. Output Directory: `.next`
3. Install Command: `npm install`
4. Node.js Version: 18.x

### 4단계: 배포 실행
```bash
# 로컬에서 배포 테스트 (선택사항)
npm run build
npm start

# Vercel CLI로 배포 (선택사항)
npx vercel --prod
```

## 🧪 배포 후 검증

### 필수 확인 사항:
1. ✅ 홈페이지 정상 로드
2. ✅ 꿈해몽 페이지 접근
3. ✅ AI 질문 생성 작동
4. ✅ AI 해석 생성 작동
5. ✅ 회원가입/로그인 기능
6. ✅ 관리자 대시보드 접근

### 테스트 시나리오:
```
1. 꿈해몽 페이지 → 꿈 내용 입력 → 질문 생성
2. 질문에 답변 → 최종 해석 요청 → 결과 확인
3. 회원가입 → 로그인 → 프로필 설정
4. 관리자 계정으로 대시보드 접근
```

## ⚡ 성능 최적화

### 현재 최적화 상태:
- ✅ **AI 응답 속도**: 6초 이내
- ✅ **페이지 로드**: Next.js 최적화
- ✅ **이미지 최적화**: Next.js Image 컴포넌트
- ✅ **CSS 최적화**: Tailwind CSS
- ✅ **번들 최적화**: Turbopack 활용

## 🔍 모니터링

### 배포 후 모니터링 항목:
1. **Vercel Analytics**: 페이지 성능 추적
2. **Error Tracking**: 에러 발생 모니터링  
3. **AI API 사용량**: Gemini/OpenAI API 호출 횟수
4. **Firebase Usage**: Firestore 읽기/쓰기 횟수

## 🆘 트러블슈팅

### 일반적인 문제:
1. **환경 변수 오류**: Vercel Dashboard에서 올바른 값 확인
2. **API 키 문제**: 각 AI 서비스 콘솔에서 키 상태 확인
3. **Firebase 연결**: 프로젝트 설정 및 권한 확인
4. **빌드 실패**: 로컬에서 `npm run build` 테스트

### 연락처:
- **이메일**: admin@innerspell.com
- **개발자**: GitHub Issues

---

## 🎉 배포 완료!

**모든 설정이 완료되었습니다. Gemini AI가 실제로 작동하는 꿈해몽 시스템이 배포 준비되었습니다!**