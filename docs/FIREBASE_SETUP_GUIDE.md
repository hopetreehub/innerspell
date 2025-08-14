# Firebase 구조 설정 가이드

## 🚀 Vercel 배포 후 Firebase 구조 생성

### 1. API 엔드포인트를 통한 설정

Vercel에 배포한 후, 다음 API를 호출하여 Firebase 구조를 생성합니다:

```bash
# 기본 시크릿 키 사용
curl -X POST https://your-app.vercel.app/api/admin/setup-firebase \
  -H "Content-Type: application/json" \
  -d '{"secret": "setup-innerspell-2024"}'

# 또는 환경변수로 설정한 시크릿 사용
curl -X POST https://your-app.vercel.app/api/admin/setup-firebase \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-custom-secret"}'
```

### 2. 환경변수 설정 (선택사항)

보안을 위해 Vercel 환경변수에 커스텀 시크릿 설정:
```
FIREBASE_SETUP_SECRET=your-custom-secret
```

### 3. 예상 응답

성공 시:
```json
{
  "success": true,
  "created": {
    "indexes": 4,
    "stats": 3,
    "system": 3,
    "sample": 1
  },
  "errors": [],
  "message": "Firebase structure setup completed",
  "timestamp": "2024-01-14T10:00:00.000Z"
}
```

## 📋 생성되는 구조

### 컬렉션 및 문서:

1. **통계 (stats)**
   - `_index`: 메타데이터
   - `daily/{month}/{date}`: 일일 통계
   - `monthly/{year}/{month}`: 월간 통계
   - `realtime`: 실시간 통계

2. **사용자 (users)**
   - `_index`: 사용자 메타데이터

3. **리딩 (readings)**
   - `_index`: 리딩 메타데이터

4. **블로그 (blogPosts)**
   - `_index`: 블로그 메타데이터
   - 샘플 포스트 1개

5. **시스템 (system)**
   - `config`: 시스템 설정
   - `status`: 서비스 상태

6. **메타데이터 (_metadata)**
   - `collections`: 컬렉션 권한 정보

## 🔧 Firebase Console 설정

### 복합 인덱스 생성 (필수):

Firebase Console > Firestore Database > 인덱스에서 다음 인덱스 생성:

1. **users 컬렉션**
   - Field: `lastActivity` (Descending)
   - Field: `status` (Ascending)

2. **readings 컬렉션**
   - Field: `userId` (Ascending)
   - Field: `createdAt` (Descending)

3. **blogPosts 컬렉션**
   - Field: `status` (Ascending)
   - Field: `publishedAt` (Descending)

## 🔍 확인 방법

1. **Firebase Console에서 확인**
   - Firestore Database에서 컬렉션 생성 확인
   - 각 문서의 데이터 확인

2. **관리자 페이지에서 확인**
   - `/admin` 페이지에서 "Firebase 연결됨" 표시 확인
   - 통계 데이터가 0으로 표시되는지 확인

3. **API로 상태 확인**
   ```bash
   curl https://your-app.vercel.app/api/admin/firebase-status
   ```

## ⚠️ 주의사항

1. 이 설정은 한 번만 실행하면 됩니다
2. 중복 실행 시 기존 데이터를 덮어씁니다
3. Production 환경에서는 시크릿 키를 안전하게 관리하세요
4. 복합 인덱스는 수동으로 생성해야 합니다

## 🆘 문제 해결

### "Unauthorized" 오류
- 시크릿 키가 올바른지 확인
- 환경변수가 제대로 설정되었는지 확인

### "This endpoint can only be run on Vercel" 오류
- 로컬에서는 실행할 수 없습니다
- Vercel에 배포 후 실행하세요

### Firebase 권한 오류
- Firebase 서비스 계정 키가 올바른지 확인
- Vercel 환경변수에 `FIREBASE_SERVICE_ACCOUNT_KEY` 설정 확인