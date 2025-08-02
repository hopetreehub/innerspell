// Build configuration to prevent timeouts
module.exports = {
  // Increase timeout for static generation
  staticPageGenerationTimeout: 180, // 3 minutes per page
  
  // Optimize build performance
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
    
    // Enable incremental static regeneration
    isrMemoryCacheSize: 0, // Disable memory cache to reduce memory usage
  },
  
  // Build output configuration
  output: 'standalone',
  
  // Disable source maps in production to speed up build
  productionBrowserSourceMaps: false,
};