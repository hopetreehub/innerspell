// Simple environment variable check
console.log('[ENV] Checking environment variables...');

const envVars = [
  'OPENAI_API_KEY',
  'GOOGLE_API_KEY', 
  'GEMINI_API_KEY',
  'ANTHROPIC_API_KEY',
  'NODE_ENV',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`[ENV] ${varName}: ${value.length > 10 ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`[ENV] ${varName}: NOT SET`);
  }
});

console.log('[ENV] Environment check complete.');