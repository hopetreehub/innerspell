/**
 * AI Response Cache Service
 * 
 * Provides caching functionality for AI-generated tarot interpretations
 * to reduce API calls and improve response times.
 */

import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

// Cache configuration
const CACHE_MAX_SIZE = 100; // Maximum number of cached responses
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

// Types
interface CacheEntry {
  interpretation: string;
  timestamp: number;
  hits: number;
}

interface CacheKey {
  question: string;
  cardSpread: string;
  cardInterpretations: string;
  isGuestUser: boolean;
}

// Initialize LRU cache
const cache = new LRUCache<string, CacheEntry>({
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL,
  updateAgeOnGet: true,
  updateAgeOnHas: false,
});

/**
 * Generate a hash key for cache lookup
 */
function generateCacheKey(input: CacheKey): string {
  const normalized = {
    question: input.question.toLowerCase().trim(),
    cardSpread: input.cardSpread,
    cardInterpretations: input.cardInterpretations,
    isGuestUser: input.isGuestUser,
  };
  
  const keyString = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(keyString).digest('hex');
}

/**
 * Get cached interpretation if available
 */
export function getCachedInterpretation(input: CacheKey): string | null {
  const key = generateCacheKey(input);
  const entry = cache.get(key);
  
  if (entry) {
    // Update hit count
    cache.set(key, {
      ...entry,
      hits: entry.hits + 1,
    });
    
    console.log('[AI_CACHE] Cache hit for interpretation, hits:', entry.hits + 1);
    return entry.interpretation;
  }
  
  return null;
}

/**
 * Store interpretation in cache
 */
export function setCachedInterpretation(input: CacheKey, interpretation: string): void {
  const key = generateCacheKey(input);
  
  cache.set(key, {
    interpretation,
    timestamp: Date.now(),
    hits: 0,
  });
  
  console.log('[AI_CACHE] Cached new interpretation, cache size:', cache.size);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = {
    size: cache.size,
    maxSize: CACHE_MAX_SIZE,
    hitRate: 0,
    entries: [] as Array<{
      question: string;
      hits: number;
      age: number;
    }>,
  };
  
  let totalHits = 0;
  let totalRequests = 0;
  
  cache.forEach((value, key) => {
    totalHits += value.hits;
    totalRequests += value.hits + 1; // +1 for initial cache set
    
    // Note: We can't reverse the hash to get original question
    // This is for debugging/monitoring purposes only
    stats.entries.push({
      question: key.substring(0, 8) + '...', // Show partial hash
      hits: value.hits,
      age: Date.now() - value.timestamp,
    });
  });
  
  stats.hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  
  // Sort by hits descending
  stats.entries.sort((a, b) => b.hits - a.hits);
  
  return stats;
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  cache.clear();
  console.log('[AI_CACHE] Cache cleared');
}

/**
 * Prune old entries manually (LRU handles this automatically)
 */
export function pruneCache(): number {
  const beforeSize = cache.size;
  cache.purgeStale();
  const pruned = beforeSize - cache.size;
  
  if (pruned > 0) {
    console.log('[AI_CACHE] Pruned', pruned, 'stale entries');
  }
  
  return pruned;
}