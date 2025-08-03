import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { createHash } from 'crypto';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .transform(val => val.trim()),

  // Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  // Safe string (no scripts or HTML)
  safeString: z.string()
    .transform(val => sanitizeHtml(val))
    .refine(val => !containsSuspiciousPatterns(val), {
      message: 'Input contains potentially malicious content',
    }),

  // Username validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

  // URL validation
  url: z.string()
    .url('Invalid URL format')
    .refine(val => isValidUrl(val), 'Invalid or suspicious URL'),

  // Phone number validation (international format)
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  // Date validation
  date: z.string()
    .datetime()
    .or(z.date())
    .transform(val => val instanceof Date ? val : new Date(val)),

  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    orderBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),

  // ID validation (Firebase format)
  firebaseId: z.string()
    .regex(/^[a-zA-Z0-9]{20,}$/, 'Invalid ID format'),

  // File upload validation
  fileUpload: z.object({
    name: z.string().max(255),
    type: z.string(),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
  }),
};

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  // Configure DOMPurify for strict sanitization
  const config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };

  return DOMPurify.sanitize(input, config);
}

/**
 * Check for suspicious patterns that might indicate attacks
 */
function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /data:text\/html/i,
    /vbscript:/i,
    /file:\/\//i,
    /\.\.\//, // Path traversal
    /\x00/, // Null bytes
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /union\s+select/i, // SQL injection
    /\';.*--/i, // SQL injection
    /1\s*=\s*1/i, // SQL injection
    /\|\|/i, // Command injection
    /&&/i, // Command injection
    /;.*\s*(cat|ls|rm|wget|curl)/i, // Command injection
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'File extension not allowed' };
  }

  // Check for double extensions
  if (file.name.split('.').length > 2) {
    return { valid: false, error: 'Multiple file extensions detected' };
  }

  // Sanitize filename
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.');

  if (sanitizedName !== file.name) {
    return { valid: false, error: 'Filename contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Block local URLs
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '169.254.169.254', // AWS metadata endpoint
    ];
    
    if (blockedHosts.includes(parsed.hostname)) {
      return false;
    }
    
    // Block private IP ranges
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(parsed.hostname)) {
      const parts = parsed.hostname.split('.').map(Number);
      // Check for private IP ranges
      if (
        parts[0] === 10 || // 10.0.0.0/8
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
        (parts[0] === 192 && parts[1] === 168) // 192.168.0.0/16
      ) {
        return false;
      }
    }
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Create content hash for integrity verification
 */
export function createContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Validate request against schema with detailed error reporting
 */
export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: any }> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
    return {
      success: false,
      errors: [{ message: 'Validation failed', code: 'UNKNOWN_ERROR' }],
    };
  }
}

/**
 * API-specific validation schemas
 */
export const apiSchemas = {
  // Blog post creation
  createBlogPost: z.object({
    title: commonSchemas.safeString.min(1).max(200),
    content: commonSchemas.safeString.min(10).max(50000),
    excerpt: commonSchemas.safeString.max(500).optional(),
    category: z.string(),
    tags: z.array(z.string()).max(10).optional(),
    featuredImage: commonSchemas.url.optional(),
    published: z.boolean().default(false),
  }),

  // Community post creation
  createCommunityPost: z.object({
    category: z.enum(['reading-share', 'free-discussion', 'q-and-a', 'deck-review', 'study-group']),
    title: commonSchemas.safeString.min(1).max(200),
    content: commonSchemas.safeString.min(10).max(10000),
    authorName: commonSchemas.safeString.max(50).optional(),
    authorPhotoURL: commonSchemas.url.optional(),
    tags: z.array(z.string()).max(5).optional(),
  }),

  // Comment creation
  createComment: z.object({
    postId: commonSchemas.firebaseId,
    content: commonSchemas.safeString.min(1).max(1000),
    parentId: commonSchemas.firebaseId.optional(),
  }),

  // User profile update
  updateProfile: z.object({
    displayName: commonSchemas.safeString.min(1).max(50).optional(),
    bio: commonSchemas.safeString.max(500).optional(),
    website: commonSchemas.url.optional(),
    photoURL: commonSchemas.url.optional(),
  }),

  // Search query
  searchQuery: z.object({
    q: commonSchemas.safeString.min(1).max(100),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    ...commonSchemas.pagination.shape,
  }),
};

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially dangerous keys
      if (!key.startsWith('__') && !key.startsWith('$')) {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}