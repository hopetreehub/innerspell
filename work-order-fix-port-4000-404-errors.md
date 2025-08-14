# 작업지시서: 포트 4000 개발 서버 404 오류 해결

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로 리딩 시스템
- **작업 요청자**: 사용자
- **작업 관리자**: SWARM PM
- **작업일**: 2025-08-14
- **우선순위**: 🔴 긴급 (High Priority)

## 🔍 문제 상황
포트 4000에서 개발 서버 실행 시 다음 리소스들이 404 오류 발생:
- `/_next/static/css/app/layout.css`
- `/_next/static/chunks/main-app.js`
- `/_next/static/chunks/app/page.js`
- `.well-known/appspecific/com.chrome.devtools.json`

### 로그 분석
```
GET /_next/static/css/app/layout.css?v=1755132876072 404 in 408ms
GET /_next/static/chunks/main-app.js?v=1755132876072 404 in 429ms
GET /_next/static/chunks/app/page.js 404 in 144ms
⨯ [Error: ENOENT: no such file or directory, open '.next/server/app/_not-found/page.js']
```

## 🎯 작업 목표
1. **Next.js 빌드 캐시 문제 해결**
2. **개발 서버 정상 작동 확보**
3. **404 오류 제거**
4. **안정적인 개발 환경 복구**

## 👥 작업 배정

### **SuperClaude (풀스택 개발자)**
- 빌드 캐시 정리
- Next.js 설정 점검
- 개발 서버 재시작 및 검증

## 📝 작업 단계

### Phase 1: 즉시 조치 (10분)

1. **개발 서버 중지**
   ```bash
   # 현재 실행 중인 개발 서버 종료
   # Ctrl+C 또는 프로세스 종료
   ```

2. **빌드 캐시 및 임시 파일 완전 정리**
   ```bash
   # .next 폴더 삭제
   rm -rf .next
   
   # node_modules/.cache 삭제
   rm -rf node_modules/.cache
   
   # 임시 파일 정리
   rm -rf .swc
   ```

3. **개발 서버 재시작**
   ```bash
   # 포트 4000으로 개발 서버 시작
   npm run dev
   ```

### Phase 2: 근본 원인 분석 (15분)

1. **Next.js 설정 파일 점검**
   ```typescript
   // next.config.mjs 확인
   // - swcMinify 설정
   // - experimental 옵션
   // - 빌드 관련 설정
   ```

2. **package.json 스크립트 확인**
   ```json
   // dev 스크립트가 올바른지 확인
   "scripts": {
     "dev": "next dev --hostname 0.0.0.0 --port 4000"
   }
   ```

3. **파일 시스템 권한 확인**
   ```bash
   # .next 폴더 생성 권한 확인
   ls -la | grep .next
   
   # 필요시 권한 수정
   chmod -R 755 .
   ```

### Phase 3: 문제 해결 방안 (20분)

#### 방안 1: Clean Install
```bash
# 1. 모든 캐시 정리
rm -rf .next node_modules package-lock.json

# 2. 의존성 재설치
npm install

# 3. 개발 서버 시작
npm run dev
```

#### 방안 2: Next.js 버전 확인 및 조정
```bash
# 현재 Next.js 버전 확인
npm list next

# 필요시 안정 버전으로 다운그레이드
npm install next@15.0.3
```

#### 방안 3: 개발 서버 설정 조정
```javascript
// next.config.mjs에 추가
const nextConfig = {
  // 개발 모드 최적화
  reactStrictMode: true,
  swcMinify: true,
  
  // 실험적 기능 비활성화
  experimental: {
    appDir: true,
    // 문제가 되는 기능 비활성화
    optimizeCss: false,
    optimizePackageImports: []
  },
  
  // 웹팩 설정
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 개발 모드에서 캐시 설정
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      };
    }
    return config;
  }
};
```

### Phase 4: 검증 및 모니터링 (10분)

1. **브라우저 캐시 정리**
   - 개발자 도구 열기 (F12)
   - Network 탭에서 "Disable cache" 체크
   - 페이지 강제 새로고침 (Ctrl+Shift+R)

2. **개발 서버 로그 모니터링**
   ```bash
   # 실시간 로그 확인
   tail -f dev-server.log
   ```

3. **리소스 로딩 확인**
   - 브라우저 개발자 도구 Network 탭
   - 404 오류 발생 여부 확인
   - 모든 정적 리소스 정상 로드 확인

## 🛠️ 추가 해결 방안

### 환경 변수 문제 확인
```bash
# .env.local 파일 확인
cat .env.local

# 필수 환경 변수 존재 여부 확인
```

### 포트 충돌 확인
```bash
# 포트 4000 사용 중인 프로세스 확인
lsof -i :4000

# 필요시 프로세스 종료
kill -9 [PID]
```

### WSL 특수 상황 대응 (Windows WSL 환경)
```bash
# WSL 파일 시스템 권한 문제 해결
sudo chown -R $(whoami) .
sudo chmod -R 755 .

# WSL 네트워크 문제 해결
# Windows 방화벽에서 포트 4000 허용
```

## ⚠️ 주의사항

1. **데이터 보존**
   - 저장된 타로 리딩 데이터 백업
   - 환경 설정 파일 백업

2. **단계적 접근**
   - 한 번에 하나의 해결책만 시도
   - 각 단계 후 테스트 수행

3. **로그 기록**
   - 모든 오류 메시지 기록
   - 해결 과정 문서화

## 📊 성공 기준
1. ✅ 404 오류 없이 홈페이지 정상 로드
2. ✅ 모든 정적 리소스 정상 로드
3. ✅ 타로 리딩 페이지 정상 작동
4. ✅ 콘솔에 오류 메시지 없음
5. ✅ 개발 서버 안정적 실행

## 🔄 진행 상황 체크포인트
- [ ] Phase 1 완료: 즉시 조치 수행
- [ ] Phase 2 완료: 원인 분석
- [ ] Phase 3 완료: 문제 해결
- [ ] Phase 4 완료: 검증 완료

## 📅 예상 소요 시간
- 총 작업 시간: 55분
- 즉시 조치: 10분
- 문제 해결: 35분
- 검증: 10분

## 🚨 에스컬레이션
문제가 지속될 경우:
1. Next.js GitHub 이슈 확인
2. Next.js 15.3.3 알려진 버그 확인
3. 안정 버전으로 다운그레이드 고려

---

**PM 승인 필요**

포트 4000 개발 서버의 404 오류를 해결하여 
안정적인 개발 환경을 복구하는 작업입니다.

승인 후 즉시 Phase 1부터 체계적으로 진행하겠습니다.