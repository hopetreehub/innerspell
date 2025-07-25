#!/bin/bash

# 🔍 Quick Vercel Domain Checker
# This script quickly identifies the current Vercel deployment domain

echo "🔍 Vercel 도메인 빠른 확인"
echo "=========================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Vercel CLI로 확인
echo -e "${YELLOW}1. Vercel CLI로 배포 확인 중...${NC}"
if command -v vercel &> /dev/null; then
    VERCEL_OUTPUT=$(npx vercel ls 2>/dev/null | grep -E "https://" | head -5)
    if [ ! -z "$VERCEL_OUTPUT" ]; then
        echo -e "${GREEN}최근 배포:${NC}"
        echo "$VERCEL_OUTPUT"
        echo ""
        
        # 프로덕션 URL 추출
        PROD_URL=$(echo "$VERCEL_OUTPUT" | grep "Production" | grep -o "https://[^ ]*" | head -1)
        if [ -z "$PROD_URL" ]; then
            PROD_URL=$(echo "$VERCEL_OUTPUT" | grep -o "https://[^ ]*" | head -1)
        fi
        
        if [ ! -z "$PROD_URL" ]; then
            echo -e "${GREEN}✅ 프로덕션 URL: $PROD_URL${NC}"
        fi
    else
        echo -e "${RED}❌ Vercel 배포를 찾을 수 없습니다${NC}"
    fi
else
    echo -e "${RED}❌ Vercel CLI가 설치되지 않았습니다${NC}"
fi

echo ""

# 2. 일반적인 패턴으로 테스트
echo -e "${YELLOW}2. 일반적인 도메인 패턴 테스트...${NC}"

# 사용자 이름 가져오기
VERCEL_USER=$(npx vercel whoami 2>/dev/null || echo "unknown")

# 테스트할 도메인 목록
DOMAINS=(
    "test-studio-firebase.vercel.app"
    "innerspell.vercel.app"
    "test-studio-firebase-${VERCEL_USER}.vercel.app"
    "innerspell-${VERCEL_USER}.vercel.app"
)

WORKING_DOMAINS=()

for domain in "${DOMAINS[@]}"; do
    echo -ne "테스트 중: https://$domain ... "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" 2>/dev/null)
    
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ 작동함 (HTTP $STATUS)${NC}"
        WORKING_DOMAINS+=("$domain")
    else
        echo -e "${RED}❌ 작동 안함 (HTTP $STATUS)${NC}"
    fi
done

echo ""

# 3. 결과 요약
echo -e "${BLUE}📊 결과 요약${NC}"
echo "=================="

if [ ${#WORKING_DOMAINS[@]} -gt 0 ]; then
    echo -e "${GREEN}✅ 작동하는 도메인:${NC}"
    for domain in "${WORKING_DOMAINS[@]}"; do
        echo "   • https://$domain"
    done
    echo ""
    echo -e "${YELLOW}📋 Firebase에 추가할 도메인:${NC}"
    for domain in "${WORKING_DOMAINS[@]}"; do
        echo "   • $domain"
    done
else
    echo -e "${RED}❌ 작동하는 도메인을 찾을 수 없습니다${NC}"
    echo ""
    echo -e "${YELLOW}해결 방법:${NC}"
    echo "1. 새로 배포하기: npx vercel --prod"
    echo "2. 배포 상태 확인: npx vercel ls"
    echo "3. 프로젝트 연결: npx vercel link"
fi

echo ""
echo -e "${BLUE}🔥 Firebase 설정 링크:${NC}"
echo "https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings"
echo ""

# 4. 추가 명령어 안내
if [ ${#WORKING_DOMAINS[@]} -gt 0 ]; then
    echo -e "${YELLOW}🧪 인증 테스트 실행:${NC}"
    echo -e "${GREEN}node test-firebase-auth-complete.js ${WORKING_DOMAINS[0]}${NC}"
    echo ""
fi

echo "✨ 도메인 확인 완료!"