import { 
  encrypt, 
  decrypt, 
  encryptApiKey, 
  decryptApiKey, 
  getSecureApiKey,
  generateCSRFToken,
  verifyCSRFToken 
} from '../encryption';

// Mock environment for testing
const originalEnv = process.env;

describe('Encryption Functions', () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'Hello, World!';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
      expect(encrypted).not.toBe(originalText);
      expect(encrypted).toMatch(/^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/); // hex:hex:hex format
    });

    it('should produce different encrypted strings for same input', () => {
      const text = 'Same input text';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it('should handle empty string', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle special characters and unicode', () => {
      const specialText = '🔒 Special chars: !@#$%^&*()_+ 한글 日本語';
      const encrypted = encrypt(specialText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(specialText);
    });

    it('should throw error for invalid encrypted format', () => {
      expect(() => decrypt('invalid-format')).toThrow('Failed to decrypt data');
      expect(() => decrypt('only:one:colon')).not.toThrow();
      expect(() => decrypt('too:many:colons:here')).toThrow('Failed to decrypt data');
    });
  });

  describe('API Key helpers', () => {
    it('should encrypt and decrypt API keys', () => {
      const apiKey = 'sk-1234567890abcdef';
      const encrypted = encryptApiKey(apiKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(apiKey);
      expect(encrypted).not.toBe(apiKey);
    });

    it('should handle empty API key', () => {
      expect(encryptApiKey('')).toBe('');
      expect(decryptApiKey('')).toBe('');
      expect(encryptApiKey('   ')).toBe('');
    });

    it('should handle decryption failure gracefully', () => {
      expect(decryptApiKey('invalid-encrypted-key')).toBe('');
    });
  });

  describe('getSecureApiKey', () => {
    it('should return undefined for non-existent environment variable', () => {
      delete process.env.TEST_API_KEY;
      expect(getSecureApiKey('TEST_API_KEY')).toBeUndefined();
    });

    it('should return plaintext key if not encrypted format', () => {
      process.env.TEST_API_KEY = 'plain-text-key';
      expect(getSecureApiKey('TEST_API_KEY')).toBe('plain-text-key');
    });

    it('should decrypt encrypted key format', () => {
      const originalKey = 'sk-secret-key-123';
      const encryptedKey = encrypt(originalKey);
      process.env.TEST_API_KEY = encryptedKey;
      
      expect(getSecureApiKey('TEST_API_KEY')).toBe(originalKey);
    });

    it('should fallback to original value if decryption fails', () => {
      process.env.TEST_API_KEY = 'invalid:encrypted:format:extra';
      expect(getSecureApiKey('TEST_API_KEY')).toBe('invalid:encrypted:format:extra');
    });
  });

  describe('CSRF Token functions', () => {
    it('should generate CSRF tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();

      expect(token1).toHaveLength(64); // 32 bytes * 2 (hex)
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^[a-f0-9]+$/);
    });

    it('should verify CSRF tokens correctly', () => {
      const token = generateCSRFToken();
      
      expect(verifyCSRFToken(token, token)).toBe(true);
      expect(verifyCSRFToken(token, 'different-token')).toBe(false);
      expect(verifyCSRFToken('', token)).toBe(false);
      expect(verifyCSRFToken(token, '')).toBe(false);
      expect(verifyCSRFToken('', '')).toBe(false);
    });

    it('should be timing-safe', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      
      // Test with tokens of different lengths
      const shortToken = token1.substring(0, 10);
      expect(verifyCSRFToken(shortToken, token1)).toBe(false);
      
      // Test with completely different tokens
      expect(verifyCSRFToken(token1, token2)).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle crypto errors gracefully', () => {
      // Test with malformed encrypted data
      expect(() => decrypt('malformed')).toThrow('Failed to decrypt data');
      expect(() => decrypt('a:b')).toThrow();
      
      // Test decryptApiKey error handling
      expect(decryptApiKey('malformed')).toBe('');
    });
  });

  describe('Security properties', () => {
    it('should produce cryptographically secure outputs', () => {
      const inputs = Array.from({ length: 100 }, (_, i) => `test-${i}`);
      const encrypted = inputs.map(encrypt);
      
      // All encrypted values should be unique
      const uniqueEncrypted = new Set(encrypted);
      expect(uniqueEncrypted.size).toBe(encrypted.length);
      
      // All should decrypt correctly
      encrypted.forEach((enc, i) => {
        expect(decrypt(enc)).toBe(inputs[i]);
      });
    });

    it('should generate unique CSRF tokens', () => {
      const tokens = Array.from({ length: 100 }, () => generateCSRFToken());
      const uniqueTokens = new Set(tokens);
      
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });
});