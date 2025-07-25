#!/usr/bin/env node

/**
 * Firebase Integration Debug Script
 * This script helps identify issues with Firebase configuration and connectivity
 */

const path = require('path');
const fs = require('fs');

console.log('🔥 Firebase Integration Debug Script');
console.log('=====================================\n');

// Check environment files
console.log('1. Environment Files Check:');
console.log('----------------------------');

const envFiles = [
  '.env.local',
  '.env.development', 
  '.env.production',
  'src/.env.local'
];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const firebaseVars = content.split('\n')
      .filter(line => line.includes('FIREBASE') || line.includes('GOOGLE_APPLICATION'))
      .filter(line => !line.startsWith('#'))
      .filter(line => line.trim() !== '');
    
    if (firebaseVars.length > 0) {
      console.log(`   Firebase vars in ${file}:`);
      firebaseVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          console.log(`   - ${key}: ${value.startsWith('"') ? '"[REDACTED]"' : '[REDACTED]'}`);
        }
      });
    } else {
      console.log(`   No Firebase vars in ${file}`);
    }
  } else {
    console.log(`❌ ${file} not found`);
  }
});

console.log('\n2. Node.js Environment Variables:');
console.log('----------------------------------');

const envVars = [
  'NODE_ENV',
  'NEXT_PUBLIC_USE_REAL_AUTH',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',  
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'FIREBASE_SERVICE_ACCOUNT_KEY'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('KEY') || varName.includes('CREDENTIALS')) {
      console.log(`✅ ${varName}: [REDACTED - ${value.length} chars]`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: not set`);
  }
});

console.log('\n3. Firebase Configuration Analysis:');
console.log('------------------------------------');

// Check if we should be using real auth
const useRealAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true' || process.env.NODE_ENV === 'production';
console.log(`Should use real auth: ${useRealAuth}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`NEXT_PUBLIC_USE_REAL_AUTH: ${process.env.NEXT_PUBLIC_USE_REAL_AUTH}`);

// Check Firebase client config completeness
const clientConfigComplete = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);
console.log(`Client config complete: ${clientConfigComplete}`);

// Check Firebase admin config
const hasAdminCredentials = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log(`Admin credentials available: ${hasAdminCredentials}`);

console.log('\n4. Expected Behavior Analysis:');
console.log('-------------------------------');

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
  console.log('🎭 EXPECTED: App should run in MOCK mode');
  console.log('   - AuthContext will use mock authentication');
  console.log('   - Firebase client will use mock services');  
  console.log('   - Reading save will show demo mode message');
} else if (clientConfigComplete) {
  console.log('🔥 EXPECTED: App should run in REAL Firebase mode');
  console.log('   - AuthContext will use real Firebase auth');
  console.log('   - Firebase client will connect to real services');
  console.log('   - Reading save should work with real Firestore');
} else {
  console.log('❌ PROBLEM: Incomplete configuration');
  console.log('   - Missing Firebase client config');
  console.log('   - App may fall back to mock mode unexpectedly');
}

console.log('\n5. Firebase Files Check:');
console.log('-------------------------');

const firebaseFiles = [
  'src/lib/firebase/client.ts',
  'src/lib/firebase/admin.ts', 
  'src/lib/firebase/client-dev.ts',
  'src/lib/firebase/mockAuth.ts',
  'src/context/AuthContext.tsx'
];

firebaseFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n6. Recommendations:');
console.log('-------------------');

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
  console.log('📝 You are in DEVELOPMENT MOCK mode:');
  console.log('   - This is normal for development without Firebase credentials');
  console.log('   - To use real Firebase, set NEXT_PUBLIC_USE_REAL_AUTH=true in .env.local');
  console.log('   - Ensure all NEXT_PUBLIC_FIREBASE_* variables are set');
} else if (!clientConfigComplete) {
  console.log('🚨 ISSUE: Missing Firebase client configuration');
  console.log('   - Copy Firebase config from your project settings');
  console.log('   - Set all NEXT_PUBLIC_FIREBASE_* variables in .env.local');
  console.log('   - Restart the development server');
} else if (!hasAdminCredentials && process.env.NODE_ENV !== 'development') {
  console.log('🚨 ISSUE: Missing Firebase admin credentials');
  console.log('   - For local development, set GOOGLE_APPLICATION_CREDENTIALS');
  console.log('   - For production, set FIREBASE_SERVICE_ACCOUNT_KEY');
} else {
  console.log('✅ Configuration looks good!');
  console.log('   - Check the browser console for Firebase connection errors');
  console.log('   - Verify Firestore rules allow your operations');
}

console.log('\n7. Next Steps:');
console.log('--------------');
console.log('1. Start the development server: npm run dev');
console.log('2. Open browser to http://localhost:4000');
console.log('3. Check browser console for Firebase errors'); 
console.log('4. Try signing in and saving a tarot reading');
console.log('5. Look for specific error messages');

console.log('\n🔚 Debug script completed.\n');