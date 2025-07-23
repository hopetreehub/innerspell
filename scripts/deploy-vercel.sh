#!/bin/bash

echo "🚀 InnerSpell Vercel 배포 시작"
echo "================================"

# 1. Vercel CLI 확인
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI 설치 중..."
    npm i -g vercel
fi

# 2. 환경 변수 확인
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다!"
    exit 1
fi

# 3. 빌드 테스트
echo "🔨 로컬 빌드 테스트 중..."
if npm run build; then
    echo "✅ 빌드 성공!"
else
    echo "❌ 빌드 실패! 오류를 수정한 후 다시 시도하세요."
    exit 1
fi

# 4. Vercel 배포
echo "🌐 Vercel에 배포 중..."
echo "다음 환경 변수들이 Vercel에 설정되어야 합니다:"
echo "  - NEXT_PUBLIC_FIREBASE_* (6개)"
echo "  - ENCRYPTION_KEY"
echo "  - BLOG_API_SECRET_KEY"
echo "  - AI API 키 (최소 1개)"
echo ""

# 프로덕션 배포
vercel --prod

echo ""
echo "✅ 배포 완료!"
echo "================================"
echo "배포 URL을 확인하고 다음을 테스트하세요:"
echo "  1. 홈페이지 로딩"
echo "  2. AI 타로 리딩"
echo "  3. 모바일 반응형"
echo "  4. 로그인/회원가입"