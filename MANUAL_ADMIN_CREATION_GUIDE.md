# 🔧 수동 관리자 계정 생성 가이드

## 🚨 현재 상황
- ✅ Firebase Admin SDK 초기화 성공
- ❌ 서비스 계정 권한 부족으로 API 계정 생성 실패
- 🎯 **해결책**: Firebase Console에서 수동 계정 생성

## 📋 Firebase Console에서 직접 계정 생성

### 1️⃣ Firebase Authentication 접속
```
https://console.firebase.google.com/project/innerspell-an7ce/authentication/users
```

### 2️⃣ 사용자 추가
1. **"사용자 추가"** 버튼 클릭
2. **이메일**: `admin@innerspell.com`
3. **비밀번호**: `admin123`
4. **"사용자 추가"** 클릭

### 3️⃣ 관리자 권한 설정 (Firestore)
Firestore에서 관리자 프로필 생성:

**Collection**: `users`
**Document ID**: `[생성된 UID]`
**Data**:
```json
{
  "email": "admin@innerspell.com",
  "displayName": "관리자",
  "role": "admin",
  "subscriptionStatus": "premium",
  "createdAt": "2025-07-28T11:00:00Z",
  "updatedAt": "2025-07-28T11:00:00Z"
}
```

## 🔄 즉시 테스트

### 로그인 테스트
1. **로그인 페이지 접속**: http://localhost:4000/auth/signin
2. **이메일**: admin@innerspell.com
3. **비밀번호**: admin123
4. **로그인** 버튼 클릭

### 관리자 페이지 접근
- http://localhost:4000/admin

## 🛠️ 자동화된 Firestore 설정

Firebase Console에서 계정 생성 후, 다음 스크립트로 관리자 권한 자동 설정: