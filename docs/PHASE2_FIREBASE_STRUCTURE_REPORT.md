# Phase 2: Firebase 데이터 구조 생성 - 진행 중

## 📊 현재 상태

### 1. Firebase 구조 설정 스크립트
- ✅ `setup-firebase-structure.ts` 작성 완료
- ✅ 필요한 모든 컬렉션 구조 정의
- ✅ 초기 데이터 및 인덱스 설정 포함

### 2. 로컬 환경 문제
- ❌ Firebase 서비스 계정 키 없음
- ❌ Application Default Credentials 설정 안됨
- 결과: 로컬에서 Firestore 쓰기 작업 불가

## 🔍 발견된 문제점

### 1. 인증 문제
```
Error: Could not load the default credentials
```
- 로컬 환경에 Firebase 인증 정보가 없음
- Vercel 환경에서만 작동 가능

### 2. 해결 방법
1. **옵션 1**: Firebase 서비스 계정 키를 로컬에 설정
2. **옵션 2**: Vercel에 배포 후 실행
3. **옵션 3**: Firebase Emulator 사용

## 📋 생성될 Firebase 구조

### 컬렉션 구조:
```
firestore-root/
├── stats/
│   ├── _index (메타데이터)
│   ├── hourly/
│   ├── daily/
│   ├── monthly/
│   └── realtime
├── users/
│   └── _index
├── readings/
│   └── _index
├── blogPosts/
│   └── _index
├── system/
│   ├── config
│   └── status
└── _metadata/
    └── collections
```

### 필요한 복합 인덱스:
1. **users**: lastActivity (DESC), status (ASC)
2. **readings**: userId (ASC), createdAt (DESC)
3. **blogPosts**: status (ASC), publishedAt (DESC)

## 🛠️ 다음 단계

### 즉시 필요한 작업:

1. **Firebase 인증 설정**
   - Vercel에서 실행하거나
   - 로컬에 서비스 계정 키 설정

2. **구조 생성 실행**
   ```bash
   node scripts/run-firebase-setup.js
   ```

3. **Firebase Console에서 인덱스 생성**
   - 복합 인덱스는 수동으로 생성 필요

### Vercel 배포 후 실행 방법:
1. 스크립트를 Vercel Functions로 변환
2. 또는 로컬에서 Vercel 환경변수 사용

## 🚀 권장사항

현재 상황에서는 다음 중 하나를 선택해야 합니다:

1. **Vercel에 먼저 배포**
   - 현재 코드를 Vercel에 배포
   - Vercel 환경에서 Firebase 구조 생성 실행

2. **로컬 Firebase 설정**
   - Firebase 서비스 계정 키를 로컬에 추가
   - `.env.local`에 `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` 설정

3. **Mock 데이터로 계속 개발**
   - Phase 3-4를 Mock 데이터로 진행
   - Vercel 배포 후 Firebase 전환

## 📝 결론

Firebase 구조 설정 스크립트는 준비되었지만, 로컬 환경의 인증 문제로 실행할 수 없습니다. Vercel 환경에서는 이미 설정된 `FIREBASE_SERVICE_ACCOUNT_KEY`를 사용하여 정상 작동할 것으로 예상됩니다.