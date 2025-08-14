# Vercel Firebase 설정 가이드

## 현재 상황

현재 시스템은 Mock 데이터를 사용하고 있습니다. 실제 Firebase 데이터를 사용하려면 다음 설정이 필요합니다.

## 1. Firebase 서비스 계정 키 설정

### 방법 1: Firebase Console에서 키 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. 프로젝트 설정 (톱니바퀴 아이콘)
4. 서비스 계정 탭
5. "새 비공개 키 생성" 클릭
6. JSON 파일 다운로드

### 방법 2: Vercel 환경 변수 설정

#### Option A: 전체 JSON을 환경 변수로
```bash
# Vercel 대시보드에서
FIREBASE_SERVICE_ACCOUNT_KEY = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

#### Option B: Base64 인코딩 (권장)
```bash
# 로컬에서
base64 -i serviceAccountKey.json | tr -d '\n' > encoded.txt

# Vercel에서
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 = [encoded.txt의 내용]
```

## 2. 데이터 소스 강제 활성화

Firebase를 강제로 사용하려면:

```bash
# Vercel 환경 변수
FORCE_DATA_SOURCE = firebase
```

## 3. 현재 Mock 데이터 구조

### 실시간 모니터링 데이터
```typescript
{
  activeUsers: [
    {
      userId: string,
      email: string,
      currentPage: string,
      lastActivity: Date,
      status: 'reading' | 'browsing'
    }
  ],
  activeSessions: number,
  todayReadings: number,
  performance: {
    averageResponseTime: number,
    errorRate: number,
    requestsPerMinute: number,
    totalRequests: number
  },
  systemStatus: 'healthy' | 'warning' | 'critical'
}
```

### 블로그 데이터
```typescript
{
  id: string,
  title: string,
  content: string,
  author: string,
  publishedAt: Date,
  status: 'published' | 'draft',
  tags: string[],
  viewCount: number
}
```

## 4. Firebase 데이터 구조 설정

### Firestore Collections

1. **users** - 사용자 정보
   ```
   /users/{userId}
   - email: string
   - displayName: string
   - lastActivity: timestamp
   - createdAt: timestamp
   ```

2. **readings** - 타로/꿈 리딩 기록
   ```
   /readings/{readingId}
   - userId: string
   - type: 'tarot' | 'dream'
   - question: string
   - interpretation: string
   - createdAt: timestamp
   ```

3. **stats** - 통계 데이터
   ```
   /stats/current
   - totalUsers: number
   - totalReadings: number
   - lastUpdated: timestamp
   
   /stats/hourly/{date}/{hour}
   - readings: number
   - users: number
   ```

4. **blog_posts** - 블로그 포스트
   ```
   /blog_posts/{postId}
   - title: string
   - content: string
   - author: string
   - publishedAt: timestamp
   - status: 'published' | 'draft'
   - tags: array
   - viewCount: number
   ```

### Realtime Database Structure
```
{
  "stats": {
    "current": {
      "activeUsers": 10,
      "todayReadings": 42,
      "averageResponseTime": 250
    }
  },
  "sessions": {
    "userId": {
      "currentPage": "/tarot",
      "lastActivity": 1234567890,
      "status": "active"
    }
  }
}
```

## 5. 즉시 사용 가능한 임시 해결책

Mock 데이터를 더 현실적으로 만들려면:

1. `/src/lib/admin/data-sources/mock-data-source.ts` 수정
2. 실제 같은 데이터 패턴 추가
3. 시간에 따른 변화 시뮬레이션

## 6. 블로그 마이그레이션 단계

### Phase 1: 데이터 읽기
- 현재 파일 시스템에서 읽기
- Firebase에서 읽기 (폴백)

### Phase 2: 듀얼 라이트
- 파일과 Firebase 모두에 쓰기
- 데이터 동기화 확인

### Phase 3: Firebase 전환
- Firebase를 주 데이터 소스로
- 파일 시스템은 백업용

### Phase 4: 파일 시스템 제거
- 모든 작업을 Firebase로
- 파일 시스템 코드 제거

## 7. 테스트 방법

```bash
# 로컬에서 Firebase 테스트
FORCE_DATA_SOURCE=firebase npm run dev

# Mock 데이터 테스트
FORCE_DATA_SOURCE=mock npm run dev
```

## 8. 모니터링

- Vercel Functions 로그 확인
- Firebase Console에서 사용량 모니터링
- 에러 발생 시 Mock으로 자동 폴백

## 문의사항

추가 설정이 필요하거나 문제가 발생하면 알려주세요.