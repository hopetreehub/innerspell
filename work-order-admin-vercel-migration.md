# 작업지시서: 관리자 시스템 Vercel 배포 마이그레이션

## 📋 작업 개요
관리자 시스템(/admin)이 현재 목(mock) 데이터를 사용하고 있어, Vercel 프로덕션 환경에서 실제 Firebase 데이터를 사용하도록 단계적으로 전환하는 작업

## 🎯 작업 목표
1. 모든 관리자 탭이 Vercel 환경에서 실제 데이터 사용
2. 개발 환경에서는 목데이터 유지 (빠른 개발을 위해)
3. 안전한 단계적 전환으로 시스템 안정성 보장
4. 에러 처리 및 폴백 메커니즘 구현

## 📊 현재 상태 분석

### 목데이터 사용 현황
| 기능 | 현재 상태 | 우선순위 | 난이도 |
|------|----------|----------|--------|
| 사용자 관리 | 실제 Firebase 사용 (개발시 인증 우회) | - | 완료 |
| 사용량 통계 | MockDataGenerator 사용 | High | 중 |
| 실시간 모니터링 | SessionManager 목데이터 | High | 중 |
| 블로그 관리 | mockPosts 하드코딩 | Medium | 낮 |
| AI 설정 | 로컬 파일 시스템 | Low | 낮 |
| 타로 가이드라인 | 로컬 파일 시스템 | Low | 낮 |
| 활동 로그 | 실제 Firebase 사용 | - | 완료 |
| 시스템 상태 | 하드코딩된 값 | Medium | 낮 |

## 🚀 단계별 작업 계획

### Phase 1: 환경 설정 및 기반 작업 (Day 1)
1. **환경 변수 설정**
   ```env
   # Vercel 환경 변수 설정
   NEXT_PUBLIC_ENABLE_DEV_MODE=false
   NEXT_PUBLIC_USE_REAL_AUTH=true
   NEXT_PUBLIC_ENABLE_FILE_STORAGE=false
   FIREBASE_SERVICE_ACCOUNT_KEY=[실제 키]
   ```

2. **데이터 소스 인터페이스 생성**
   ```typescript
   // /src/lib/admin/data-source.ts
   interface DataSource {
     getStats(): Promise<AdminStats>;
     getRealtimeData(): Promise<RealtimeData>;
     // ...
   }
   ```

3. **환경별 데이터 소스 팩토리**
   ```typescript
   // /src/lib/admin/data-source-factory.ts
   export function createDataSource(): DataSource {
     if (isProduction() && hasFirebaseConfig()) {
       return new FirebaseDataSource();
     }
     return new MockDataSource();
   }
   ```

### Phase 2: 사용량 통계 마이그레이션 (Day 2-3)

1. **Firebase 스키마 설계**
   ```
   /stats
     /daily/{date}
       - totalReadings: number
       - uniqueUsers: number
       - peakHour: number
       - averageSessionTime: number
     /hourly/{date}/{hour}
       - readings: number
       - users: number
   ```

2. **통계 수집 로직 구현**
   - 타로 리딩 완료 시 통계 업데이트
   - Cloud Functions로 일간/월간 집계
   - 실시간 카운터 구현

3. **UsageStatsCharts 컴포넌트 수정**
   - MockDataGenerator 조건부 사용
   - Firebase 데이터 페칭 구현
   - 로딩 및 에러 상태 처리

### Phase 3: 실시간 모니터링 마이그레이션 (Day 4-5)

1. **Firebase Realtime Database 설정**
   ```
   /monitoring
     /activeUsers/{userId}
       - lastActivity: timestamp
       - status: 'active' | 'idle'
     /todayStats
       - readings: number
       - newUsers: number
   ```

2. **세션 관리 구현**
   - 사용자 활동 추적
   - 5분 이상 비활동 시 idle 처리
   - 실시간 업데이트 구독

3. **RealTimeMonitoringDashboard 수정**
   - SessionManager 대체
   - Firebase 실시간 리스너 구현
   - 연결 상태 모니터링

### Phase 4: 블로그 시스템 마이그레이션 (Day 6)

1. **Firestore 컬렉션 생성**
   ```
   /blogPosts
     /{postId}
       - title: string
       - content: string
       - author: string
       - publishedAt: timestamp
       - status: 'draft' | 'published'
   ```

2. **기존 목데이터 마이그레이션**
   - 스크립트로 mockPosts 데이터 이전
   - 이미지 URL 검증 및 수정

3. **블로그 API 수정**
   - CRUD 작업 Firebase 연동
   - 페이지네이션 구현

### Phase 5: 시스템 상태 모니터링 (Day 7)

1. **실제 시스템 메트릭 수집**
   - Vercel Analytics API 연동
   - Firebase 성능 모니터링
   - Next.js 런타임 메트릭

2. **SystemStatus 컴포넌트 업데이트**
   - 하드코딩 값 제거
   - 실시간 메트릭 표시

### Phase 6: 테스트 및 검증 (Day 8-9)

1. **단위 테스트**
   - 각 데이터 소스 테스트
   - 목데이터 폴백 테스트

2. **통합 테스트**
   - Vercel Preview 환경에서 테스트
   - 실제 데이터 플로우 검증

3. **성능 테스트**
   - 대용량 데이터 처리
   - 실시간 업데이트 성능

### Phase 7: 배포 및 모니터링 (Day 10)

1. **단계적 배포**
   - Vercel Preview 배포
   - 기능별 점진적 활성화
   - Production 배포

2. **모니터링 설정**
   - 에러 추적 (Sentry)
   - 성능 모니터링
   - 사용자 피드백 수집

## 🛡️ 리스크 관리

### 주요 리스크
1. **Firebase 할당량 초과**
   - 해결: 캐싱 전략 구현
   - 백업: 읽기 전용 모드 전환

2. **실시간 데이터 지연**
   - 해결: 디바운싱/스로틀링
   - 백업: 폴링 방식 대체

3. **마이그레이션 중 데이터 손실**
   - 해결: 백업 후 진행
   - 백업: 롤백 계획 수립

## 📝 체크리스트

### 사전 준비
- [ ] Firebase 프로젝트 설정 완료
- [ ] Vercel 환경 변수 설정
- [ ] 백업 계획 수립
- [ ] 테스트 계획 작성

### 구현
- [ ] Phase 1: 환경 설정
- [ ] Phase 2: 사용량 통계
- [ ] Phase 3: 실시간 모니터링
- [ ] Phase 4: 블로그 시스템
- [ ] Phase 5: 시스템 상태
- [ ] Phase 6: 테스트
- [ ] Phase 7: 배포

### 사후 관리
- [ ] 모니터링 대시보드 설정
- [ ] 알림 설정
- [ ] 문서화 완료
- [ ] 팀 교육

## 🎯 성공 기준

1. **기능적 요구사항**
   - 모든 관리자 탭이 실제 데이터 표시
   - 실시간 업데이트 정상 작동
   - 에러 발생 시 적절한 폴백

2. **비기능적 요구사항**
   - 페이지 로드 시간 < 3초
   - 실시간 업데이트 지연 < 1초
   - Firebase 비용 예산 내 유지

3. **운영 요구사항**
   - 개발/프로덕션 환경 분리
   - 모니터링 및 알림 체계
   - 롤백 가능한 배포 전략

## 📅 예상 일정
- 총 작업 기간: 10일
- 일일 작업 시간: 4-6시간
- 버퍼 기간: 2일

---
*작성일: 2024-12-14*
*작성자: PM (SuperClaude)*
*버전: 1.0*