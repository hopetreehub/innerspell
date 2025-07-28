#!/bin/bash

echo "🚀 Vercel 환경변수 설정 시작..."

# Firebase 환경변수 설정
echo "AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg" | npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo "AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg" | npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview  
echo "AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg" | npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY development

echo "innerspell-an7ce.firebaseapp.com" | npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo "innerspell-an7ce.firebaseapp.com" | npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN preview
echo "innerspell-an7ce.firebaseapp.com" | npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN development

echo "innerspell-an7ce" | npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo "innerspell-an7ce" | npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview
echo "innerspell-an7ce" | npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID development

echo "innerspell-an7ce.firebasestorage.app" | npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo "innerspell-an7ce.firebasestorage.app" | npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET preview
echo "innerspell-an7ce.firebasestorage.app" | npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET development

echo "944680989471" | npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo "944680989471" | npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID preview
echo "944680989471" | npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID development

echo "1:944680989471:web:bc817b811a6033017f362a" | npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
echo "1:944680989471:web:bc817b811a6033017f362a" | npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID preview
echo "1:944680989471:web:bc817b811a6033017f362a" | npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID development

echo "✅ 모든 Firebase 환경변수 설정 완료"
echo "📋 환경변수 목록 확인:"
npx vercel env ls