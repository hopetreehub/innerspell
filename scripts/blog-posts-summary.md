# 블로그 포스트 마이그레이션 요약

## 전체 포스트 목록 (12개)

### 1. 타로카드 기초 가이드 2025
- **ID**: `tarot-basics-2025`
- **카테고리**: tarot
- **주요 포스트**: ✅
- **조회수**: 800

### 2. 명상 입문 가이드
- **ID**: `meditation-guide-2025`
- **카테고리**: meditation
- **주요 포스트**: ✅
- **조회수**: 650

### 3. 꿈해몽 기초 해석법
- **ID**: `dream-interpretation-basics`
- **카테고리**: dream
- **주요 포스트**: ❌
- **조회수**: 450

### 4. 타로 스프레드 완벽 가이드
- **ID**: `tarot-spread-complete-guide`
- **카테고리**: tarot
- **주요 포스트**: ✅
- **조회수**: 1,250

### 5. 영성과 생산성의 조화
- **ID**: `spiritual-productivity-2025`
- **카테고리**: lifestyle
- **주요 포스트**: ✅
- **조회수**: 920

### 6. AI 시대의 타로
- **ID**: `ai-tarot-integration`
- **카테고리**: tarot
- **주요 포스트**: ✅
- **조회수**: 1,100

### 7. 꿈 일기의 힘
- **ID**: `dream-journal-power`
- **카테고리**: dream
- **주요 포스트**: ❌
- **조회수**: 680

### 8. 2025년 타로 신년 운세
- **ID**: `tarot-2025-new-year-guide`
- **카테고리**: tarot
- **주요 포스트**: ✅
- **조회수**: 2,100

### 9. AI 타로의 미래
- **ID**: `ai-tarot-future-guide`
- **카테고리**: tarot
- **주요 포스트**: ✅
- **조회수**: 1,450

### 10. 꿈의 심리학
- **ID**: `dream-meaning-psychology`
- **카테고리**: dream
- **주요 포스트**: ✅
- **조회수**: 890

### 11. 타로 명상
- **ID**: `tarot-meditation-practice`
- **카테고리**: meditation
- **주요 포스트**: ❌
- **조회수**: 720

### 12. 현대인을 위한 영성 가이드
- **ID**: `modern-spirituality-guide`
- **카테고리**: lifestyle
- **주요 포스트**: ✅
- **조회수**: 980

## 통계 요약

- **총 포스트 수**: 12개
- **카테고리별 분포**:
  - tarot: 5개
  - dream: 3개
  - meditation: 2개
  - lifestyle: 2개
- **주요 포스트**: 9개
- **총 조회수**: 11,990회
- **평균 조회수**: 999회

## 마이그레이션 명령어

```bash
# 마이그레이션 스크립트 실행
node scripts/complete-blog-migration.js

# 특정 포스트만 마이그레이션 (예시)
node scripts/migrate-single-post.js tarot-basics-2025
```

## 주의사항

1. 각 포스트의 `content` 필드는 매우 길어서 별도 처리 필요
2. `publishedAt` 날짜는 2025-01-20 기준으로 랜덤하게 설정됨
3. 이미지 경로는 `/images/` 디렉토리 기준
4. 모든 포스트는 `published: true` 상태로 설정됨