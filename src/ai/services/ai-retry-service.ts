/**
 * AI Retry Service
 * 
 * Implements exponential backoff retry logic for AI API calls
 * to handle temporary failures and rate limiting.
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryableErrors: [
    '429', // Too Many Requests
    '503', // Service Unavailable
    '504', // Gateway Timeout
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'overloaded',
    'temporarily unavailable',
  ],
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
  const errorMessage = error.toString().toLowerCase();
  const errorDetails = error.message?.toLowerCase() || '';
  
  return retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError.toLowerCase()) ||
    errorDetails.includes(retryableError.toLowerCase())
  );
}

/**
 * Calculate delay for next retry using exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = Math.min(
    options.initialDelay * Math.pow(options.backoffFactor, attempt - 1),
    options.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  return Math.floor(delay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      console.log(`[AI_RETRY] Attempt ${attempt}/${opts.maxRetries}`);
      const result = await fn();
      
      if (attempt > 1) {
        console.log(`[AI_RETRY] Success after ${attempt} attempts`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error, opts.retryableErrors)) {
        console.log('[AI_RETRY] Non-retryable error:', error);
        throw error;
      }
      
      // Don't retry if this was the last attempt
      if (attempt === opts.maxRetries) {
        console.log(`[AI_RETRY] Failed after ${attempt} attempts`);
        break;
      }
      
      // Calculate and apply delay
      const delay = calculateDelay(attempt, opts);
      console.log(`[AI_RETRY] Retrying after ${delay}ms delay...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Create a retry wrapper with custom options
 */
export function createRetryWrapper(defaultOptions?: RetryOptions) {
  return <T>(fn: () => Promise<T>, overrideOptions?: RetryOptions): Promise<T> => {
    return withRetry(fn, { ...defaultOptions, ...overrideOptions });
  };
}

/**
 * Retry wrapper specifically for AI API calls
 */
export const retryAICall = createRetryWrapper({
  maxRetries: 3,
  initialDelay: 2000,
  maxDelay: 60000,
  backoffFactor: 2.5,
  retryableErrors: [
    ...DEFAULT_OPTIONS.retryableErrors,
    'model overloaded',
    'api key',
    'quota exceeded',
  ],
});