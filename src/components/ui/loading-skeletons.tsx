/**
 * Loading skeleton components for better perceived performance
 */

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-purple-900/20 rounded-lg border border-purple-800/30 p-6">
      <div className="h-4 bg-purple-700/30 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-purple-700/20 rounded w-full"></div>
        <div className="h-3 bg-purple-700/20 rounded w-5/6"></div>
        <div className="h-3 bg-purple-700/20 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function TarotCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center space-y-4">
      <div className="w-32 h-48 bg-purple-900/30 rounded-lg border border-purple-800/30"></div>
      <div className="h-4 bg-purple-700/30 rounded w-24"></div>
      <div className="h-3 bg-purple-700/20 rounded w-32"></div>
    </div>
  );
}

export function ReadingResultSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="text-center space-y-4">
        <div className="h-8 bg-purple-700/30 rounded w-64 mx-auto"></div>
        <div className="h-4 bg-purple-700/20 rounded w-48 mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <TarotCardSkeleton key={i} />
        ))}
      </div>
      
      <div className="space-y-4">
        <div className="h-6 bg-purple-700/30 rounded w-48"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-purple-700/20 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-purple-700/30 rounded w-64"></div>
        <div className="h-4 bg-purple-700/20 rounded w-96"></div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-purple-900/20 rounded-lg border border-purple-800/30 p-6">
            <div className="h-4 bg-purple-700/30 rounded w-20 mb-2"></div>
            <div className="h-8 bg-purple-700/40 rounded w-16 mb-1"></div>
            <div className="h-3 bg-purple-700/20 rounded w-24"></div>
          </div>
        ))}
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-purple-700/30 rounded w-32"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <CardSkeleton key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {/* Table Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-4 bg-purple-700/30 rounded w-20"></div>
        ))}
      </div>
      
      {/* Table Rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, j) => (
              <div key={j} className="h-4 bg-purple-700/20 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-4">
        <div className="h-4 bg-purple-700/30 rounded w-24"></div>
        <div className="h-10 bg-purple-900/20 rounded border border-purple-800/30"></div>
      </div>
      
      <div className="space-y-4">
        <div className="h-4 bg-purple-700/30 rounded w-32"></div>
        <div className="h-32 bg-purple-900/20 rounded border border-purple-800/30"></div>
      </div>
      
      <div className="space-y-4">
        <div className="h-4 bg-purple-700/30 rounded w-28"></div>
        <div className="h-10 bg-purple-900/20 rounded border border-purple-800/30"></div>
      </div>
      
      <div className="flex space-x-4">
        <div className="h-10 bg-purple-600/30 rounded w-24"></div>
        <div className="h-10 bg-gray-600/30 rounded w-20"></div>
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Featured Image */}
      <div className="w-full h-64 bg-purple-900/20 rounded-lg"></div>
      
      {/* Title and Meta */}
      <div className="space-y-4">
        <div className="h-8 bg-purple-700/30 rounded w-3/4"></div>
        <div className="flex space-x-4">
          <div className="h-4 bg-purple-700/20 rounded w-20"></div>
          <div className="h-4 bg-purple-700/20 rounded w-16"></div>
          <div className="h-4 bg-purple-700/20 rounded w-24"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-purple-700/20 rounded w-full"></div>
            <div className="h-4 bg-purple-700/20 rounded w-5/6"></div>
            <div className="h-4 bg-purple-700/20 rounded w-4/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-between p-4">
      <div className="h-8 bg-purple-700/30 rounded w-32"></div>
      <div className="flex space-x-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-purple-700/20 rounded w-16"></div>
        ))}
      </div>
      <div className="h-8 bg-purple-600/30 rounded w-20"></div>
    </div>
  );
}