/**
 * Environment Variable Validation
 * Ensures all required environment variables are present at startup
 */

interface EnvVar {
  name: string;
  required: boolean;
  sensitive?: boolean;
  validator?: (value: string) => boolean;
}

const environmentVariables: EnvVar[] = [
  // Firebase Client Configuration (Public)
  { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', required: true },
  { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', required: true },
  { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', required: true },
  { name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', required: true },
  { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', required: true },
  { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', required: true },
  { name: 'NEXT_PUBLIC_SITE_URL', required: true },
  
  // Server-side Configuration (Private)
  { name: 'BLOG_API_SECRET_KEY', required: true, sensitive: true },
  { name: 'SESSION_SECRET_KEY', required: false, sensitive: true }, // Required in production
  { name: 'ENCRYPTION_KEY', required: false, sensitive: true }, // Required in production
  { name: 'ADMIN_EMAILS', required: false },
  
  // Optional configurations
  { name: 'GOOGLE_APPLICATION_CREDENTIALS', required: false, sensitive: true },
  { name: 'FIREBASE_SERVICE_ACCOUNT_PATH', required: false, sensitive: true },
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates that all required environment variables are present
 * @returns Validation result with missing variables and warnings
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missing: [],
    warnings: []
  };
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  for (const envVar of environmentVariables) {
    const value = process.env[envVar.name];
    
    // Check if required variable is missing
    if (envVar.required && !value) {
      result.valid = false;
      result.missing.push(envVar.name);
      continue;
    }
    
    // Production-specific requirements
    if (isProduction) {
      // These variables are required in production
      if (['SESSION_SECRET_KEY', 'ENCRYPTION_KEY'].includes(envVar.name) && !value) {
        result.valid = false;
        result.missing.push(`${envVar.name} (required in production)`);
      }
      
      // Warn about missing optional but recommended variables
      if (envVar.name === 'GOOGLE_APPLICATION_CREDENTIALS' && !value && !process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        result.warnings.push('Neither GOOGLE_APPLICATION_CREDENTIALS nor FIREBASE_SERVICE_ACCOUNT_PATH is set. Firebase Admin SDK may not initialize properly.');
      }
    }
    
    // Run custom validators if provided
    if (value && envVar.validator && !envVar.validator(value)) {
      result.valid = false;
      result.warnings.push(`${envVar.name} has an invalid format`);
    }
  }
  
  // Additional validation checks
  if (process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') && isProduction) {
    result.warnings.push('NEXT_PUBLIC_SITE_URL is set to localhost in production environment');
  }
  
  return result;
}

/**
 * Logs environment validation results
 */
export function logValidationResult(result: ValidationResult): void {
  if (!result.valid) {
    console.error('❌ Environment validation failed!');
    console.error('Missing required variables:', result.missing.join(', '));
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }
}

/**
 * Gets a required environment variable or throws an error
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Masks sensitive values for logging
 */
export function maskSensitiveValue(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars * 2) {
    return '••••••••';
  }
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  return `${start}••••••••${end}`;
}

/**
 * Creates a safe environment object for logging
 */
export function getSafeEnvironmentInfo(): Record<string, string> {
  const safeEnv: Record<string, string> = {};
  
  for (const envVar of environmentVariables) {
    const value = process.env[envVar.name];
    if (value) {
      safeEnv[envVar.name] = envVar.sensitive 
        ? maskSensitiveValue(value) 
        : value;
    } else {
      safeEnv[envVar.name] = '<not set>';
    }
  }
  
  return safeEnv;
}

// Declare global type for TypeScript
declare global {
  var __encryptionKey: Buffer | undefined;
}