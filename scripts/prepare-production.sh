#!/bin/bash

# 프로덕션 준비 스크립트
echo "🚀 InnerSpell 프로덕션 준비 시작"
echo "================================"

# 1. 환경 변수 확인
echo "📋 환경 변수 확인 중..."
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다!"
    echo "📝 env.production.example을 참고하여 생성해주세요."
    exit 1
fi

# 2. 필수 환경 변수 체크
required_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "ENCRYPTION_KEY"
    "BLOG_API_SECRET_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.production; then
        missing_vars+=($var)
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ 다음 필수 환경 변수가 설정되지 않았습니다:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

# 3. AI API 키 확인
echo "🤖 AI API 키 확인 중..."
ai_keys=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
    "GOOGLE_API_KEY"
    "GEMINI_API_KEY"
)

has_ai_key=false
for key in "${ai_keys[@]}"; do
    if grep -q "^$key=.*[a-zA-Z0-9]" .env.production; then
        has_ai_key=true
        echo "✅ $key 설정됨"
    fi
done

if [ "$has_ai_key" = false ]; then
    echo "❌ 최소 하나의 AI API 키가 필요합니다!"
    echo "다음 중 하나를 설정해주세요: ${ai_keys[*]}"
    exit 1
fi

# 4. 의존성 설치
echo "📦 의존성 설치 중..."
npm ci --legacy-peer-deps || exit 1

# 5. 타입 체크
echo "🔍 타입 체크 중..."
npm run typecheck || echo "⚠️ 타입 체크 경고가 있습니다."

# 6. 린트
echo "🧹 코드 린트 중..."
npm run lint || echo "⚠️ 린트 경고가 있습니다."

# 7. 빌드
echo "🏗️ 프로덕션 빌드 중..."
NODE_ENV=production npm run build || exit 1

# 8. 빌드 성공
echo ""
echo "✅ 프로덕션 준비 완료!"
echo "================================"
echo "다음 명령으로 프로덕션 서버를 시작할 수 있습니다:"
echo "  npm start"
echo ""
echo "또는 Docker를 사용하여 배포할 수 있습니다:"
echo "  docker build -t innerspell ."
echo "  docker run -p 4000:4000 --env-file .env.production innerspell"