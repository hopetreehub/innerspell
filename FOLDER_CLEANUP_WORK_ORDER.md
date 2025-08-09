# 🧹 폴더 클린업 작업지시서

## 📋 프로젝트 정보
- **프로젝트명**: InnerSpell 타로점 서비스
- **작업일자**: 2025-08-09
- **작업단계**: Folder Cleanup Phase
- **포트**: 4000 (필수 고정)
- **PM 지휘**: SWARM PM 승인 후 진행

## 🎯 작업 목표

### 🗂️ 클린업 목표
- **프로젝트 용량**: 50% 이상 감소
- **파일 수**: 80% 이상 감소 (불필요한 파일)
- **폴더 구조**: 체계적 정리
- **개발 효율성**: 대폭 향상
- **Git 히스토리**: 깔끔하게 정리

## 📊 현재 프로젝트 분석

### 📈 파일 현황 (40,000+ 문자 초과)
**확인된 문제점**:
1. **테스트 파일 과다** - 200개+ 파일
2. **스크린샷 파일 과다** - 500개+ PNG 파일  
3. **로그 파일 누적** - 50개+ 로그 파일
4. **중복 작업지시서** - 30개+ MD 파일

### 💾 예상 용량 현황
- **전체 프로젝트**: 약 2-3GB
- **불필요한 파일**: 약 1.5-2GB (70%)
- **핵심 소스코드**: 약 500MB (30%)

## 🗑️ Phase 1: 대량 파일 제거 (30분)

### 1.1 테스트 및 디버그 파일 제거
**제거 대상 (200+ 파일)**:
```bash
# 테스트 스크립트들
test-*.js
check-*.js  
debug-*.js
verify-*.js
analyze-*.js
complete-*.js
direct-*.js
final-*.js
manual-*.js
playwright-*.js
quick-*.js
simple-*.js
comprehensive-*.js

# 특정 테스트 파일들
*-test.js
*-debug.js
*-verify.js
*-check.js
```

### 1.2 스크린샷 파일 대량 제거
**제거 대상 (500+ 파일)**:
```bash
# 관리자 관련 스크린샷
admin-*.png
step-*.png
screenshot-*.png

# 테스트 결과 스크린샷
test-*.png
error-*.png
final-*.png
verify-*.png
debug-*.png

# 날짜별 스크린샷
*-2025-*.png
blog-*.png
tarot-*.png
```

### 1.3 로그 파일 제거
**제거 대상**:
```bash
*.log
dev-server-*.log
server-*.log
error-*.log
clean-*.log
success-*.log
```

## 📁 Phase 2: 폴더 구조 정리 (20분)

### 2.1 제거할 폴더들
**전체 삭제 대상**:
```bash
admin-auth-bypass-screenshots/
admin-direct-access-screenshots/  
admin-test-screenshots/
ai-interpretation-test-screenshots/
chrome-extension-test-results/
complete-reading-screenshots/
complete-tarot-test-screenshots/
firebase-focused-screenshots/
firebase-test-screenshots/
innerspell/
qa-screenshots/
screenshots/ (일부 보관 후 나머지 삭제)
```

### 2.2 임시 파일 제거
**루트 디렉토리 정리**:
```bash
# 이미지 파일들
*.png (루트의 임시 스크린샷들)
*.svg (테스트용 이미지들)

# 임시 스크립트들
click_*.js
debug_*.js
fix_*.js
toggle_*.js

# 설정 임시 파일들
cookies.txt
*.spec.ts (테스트 파일)
```

## 📄 Phase 3: 문서 파일 정리 (10분)

### 3.1 작업지시서 통합
**보관할 중요 문서**:
- `CLAUDE.md` ✅ 보관
- `README.md` ✅ 보관  
- `PERFORMANCE_OPTIMIZATION_WORK_ORDER.md` ✅ 보관
- `LOADING_OPTIMIZATION_WORK_ORDER.md` ✅ 보관
- `FOLDER_CLEANUP_WORK_ORDER.md` ✅ 보관

**제거할 구 문서들**:
```bash
BLOG_*.md (구 블로그 작업지시서들)
WORK_ORDER_*.md (완료된 작업지시서들)
*_WORK_ORDER.md (중복된 작업지시서들)
*_REPORT.md (구 리포트들)
*_STATUS.md (구 상태 파일들)
*_GUIDE.md (중복 가이드들)
```

### 3.2 문서 아카이브
**아카이브 폴더 생성**:
```
/docs/
  ├── archive/ (완료된 작업지시서들)
  ├── current/ (현재 활성 문서들)
  └── reference/ (참조용 문서들)
```

## 🔧 Phase 4: 소스코드 최적화 (20분)

