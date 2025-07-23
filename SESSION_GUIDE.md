# 다음 세션을 위한 지침서

## 프로젝트 현황

### 🎯 완료된 주요 작업
1. **블로그 시스템 개선**
   - 모든 포스트(11개) 정상 표시 (페이지네이션: 첫 페이지 9개, 두 번째 페이지 2개)
   - 블로그 상세 페이지 레이아웃 개선 (사이드바 유지)
   - 관련 포스트를 카드 형식에서 리스트 형식으로 변경
   - 관련 포스트 개수 3개 → 5개로 증가

2. **뉴스레터 이메일 알림 기능**
   - 구독 시 admin@innerspell.com으로 알림 전송 설정
   - Mock 이메일 시스템 구현 (개발 환경)
   - API 엔드포인트: `/api/newsletter`

### 📁 주요 파일 위치
- 블로그 메인: `/src/components/blog/BlogMain.tsx`
- 블로그 상세: `/src/components/blog/BlogPostDetail.tsx`
- 뉴스레터 액션: `/src/actions/newsletterActions.ts`
- 뉴스레터 API: `/src/app/api/newsletter/route.ts`
- Mock 이메일: `/src/lib/email-mock.ts`

## ⚠️ 중요 환경 설정

### 포트 설정 (절대 준수)
```bash
# 개발 서버는 반드시 포트 4000 사용
npm run dev  # 자동으로 포트 4000에서 실행됨
```

### 현재 브랜치
```
feature/blog-system
```

## 🔧 환경 구성

### 필요한 패키지 (아직 설치 안됨)
```bash
# 실제 이메일 전송을 위해 필요 (현재는 Mock 사용 중)
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 환경 변수 (.env.local) - 실제 이메일 전송 시 필요
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
SEND_WELCOME_EMAIL=true
```

## 📝 다음 세션 시작 시 확인사항

1. **서버 상태 확인**
   ```bash
   # 개발 서버 실행 (포트 4000)
   npm run dev
   ```

2. **블로그 포스트 확인**
   - http://localhost:4000/blog 접속
   - 모든 포스트(11개) 표시 확인
   - 페이지네이션 동작 확인

3. **뉴스레터 기능 확인**
   - 홈페이지 하단 Footer에서 뉴스레터 구독 테스트
   - 서버 로그에서 Mock 이메일 전송 확인

## 🚀 향후 작업 제안

1. **이메일 기능 완성**
   - nodemailer 설치
   - 실제 SMTP 설정
   - 환경 변수 구성

2. **블로그 기능 강화**
   - 검색 기능 추가
   - 카테고리/태그 필터링
   - 조회수 추가

3. **SEO 최적화**
   - 동적 메타데이터 개선
   - 구조화된 데이터 추가
   - 사이트맵 생성

4. **성능 최적화**
   - 이미지 최적화
   - 캐싱 전략 구현
   - 로딩 성능 개선

## 🧪 테스트 스크립트

```bash
# 블로그 전체 플로우 테스트
node test-complete-crud-api.js

# 뉴스레터 구독 테스트
node test-newsletter-full.js
```

## 📌 주의사항

1. **포트 4000 필수 사용** - 다른 포트 절대 사용 금지
2. **Mock Firebase Admin SDK** 사용 중 (개발 환경)
3. **Git 커밋 전 테스트** 필수
4. **Playwright로 모든 UI 변경사항 검증**

## 💡 디버깅 팁

- 서버 로그 확인: `tail -f dev_server.log`
- Mock 이메일 로그: 서버 콘솔에서 "MOCK EMAIL" 검색
- Firestore 데이터: Mock 환경에서는 메모리에만 저장됨

---
작성일: 2025-07-19
프로젝트: test-studio-firebase
포트: 4000 (필수)