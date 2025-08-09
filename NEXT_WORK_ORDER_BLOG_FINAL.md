# 📋 블로그 시스템 최종 마무리 작업 지시서

## 🔍 현재 상황 분석 (2025-08-08)

### ✅ 완료된 사항
1. **프론트엔드 블로그 페이지** - 정상 작동 중
   - 블로그 목록 페이지에서 6개 포스트 정상 표시
   - 페이지네이션 구현 완료
   - 검색 및 필터 UI 구현
   - 인기 포스트/주요 포스트 사이드바 구현

2. **관리자 블로그 관리 시스템** - 기본 구조 구현 완료
   - 블로그 관리 탭 정상 접근
   - 새 포스트 작성 모달 UI 구현
   - 포스트 상태 요약 카드 표시

3. **백엔드 API** - 기본 구조 구현
   - getAllPosts 함수 export 문제 해결됨
   - 파일 시스템 기반 데이터 저장소 구현

### ❌ 미완성 사항
1. **이미지 업로드 기능** - 미구현
2. **블로그 상세 페이지** - 확인 필요
3. **CRUD 실제 동작** - 생성/수정/삭제 기능 실제 테스트 필요
4. **태그 입력 필드** - UI에 누락

---

## 🎯 작업 목표 및 우선순위

### 1️⃣ 긴급 - 블로그 상세 페이지 검증 (30분)
**목표**: 블로그 상세 페이지가 정상적으로 작동하는지 확인

**작업 내용**:
1. `/blog/[id]` 라우트 동작 확인
2. 포스트 내용 정상 표시 여부 검증
3. 추천 포스트 표시 확인
4. SEO 메타데이터 확인

**검증 방법**:
```javascript
// Playwright로 상세 페이지 테스트
await page.goto('http://localhost:4000/blog');
await page.click('text=읽기'); // 첫 번째 포스트 클릭
// 상세 페이지 로드 확인
```

### 2️⃣ 중요 - 관리자 CRUD 실제 동작 테스트 (1시간)
**목표**: 관리자 패널에서 실제로 포스트 생성/수정/삭제가 작동하는지 확인

**작업 내용**:
1. 새 포스트 생성 테스트
   - 모든 필드 입력
   - 저장 후 목록에 표시 확인
   - 프론트엔드에 반영 확인

2. 기존 포스트 수정 테스트
   - 제목/내용 수정
   - 상태 변경 (초안↔게시됨)

3. 포스트 삭제 테스트
   - 삭제 확인 다이얼로그
   - 삭제 후 목록에서 제거 확인

### 3️⃣ 중요 - 이미지 업로드 기능 구현 (1.5시간)
**목표**: 블로그 포스트에 이미지를 업로드하고 표시할 수 있도록 구현

**구현 내용**:
1. **업로드 API 엔드포인트** (`/api/blog/upload/route.ts`)
   ```typescript
   - 파일 타입 검증 (jpg, png, webp)
   - 파일 크기 제한 (5MB)
   - /public/uploads/blog/ 디렉토리에 저장
   - 고유 파일명 생성
   ```

2. **ImageUpload 컴포넌트 수정**
   - 드래그 앤 드롭 지원
   - 업로드 진행률 표시
   - 미리보기 기능
   - 에러 처리

3. **관리자 모달에 통합**
   - 이미지 업로드 필드 추가
   - 업로드된 이미지 URL 자동 입력

### 4️⃣ 보통 - 태그 입력 필드 추가 (30분)
**목표**: 관리자 모달에 태그 입력 필드 추가

**구현 내용**:
- 태그 입력 UI 컴포넌트 추가
- 쉼표 구분 또는 칩 스타일 입력
- 자동완성 기능 (선택사항)

### 5️⃣ 최종 검증 - 전체 시스템 통합 테스트 (30분)
**목표**: 모든 기능이 통합되어 정상 작동하는지 최종 확인

**테스트 시나리오**:
1. 관리자 패널에서 이미지 포함 새 포스트 작성
2. 프론트엔드에서 새 포스트 확인
3. 상세 페이지에서 이미지 표시 확인
4. 포스트 수정 후 반영 확인
5. 포스트 삭제 후 목록에서 제거 확인

---

## 💻 기술 구현 가이드

### 이미지 업로드 디렉토리 생성
```bash
mkdir -p public/uploads/blog
```

### 이미지 업로드 API 구현
```typescript
// src/app/api/blog/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' }, 
        { status: 400 }
      );
    }
    
    // 파일 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '허용되지 않는 파일 형식입니다.' }, 
        { status: 400 }
      );
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. (최대 5MB)' }, 
        { status: 400 }
      );
    }
    
    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${timestamp}-${sanitizedName}`;
    const filepath = path.join(process.cwd(), 'public/uploads/blog', filename);
    
    await writeFile(filepath, buffer);
    
    return NextResponse.json({ 
      url: `/uploads/blog/${filename}`,
      filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '업로드 실패' }, 
      { status: 500 }
    );
  }
}
```

---

## ✅ 완료 기준

### 필수 요구사항
- [ ] 블로그 상세 페이지 정상 작동
- [ ] 관리자 패널에서 포스트 CRUD 모든 기능 작동
- [ ] 이미지 업로드 및 표시 정상 작동
- [ ] 태그 입력 필드 구현
- [ ] 프론트엔드와 백엔드 데이터 동기화

### 성능 요구사항
- [ ] 페이지 로드 시간 3초 이내
- [ ] 이미지 업로드 5MB 이내 10초 내 완료
- [ ] API 응답 시간 500ms 이내

### 품질 요구사항
- [ ] TypeScript 타입 오류 없음
- [ ] 콘솔 에러 없음
- [ ] 모든 기능 Playwright 테스트 통과

---

## 📊 예상 소요 시간
- **총 소요 시간**: 4시간
- **우선순위**:
  1. 블로그 상세 페이지 검증 (30분) - **필수**
  2. 관리자 CRUD 테스트 (1시간) - **필수**
  3. 이미지 업로드 구현 (1.5시간) - **중요**
  4. 태그 필드 추가 (30분) - **보통**
  5. 최종 통합 테스트 (30분) - **필수**

---

## ⚠️ 주의사항

### 포트 사용
- **개발 서버**: 반드시 포트 4000 사용
- **API 엔드포인트**: 4000번대 포트 사용
- **절대 3000번대 포트 사용 금지**

### 작업 원칙
- **추정 금지**: 모든 기능은 Playwright로 직접 확인
- **단계별 검증**: 각 단계 완료 후 즉시 테스트
- **스크린샷 증거**: 주요 단계마다 스크린샷 캡처
- **커밋 금지**: 사용자 명시적 승인 없이 GitHub 커밋 금지

### 보안 고려사항
- 파일 업로드 시 확장자 검증 철저히
- 파일명 sanitization 필수
- 업로드 디렉토리 권한 설정 확인

---

**작성일**: 2025-08-08  
**PM**: SWARM PM  
**상태**: 대기 중  
**목표**: 블로그 시스템 100% 완성도 달성