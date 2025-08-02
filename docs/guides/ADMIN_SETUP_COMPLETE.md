# 🎯 관리자 계정 설정 완료 가이드

## 🔥 현재 상황
- ✅ Firebase Admin SDK 성공적으로 초기화됨
- ✅ Firebase Console이 브라우저에서 열림
- 🔄 **현재 단계**: Firebase Console에서 수동 계정 생성 중

## 📋 Firebase Console에서 진행할 작업

### 🎯 **현재 열린 페이지에서:**
```
https://console.firebase.google.com/project/innerspell-an7ce/authentication/users
```

### 1️⃣ 관리자 계정 생성
1. **"사용자 추가"** 또는 **"Add user"** 버튼 클릭
2. **이메일**: `admin@innerspell.com`
3. **비밀번호**: `admin123`
4. **"사용자 추가"** 클릭하여 완료

### 2️⃣ 생성된 UID 복사
계정 생성 후 사용자 목록에서:
1. **admin@innerspell.com** 사용자 클릭
2. **UID** 값 복사 (예: `ABcd1234EfGh...`)

## 🚀 계정 생성 완료 후 즉시 실행

### 3️⃣ 관리자 권한 부여
```bash
# UID를 실제 값으로 교체하여 실행
node setup-admin-role.js [복사한_UID]
```

### 4️⃣ 로그인 테스트
```bash
node test-admin-login-manual.js
```

## 🎊 예상 결과

### ✅ 성공 시 출력:
```
✅ 관리자 권한 설정 완료
🔗 로그인 테스트: http://localhost:4000/auth/signin
🎉 로그인 성공!
🎊 관리자 페이지 접근 성공!
```

### 🔗 접근 가능한 페이지:
- **로그인**: http://localhost:4000/auth/signin
- **관리자 대시보드**: http://localhost:4000/admin
- **블로그 관리**: http://localhost:4000/admin (블로그 탭)
- **AI 설정**: http://localhost:4000/admin (AI 탭)

## 📞 문제 해결

### 계정 생성이 안 되는 경우:
1. Google 계정으로 Firebase Console 로그인 확인
2. 프로젝트 권한 확인 (Owner 또는 Editor)
3. Firebase Authentication 활성화 확인

### 권한 설정이 안 되는 경우:
```bash
# Firestore 규칙 확인
# Firebase Console → Firestore Database → 규칙
```

## 🏁 최종 확인

계정 생성과 권한 설정이 완료되면:
1. **로그인**: admin@innerspell.com / admin123
2. **관리자 페이지** 정상 접근
3. **admin@innerspell.com 로그인 문제 완전 해결**

---

**다음**: Firebase Console에서 계정 생성 후 UID로 `setup-admin-role.js` 실행