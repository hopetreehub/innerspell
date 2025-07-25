const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

console.log('=== AI Configuration Debug ===\n');

console.log('1. Environment Variables:');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.length} chars)` : 'NOT SET');
console.log('   GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? `Set (${process.env.GOOGLE_AI_API_KEY.length} chars)` : 'NOT SET');
console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.length} chars)` : 'NOT SET');
console.log('   ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? `Set (${process.env.ANTHROPIC_API_KEY.length} chars)` : 'NOT SET');

console.log('\n2. Firebase Configuration:');
console.log('   NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET');
console.log('   GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET');
console.log('   FIREBASE_SERVICE_ACCOUNT_KEY:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 'NOT SET');

console.log('\n3. Site Configuration:');
console.log('   NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

console.log('\n4. Vercel Configuration:');
console.log('   VERCEL:', process.env.VERCEL || 'NOT SET');
console.log('   VERCEL_ENV:', process.env.VERCEL_ENV || 'NOT SET');
console.log('   VERCEL_URL:', process.env.VERCEL_URL || 'NOT SET');

console.log('\n=== Key Points ===');
console.log('- AI API keys should be set in Vercel Dashboard > Project Settings > Environment Variables');
console.log('- For local development, add them to .env.local file');
console.log('- The app uses a fallback system to try multiple AI providers');
console.log('- Provider configurations are stored in Firestore for flexibility');