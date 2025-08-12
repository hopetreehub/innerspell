#!/bin/bash

# Vercel 프로젝트 초기화 스크립트
echo "🚀 Vercel 프로젝트 초기화 중..."

# 새 프로젝트로 설정
npx vercel --yes \
  --name test-studio-firebase \
  --scope junsupark9999-8777 \
  --build-env NEXT_PUBLIC_ENABLE_FILE_STORAGE=true \
  --env NEXT_PUBLIC_ENABLE_FILE_STORAGE=true \
  --public