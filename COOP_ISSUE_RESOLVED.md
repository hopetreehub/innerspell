# COOP 경고 해결 완료

## 수정 사항
Next.js 설정에 다음 헤더를 추가했습니다:
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` - 팝업 허용
- `Cross-Origin-Embedder-Policy: unsafe-none` - 임베딩 허용

이제 Firebase Auth 팝업이 COOP 정책 경고 없이 작동합니다.

## 중요! 
하지만 여전히 가장 중요한 문제는 **Firebase 도메인 승인**입니다:

### 🚨 즉시 해결 필요:
1. [Firebase Console 접속](https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings)
2. **Authorized domains**에서 `innerspell-tarot.vercel.app` 추가
3. Google 로그인 재시도

도메인을 추가하면 모든 기능이 정상 작동합니다!