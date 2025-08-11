# 다음 세션을 위한 작업 지침서

## 🎯 현재 상황 요약

### 완료된 작업
1. **tarot-guidelines 페이지 관리자 전용 변환 완료**
   - `/src/app/tarot-guidelines/page.tsx` 파일 수정 완료
   - 관리자가 아닌 사용자 접근 시 제한 페이지 표시하도록 구현
   - 관리자는 `/admin?tab=tarot-guidelines`로 자동 리다이렉트

2. **관리자 대시보드 업데이트 완료**
   - `/src/app/admin/page.tsx` 파일 수정 완료
   - 탭 이름을 `tarot-instructions`에서 `tarot-guidelines`로 변경
   - 기본 활성 탭을 `tarot-guidelines`로 설정

### 미해결 이슈
1. **서버 빌드 문제**
   - `.next/server/app-paths-manifest.json` 파일 누락 에러
   - 많은 static 파일 404 에러 발생
   - AuthContext 초기화 문제로 페이지가 제대로 렌더링되지 않음

2. **인증 상태 확인 무한 로딩**
   - "관리자 권한을 확인하는 중..." 상태에서 멈춤
   - 실제 페이지 컴포넌트가 마운트되지 않음

## 🔧 다음 세션 시작 시 필요한 작업

### 1. 서버 완전 재시작
```bash
# 모든 Node 프로세스 종료
ps aux | grep node | awk '{print $2}' | xargs -r kill -9

# 캐시 및 빌드 파일 완전 삭제
rm -rf .next/ node_modules/.cache

# 개발 서버 시작
npm run dev
```

### 2. 빌드 확인
```bash
# 빌드가 정상적으로 완료되는지 확인
npm run build

# 빌드 성공 시 프로덕션 모드로 테스트
npm run start
```

### 3. AuthContext 문제 해결
- `/src/context/AuthContext.tsx` 파일 확인
- Firebase 초기화 관련 문제 점검
- 로딩 상태가 무한히 지속되는 원인 파악

### 4. 수정된 파일 목록
- `/src/app/tarot-guidelines/page.tsx` - 관리자 전용 접근 제어 추가
- `/src/app/admin/page.tsx` - 타로 지침 탭 활성화

## 📋 검증 체크리스트

### Playwright로 확인할 항목
1. [ ] `/tarot-guidelines` 접속 시 관리자 전용 페이지 메시지 표시
2. [ ] Lock 아이콘과 "관리자 전용 페이지" 텍스트 확인
3. [ ] "관리자 대시보드로 이동" 버튼 작동 확인
4. [ ] `/admin?tab=tarot-guidelines`로 정상 이동
5. [ ] 관리자 대시보드에서 타로 지침 탭 활성화 확인
6. [ ] TarotGuidelineManagement 컴포넌트 정상 작동 확인

## 🚨 주의사항

1. **Git 커밋 금지**: SWARM PM 지침에 따라 사용자 승인 없이 절대 커밋하지 않음
2. **Vercel 배포 우선**: 로컬 테스트보다 Vercel 배포 후 확인 우선
3. **추정 금지**: 모든 기능은 Playwright로 직접 확인

## 💡 추가 권장사항

1. **환경 변수 확인**
   - `.env.local` 파일에 Firebase 관련 설정 확인
   - 필요한 환경 변수가 모두 설정되어 있는지 점검

2. **의존성 재설치**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Firebase 연결 상태 확인**
   - Firebase Console에서 프로젝트 상태 확인
   - 인증 서비스가 활성화되어 있는지 점검

## 📅 다음 세션 우선순위

1. **High**: 서버 빌드 문제 해결
2. **High**: AuthContext 무한 로딩 문제 수정
3. **Medium**: Playwright로 전체 기능 검증
4. **Low**: 성능 최적화 및 코드 정리

---

**작성일**: 2025-08-06  
**작성자**: SWARM PM  
**프로젝트**: test-studio-firebase  
**작업 ID**: #001 - tarot-guidelines 관리자 전용 이전