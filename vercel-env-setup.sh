#!/bin/bash

echo "🚀 Vercel 환경 변수 설정 스크립트"
echo "=================================="

# Vercel 프로젝트 연결 (이미 생성된 프로젝트가 있다면)
echo "📡 Vercel 프로젝트 연결 중..."

# Firebase 환경 변수 설정
echo "🔥 Firebase 환경 변수 설정 중..."

echo "NEXT_PUBLIC_FIREBASE_API_KEY 설정..."
echo "AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg" | npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production --yes

echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 설정..."
echo "innerspell-an7ce.firebaseapp.com" | npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production --yes

echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID 설정..."
echo "innerspell-an7ce" | npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production --yes

echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 설정..."
echo "innerspell-an7ce.firebasestorage.app" | npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production --yes

echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID 설정..."
echo "944680989471" | npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production --yes

echo "NEXT_PUBLIC_FIREBASE_APP_ID 설정..."
echo "1:944680989471:web:bc817b811a6033017f362a" | npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production --yes

# 보안 키 설정
echo "🔒 보안 키 설정 중..."

echo "ENCRYPTION_KEY 설정..."
echo "imYNbSV++Pcv5Hrybj4HDt0xkEL4ojD6/xF2O+SrJLk=" | npx vercel env add ENCRYPTION_KEY production --yes

echo "BLOG_API_SECRET_KEY 설정..."
echo "c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=" | npx vercel env add BLOG_API_SECRET_KEY production --yes

# 기본 설정
echo "⚙️ 기본 설정 중..."

echo "NODE_ENV 설정..."
echo "production" | npx vercel env add NODE_ENV production --yes

echo "NEXT_PUBLIC_USE_REAL_AUTH 설정..."
echo "true" | npx vercel env add NEXT_PUBLIC_USE_REAL_AUTH production --yes

echo "ADMIN_EMAILS 설정..."
echo "admin@innerspell.com" | npx vercel env add ADMIN_EMAILS production --yes

echo ""
echo "✅ 기본 환경 변수 설정 완료!"
echo "🤖 AI API 키는 수동으로 설정해야 합니다."
echo ""
echo "다음 명령으로 AI API 키를 설정하세요:"
echo "npx vercel env add GOOGLE_API_KEY production"
echo "npx vercel env add GEMINI_API_KEY production"
echo "또는"
echo "npx vercel env add OPENAI_API_KEY production"