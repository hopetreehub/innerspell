#!/bin/bash

echo "🚀 SuperClaude DevOps - InnerSpell Vercel 배포 자동화"
echo "=================================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로고 출력
echo -e "${BLUE}"
echo "   ___                       ____            __ __"
echo "  |_ _|_ __  _ __   ___ _ __ / ___| _ __   ___| | |"
echo "   | || '_ \| '_ \ / _ \ '__\___ \| '_ \ / _ \ | |"
echo "   | || | | | | | |  __/ |   ___) | |_) |  __/ | |"
echo "  |___|_| |_|_| |_|\___|_|  |____/| .__/ \___|_|_|"
echo "                                  |_|              "
echo -e "${NC}"

# Step 1: Vercel 로그인 확인
echo -e "${YELLOW}📡 Step 1: Vercel 인증 확인${NC}"
if ! npx vercel whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Vercel 로그인이 필요합니다!${NC}"
    echo -e "${BLUE}다음 명령을 실행하고 브라우저에서 로그인하세요:${NC}"
    echo -e "${GREEN}npx vercel login${NC}"
    echo ""
    echo -e "${YELLOW}로그인 완료 후 이 스크립트를 다시 실행하세요.${NC}"
    exit 1
else
    VERCEL_USER=$(npx vercel whoami 2>/dev/null)
    echo -e "${GREEN}✅ Vercel 로그인됨: ${VERCEL_USER}${NC}"
fi

# Step 2: 프로젝트 연결
echo -e "${YELLOW}📋 Step 2: 프로젝트 연결 확인${NC}"
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${BLUE}프로젝트를 Vercel에 연결합니다...${NC}"
    echo -e "${YELLOW}다음 질문에 답해주세요:${NC}"
    echo "  - Link to existing project? → Y"
    echo "  - What's your project name? → 생성한 프로젝트 이름"
    echo ""
    npx vercel link
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 프로젝트 연결 실패${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 프로젝트 이미 연결됨${NC}"
fi

# Step 3: 환경 변수 설정
echo -e "${YELLOW}🔧 Step 3: 환경 변수 설정${NC}"

# 환경 변수 배열 정의
declare -A env_vars=(
    ["NEXT_PUBLIC_FIREBASE_API_KEY"]="AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg"
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"]="innerspell-an7ce.firebaseapp.com"
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]="innerspell-an7ce"
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"]="innerspell-an7ce.firebasestorage.app"
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"]="944680989471"
    ["NEXT_PUBLIC_FIREBASE_APP_ID"]="1:944680989471:web:bc817b811a6033017f362a"
    ["ENCRYPTION_KEY"]="imYNbSV++Pcv5Hrybj4HDt0xkEL4ojD6/xF2O+SrJLk="
    ["BLOG_API_SECRET_KEY"]="c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c="
    ["NODE_ENV"]="production"
    ["NEXT_PUBLIC_USE_REAL_AUTH"]="true"
    ["ADMIN_EMAILS"]="admin@innerspell.com"
)

# 환경 변수 설정
for key in "${!env_vars[@]}"; do
    echo -e "${BLUE}설정 중: ${key}${NC}"
    echo "${env_vars[$key]}" | npx vercel env add "$key" production --yes 2>/dev/null || echo -e "${YELLOW}  ⚠️ 이미 존재하거나 설정됨${NC}"
done

# AI API 키 확인
echo -e "${YELLOW}🤖 AI API 키 확인${NC}"
echo -e "${BLUE}최소 1개의 AI API 키가 필요합니다:${NC}"
echo "  - Google AI (무료): GOOGLE_API_KEY"  
echo "  - OpenAI (유료): OPENAI_API_KEY"
echo "  - Anthropic (유료): ANTHROPIC_API_KEY"
echo ""
echo -e "${YELLOW}AI API 키를 설정하시겠습니까? (y/n)${NC}"
read -r setup_ai

if [[ $setup_ai =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}어떤 AI 제공자를 사용하시겠습니까?${NC}"
    echo "1) Google AI (무료)"
    echo "2) OpenAI (GPT-4)"
    echo "3) Anthropic (Claude)"
    echo "4) 직접 설정 건너뛰기"
    read -r ai_choice
    
    case $ai_choice in
        1)
            echo -e "${BLUE}Google AI API 키를 입력하세요 (AIza로 시작):${NC}"
            npx vercel env add GOOGLE_API_KEY production
            npx vercel env add GEMINI_API_KEY production
            ;;
        2)
            echo -e "${BLUE}OpenAI API 키를 입력하세요 (sk-로 시작):${NC}"
            npx vercel env add OPENAI_API_KEY production
            ;;
        3)
            echo -e "${BLUE}Anthropic API 키를 입력하세요 (sk-ant-로 시작):${NC}"
            npx vercel env add ANTHROPIC_API_KEY production
            ;;
        4)
            echo -e "${YELLOW}⚠️ AI API 키를 나중에 설정하세요${NC}"
            ;;
    esac
fi

# Step 4: 사이트 URL 업데이트
echo -e "${YELLOW}🌐 Step 4: 사이트 URL 설정${NC}"
PROJECT_URL=$(npx vercel ls --scope=$(npx vercel teams ls | head -1 | awk '{print $1}') 2>/dev/null | grep $(basename $(pwd)) | awk '{print $2}' | head -1)
if [ ! -z "$PROJECT_URL" ]; then
    echo "https://$PROJECT_URL" | npx vercel env add NEXT_PUBLIC_SITE_URL production --yes 2>/dev/null
    echo -e "${GREEN}✅ 사이트 URL 설정: https://$PROJECT_URL${NC}"
fi

# Step 5: 배포
echo -e "${YELLOW}🚀 Step 5: 프로덕션 배포${NC}"
echo -e "${BLUE}프로덕션 배포를 시작합니다...${NC}"
npx vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 배포 성공!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${BLUE}배포 URL: ${NC}$(npx vercel ls 2>/dev/null | grep $(basename $(pwd)) | awk '{print "https://" $2}' | head -1)"
    echo ""
    echo -e "${YELLOW}📋 배포 후 확인사항:${NC}"
    echo "  1. 홈페이지 로딩 확인"
    echo "  2. AI 타로 리딩 테스트"
    echo "  3. 모바일 반응형 확인"
    echo "  4. 로그인/회원가입 테스트"
    echo "  5. Admin 패널 접근 (/admin)"
    echo ""
    echo -e "${GREEN}🎊 InnerSpell 배포 완료! 축하합니다!${NC}"
else
    echo -e "${RED}❌ 배포 실패${NC}"
    echo -e "${YELLOW}로그를 확인하고 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi