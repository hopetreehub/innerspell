# Vercel 프로젝트 접근 권한 설정 가이드

## 🚨 현재 문제
- 프로젝트가 **Private** 상태여서 모든 요청이 로그인 페이지로 리디렉션됨
- JavaScript 파일을 요청해도 HTML (로그인 페이지)이 반환되어 MIME type 오류 발생

## ✅ 정식 해결 방법

### 방법 1: 완전 공개 (권장)
1. [Vercel Dashboard](https://vercel.com/dashboard) 로그인
2. `test-studio-firebase` 프로젝트 선택
3. **Settings** → **General** → **Project Access**
4. **Private** → **Public** 변경
5. 저장

### 방법 2: 비밀번호 보호
1. Vercel Dashboard에서 프로젝트 선택
2. **Settings** → **General** → **Password Protection**
3. 비밀번호 설정
4. 사용자에게 비밀번호 공유

### 방법 3: Vercel 인증 (특정 이메일만 허용)
```bash
# vercel.json에 추가
{
  "functions": {
    "api/auth/[...nextauth].ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 방법 4: 도메인 화이트리스트
1. **Settings** → **Domains**
2. 특정 도메인에서만 접근 가능하도록 설정

## 🔍 현재 상태 확인 방법

```bash
# 배포 URL 확인
npx vercel@latest ls

# 프로젝트 정보 확인
npx vercel@latest project inspect test-studio-firebase
```

## 💡 추천 설정

**개발/테스트 단계**: Public으로 설정
**프로덕션 단계**: 비밀번호 보호 또는 인증 설정

## 📝 설정 후 확인사항

1. 캐시 클리어: `Ctrl + Shift + R` (하드 리프레시)
2. 시크릿 모드에서 테스트
3. 모든 페이지 접근 가능 여부 확인

---
*작성일: 2025년 7월 29일*