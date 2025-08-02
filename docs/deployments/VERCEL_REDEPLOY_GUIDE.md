# Vercel 수동 재배포 가이드

## 현재 상황
- 최신 커밋: f852e1a (mockPosts API 추가)
- 문제: 새로운 블로그 포스트와 페이지들이 Vercel에 반영되지 않음
- 추가된 파일들:
  - `/blog-new` 페이지
  - `/api/mock-posts` API 엔드포인트
  - 5개의 새 블로그 포스트

## 재배포 방법

### 옵션 1: Deployments에서 재배포
1. Vercel Dashboard → test-studio-firebase 프로젝트
2. Deployments 탭
3. 최신 배포 옆 ⋮ 메뉴 → Redeploy
4. **"Redeploy with existing Build Cache" 체크 해제** ← 중요!
5. Redeploy 클릭

### 옵션 2: 환경 변수로 트리거
1. Settings → Environment Variables
2. 새 변수 추가: `FORCE_REBUILD=true`
3. Save (자동 재배포 시작)

### 옵션 3: Deploy Hook 사용
1. Settings → Git → Deploy Hooks
2. Create Hook
3. 생성된 URL을 브라우저에서 열거나 curl로 호출

## 재배포 후 확인사항
- Build Logs에서 에러 확인
- 빌드 완료 시간 (보통 2-5분)
- Status가 "Ready"인지 확인

## 테스트할 URL들
- https://test-studio-firebase.vercel.app/blog (기존 블로그)
- https://test-studio-firebase.vercel.app/blog-new (새 테스트 페이지)
- https://test-studio-firebase.vercel.app/api/mock-posts (API 엔드포인트)