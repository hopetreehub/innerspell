# 작업지시서: 타로 해석 생성 오류 완전 해결

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로 리딩 시스템
- **작업 요청자**: 사용자
- **작업 관리자**: SWARM PM
- **작업일**: 2025-08-12
- **우선순위**: 🔴 긴급 (Critical Priority)
- **이전 상태**: Gemini API 연동 성공 → 다시 해석 오류 발생

## 🔍 문제 상황 분석
- **증상**: 타로 해석 생성 시 오류 발생 (이전에 해결했던 문제가 재발)
- **영향 범위**: 
  - 전체 타로 리딩 기능 마비
  - 사용자 서비스 중단
  - 핵심 기능 불가
- **재발 원인 추정**:
  - API 키 만료 또는 무효화
  - 서버 재시작 후 환경변수 미적용
  - API 제공자측 변경사항
  - 코드 충돌 또는 설정 덮어쓰기

## 🎯 작업 목표
1. **근본 원인 파악**: 왜 해결된 문제가 재발했는지 정확히 분석
2. **영구적 해결**: 재발 방지를 위한 완전한 수정
3. **안정성 확보**: 다양한 시나리오에서도 작동하는 견고한 시스템
4. **모니터링 체계**: 문제 조기 감지 시스템 구축

## 👥 작업 배정

### 1. **SuperClaude (시니어 아키텍트)**
- 전체 AI 시스템 아키텍처 검토
- 환경변수 및 설정 파일 분석
- 재발 원인 근본 분석

### 2. **DevExpert (백엔드 전문가)**
- API 연동 코드 상세 분석
- 에러 로그 수집 및 분석
- API 호출 체인 추적

### 3. **QA Engineer (품질 보증 전문가)**
- 다양한 시나리오 테스트
- 에러 재현 및 패턴 분석
- 회귀 테스트 수행

### 4. **SRE Engineer (신뢰성 엔지니어)**
- 모니터링 시스템 구축
- 에러 알림 체계 구현
- 자동 복구 메커니즘 설계

## 📝 작업 단계

### Phase 1: 완전한 현황 파악 (20분)
1. **서버 상태 점검**
   ```bash
   # 프로세스 확인
   ps aux | grep node
   
   # 환경변수 확인
   env | grep -E "API_KEY|GEMINI|GOOGLE|OPENAI"
   
   # 최근 로그 분석
   tail -n 200 server.log | grep -E "error|Error|API|401|403|429"
   ```

2. **API 키 상태 검증**
   - 모든 API 키 유효성 검사
   - API 제공자 대시보드 확인
   - 사용량 및 제한 확인

3. **코드 변경사항 추적**
   ```bash
   git log --oneline -20
   git diff HEAD~5
   ```

### Phase 2: 심층 진단 (30분)
1. **API 호출 경로 추적**
   - 클라이언트 → API 엔드포인트
   - API 엔드포인트 → 서버 액션
   - 서버 액션 → Genkit
   - Genkit → AI Provider

2. **각 단계별 로깅 추가**
   ```typescript
   // 상세 디버깅 로그 추가
   console.log('[TAROT_DEBUG] Step 1: Request received', { timestamp, data });
   console.log('[TAROT_DEBUG] Step 2: API key loaded', { keyLength, provider });
   console.log('[TAROT_DEBUG] Step 3: Genkit initialized', { plugins });
   console.log('[TAROT_DEBUG] Step 4: API call made', { model, response });
   ```

3. **에러 패턴 분석**
   - 에러 발생 시점
   - 에러 메시지 상세
   - 에러 발생 조건

### Phase 3: 근본 해결 구현 (40분)
1. **환경변수 관리 개선**
   ```typescript
   // 환경변수 검증 및 폴백
   class APIKeyManager {
     validateAndLoad() {
       // 키 유효성 검사
       // 폴백 메커니즘
       // 에러 리포팅
     }
   }
   ```

2. **API 연동 안정화**
   - 재시도 로직 강화
   - 타임아웃 설정 최적화
   - 에러 핸들링 개선

3. **다중 제공자 폴백**
   ```typescript
   // AI 제공자 우선순위 관리
   const providers = [
     { name: 'gemini', handler: geminiHandler },
     { name: 'openai', handler: openaiHandler },
     { name: 'anthropic', handler: anthropicHandler }
   ];
   ```

### Phase 4: 검증 및 모니터링 (20분)
1. **통합 테스트**
   - 정상 시나리오
   - 에러 시나리오
   - 부하 테스트

2. **모니터링 구현**
   ```typescript
   // 실시간 모니터링
   class TarotMonitor {
     trackAPICall(provider, status, duration) {
       // 메트릭 수집
       // 알림 조건 확인
       // 대시보드 업데이트
     }
   }
   ```

3. **자동 복구 메커니즘**
   - API 키 자동 로테이션
   - 제공자 자동 전환
   - 에러 시 알림

### Phase 5: 문서화 및 예방 (15분)
1. **트러블슈팅 가이드**
   - 일반적인 오류와 해결법
   - API 키 관리 방법
   - 긴급 대응 절차

2. **운영 체크리스트**
   - 일일 점검 항목
   - 주간 유지보수
   - 월간 리뷰

## 🛠️ 필요 도구 및 리소스
- Playwright (E2E 테스트)
- Postman/Insomnia (API 테스트)
- 로그 분석 도구
- 성능 모니터링 도구
- Git (버전 관리)

## ⚠️ 리스크 및 주의사항
1. **서비스 중단 최소화**
   - 단계적 수정 적용
   - 롤백 계획 준비

2. **보안 고려사항**
   - API 키 노출 방지
   - 로그에 민감정보 제외

3. **성능 영향**
   - 추가 로깅의 성능 영향 고려
   - 모니터링 오버헤드 최소화

## 📊 성공 기준
1. ✅ 모든 타로 해석 요청 성공 (100% 성공률)
2. ✅ API 응답 시간 < 5초
3. ✅ 24시간 무중단 운영
4. ✅ 자동 복구 메커니즘 작동 확인
5. ✅ 모니터링 대시보드 구축 완료

## 🔄 진행 상황 체크포인트
- [ ] Phase 1: 현황 파악 완료
- [ ] Phase 2: 심층 진단 완료
- [ ] Phase 3: 해결 구현 완료
- [ ] Phase 4: 검증 완료
- [ ] Phase 5: 문서화 완료

## 📅 예상 소요 시간
- 총 작업 시간: 2시간 5분
- 긴급도를 고려한 즉시 착수 필요

## 🚨 에스컬레이션 계획
1. **1차 대응**: 개발팀 내부 해결 시도
2. **2차 대응**: API 제공자 지원 요청
3. **3차 대응**: 대체 AI 서비스 긴급 전환

---

**PM 승인 대기 중**

이 작업지시서는 타로 해석 오류를 완전히 해결하고 재발을 방지하기 위한 종합적인 계획입니다.
승인 후 즉시 Phase 1부터 체계적으로 진행하겠습니다.