### 4.1 사용하지 않는 파일 제거
**검토 및 제거 대상**:
```bash
# 중복 컴포넌트 파일들
# 사용하지 않는 유틸리티들  
# 테스트용 더미 데이터들
# 구버전 백업 파일들
```

### 4.2 Import 정리
**작업 내용**:
1. 사용하지 않는 import 제거
2. 절대경로로 통일
3. 알파벳순 정렬

### 4.3 코드 포맷팅
```bash
# ESLint 및 Prettier 실행
npm run lint --fix
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"
```

## 📦 Phase 5: Package 최적화 (10분)

### 5.1 의존성 정리
```bash
# 사용하지 않는 패키지 찾기
npx depcheck

# Dev dependencies 정리
npm prune
```

### 5.2 node_modules 최적화
```bash
# 캐시 정리
npm cache clean --force

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Phase 6: 최종 검증 (10분)

### 6.1 프로젝트 동작 확인
**Playwright 검증**:
```javascript
// 클린업 후 전체 시스템 동작 확인
const verifyAfterCleanup = async () => {
  // 홈페이지 로딩 확인
  // 블로그 페이지 확인  
  // 관리자 페이지 확인
  // API 엔드포인트 확인
};
```

### 6.2 용량 및 성능 측정
```bash
# 프로젝트 크기 측정
du -sh .

# 파일 개수 확인  
find . -type f | wc -l

# 성능 재측정
```

## 📋 클린업 체크리스트

### ✅ Phase 1: 대량 파일 제거
- [ ] 테스트 스크립트 200+ 파일 삭제
- [ ] 스크린샷 500+ 파일 삭제  
- [ ] 로그 파일 50+ 파일 삭제
- [ ] 임시 파일들 정리

### ✅ Phase 2: 폴더 구조 정리
- [ ] 불필요한 폴더 10+ 개 삭제
- [ ] 루트 디렉토리 임시 파일 정리
- [ ] 폴더 구조 체계화

### ✅ Phase 3: 문서 정리
- [ ] 중요 문서 선별 보관
- [ ] 구 작업지시서 아카이브
- [ ] 문서 폴더 구조 정리

### ✅ Phase 4: 소스코드 최적화  
- [ ] 사용하지 않는 파일 제거
- [ ] Import 정리
- [ ] 코드 포맷팅

### ✅ Phase 5: Package 최적화
- [ ] 의존성 정리
- [ ] node_modules 최적화
- [ ] 캐시 정리

### ✅ Phase 6: 최종 검증
- [ ] Playwright 전체 시스템 확인
- [ ] 용량 및 성능 측정
- [ ] Git 상태 정리

## 🎲 성공 지표

### 📊 목표 달성 기준
- **프로젝트 용량**: 1.5GB → 500MB (67% 감소) ✅
- **파일 개수**: 2000+ → 500개 미만 (75% 감소) ✅  
- **폴더 정리**: 체계적 구조 완성 ✅
- **빌드 시간**: 30% 이상 단축 ✅
- **개발 효율성**: 대폭 향상 ✅

### 📈 추가 효과
- Git 클론 속도 3배 향상
- IDE 인덱싱 시간 50% 단축
- 파일 검색 속도 향상
- 프로젝트 이해도 향상

## ⚠️ 중요 주의사항

1. **백업 필수**: Git 커밋 후 클린업 진행
2. **기능 확인**: 각 단계별 Playwright 검증
3. **점진적 진행**: 한 번에 모든 파일 삭제 금지
4. **중요 파일 보호**: 소스코드 및 설정 파일 보호
5. **SWARM PM 승인**: 각 단계별 승인 하에 진행

## 🔄 클린업 실행 스크립트

```bash
#!/bin/bash
# cleanup-script.sh

echo "🧹 InnerSpell 프로젝트 클린업 시작..."

# Phase 1: 테스트 파일 제거
echo "📂 Phase 1: 테스트 파일 제거"
find . -name "test-*.js" -delete
find . -name "check-*.js" -delete
find . -name "debug-*.js" -delete
find . -name "verify-*.js" -delete

# Phase 2: 스크린샷 제거  
echo "🖼️ Phase 2: 스크린샷 파일 제거"
find . -name "*.png" -not -path "./public/*" -delete

# Phase 3: 로그 파일 제거
echo "📋 Phase 3: 로그 파일 제거"  
find . -name "*.log" -delete

# Phase 4: 빈 폴더 제거
echo "📁 Phase 4: 빈 폴더 제거"
find . -type d -empty -delete

echo "✅ 클린업 완료!"
echo "📊 용량 확인: $(du -sh .)"
```

---
**📅 예상 작업 시간**: 1시간 30분  
**👥 담당**: SuperClaude Cleanup Team  
**🎯 목표**: 깔끔하고 효율적인 프로젝트 구조 완성