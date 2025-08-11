# 사고 보고서: 타로 리딩 CSRF 토큰 오류

## 사고 개요
- **발생 일시**: 2025년 8월 11일
- **심각도**: Critical
- **영향**: 모든 타로 리딩 기능 사용 불가
- **해결 시간**: 약 30분

## 사고 내용

### 문제 증상
- 타로 리딩 페이지에서 "AI 해석 받기" 클릭 시 403 Forbidden 오류 발생
- 오류 메시지: "Invalid CSRF token"
- 모든 사용자가 타로 리딩 기능을 사용할 수 없음

### 근본 원인
1. **미들웨어 CSRF 보호**: `middleware.ts`에서 모든 POST API 요청에 대해 CSRF 토큰 검증
2. **클라이언트 미구현**: 클라이언트 코드에서 CSRF 토큰을 헤더에 포함하지 않음
3. **최근 변경사항 영향**: 타로 스타일 시스템 구현 중 API 호출 방식 변경

## 해결 방법

### 단기 해결책 (적용됨)
1. 개발 모드에서 타로 API를 CSRF 검증 예외 목록에 추가
   ```typescript
   const isTarotApi = request.nextUrl.pathname.startsWith('/api/generate-tarot-interpretation');
   if (isDevelopmentMode && (isUploadApi || isBlogApi || isTarotApi)) {
     // CSRF 검증 건너뛰기
   }
   ```

2. CSRF 토큰 헤더 추가 유틸리티 구현
   ```typescript
   export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
     const csrfToken = getCSRFToken();
     if (csrfToken) {
       return { ...headers, 'x-csrf-token': csrfToken };
     }
     return headers;
   }
   ```

### 장기 해결책 (권장)
1. 모든 API 호출에 CSRF 토큰 자동 포함
2. API 클라이언트 라이브러리 통합
3. 프로덕션 환경에서도 안전한 CSRF 처리

## 재발 방지책

1. **API 변경 시 체크리스트**
   - [ ] CSRF 토큰 처리 확인
   - [ ] 미들웨어 예외 처리 검토
   - [ ] 클라이언트-서버 통신 테스트

2. **모니터링 강화**
   - API 오류율 모니터링 추가
   - CSRF 관련 403 오류 별도 추적
   - 실시간 알림 설정

3. **개발 프로세스 개선**
   - API 변경 시 통합 테스트 필수
   - 스테이징 환경에서 충분한 테스트
   - 코드 리뷰 시 보안 체크리스트 확인

## 교훈

1. **보안과 사용성의 균형**: CSRF 보호는 중요하지만, 적절한 구현이 필요
2. **통합 테스트의 중요성**: 단위 테스트만으로는 이런 문제를 발견하기 어려움
3. **빠른 대응의 가치**: 체계적인 대응 프로세스로 30분 내 해결

## 담당자
- **사고 대응**: SWARM PM 및 개발팀
- **문서 작성**: SWARM PM
- **승인**: 프로젝트 관리자

---
*이 문서는 향후 유사한 사고 방지를 위한 참고 자료입니다.*