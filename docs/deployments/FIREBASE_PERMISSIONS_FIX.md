# 🔧 Firebase 서비스 계정 권한 문제 해결

## 🚨 현재 상황
- ✅ Firebase Admin SDK 성공적으로 초기화됨
- ✅ 서비스 계정 키 정상 설정됨
- ❌ 서비스 계정에 필요한 권한 부족

## 📋 오류 분석
```
Error: Caller does not have required permission to use project innerspell-an7ce. 
Grant the caller the roles/serviceusage.serviceUsageConsumer role
```

**문제**: 서비스 계정이 Firebase Auth API를 사용할 권한이 없음

## 🛠️ 해결 방법

### 1️⃣ Google Cloud Console에서 권한 부여

**접속 URL:**
```
https://console.developers.google.com/iam-admin/iam/project?project=innerspell-an7ce
```

**필요한 역할 추가:**
1. **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`)
2. **Firebase Admin** (`roles/firebase.admin`)
3. **Project Editor** (`roles/editor`) - 또는 더 구체적인 권한

### 2️⃣ 서비스 계정 찾기
서비스 계정 이메일: `firebase-adminsdk-fbsvc@innerspell-an7ce.iam.gserviceaccount.com`

### 3️⃣ 권한 부여 절차
1. IAM 페이지에서 서비스 계정 찾기
2. "편집" 버튼 클릭
3. "역할 추가" 클릭
4. 다음 역할들 추가:
   - **Service Usage Consumer**
   - **Firebase Admin SDK Administrator Service Agent**
   - **Identity and Access Management (IAM) Security Reviewer**

### 4️⃣ Firebase Console에서 확인
```
https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk
```

### 5️⃣ 대안: 새 서비스 계정 생성
현재 서비스 계정에 문제가 있다면:
1. Firebase Console → Project Settings → Service Accounts
2. "Generate new private key" 클릭
3. 새 JSON 파일 다운로드
4. 기존 키 교체

## 🔄 테스트 명령어
권한 설정 후 테스트:
```bash
curl http://localhost:4000/api/create-admin
```

## 🎯 예상 결과
```json
{
  "success": true,
  "message": "관리자 계정이 성공적으로 생성되었습니다",
  "user": {
    "uid": "...",
    "email": "admin@innerspell.com",
    "role": "admin"
  },
  "credentials": {
    "email": "admin@innerspell.com",
    "password": "admin123"
  }
}
```

## ⚡ 빠른 해결 (임시)
현재 서비스 계정 대신 새로운 키를 생성하여 더 높은 권한으로 설정할 수 있습니다.

---

**다음 단계**: Google Cloud Console에서 서비스 계정 권한을 부여한 후 다시 테스트