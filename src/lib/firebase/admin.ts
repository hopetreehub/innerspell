// Re-export everything from the lazy admin module
export * from './admin-lazy';

// This file now acts as a pass-through to prevent breaking existing imports
// The actual implementation is in admin-lazy.ts which initializes Firebase
// only when actually needed, preventing build-time hangs