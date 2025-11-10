export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
      {/* Header skeleton */}
      <div className="h-8 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded animate-pulse mb-6"></div>
      
      {/* Progress bar skeleton */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 animate-pulse"></div>
      
      {/* Question skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
        
        {/* Options skeleton */}
        <div className="space-y-3 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="mt-8 flex justify-between">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
      {/* Title skeleton */}
      <div className="h-10 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded animate-pulse mb-6 w-3/4 mx-auto"></div>
      
      {/* Entries skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
      <div className="text-center space-y-6">
        {/* Emoji skeleton */}
        <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded-full animate-pulse mx-auto"></div>
        
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mx-auto"></div>
        
        {/* Text skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6 mx-auto"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
