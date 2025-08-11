import { encrypt, decrypt } from '@/lib/encryption';

describe('Encryption Utils', () => {
  const testKey = 'test-encryption-key-32-characters!';
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ENCRYPTION_KEY = testKey;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('encrypts and decrypts text correctly', () => {
    const plainText = 'This is a secret message';
    
    const encrypted = encrypt(plainText);
    expect(encrypted).not.toBe(plainText);
    expect(encrypted).toBeTruthy();
    
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plainText);
  });

  it('generates different encrypted values for same input', () => {
    const plainText = 'Same message';
    
    const encrypted1 = encrypt(plainText);
    const encrypted2 = encrypt(plainText);
    
    // Different due to random IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both decrypt to same value
    expect(decrypt(encrypted1)).toBe(plainText);
    expect(decrypt(encrypted2)).toBe(plainText);
  });

  it('handles empty string', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('handles special characters', () => {
    const plainText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(plainText);
  });

  it('handles unicode characters', () => {
    const plainText = '안녕하세요 🎴 타로카드';
    
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(plainText);
  });

  it('throws error when decrypting invalid data', () => {
    expect(() => {
      decrypt('invalid-encrypted-data');
    }).toThrow();
  });

  it('throws error when encryption key is missing', () => {
    delete process.env.ENCRYPTION_KEY;
    
    expect(() => {
      encrypt('test');
    }).toThrow('Encryption key not found');
  });
});