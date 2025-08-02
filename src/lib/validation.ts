import { z } from 'zod';

/**
 * Common validation schemas for the application
 */

// User input validation
export const emailSchema = z.string().email('Invalid email format').max(255);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

// Content validation
export const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be at most 200 characters')
  .transform(str => str.trim());

export const contentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(50000, 'Content is too long');

export const excerptSchema = z
  .string()
  .max(500, 'Excerpt must be at most 500 characters')
  .transform(str => str.trim());

export const tagSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9가-힣\s-]+$/, 'Invalid tag format')
  .transform(str => str.trim().toLowerCase());

export const categorySchema = z.enum([
  'tarot',
  'meditation', 
  'spirituality',
  'healing',
  'astrology',
  'mindfulness',
  'energy',
  'other'
]);

// Blog post validation
export const createBlogPostSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  excerpt: excerptSchema,
  category: categorySchema,
  tags: z.array(tagSchema).max(10, 'Maximum 10 tags allowed'),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  coverImage: z.string().url().optional()
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// Comment validation
export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000, 'Comment is too long'),
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional()
});

// User profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  website: z.string().url().optional(),
  social: z.object({
    twitter: z.string().max(100).optional(),
    instagram: z.string().max(100).optional(),
    linkedin: z.string().max(100).optional()
  }).optional()
});

// Tarot reading validation
export const tarotSpreadSchema = z.enum(['single', 'three-card', 'celtic-cross', 'relationship', 'career']);

export const createReadingSchema = z.object({
  question: z.string().min(1).max(500),
  spread: tarotSpreadSchema,
  cards: z.array(z.object({
    id: z.string(),
    position: z.number(),
    reversed: z.boolean()
  })),
  isPublic: z.boolean().optional().default(false)
});

// Search and filter validation
export const searchQuerySchema = z
  .string()
  .max(200)
  .transform(str => str.trim())
  .refine(str => !/<[^>]*>/g.test(str), 'HTML tags are not allowed');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['latest', 'oldest', 'popular']).optional().default('latest')
});

// API request validation
export const apiKeySchema = z
  .string()
  .min(32)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid API key format');

// Sanitization helpers
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Validation middleware for API routes
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>
): (data: unknown) => { success: true; data: T } | { success: false; errors: z.ZodError } {
  return (data: unknown) => {
    try {
      const validated = schema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  };
}

/**
 * Format validation errors for API responses
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  errors.errors.forEach(error => {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  });
  
  return formatted;
}

// Type exports
export type CreateBlogPost = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type CreateReading = z.infer<typeof createReadingSchema>;
export type Pagination = z.infer<typeof paginationSchema>;