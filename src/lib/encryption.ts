import crypto from 'crypto';

// Use environment variable for encryption key, or generate one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 64; // Length of salt in bytes
const TAG_LENGTH = 16; // Length of tag in bytes
const IV_LENGTH = 16; // Length of IV in bytes
const KEY_LENGTH = 32; // Length of key in bytes (256 bits)
const ITERATIONS = 100000; // Number of iterations for key derivation

/**
 * Derives a key from the encryption key using PBKDF2
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @returns The encrypted text in base64 format with salt, iv, tag, and encrypted data
 */
export function encrypt(text: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from salt
    const key = deriveKey(salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Return as base64
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string encrypted with encrypt()
 * @param encryptedText - The encrypted text in base64 format
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  try {
    // Convert from base64
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from salt
    const key = deriveKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Masks an API key for display (shows only first 6 and last 4 characters)
 * @param apiKey - The API key to mask
 * @returns The masked API key
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 10) {
    return '********';
  }
  
  const firstChars = apiKey.slice(0, 6);
  const lastChars = apiKey.slice(-4);
  const maskedMiddle = '*'.repeat(Math.max(8, apiKey.length - 10));
  
  return `${firstChars}${maskedMiddle}${lastChars}`;
}

/**
 * Validates an API key format based on provider
 * @param provider - The AI provider
 * @param apiKey - The API key to validate
 * @returns True if valid, false otherwise
 */
export function validateApiKeyFormat(provider: string, apiKey: string): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  switch (provider) {
    case 'openai':
      // OpenAI keys start with 'sk-'
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    
    case 'gemini':
      // Gemini/Google AI keys are typically 39 characters
      return apiKey.length >= 30;
    
    case 'grok':
      // xAI/Grok keys format (placeholder - update when format is known)
      return apiKey.length >= 20;
    
    case 'openrouter':
      // OpenRouter keys start with 'sk-or-'
      return apiKey.startsWith('sk-or-') && apiKey.length > 20;
    
    case 'huggingface':
      // Hugging Face tokens start with 'hf_'
      return apiKey.startsWith('hf_') && apiKey.length > 20;
    
    default:
      // Default validation - just check it's not empty and has reasonable length
      return apiKey.length >= 10;
  }
}