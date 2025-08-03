# 🔵 Backend 전문가 작업 지시서

## 📋 작업 개요
- **담당자**: Backend Specialist
- **우선순위**: 🔴 높음
- **예상 소요시간**: 3일
- **시작일**: 2025년 1월 3일

---

## 🎯 주요 목표
1. Firebase 쿼리 최적화 및 비용 절감
2. API 응답 시간 < 200ms 달성
3. 목업 데이터 완전 제거 및 실데이터 전환

---

## 📝 상세 작업 내용

### Day 1: Firebase 최적화

#### 오전 (09:00-12:00)
```javascript
// 1. Firestore 쿼리 분석
// 현재 쿼리 패턴 파악
const inefficientQuery = db.collection('users')
  .where('status', '==', 'active')
  .get(); // 전체 스캔

// 최적화된 쿼리
const optimizedQuery = db.collection('users')
  .where('status', '==', 'active')
  .where('lastActive', '>=', thirtyDaysAgo)
  .orderBy('lastActive', 'desc')
  .limit(100);
```

#### 오후 (13:00-18:00)
```javascript
// 2. 복합 인덱스 생성
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "savedReadings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "userActivity",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "lastActive", "order": "DESCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" }
      ]
    }
  ]
}

// 3. 보안 규칙 최적화
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 데이터 보호
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // 저장된 리딩 보호
    match /savedReadings/{readingId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if false; // 수정 불가
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    function isAdmin() {
      return request.auth.token.admin == true;
    }
  }
}
```

### Day 2: API 성능 개선

#### 오전 (09:00-12:00)
```typescript
// 4. 캐싱 전략 구현
// src/lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5분
});

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
}

// 5. API 응답 최적화
// src/app/api/optimize-response.ts
export function optimizeResponse(data: any) {
  return {
    success: true,
    data: compress(data), // 데이터 압축
    timestamp: Date.now(),
    cache: {
      maxAge: 300, // 5분
      sMaxAge: 3600, // 1시간 (CDN)
    }
  };
}
```

#### 오후 (13:00-18:00)
```typescript
// 6. Rate Limiting 구현
// src/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10초당 10회
  analytics: true,
});

export async function rateLimitMiddleware(
  req: Request,
  userId: string
) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `api_${userId}`
  );
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
  
  return { limit, reset, remaining };
}
```

### Day 3: 데이터 마이그레이션 및 검증

#### 오전 (09:00-12:00)
```javascript
// 7. 목업 데이터 제거 스크립트
// scripts/remove-mock-data.js
const admin = require('firebase-admin');

async function removeMockData() {
  const db = admin.firestore();
  const batch = db.batch();
  
  // Mock 사용자 제거
  const mockUsers = await db.collection('users')
    .where('isMock', '==', true)
    .get();
    
  mockUsers.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Mock 이벤트 제거
  const mockEvents = await db.collection('events')
    .where('userId', 'in', ['demo_user_1', 'demo_user_2', 'demo_user_3'])
    .get();
    
  mockEvents.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Mock data removed successfully');
}

// 8. 데이터 무결성 검증
async function validateData() {
  const validations = [
    checkUserIntegrity(),
    checkReadingIntegrity(),
    checkRelationships(),
  ];
  
  const results = await Promise.all(validations);
  return results.every(r => r.valid);
}
```

#### 오후 (13:00-18:00)
```javascript
// 9. 백업 시스템 구축
// scripts/backup.js
const { Storage } = require('@google-cloud/storage');

async function backupFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const bucket = `gs://${projectId}-backups`;
  const timestamp = new Date().toISOString();
  
  const backupPath = `backups/firestore-${timestamp}`;
  
  await admin.firestore().backup({
    bucketName: bucket,
    name: backupPath,
  });
  
  console.log(`Backup completed: ${backupPath}`);
}

// 10. 자동 백업 스케줄
// 매일 새벽 3시에 실행
const schedule = require('node-schedule');
schedule.scheduleJob('0 3 * * *', backupFirestore);
```

---

## 🔍 중점 확인 사항

### 1. 쿼리 최적화 체크리스트
- [ ] 모든 쿼리에 적절한 인덱스 생성
- [ ] 불필요한 필드 제외 (select 사용)
- [ ] 페이지네이션 구현 (limit + startAfter)
- [ ] 실시간 리스너 최소화
- [ ] 배치 작업 활용

### 2. 성능 모니터링
```javascript
// 쿼리 성능 측정
async function measureQueryPerformance(queryFn) {
  const start = performance.now();
  const result = await queryFn();
  const duration = performance.now() - start;
  
  console.log(`Query executed in ${duration}ms`);
  return { result, duration };
}
```

### 3. 비용 최적화
- 읽기 작업 최소화
- 캐싱 적극 활용
- 불필요한 실시간 업데이트 제거
- 적절한 데이터 구조 설계

---

## 📊 체크리스트

### 필수 완료 항목
- [ ] 모든 Firestore 인덱스 생성
- [ ] 보안 규칙 업데이트 및 테스트
- [ ] API 캐싱 구현
- [ ] Rate limiting 적용
- [ ] 목업 데이터 완전 제거
- [ ] 데이터 무결성 검증
- [ ] 백업 시스템 구축
- [ ] 성능 모니터링 대시보드

### 성능 목표
- [ ] API 평균 응답 시간 < 200ms
- [ ] Firestore 읽기 비용 50% 감소
- [ ] 동시 접속자 1000명 처리 가능
- [ ] 에러율 < 0.1%

---

## 🚨 주의사항

1. **데이터 마이그레이션**
   - 반드시 백업 후 진행
   - 단계별 검증 필수
   - 롤백 계획 수립

2. **보안 규칙**
   - 최소 권한 원칙 적용
   - 관리자 권한 별도 검증
   - 민감 데이터 암호화

3. **성능 테스트**
   - 실제 환경과 유사한 데이터로 테스트
   - 부하 테스트 필수
   - 병목 지점 파악 및 개선

---

## 📁 주요 작업 파일

### Firebase 설정
- `/firestore.rules` - 보안 규칙
- `/firestore.indexes.json` - 인덱스 정의
- `/src/lib/firebase/admin.ts` - Admin SDK

### API 최적화
- `/src/app/api/*` - API 라우트
- `/src/actions/*` - Server Actions
- `/src/lib/cache.ts` - 캐싱 로직

### 데이터 관리
- `/scripts/migration/*` - 마이그레이션 스크립트
- `/scripts/backup.js` - 백업 스크립트
- `/src/lib/firebase/queries.ts` - 쿼리 최적화

---

## 🎯 최종 목표

### 완료 기준
1. 모든 API 응답 시간 < 200ms
2. Firestore 비용 50% 감소
3. 목업 데이터 0개
4. 데이터 무결성 100%
5. 백업 시스템 가동

### 산출물
1. 성능 최적화 보고서
2. 데이터베이스 스키마 문서
3. API 문서
4. 백업/복구 가이드

---

## 💡 참고 자료
- [Firestore 성능 가이드](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase 보안 규칙](https://firebase.google.com/docs/rules)
- [Next.js API 최적화](https://nextjs.org/docs/api-routes/introduction)

---

**작성자**: PM Claude  
**최종 수정**: 2025년 1월 3일