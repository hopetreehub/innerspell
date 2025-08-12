# 🚀 SWARM PM 작업지시서 - Vercel 배포 (처음부터 끝까지)

## 📋 작업 개요
- **작업명**: test-studio-firebase 프로젝트 Vercel 완전 재배포
- **우선순위**: 🔴 CRITICAL
- **예상 소요시간**: 1시간
- **작성일**: 2025-08-12
- **PM**: SWARM PM
- **상태**: 승인 대기

## 🎯 작업 목표
1. Vercel에서 기존 프로젝트 완전 제거
2. 처음부터 새로운 Vercel 프로젝트 생성
3. 포트 4000에서 검증된 로컬 프로젝트를 Vercel에 배포
4. 모든 기능 정상 작동 확인
5. 프로덕션 URL에서 실제 검증

## 📝 전제 조건
- 로컬 환경에서 포트 4000으로 모든 기능 정상 작동 확인 완료
- Git 저장소 준비 완료
- Vercel 계정 활성화 상태
- 기존 Vercel 프로젝트 완전 삭제 예정

## ✅ 단계별 작업 목록

### 1단계: 사전 준비
- [ ] 현재 로컬 서버 종료
- [ ] 프로젝트 빌드 가능 여부 확인
- [ ] .gitignore 파일 확인
- [ ] 환경 변수 목록 정리

### 2단계: Vercel CLI 설치 및 인증
- [ ] Vercel CLI 글로벌 설치 확인
- [ ] Vercel 로그인 상태 확인
- [ ] 필요시 재인증

### 3단계: 로컬 빌드 테스트
- [ ] `npm run build` 실행
- [ ] 빌드 에러 없음 확인
- [ ] 빌드 시간 측정
- [ ] 빌드 결과물 확인

### 4단계: Vercel 프로젝트 초기화
- [ ] `vercel` 명령으로 새 프로젝트 생성
- [ ] 프로젝트 이름: test-studio-firebase
- [ ] Framework: Next.js 자동 감지 확인
- [ ] Build & Output 설정 확인

### 5단계: 환경 변수 설정
- [ ] 개발 환경 변수 목록:
  - `NEXT_PUBLIC_ENABLE_FILE_STORAGE=true`
  - `NODE_ENV=production`
  - Firebase 관련 (선택사항)
  - AI API 키 (필요시)
- [ ] Vercel 대시보드에서 환경 변수 추가
- [ ] Production, Preview, Development 환경별 설정

### 6단계: 배포 실행
- [ ] `vercel --prod` 명령으로 프로덕션 배포
- [ ] 배포 로그 모니터링
- [ ] 배포 완료 대기
- [ ] 배포 URL 확인

### 7단계: 배포 검증 (Playwright)
- [ ] 프로덕션 URL에서 모든 페이지 테스트
  - 홈페이지
  - 블로그 목록
  - 블로그 상세
  - 타로 리딩
  - 관리자 페이지
- [ ] 각 페이지 스크린샷 저장
- [ ] 기능 테스트
  - 타로 카드 셔플/선택
  - AI 해석 (API 키 설정 시)
  - 블로그 포스트 로딩

### 8단계: 최종 점검
- [ ] 도메인 설정 (있을 경우)
- [ ] HTTPS 인증서 확인
- [ ] 성능 메트릭 확인
- [ ] 에러 로그 확인

## 🛠️ 필수 명령어

```bash
# Vercel CLI 설치
npm i -g vercel@latest

# 로그인
vercel login

# 빌드 테스트
npm run build

# Vercel 초기화 및 배포
vercel

# 프로덕션 배포
vercel --prod

# 환경 변수 추가
vercel env add NEXT_PUBLIC_ENABLE_FILE_STORAGE

# 로그 확인
vercel logs
```

## ⚠️ 주의사항
1. **빌드 에러 주의**: 로컬과 Vercel 환경 차이 고려
2. **환경 변수**: 모든 필수 환경 변수 설정 확인
3. **포트 설정**: Vercel은 자동으로 포트 할당 (4000 아님)
4. **Firebase**: 선택사항이므로 없어도 작동해야 함
5. **캐시**: 문제 발생 시 캐시 삭제 고려

## 🚫 절대 금지사항
- GitHub 자동 커밋 금지
- UI/UX 변경 금지
- 타로 카드 관련 시각적 요소 수정 금지
- 추정이나 가정 금지 - 모든 것은 실제 확인

## 📊 성공 기준
1. Vercel 프로덕션 URL에서 모든 페이지 정상 접속
2. 404 에러 없음
3. 빌드 시간 5분 이내
4. 모든 기능 정상 작동
5. Playwright 검증 통과

## 🔍 문제 해결 가이드
- **빌드 실패**: package.json scripts 확인
- **환경 변수 누락**: Vercel 대시보드 Settings > Environment Variables
- **404 에러**: vercel.json 설정 확인
- **타임아웃**: 함수 실행 시간 제한 확인

## 📈 예상 결과
- 배포 URL: https://test-studio-firebase.vercel.app
- 빌드 시간: 약 3-5분
- 초기 로딩: 3초 이내
- 모든 기능 정상 작동

---
*작성: SWARM PM | 상태: 승인 대기 | 실행 준비 완료*