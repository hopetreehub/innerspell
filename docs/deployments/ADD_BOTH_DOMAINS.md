# 🚨 Firebase에 두 도메인 모두 추가 필요!

## 추가해야 할 도메인들:
1. ✅ `innerspell-tarot.vercel.app` 
2. ❌ `test-studio-firebase.vercel.app` (현재 오류 발생 중)

## 🔥 즉시 해결 방법

### 1. Firebase Console 접속
👉 **[클릭하여 바로 이동](https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings)**

### 2. Authorized domains 섹션에서
1. **"Add domain"** 버튼 클릭
2. 다음 도메인 입력: `test-studio-firebase.vercel.app`
3. **"Add"** 클릭

### 3. 확인
현재 등록되어야 할 도메인 목록:
- ✅ `localhost`
- ✅ `innerspell-an7ce.firebaseapp.com`
- ✅ `innerspell-an7ce.web.app`
- ✅ `innerspell-tarot.vercel.app` (이미 추가했다면)
- ❌ `test-studio-firebase.vercel.app` (지금 추가 필요!)

## 💡 왜 두 개의 도메인이 필요한가?
- `innerspell-tarot.vercel.app` - 프로덕션 도메인
- `test-studio-firebase.vercel.app` - 개발/테스트 도메인

두 도메인 모두에서 접속할 수 있도록 모두 추가해야 합니다.

---
⚡ 도메인 추가는 즉시 적용됩니다!