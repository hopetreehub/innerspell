#!/bin/bash

echo "🔧 Vercel 환경 변수 수정 스크립트"
echo "================================"

echo "1. 현재 Firebase 환경 변수 제거 중..."

# 기존 Firebase 환경 변수들 제거
npx vercel env rm NEXT_PUBLIC_FIREBASE_API_KEY production --yes
npx vercel env rm NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production --yes
npx vercel env rm NEXT_PUBLIC_FIREBASE_PROJECT_ID production --yes
npx vercel env rm NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production --yes
npx vercel env rm NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production --yes
npx vercel env rm NEXT_PUBLIC_FIREBASE_APP_ID production --yes

echo "2. 새로운 Firebase 환경 변수 추가 중..."

# 올바른 Firebase 설정 값들 (개행문자 없이 클린하게)
npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# 값: AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg

npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production  
# 값: innerspell-an7ce.firebaseapp.com

npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# 값: innerspell-an7ce

npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# 값: innerspell-an7ce.firebasestorage.app

npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# 값: 584426490516

npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# 값: 1:584426490516:web:8b8e8f8e8f8e8f8e8f8e8f

echo "✅ 환경 변수 재설정 완료!"
echo "📝 다음 단계: Firebase Console에서 승인된 도메인에 test-studio-firebase.vercel.app 추가"