#!/bin/bash

# Vercel 배포 스크립트
echo "🚀 InnerSpell Firebase 통합 버전 Vercel 배포 준비"
echo "============================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 빌드 테스트
echo -e "\n${YELLOW}1. 로컬 빌드 테스트 중...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패! 오류를 수정하고 다시 시도하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 빌드 성공${NC}"

# 2. TypeScript 타입 체크
echo -e "\n${YELLOW}2. TypeScript 타입 체크 중...${NC}"
npm run type-check 2>/dev/null || npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 타입 체크 실패! TypeScript 오류를 수정하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 타입 체크 통과${NC}"

# 3. 환경변수 체크리스트
echo -e "\n${YELLOW}3. Vercel 환경변수 체크리스트${NC}"
echo "다음 환경변수들이 Vercel에 설정되어 있는지 확인하세요:"
echo ""
echo "필수 환경변수:"
echo "  ✓ FIREBASE_SERVICE_ACCOUNT_KEY_BASE64"
echo "  ✓ NEXT_PUBLIC_FIREBASE_API_KEY"
echo "  ✓ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "  ✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "  ✓ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "  ✓ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "  ✓ NEXT_PUBLIC_FIREBASE_APP_ID"
echo "  ✓ ENCRYPTION_KEY"
echo "  ✓ BLOG_API_SECRET_KEY"
echo "  ✓ OPENAI_API_KEY (또는 다른 AI Provider Key)"
echo ""
echo "선택 환경변수:"
echo "  - FIREBASE_SETUP_SECRET (기본값: setup-innerspell-2024)"
echo "  - ADMIN_EMAILS"
echo ""

# 4. 배포 확인
echo -e "${YELLOW}4. 배포 준비 완료${NC}"
echo ""
echo "다음 명령어로 Vercel에 배포하세요:"
echo -e "${GREEN}vercel --prod${NC}"
echo ""
echo "또는 Git push로 자동 배포:"
echo -e "${GREEN}git push origin main${NC}"
echo ""

# 5. 배포 후 작업 안내
echo -e "${YELLOW}5. 배포 후 필수 작업${NC}"
echo ""
echo "1) Firebase 구조 생성 (처음 한 번만):"
echo "   curl -X POST https://your-app.vercel.app/api/admin/setup-firebase \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"secret\": \"setup-innerspell-2024\"}'"
echo ""
echo "2) Firebase Console에서 복합 인덱스 생성:"
echo "   - users: lastActivity (DESC) + status (ASC)"
echo "   - readings: userId (ASC) + createdAt (DESC)"
echo "   - blogPosts: status (ASC) + publishedAt (DESC)"
echo ""
echo "3) 관리자 페이지에서 Firebase 연결 확인:"
echo "   https://your-app.vercel.app/admin"
echo ""

echo -e "${GREEN}✨ 배포 준비가 완료되었습니다!${NC}"