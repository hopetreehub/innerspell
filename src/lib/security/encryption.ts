import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

/**
 * 환경 변수에서 암호화 키를 가져오거나 생성
 */
export function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // 개발 환경에서는 기본 키 사용 (프로덕션에서는 반드시 환경변수 설정 필요)
    console.warn('ENCRYPTION_KEY not found in environment variables. Using default key for development.');
    return crypto.scryptSync('innerspell-default-key-2024', 'salt', 32);
  }
  return Buffer.from(key, 'hex');
}

/**
 * 문자열을 암호화
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // IV + authTag + encrypted data를 하나의 문자열로 결합
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * 암호화된 문자열을 복호화
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * API 키를 안전하게 저장하기 위한 헬퍼 함수
 */
export function encryptApiKey(apiKey: string): string {
  if (!apiKey || apiKey.trim() === '') {
    return '';
  }
  return encrypt(apiKey);
}

/**
 * 암호화된 API 키를 복호화하는 헬퍼 함수
 */
export function decryptApiKey(encryptedApiKey: string): string {
  if (!encryptedApiKey || encryptedApiKey.trim() === '') {
    return '';
  }
  try {
    return decrypt(encryptedApiKey);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return '';
  }
}

/**
 * 환경변수에서 API 키를 안전하게 가져오는 함수
 */
export function getSecureApiKey(envKey: string): string | undefined {
  const encryptedKey = process.env[envKey];
  if (!encryptedKey) return undefined;
  
  // 암호화된 형식인지 확인 (콜론이 2개 있는지)
  if (encryptedKey.split(':').length === 3) {
    try {
      return decryptApiKey(encryptedKey);
    } catch {
      // 복호화 실패 시 원본 반환 (기존 평문 키와의 호환성)
      return encryptedKey;
    }
  }
  
  // 평문 키인 경우 그대로 반환
  return encryptedKey;
}

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  // timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}