#!/bin/bash

# 🔍 InnerSpell Vercel Deployment Verification & Testing Script
# This script helps verify the deployment domain and test authentication

echo "🔍 InnerSpell Vercel 배포 검증 및 테스트 스크립트"
echo "=================================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# Step 1: Vercel 로그인 상태 확인
echo -e "${YELLOW}📡 Step 1: Vercel 로그인 상태 확인${NC}"
if ! npx vercel whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Vercel에 로그인되어 있지 않습니다!${NC}"
    echo -e "${BLUE}다음 명령을 실행하세요:${NC}"
    echo -e "${GREEN}npx vercel login${NC}"
    exit 1
else
    VERCEL_USER=$(npx vercel whoami 2>/dev/null)
    echo -e "${GREEN}✅ 로그인됨: ${VERCEL_USER}${NC}"
fi

# Step 2: 프로젝트 ID 확인
echo -e "${YELLOW}🔍 Step 2: 프로젝트 정보 확인${NC}"
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | grep -o '[^"]*$')
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | grep -o '[^"]*$')
    echo -e "${GREEN}✅ 프로젝트 ID: ${PROJECT_ID}${NC}"
    echo -e "${GREEN}✅ 조직 ID: ${ORG_ID}${NC}"
else
    echo -e "${RED}❌ 프로젝트가 연결되지 않았습니다!${NC}"
    echo -e "${BLUE}다음 명령을 실행하세요:${NC}"
    echo -e "${GREEN}npx vercel link${NC}"
    exit 1
fi

# Step 3: 배포 URL 확인
echo -e "${YELLOW}🌐 Step 3: 배포 URL 확인${NC}"
echo -e "${BLUE}배포 목록을 가져오는 중...${NC}"

# Vercel CLI로 배포 정보 가져오기
DEPLOYMENTS=$(npx vercel ls --json 2>/dev/null)

# 가능한 도메인들 찾기
echo -e "${CYAN}📋 가능한 도메인들:${NC}"
echo ""

# 1. 프로덕션 도메인 확인
PROD_DOMAINS=$(echo "$DEPLOYMENTS" | grep -o '"url":"[^"]*' | grep -o '[^"]*$' | sort -u)
if [ ! -z "$PROD_DOMAINS" ]; then
    echo -e "${GREEN}프로덕션 도메인:${NC}"
    echo "$PROD_DOMAINS" | while read domain; do
        echo "  • https://$domain"
    done
fi

# 2. 자동 생성된 도메인 패턴
echo ""
echo -e "${YELLOW}예상 가능한 도메인 패턴:${NC}"
echo "  • https://test-studio-firebase.vercel.app"
echo "  • https://innerspell.vercel.app"
echo "  • https://test-studio-firebase-{username}.vercel.app"
echo "  • https://test-studio-firebase-{git-branch}-{username}.vercel.app"

# Step 4: 실제 도메인 테스트
echo ""
echo -e "${YELLOW}🧪 Step 4: 도메인 접속 테스트${NC}"

# 테스트할 도메인 목록
DOMAINS_TO_TEST=(
    "test-studio-firebase.vercel.app"
    "innerspell.vercel.app"
    "test-studio-firebase-${VERCEL_USER}.vercel.app"
)

WORKING_DOMAIN=""

for domain in "${DOMAINS_TO_TEST[@]}"; do
    echo -e "${BLUE}테스트 중: https://$domain${NC}"
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" 2>/dev/null)
    
    if [ "$STATUS_CODE" = "200" ]; then
        echo -e "${GREEN}✅ 접속 성공! (HTTP $STATUS_CODE)${NC}"
        WORKING_DOMAIN="$domain"
        break
    else
        echo -e "${RED}❌ 접속 실패 (HTTP $STATUS_CODE)${NC}"
    fi
done

# Step 5: Firebase 도메인 설정 안내
echo ""
echo -e "${YELLOW}🔥 Step 5: Firebase 인증 도메인 설정${NC}"

if [ ! -z "$WORKING_DOMAIN" ]; then
    echo -e "${GREEN}✅ 작동하는 도메인: https://$WORKING_DOMAIN${NC}"
    echo ""
    echo -e "${CYAN}📋 Firebase Console에서 다음 도메인을 추가하세요:${NC}"
    echo ""
    echo -e "${BLUE}1. Firebase Console 접속:${NC}"
    echo "   https://console.firebase.google.com/project/innerspell-an7ce/authentication/settings"
    echo ""
    echo -e "${BLUE}2. '승인된 도메인' 섹션에서 '도메인 추가' 클릭${NC}"
    echo ""
    echo -e "${BLUE}3. 다음 도메인들을 추가:${NC}"
    echo -e "${GREEN}   • $WORKING_DOMAIN${NC}"
    echo -e "${GREEN}   • *.vercel.app${NC} (와일드카드 - 선택사항)"
    echo ""
else
    echo -e "${RED}❌ 작동하는 도메인을 찾을 수 없습니다!${NC}"
    echo -e "${YELLOW}수동으로 도메인을 확인하려면:${NC}"
    echo -e "${BLUE}npx vercel ls${NC}"
fi

# Step 6: 자동화 테스트 스크립트 생성
echo -e "${YELLOW}🤖 Step 6: 자동화 테스트 스크립트 생성${NC}"

cat > test-vercel-auth.js << 'EOF'
#!/usr/bin/env node

const { chromium } = require('playwright');

// 테스트할 도메인 설정
const DOMAIN = process.argv[2] || 'test-studio-firebase.vercel.app';
const BASE_URL = `https://${DOMAIN}`;

console.log(`🧪 InnerSpell 인증 테스트 시작: ${BASE_URL}`);

async function testAuth() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        console.log('📍 1. 홈페이지 접속...');
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // 스크린샷 저장
        await page.screenshot({ path: 'screenshots/01-homepage.png' });
        console.log('✅ 홈페이지 로드 완료');
        
        console.log('📍 2. 로그인 페이지로 이동...');
        await page.goto(`${BASE_URL}/sign-in`);
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ path: 'screenshots/02-signin-page.png' });
        console.log('✅ 로그인 페이지 로드 완료');
        
        // Google 로그인 버튼 확인
        const googleButton = await page.locator('button:has-text("Google")').first();
        if (await googleButton.isVisible()) {
            console.log('✅ Google 로그인 버튼 발견');
            await page.screenshot({ path: 'screenshots/03-google-button.png' });
            
            // 실제 로그인은 수동으로 진행
            console.log('\n⚠️  수동 작업 필요:');
            console.log('1. 브라우저에서 Google 로그인 버튼을 클릭하세요');
            console.log('2. Google 계정으로 로그인하세요');
            console.log('3. 로그인 후 리다이렉트되는지 확인하세요');
            
            // 60초 대기
            console.log('\n⏳ 60초 동안 대기합니다...');
            await page.waitForTimeout(60000);
            
            // 로그인 후 상태 확인
            const currentUrl = page.url();
            console.log(`\n현재 URL: ${currentUrl}`);
            
            if (currentUrl.includes('/dashboard') || currentUrl === BASE_URL + '/') {
                console.log('✅ 로그인 성공! 리다이렉트 확인');
                await page.screenshot({ path: 'screenshots/04-after-login.png' });
            } else {
                console.log('⚠️  로그인 후 예상 페이지가 아닙니다');
            }
        } else {
            console.log('❌ Google 로그인 버튼을 찾을 수 없습니다');
        }
        
        console.log('\n📋 테스트 완료!');
        console.log('스크린샷이 ./screenshots 폴더에 저장되었습니다.');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
    } finally {
        await browser.close();
    }
}

// 메인 실행
testAuth().catch(console.error);
EOF

chmod +x test-vercel-auth.js

echo -e "${GREEN}✅ 테스트 스크립트 생성 완료!${NC}"

# Step 7: 수동 검증 가이드
echo ""
echo -e "${YELLOW}📋 Step 7: 수동 검증 체크리스트${NC}"
echo ""
echo -e "${CYAN}Firebase Console에서 확인:${NC}"
echo "□ 1. Authentication > Settings > 승인된 도메인에 Vercel 도메인 추가"
echo "□ 2. Firestore Database > Rules에서 인증 규칙 확인"
echo "□ 3. Project Settings에서 웹 앱 구성 확인"
echo ""
echo -e "${CYAN}Vercel Dashboard에서 확인:${NC}"
echo "□ 1. Environment Variables에 모든 Firebase 키 설정됨"
echo "□ 2. NEXT_PUBLIC_USE_REAL_AUTH=true 설정됨"
echo "□ 3. FIREBASE_SERVICE_ACCOUNT_KEY 설정됨 (서버 사이드용)"
echo "□ 4. AI API 키 중 최소 1개 설정됨"
echo ""
echo -e "${CYAN}브라우저에서 테스트:${NC}"
echo "□ 1. 배포된 사이트 접속 가능"
echo "□ 2. Google 로그인 버튼 클릭 시 팝업 표시"
echo "□ 3. 로그인 후 정상 리다이렉트"
echo "□ 4. 타로 리딩 페이지 접근 가능"
echo "□ 5. 리딩 저장 기능 작동"
echo ""

# Step 8: 자동 테스트 실행 옵션
echo -e "${YELLOW}🚀 Step 8: 테스트 실행${NC}"
echo ""
echo -e "${BLUE}자동화 테스트를 실행하려면:${NC}"
echo -e "${GREEN}node test-vercel-auth.js $WORKING_DOMAIN${NC}"
echo ""
echo -e "${BLUE}전체 기능 테스트를 실행하려면:${NC}"
echo -e "${GREEN}npm test${NC}"
echo ""

# 최종 요약
echo -e "${CYAN}📊 배포 상태 요약${NC}"
echo "=================================="
if [ ! -z "$WORKING_DOMAIN" ]; then
    echo -e "${GREEN}✅ 배포 URL: https://$WORKING_DOMAIN${NC}"
    echo -e "${YELLOW}⚠️  Firebase에 이 도메인을 추가하는 것을 잊지 마세요!${NC}"
else
    echo -e "${RED}❌ 작동하는 배포 URL을 찾을 수 없습니다${NC}"
    echo -e "${YELLOW}다음 명령으로 새로 배포하세요:${NC}"
    echo -e "${GREEN}npx vercel --prod${NC}"
fi
echo ""
echo -e "${GREEN}🎯 검증 스크립트 실행 완료!${NC}"